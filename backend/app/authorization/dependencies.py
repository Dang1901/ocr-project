from fastapi import Request, HTTPException, Depends
from app.authorization.casbin_enforcer import get_enforcer
from app.core.config import settings

async def check_permission(request: Request):
    """Dependency to check user permissions"""
    # Global switch to bypass authorization quickly
    if getattr(settings, "disable_authorization", False):
        return True
    roles = request.session.get("roles")
    if roles and "ADMIN" in roles:
        return True
    # Skip permission check for authentication endpoints
    path = request.url.path.lower()
    if path.startswith("/api/v1/auth"): # or path.startswith("/api/v1/sso")
        return True
    
    enforcer = request.app.state.enforcer
    user_uid = request.session.get("user_id")
    
    if not user_uid:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Get route info after it's resolved
    route = request.scope.get("route")
    if not route:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    tags = getattr(route, "tags", [])
    operation = getattr(route, "name", None)
    
    if not tags or not operation:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    feature_code = tags[0] if isinstance(tags, list) else tags
    
    try:
        allowed = enforcer.enforce(user_uid, feature_code, operation)
    except Exception:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    if not allowed:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    return True

