import inject
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ocr_service import OcrService

router = APIRouter()


# Dependency provider for OcrService
@inject.autoparams()
def get_ocr_service():
    return OcrService()


@router.post("/ocr/upload", name="upload_file_for_ocr")
async def upload_file_for_ocr(
    file: UploadFile = File(..., description="PDF file to upload"),
    db: Session = Depends(get_db),
    ocr_service: OcrService = Depends(get_ocr_service),
):
    """
    Upload PDF file to MinIO, create Document record, count pages, and create OcrPage records for background processing
    """
    try:
        # Read file data
        file_data = await file.read()

        if len(file_data) == 0:
            raise HTTPException(status_code=400, detail="File is empty")

        # Upload PDF, create Document, count pages, and create OcrPage records
        result = ocr_service.upload_file_and_create_document(
            file_data=file_data,
            filename=file.filename,
            db=db
        )

        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": f"PDF uploaded successfully. Document created with {result['total_pages']} page(s) ready for processing.",
                "data": result
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/ocr/documents/{document_id}", name="get_document_by_id")
async def get_document_by_id(
    document_id: int,
    db: Session = Depends(get_db),
    ocr_service: OcrService = Depends(get_ocr_service),
):
    """
    Get document by ID
    """
    try:
        document = ocr_service.get_document_by_id(document_id, db)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return {
            "status": "success",
            "data": document.serialize
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/ocr/pages/{page_id}", name="get_page_by_id")
async def get_page_by_id(
    page_id: int,
    db: Session = Depends(get_db),
    ocr_service: OcrService = Depends(get_ocr_service),
):
    """
    Get a specific page by ID
    """
    try:
        page = ocr_service.get_page_by_id(page_id, db)
        if not page:
            raise HTTPException(status_code=404, detail="Page not found")
        return {
            "status": "success",
            "data": page.serialize
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/ocr/documents/{document_id}/result", name="get_ocr_result")
async def get_ocr_result(
    document_id: int,
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page (max 100)"),
    db: Session = Depends(get_db),
    ocr_service: OcrService = Depends(get_ocr_service),
):
    """
    Get complete OCR result for a document including all pages with their OCR data (with pagination)
    Returns document info, paginated pages with OCR markdown and LLM JSON results, and processing status
    
    - **page**: Page number (starts from 1)
    - **page_size**: Number of items per page (1-100, default: 20)
    """
    try:
        result = ocr_service.get_ocr_result_by_document_id(document_id, db, page=page, page_size=page_size)
        if not result:
            raise HTTPException(status_code=404, detail="Document not found")
        return {
            "status": "success",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")