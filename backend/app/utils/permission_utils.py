"""
Permission check utilities for reusable permission validation
"""
from fastapi import Request, HTTPException
from sqlalchemy.orm import Session
from app.authorization.utils import check_casbin_permission
from app.authentication.dependencies import get_current_user
from app.models.user import User as UserModel


def require_permission(request: Request, feature_code: str, operation: str) -> None:
    """
    Check if user has permission for a feature and operation
    
    Args:
        request: FastAPI Request object
        feature_code: Feature code (e.g., "DOCUMENT", "USER")
        operation: Operation name (e.g., "list_documents", "create_user")
        
    Raises:
        HTTPException: 403 if permission denied
    """
    check_casbin_permission(request, feature_code, operation)


def require_authenticated_user(request: Request, db: Session, require_roles: bool = True) -> UserModel:
    """
    Get current authenticated user
    
    Args:
        request: FastAPI Request object
        db: Database session
        require_roles: Whether to load user roles
        
    Returns:
        UserModel: Current authenticated user
        
    Raises:
        HTTPException: 401 if not authenticated
    """
    return get_current_user(request, db, require_roles=require_roles)


def check_and_get_user(
    request: Request,
    db: Session,
    feature_code: str,
    operation: str,
    require_roles: bool = True
) -> UserModel:
    """
    Check permission and get authenticated user in one call
    
    Args:
        request: FastAPI Request object
        db: Database session
        feature_code: Feature code
        operation: Operation name
        require_roles: Whether to load user roles
        
    Returns:
        UserModel: Current authenticated user
        
    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 403 if permission denied
    """
    require_permission(request, feature_code, operation)
    return require_authenticated_user(request, db, require_roles)

