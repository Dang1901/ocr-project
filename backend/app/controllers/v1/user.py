import inject
from fastapi import APIRouter, Depends, Query, Request
from app.services.user_service import UserService
from app.services.session_service import SessionService
from app.authentication.dependencies import require_token
# from authorization.dependencies import check_permission  # Tạm comment
from typing import Optional, List
from app.schemas.user import UserRoleAssignment, UserRoleRemoval, CreateUserRequest, ToggleUserStatusRequest, ResetPasswordResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.role import Role

# router = APIRouter(dependencies=[Depends(require_token)])  # Tạm comment để test
router = APIRouter()  # Tạm comment require_token để test

# Dependency provider for UserService
@inject.autoparams()
def get_user_service():
    return UserService()

# Dependency provider for SessionService
@inject.autoparams()
def get_session_service():
    return SessionService()

@router.get("/users", name="list_users")
def get_users(
    q: Optional[str] = Query(None, description="Search term for username, email, first name, or last name"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    user_service: UserService = Depends(get_user_service),
):
    """Get list of all users (both logged in and logged out)"""
    users, total = user_service.get_users(q=q, page=page, page_size=page_size)
    return {"data": users, "total": total, "page": page, "page_size": page_size}

@router.post("/users/sync-users", name="sync_users")
def sync_users(user_service: UserService = Depends(get_user_service)):
    success = user_service.sync_users_from_api()
    if success:
        return {"status": "success", "message": "Users synced successfully"}
    else:
        return {"status": "error", "message": "Failed to sync users"}

@router.post("/users/assign-roles", name="assign_roles_to_user")
def assign_roles_to_user(
    assignment: UserRoleAssignment,
    request: Request,
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    """Assign roles to a user and update Casbin grouping policies"""
    success = user_service.assign_roles_to_user(assignment.user_id, assignment.role_ids)
    if not success:
        return {"status": "error", "message": "Failed to assign roles"}

    # Update Casbin: add group policies
    enforcer = request.app.state.enforcer
    roles = db.query(Role).filter(Role.id.in_(assignment.role_ids)).all()
    for r in roles:
        enforcer.add_grouping_policy(assignment.user_id, r.code)
    enforcer.save_policy()

    return {"status": "success", "message": "Roles assigned successfully"}

@router.delete("/users/remove-roles", name="remove_roles_from_user")
def remove_roles_from_user(
    removal: UserRoleRemoval,
    request: Request,
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    """Remove roles from a user and update Casbin grouping policies"""
    success = user_service.remove_roles_from_user(removal.user_id, removal.role_ids)
    if not success:
        return {"status": "error", "message": "Failed to remove roles"}

    enforcer = request.app.state.enforcer
    roles = db.query(Role).filter(Role.id.in_(removal.role_ids)).all()
    for r in roles:
        enforcer.remove_grouping_policy(removal.user_id, r.code)
    enforcer.save_policy()

    return {"status": "success", "message": "Roles removed successfully"}

@router.get("/users/{user_id}/roles", name="get_user_roles")
def get_user_roles(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
):
    """Get all roles assigned to a user"""
    roles = user_service.get_user_roles(user_id)
    return {"user_id": user_id, "roles": roles}

@router.get("/roles/{role_id}/users", name="get_role_users")
def get_role_users(
    role_id: str,
    q: Optional[str] = Query(None, description="Search term for username, email, first name, or last name"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    """Get all users assigned to a specific role"""
    users, total = user_service.get_users_by_role(role_id, q=q, page=page, page_size=page_size)
    return {"data": users, "total": total, "page": page, "page_size": page_size, "role_id": role_id}

@router.put("/users/{user_id}/roles", name="update_user_roles")
def update_user_roles(
    user_id: str,
    role_ids: List[str],
    request: Request,
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    """Update user roles (replace all existing roles with new ones) and sync Casbin"""
    success = user_service.update_user_roles(user_id, role_ids)
    if not success:
        return {"status": "error", "message": "Failed to update user roles"}

    enforcer = request.app.state.enforcer
    # Clear existing groups for user then add new
    enforcer.delete_roles_for_user(user_id)
    roles = db.query(Role).filter(Role.id.in_(role_ids)).all()
    for r in roles:
        enforcer.add_grouping_policy(user_id, r.code)
    enforcer.save_policy()

    return {"status": "success", "message": "User roles updated successfully"}

@router.post("/users", name="create_user")
def create_user(
    user_data: CreateUserRequest,
    user_service: UserService = Depends(get_user_service),
):
    """Create a new user (Admin only)"""
    try:
        user = user_service.create_user(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name
        )
        user_info = user_service.get_user_info_by_id(user.id)
        return {
            "status": "success",
            "message": "User created successfully",
            "data": user_info
        }
    except ValueError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        return {"status": "error", "message": f"Failed to create user: {str(e)}"}

@router.put("/users/{user_id}/toggle-status", name="toggle_user_status")
def toggle_user_status(
    user_id: str,
    status_data: ToggleUserStatusRequest,
    user_service: UserService = Depends(get_user_service),
):
    """Toggle user active/inactive status (Admin only)"""
    try:
        success = user_service.toggle_user_status(user_id, status_data.is_active)
        if not success:
            return {"status": "error", "message": "Failed to update user status"}
        
        status_text = "activated" if status_data.is_active else "deactivated"
        return {
            "status": "success",
            "message": f"User {status_text} successfully"
        }
    except ValueError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        return {"status": "error", "message": f"Failed to update user status: {str(e)}"}

@router.put("/users/{user_id}/reset-password", name="reset_user_password")
def reset_user_password(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
):
    """Reset user password and return new password (Admin only)"""
    try:
        new_password = user_service.reset_user_password(user_id)
        return {
            "status": "success",
            "message": "Password reset successfully",
            "data": ResetPasswordResponse(new_password=new_password)
        }
    except ValueError as e:
        return {"status": "error", "message": str(e)}
    except Exception as e:
        return {"status": "error", "message": f"Failed to reset password: {str(e)}"}

