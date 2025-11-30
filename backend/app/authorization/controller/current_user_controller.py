from fastapi import APIRouter, Depends, Request, Query
from app.authentication.dependencies import require_session
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission
from collections import defaultdict
from typing import Optional, Dict, List
from sqlalchemy.orm import Session

router = APIRouter(dependencies=[Depends(require_session)])


@router.get("/check-permission", name="check_permission", include_in_schema=False)
def check_permission(
    request: Request,
    feature_code: str = Query(..., description="Feature code (e.g., ROLE, USER, PERMISSION)"),
    operation: str = Query(..., description="Operation name (e.g., list_roles, create_role)"),
):
    """
    Check if current user has permission for a specific feature and operation.
    This is a lightweight endpoint to check permission before making actual API calls.
    """
    # Global switch to bypass authorization
    if getattr(settings, "DISABLE_AUTHORIZATION", False):
        return {"allowed": True}
    
    # Check ADMIN role (bypass permission check)
    roles = request.session.get("roles", [])
    if roles and "ADMIN" in roles:
        return {"allowed": True}
    
    # Get user_id from session
    user_id = request.session.get("user_id")
    if not user_id:
        return {"allowed": False, "reason": "Not authenticated"}
    
    # Get enforcer from app state
    enforcer = request.app.state.enforcer
    
    # Check permission with Casbin
    try:
        allowed = enforcer.enforce(user_id, feature_code, operation)
        return {"allowed": allowed}
    except Exception as e:
        print(f"Error checking permission: {e}")
        return {"allowed": False, "reason": str(e)}


@router.get("/check", name="get_current_user_permissions", include_in_schema=False)
def get_current_user_permissions(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get current user's permissions and roles - only basic info for UI control.
    Returns permissions grouped by feature code.
    Lấy permissions từ Casbin enforcer (từ casbin_rule table) thay vì từ Permission table.
    """
    user_id = request.session.get("user_id")
    if not user_id:
        return {"error": "User not authenticated"}
    
    # Get user info
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    # Get user roles từ database
    user_roles = db.query(Role).join(User.roles).filter(User.id == user_id).all()
    role_codes = [role.code for role in user_roles]
    
    if not role_codes:
        # Nếu không có roles, return empty permissions
        ui_features = [
            "DASHBOARD", "USER", "ROLE", "FEATURE", "PERMISSION", "DEPARTMENT", "DOCUMENT", "DOCUMENT_PERMISSION", "OCR", "ACTIVITY_LOG",
        ]
        return {feature: [] for feature in ui_features}
    
    # Get user permissions through roles từ Permission table (giống reference implementation)
    permissions = db.query(Permission).filter(Permission.role_code.in_(role_codes)).all()
    
    # Group permissions by feature
    permissions_by_feature = defaultdict(list)
    for perm in permissions:
        permissions_by_feature[perm.feature_code].append(perm.operation)
    
    # Chỉ return permissions cho UI features
    ui_features = [
        "DASHBOARD", "USER", "ROLE", "FEATURE", "PERMISSION", "DEPARTMENT", "DOCUMENT", "DOCUMENT_PERMISSION", "OCR", "ACTIVITY_LOG",
    ]
    
    ui_permissions = {}
    for feature in ui_features:
        if feature in permissions_by_feature:
            ui_permissions[feature] = sorted(list(set(permissions_by_feature[feature])))  # Remove duplicates
        else:
            ui_permissions[feature] = []
    
    return ui_permissions


@router.get("/me", name="get_current_user_info", include_in_schema=True)
def get_current_user_info(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get current user information including user ID, username, email, etc.
    """
    user_id = request.session.get("user_id")
    if not user_id:
        return {"error": "User not authenticated"}
    
    # Get user info
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    # Format user ID as Account ID (format: XXXX-XXXX-XXXX)
    # Remove hyphens from UUID and format as XXXX-XXXX-XXXX
    clean_id = user_id.replace('-', '')
    if len(clean_id) >= 12:
        account_id = f"{clean_id[:4]}-{clean_id[4:8]}-{clean_id[8:12]}"
    else:
        account_id = user_id
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "fullname": user.fullname,
        "account_id": account_id,
        "department_id": user.department_id,
    }