from typing import Optional, List
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.document import Document as DocumentModel
from app.models.user import User as UserModel
from app.services.document_permission_service import DocumentPermissionService


class DocumentService:
    """Service layer for document business logic"""
    
    def __init__(self, db: Session):
        self.db = db
        self.permission_service = DocumentPermissionService(db)
    
    def list_documents(
        self,
        user: UserModel,
        q: Optional[str] = None,
        department_id: Optional[str] = None,
        document_type: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> dict:
        # Build base query
        query = self.db.query(DocumentModel).options(joinedload(DocumentModel.department))
        
        # Apply filters
        if q:
            like = f"%{q}%"
            query = query.filter(
                or_(
                    DocumentModel.filename.ilike(like),
                    DocumentModel.document_type.ilike(like),
                )
            )
        
        if department_id:
            query = query.filter(DocumentModel.department_id == department_id)
        
        if document_type:
            query = query.filter(DocumentModel.document_type == document_type)
        
        if status:
            query = query.filter(DocumentModel.status == status)
        
        # Get all documents first
        all_documents = query.order_by(DocumentModel.created_at.desc()).all()
        
        # Filter documents by permission
        filtered_documents = [
            doc for doc in all_documents
            if self.permission_service.can_view_document(user, doc)
        ]
        
        # Calculate pagination
        total = len(filtered_documents)
        start = (page - 1) * page_size
        end = start + page_size
        items = filtered_documents[start:end]
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    
    def get_document(
        self,
        user: UserModel,
        document_id: str
    ) -> DocumentModel:
        # Get document
        document = (
            self.db.query(DocumentModel)
            .options(joinedload(DocumentModel.department))
            .filter(DocumentModel.id == document_id)
            .first()
        )
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Check permission
        if not self.permission_service.can_view_document(user, document):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to view this document"
            )
        
        return document
    
    def check_edit_permission(
        self,
        user: UserModel,
        document_id: str
    ) -> DocumentModel:
        document = (
            self.db.query(DocumentModel)
            .options(joinedload(DocumentModel.department))
            .filter(DocumentModel.id == document_id)
            .first()
        )
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if not self.permission_service.can_edit_document(user, document):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to edit this document"
            )
        
        return document
    
    def check_delete_permission(
        self,
        user: UserModel,
        document_id: str
    ) -> DocumentModel:
        document = (
            self.db.query(DocumentModel)
            .options(joinedload(DocumentModel.department))
            .filter(DocumentModel.id == document_id)
            .first()
        )
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if not self.permission_service.can_delete_document(user, document):
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to delete this document"
            )
        
        return document

