import inject
import os
import tempfile
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.orc_page import OcrPage
from app.models.document import Document
from app.utils.minio_client import MinioService
from app.core.config import settings
from PyPDF2 import PdfReader


class OcrService:
    @inject.autoparams()
    def __init__(self):
        self.minio_service = MinioService()
        self.bucket = settings.MINIO_BUCKET

    def count_pdf_pages(self, pdf_path: str) -> int:
        """
        Count number of pages in PDF
        """
        try:
            with open(pdf_path, 'rb') as f:
                reader = PdfReader(f)
                return len(reader.pages)
        except ImportError:
            try:
                from pdf2image import convert_from_path
                images = convert_from_path(pdf_path)
                return len(images)
            except ImportError:
                raise Exception("PyPDF2 or pdf2image library is required. Please install it: pip install PyPDF2")
        except Exception as e:
            raise Exception(f"Failed to count PDF pages: {str(e)}")

    def extract_pages_from_pdf(self, pdf_path: str) -> List[str]:
        """
        Extract pages from PDF and save as temporary image files
        Returns list of temporary image file paths
        """
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(pdf_path)
            temp_files = []
            for image in images:
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
                image.save(temp_file.name, 'PNG')
                temp_files.append(temp_file.name)
            return temp_files
        except ImportError:
            raise Exception("pdf2image library is required. Please install it: pip install pdf2image")
        except Exception as e:
            raise Exception(f"Failed to extract PDF pages: {str(e)}")

    def is_pdf(self, filename: str) -> bool:
        """Check if file is PDF based on extension"""
        return filename.lower().endswith('.pdf')

    def upload_file_and_create_document(
        self, 
        file_data: bytes, 
        filename: str, 
        db: Session
    ) -> Dict:
        """
        Upload PDF file to MinIO, create Document record, count pages, and create OcrPage records
        Returns dict with document info and pages info
        """
        temp_files_to_cleanup = []

        try:
            # Save uploaded file to temp location
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1])
            temp_file.write(file_data)
            temp_file.close()
            temp_files_to_cleanup.append(temp_file.name)

            # Only support PDF files for now
            if not self.is_pdf(filename):
                raise ValueError(f"Only PDF files are supported. Received: {filename}")

            # Upload PDF to MinIO
            pdf_s3_path = self.minio_service.upload_pdf(self.bucket, temp_file.name)

            # Count pages in PDF
            total_pages = self.count_pdf_pages(temp_file.name)

            # Create Document record first (id will be auto-generated)
            document_data = {
                "file_path": pdf_s3_path,
                "filename": filename,
                "total_pages": total_pages,
                "status": "ready"
            }

            document = Document(document_data)
            db.add(document)
            db.flush()  # Flush to get the auto-generated id
            db.commit()  # Commit document trước để tránh lock lâu

            # Get the document_id (auto-generated or provided)
            document_id = document.id

            # Create OcrPage records using bulk insert for better performance
            # Tách transaction riêng để tránh lock timeout
            created_pages = []
            pages_data = []
            for page_num in range(1, total_pages + 1):
                pages_data.append({
                    "document_id": document_id,
                    "page_number": page_num,
                    "status": "pending",
                    "ocr_markdown": None,
                    "llm_json": None,
                    "llm_json_alt": None
                })
                created_pages.append({
                    "page_number": page_num,
                    "status": "pending"
                })

            # Bulk insert OcrPage records trong transaction riêng
            if pages_data:
                db.bulk_insert_mappings(OcrPage, pages_data)
                db.commit()  # Commit pages

            return {
                "document": document.serialize,
                "total_pages": total_pages,
                "pages": created_pages
            }

        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to upload file and create document: {str(e)}")
        finally:
            # Cleanup temporary files
            for temp_file in temp_files_to_cleanup:
                try:
                    if os.path.exists(temp_file):
                        os.remove(temp_file)
                except Exception:
                    pass

    def get_document_by_id(self, document_id: int, db: Session) -> Optional[Document]:
        """Get a document by ID"""
        return db.query(Document).filter(Document.id == document_id).first()

    def get_pages_by_document_id(self, document_id: int, db: Session) -> List[OcrPage]:
        """Get all pages for a document"""
        return db.query(OcrPage).filter(OcrPage.document_id == document_id).order_by(OcrPage.page_number).all()

    def get_page_by_id(self, page_id: int, db: Session) -> Optional[OcrPage]:
        """Get a specific page by ID"""
        return db.query(OcrPage).filter(OcrPage.id == page_id).first()

    def get_ocr_result_by_document_id(
        self, 
        document_id: int, 
        db: Session,
        page: int = 1,
        page_size: int = 20
    ) -> Optional[Dict]:
        """
        Get complete OCR result for a document including all pages with their OCR data (with pagination)
        Returns dict with document info and paginated pages with OCR results
        """
        document = self.get_document_by_id(document_id, db)
        if not document:
            return None

        # Get total count of pages
        total_pages_count = db.query(OcrPage).filter(OcrPage.document_id == document_id).count()

        # Calculate pagination
        offset = (page - 1) * page_size
        total_pages = (total_pages_count + page_size - 1) // page_size  # Ceiling division

        # Get paginated pages
        pages = (
            db.query(OcrPage)
            .filter(OcrPage.document_id == document_id)
            .order_by(OcrPage.page_number)
            .offset(offset)
            .limit(page_size)
            .all()
        )

        # Get processing status counts (optimized - only count, don't load all pages)
        processing_status = {
            "completed": db.query(OcrPage).filter(
                OcrPage.document_id == document_id,
                OcrPage.status == "done"
            ).count(),
            "processing": db.query(OcrPage).filter(
                OcrPage.document_id == document_id,
                OcrPage.status == "processing"
            ).count(),
            "pending": db.query(OcrPage).filter(
                OcrPage.document_id == document_id,
                OcrPage.status == "pending"
            ).count(),
            "failed": db.query(OcrPage).filter(
                OcrPage.document_id == document_id,
                OcrPage.status == "failed"
            ).count(),
        }

        # Aggregate OCR results for current page
        ocr_results = []
        for page_obj in pages:
            ocr_results.append({
                "page_number": page_obj.page_number,
                "status": page_obj.status,
                "llm_json": page_obj.llm_json,
                "llm_json_alt": page_obj.llm_json_alt,
                "created_at": page_obj.created_at.isoformat() if page_obj.created_at else None,
                "updated_at": page_obj.updated_at.isoformat() if page_obj.updated_at else None,
            })

        return {
            "document": document.serialize,
            "total_pages_count": total_pages_count,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "total_items": total_pages_count,
                "has_next": page < total_pages,
                "has_previous": page > 1
            },
            "pages": ocr_results,
            "processing_status": processing_status
        }