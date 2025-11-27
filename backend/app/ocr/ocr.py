import time
import threading
import logging
from database import SessionLocal
from app.models.orc_page import OcrPage
from app.models.document import Document
from app.utils.minio_client import MinioService
from .vlm import call_vlm_api
from .lim import call_llm_api

# --- MinIO setup ---
minio_service = MinioService()

# Thread lock để đảm bảo chỉ một thread claim page tại một thời điểm
claim_lock = threading.Lock()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] - [%(threadName)s] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def download_pdf_from_s3(s3_path):
    """
    Download PDF from MinIO
    s3_path format: s3://bucket/key
    """
    try:
        logger.debug(f"[MinIO] Parsing S3 path: {s3_path}")
        bucket, key = s3_path.replace("s3://", "").split("/", 1)
        logger.info(f"[MinIO] Downloading from bucket={bucket}, key={key}")
        local_file = minio_service.download_to_tmp(bucket, key)
        logger.info(f"[MinIO] Downloaded to: {local_file}")
        return local_file
    except Exception as e:
        logger.error(f"[MinIO] Error downloading PDF: {e}", exc_info=True)
        raise


def extract_page_to_base64(pdf_path: str, page_number: int) -> str:
    """
    Extract a single page from PDF and convert to base64 string
    Returns: base64 encoded image string with data URI prefix
    Note: page_number is 1-indexed
    """
    try:
        logger.debug(f"[Extract] Extracting page {page_number} from PDF: {pdf_path}")
        from pdf2image import convert_from_path
        import base64
        from io import BytesIO

        # pdf2image uses 1-indexed pages, first_page and last_page are inclusive
        logger.debug(f"[Extract] Calling convert_from_path with first_page={page_number}, last_page={page_number}")
        images = convert_from_path(pdf_path, first_page=page_number, last_page=page_number)
        if not images or len(images) == 0:
            raise Exception(f"Failed to extract page {page_number} from PDF")

        logger.debug(f"[Extract] Extracted {len(images)} image(s), converting to base64...")
        # Convert PIL Image to bytes in memory
        img_buffer = BytesIO()
        images[0].save(img_buffer, format='PNG')
        img_bytes = img_buffer.getvalue()

        # Encode to base64
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")
        result = f"data:image/png;base64,{img_base64}"
        logger.debug(f"[Extract] Converted to base64, length: {len(result)}")
        return result
    except ImportError:
        logger.error("[Extract] pdf2image library not found")
        raise Exception("pdf2image library is required. Please install it: pip install pdf2image")
    except Exception as e:
        logger.error(f"[Extract] Error extracting page {page_number}: {e}", exc_info=True)
        raise Exception(f"Failed to extract page {page_number} from PDF: {str(e)}")


def claim_next_page():
    with claim_lock:
        with SessionLocal() as session:
            try:
                page = (
                    session.query(OcrPage)
                    .filter(OcrPage.status == "pending")
                    .order_by(OcrPage.page_number)
                    .first()
                )

                if not page:
                    return None

                page.status = "processing"
                session.commit()

                return page.id

            except Exception:
                session.rollback()
                return None


def _update_page_status(page_id: int, status: str):
    """Helper function to update page status"""
    with SessionLocal() as session:
        try:
            page = session.query(OcrPage).filter(OcrPage.id == page_id).first()
            if page:
                page.status = status
                session.commit()
        except Exception as e:
            logger.error(f"[Process] Error updating page status to {status}: {e}", exc_info=True)
            session.rollback()


def process_page(page_id: int):
    """
    Process a single OCR page
    - Tách session riêng cho mỗi operation để tránh timeout khi call API
    - Không lưu image ra file, dùng base64 trong memory
    - Không cleanup pdf_path vì nó được cache 1h
    """
    # Step 1: Query page and document info (short session)
    with SessionLocal() as session:
        page = session.query(OcrPage).filter(OcrPage.id == page_id).first()
        if not page:
            raise Exception(f"Page {page_id} not found")

        document = (
            session.query(Document)
            .filter(Document.id == page.document_id)
            .first()
        )
        if not document:
            raise Exception(f"Document {page.document_id} not found")

        # Lưu thông tin cần thiết
        document_file_path = document.file_path
        page_number = page.page_number

    # Step 2: Download PDF (không cleanup vì cache 1h)
    try:
        pdf_path = download_pdf_from_s3(document_file_path)
    except Exception as e:
        logger.error(f"[Process] Error downloading PDF: {e}", exc_info=True)
        _update_page_status(page_id, "failed")
        return

    # Step 3: Extract page to base64 (in memory, no file)
    try:
        image_base64 = extract_page_to_base64(pdf_path, page_number)
    except Exception as e:
        logger.error(f"[Process] Error extracting page: {e}", exc_info=True)
        _update_page_status(page_id, "failed")
        return

    # Step 4: Call VLM API (có thể mất thời gian)
    try:
        md = call_vlm_api(image_base64)
    except Exception as e:
        logger.error(f"[Process] Error calling VLM API: {e}", exc_info=True)
        _update_page_status(page_id, "failed")
        return

    # Step 5: Save OCR markdown (short session)
    with SessionLocal() as session:
        try:
            page = session.query(OcrPage).filter(OcrPage.id == page_id).first()
            if page:
                page.ocr_markdown = md
                session.commit()
        except Exception as e:
            logger.error(f"[Process] Error saving OCR markdown: {e}", exc_info=True)
            session.rollback()

    # Step 6: Call LLM API (có thể mất thời gian)
    try:
        json_data = call_llm_api(md)
        if json_data is None:
            raise Exception("LLM API returned None")
    except Exception as e:
        logger.error(f"[Process] Error calling LLM API: {e}", exc_info=True)
        _update_page_status(page_id, "failed")
        return

    # Step 7: Save LLM JSON and update status to done (short session)
    with SessionLocal() as session:
        try:
            page = session.query(OcrPage).filter(OcrPage.id == page_id).first()
            if page:
                page.llm_json = json_data
                page.status = "done"
                session.commit()
                logger.info(f"[Process] ✅ Page {page_id} processed successfully")
        except Exception as e:
            logger.error(f"[Process] Error saving final result: {e}", exc_info=True)
            session.rollback()


def worker_loop(worker_id: int):
    print(f"[Worker {worker_id}] Started")

    while True:
        try:
            page_id = claim_next_page()
            if not page_id:
                time.sleep(5)
                continue
            process_page(page_id)

        except Exception as loop_err:
            logger.error(f"[Worker {worker_id}] Loop error (continue): {loop_err}", exc_info=True)
            time.sleep(2)