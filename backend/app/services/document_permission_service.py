from sqlalchemy.orm import Session
from app.models.user import User
from app.models.document import Document
from app.models.document_permission import DocumentPermission


class DocumentPermissionService:
    def __init__(self, db: Session):
        self.db = db
    
    def can_view_document(self, user: User, document: Document) -> bool:
        """Check if user can view document based on 4 conditions:
        1. Is user the creator?
        2. Does user's role have view permission for document_type?
        3. Is user ADMIN?
        4. Does user belong to document's department?
        """
        # 1. Is user the creator?
        if document.created_by == user.username:
            return True
        
        # 2. Check role-based permissions for document_type
        user_roles = [role.code for role in user.roles] if user.roles else []
        if user_roles:
            perm = self.db.query(DocumentPermission).filter(
                DocumentPermission.role_code.in_(user_roles),
                DocumentPermission.document_type == document.document_type,
                DocumentPermission.can_view == True
            ).first()
            if perm:
                return True
        
        # 3. Is user ADMIN? (check if has ADMIN role)
        if any(role.code == "ADMIN" for role in user.roles) if user.roles else False:
            return True
        
        # 4. Does user belong to document's department?
        if hasattr(user, 'department_id') and user.department_id and document.department_id:
            if user.department_id == document.department_id:
                return True
        
        return False
    
    def can_edit_document(self, user: User, document: Document) -> bool:
        """Check if user can edit document"""
        # 1. Is user the creator?
        if document.created_by == user.username:
            return True
        
        # 2. Check role-based permissions
        user_roles = [role.code for role in user.roles] if user.roles else []
        if user_roles:
            perm = self.db.query(DocumentPermission).filter(
                DocumentPermission.role_code.in_(user_roles),
                DocumentPermission.document_type == document.document_type,
                DocumentPermission.can_edit == True
            ).first()
            if perm:
                return True
        
        # 3. Is user ADMIN?
        if any(role.code == "ADMIN" for role in user.roles) if user.roles else False:
            return True
        
        return False
    
    def can_delete_document(self, user: User, document: Document) -> bool:
        """Check if user can delete document"""
        # 1. Is user the creator?
        if document.created_by == user.username:
            return True
        
        # 2. Check role-based permissions
        user_roles = [role.code for role in user.roles] if user.roles else []
        if user_roles:
            perm = self.db.query(DocumentPermission).filter(
                DocumentPermission.role_code.in_(user_roles),
                DocumentPermission.document_type == document.document_type,
                DocumentPermission.can_delete == True
            ).first()
            if perm:
                return True
        
        # 3. Is user ADMIN?
        if any(role.code == "ADMIN" for role in user.roles) if user.roles else False:
            return True
        
        return False

