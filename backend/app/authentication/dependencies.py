from fastapi import HTTPException, Depends, Request
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.user import User as UserModel


def require_session(request: Request):
    """
    Dependency to require a valid session.
    Checks if user has an active session.
    """
    if not request.session.get("username") and not request.session.get("email"):
        raise HTTPException(status_code=401, detail="Session required")
    return True


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    require_roles: bool = True
) -> UserModel:
    """
    Dependency to get the current authenticated user from session.
    
    Args:
        request: FastAPI Request object
        db: Database session
        require_roles: If True, load user roles (default: True)
    
    Returns:
        UserModel: The current authenticated user
        
    Raises:
        HTTPException: 401 if user is not authenticated or not found
    """
    # Get username or email from session
    username = request.session.get("username") or request.session.get("email")
    if not username:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    # Build query
    query = db.query(UserModel)
    
    # Load roles if required
    if require_roles:
        query = query.options(joinedload(UserModel.roles))
    
    # Try to find user by username first
    user = query.filter(UserModel.username == username).first()
    
    # If not found, try email
    if not user:
        user = query.filter(UserModel.email == username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
