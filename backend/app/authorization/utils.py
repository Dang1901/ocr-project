from fastapi import Request, HTTPException
from app.authorization.casbin_enforcer import get_enforcer
from app.core.config import settings


def check_casbin_permission(
    request: Request, 
    feature_code: str, 
    operation: str
) -> bool:
    """
    Helper function để check permission bằng Casbin enforcer
    
    Args:
        request: FastAPI Request object
        feature_code: Feature code (ví dụ: "ROLE", "USER", "PERMISSION")
        operation: Operation name (ví dụ: "list_roles", "create_role")
    
    Returns:
        True nếu có permission
    
    Raises:
        HTTPException 401 nếu chưa authenticated
        HTTPException 403 nếu không có permission
    """
    # Global switch to bypass authorization
    if getattr(settings, "DISABLE_AUTHORIZATION", False):
        return True
    
    # Lấy user_id từ session
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Check ADMIN role (bypass permission check)
    roles = request.session.get("roles", [])
    if roles and "ADMIN" in roles:
        return True
    
    # Lấy enforcer từ app state
    enforcer = request.app.state.enforcer
    
    # Check permission với Casbin
    try:
        allowed = enforcer.enforce(user_id, feature_code, operation)
        if not allowed:
            raise HTTPException(status_code=403, detail="Permission denied")
        return True
    except HTTPException:
        raise
    except Exception as e:
        # Log error nếu cần (chỉ log khi thực sự có lỗi, không phải permission denied)
        # print(f"Error checking permission: {e}")
        raise HTTPException(status_code=403, detail="Permission denied")

