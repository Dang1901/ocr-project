from typing import Optional
from datetime import date
import uuid
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, File, Form
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.authentication.dependencies import require_session, get_current_user
from app.authorization.utils import check_casbin_permission
from app.models.document import Document as DocumentModel
from app.models.department import Department as DepartmentModel
from app.models.user import User as UserModel
from app.services.document_service import DocumentService
from app.services.document_permission_service import DocumentPermissionService
from app.core.config import settings
from app.schemas.document import (
    Document as DocumentSchema,
    DocumentCreate,
    DocumentUpdate,
    PaginatedDocumentResponse,
)


router = APIRouter(dependencies=[Depends(require_session)])

# Ensure upload directory exists
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/documents", response_model=PaginatedDocumentResponse, name="list_documents")
def list_documents(
    request: Request,
    q: Optional[str] = Query(None, description="Search by filename or document type"),
    department_id: Optional[str] = Query(None, description="Filter by department"),
    document_type: Optional[str] = Query(None, description="Filter by document type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "DOCUMENT", "list_documents")
    
    # Get current user
    user = get_current_user(request, db, require_roles=True)
    
    # Use service layer
    document_service = DocumentService(db)
    return document_service.list_documents(
        user=user,
        q=q,
        department_id=department_id,
        document_type=document_type,
        status=status,
        page=page,
        page_size=page_size
    )


@router.get("/documents/{document_id}", response_model=DocumentSchema, name="get_document")
def get_document(
    document_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "DOCUMENT", "get_document")
    
    # Get current user
    user = get_current_user(request, db, require_roles=True)
    
    # Use service layer
    document_service = DocumentService(db)
    return document_service.get_document(user=user, document_id=document_id)


def _validate_department(db: Session, department_id: Optional[str]) -> Optional[DepartmentModel]:
    if department_id is None:
        return None

    department = db.query(DepartmentModel).filter(DepartmentModel.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.post("/documents", response_model=DocumentSchema, name="create_document")
async def create_document(
    file: UploadFile = File(..., description="Document file to upload"),
    filename: str = Form(None, description="Custom filename (optional, defaults to uploaded file name)"),
    department_id: Optional[str] = Form(None, description="Department ID"),
    document_type: Optional[str] = Form(..., description="Department Type code (required, e.g., bao_cao_tai_chinh, luong, ke_hoach, nhan_su)"),
    status: Optional[str] = Form(None, description="Document status"),
    request: Request = None,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "DOCUMENT", "create_document")
    
    # Validate file size
    file_content = await file.read()
    if len(file_content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Validate department if provided
    department_id = department_id.strip() if department_id else None
    _validate_department(db, department_id)
    
    # Validate document_type (required) - should be a valid department type code
    document_type = document_type.strip() if document_type else None
    if not document_type:
        raise HTTPException(status_code=400, detail="Document type is required")
    
    # Get current user to ensure username is valid
    user = get_current_user(request, db, require_roles=False)
    username = user.username
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix if file.filename else ""
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Use custom filename if provided, otherwise use original filename
    document_filename = filename.strip() if filename else (file.filename or unique_filename)
    
    now = date.today()
    document_id = str(uuid.uuid4())
    data = {
        "id": document_id,
        "filename": document_filename,
        "file_path": str(file_path),  # Store absolute path
        "department_id": department_id,
        "status": status,
        "document_type": document_type,  # Store department type code
        "created_by": username,
        "owner": username,  # Owner is the same as created_by when uploading
        "created_at": now,
    }
    
    try:
        document = DocumentModel(data)
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # Reload with relationships
        document = (
            db.query(DocumentModel)
            .options(joinedload(DocumentModel.department))
            .filter(DocumentModel.id == document_id)
            .first()
        )
        
        if not document:
            raise HTTPException(status_code=500, detail="Failed to create document in database")
        
        return document
    except Exception as e:
        db.rollback()
        # Delete uploaded file if database save fails
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Error saving document: {str(e)}")


@router.put("/documents/{document_id}", response_model=DocumentSchema, name="update_document")
def update_document(
    document_id: str,
    payload: DocumentUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "DOCUMENT", "update_document")
    
    # Get current user
    user = get_current_user(request, db, require_roles=True)
    
    # Use service layer to check permission
    document_service = DocumentService(db)
    document = document_service.check_edit_permission(user=user, document_id=document_id)

    if payload.filename is not None:
        document.filename = payload.filename
    if payload.file_path is not None:
        document.file_path = payload.file_path
    if payload.department_id is not None:
        department_id = payload.department_id.strip() or None
        _validate_department(db, department_id)
        document.department_id = department_id
    if payload.status is not None:
        document.status = payload.status
    if payload.document_type is not None:
        document.document_type = payload.document_type

    db.commit()
    db.refresh(document)
    
    # Reload with relationships
    document = (
        db.query(DocumentModel)
        .options(joinedload(DocumentModel.department))
        .filter(DocumentModel.id == document.id)
        .first()
    )
    return document


@router.delete("/documents/{document_id}", name="delete_document")
def delete_document(
    document_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "DOCUMENT", "delete_document")
    
    # Get current user
    user = get_current_user(request, db, require_roles=True)
    
    # Use service layer to check permission
    document_service = DocumentService(db)
    document = document_service.check_delete_permission(user=user, document_id=document_id)
    
    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully"}

