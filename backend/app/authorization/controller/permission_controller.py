from typing import Optional, List
import uuid
from datetime import datetime
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.authentication.dependencies import require_session
from app.authorization.utils import check_casbin_permission
from app.db.session import get_db
from app.models.permission import Permission
from app.models.feature_operation import FeatureOperation
from app.models.role import Role
from app.schemas.permission import PaginatedPermissionResponse
from app.models.feature import Feature

router = APIRouter(dependencies=[Depends(require_session)])


@router.get(
    "/permissions",
    response_model=PaginatedPermissionResponse,
    name="list_permissions",
)
def list_permissions(
    request: Request,
    role_code: Optional[str] = Query(None),
    feature_code: Optional[str] = Query(None),
    operation: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "PERMISSION", "list_permissions")

    db_operations = db.query(FeatureOperation).all()
    user_permissions = (
        db.query(Permission).filter(Permission.role_code == role_code).all()
    )

    grouped = defaultdict(list)
    for o in db_operations:
        oper = {
            "id": o.id,
            "feature_id": o.feature_id,
            "feature_code": o.feature_code,
            "operation": o.operation,
            "created_at": o.created_at,
            "role_code": "",
            "role_id": "",
            "updated_at": o.updated_at,
            "own": False,
            "permission_id": "",
        }
        for up in user_permissions:
            if up.feature_code == o.feature_code and up.operation == o.operation:
                oper["permission_id"] = up.id
                oper["own"] = True
        grouped[o.feature_code].append(oper)

    items = []
    for fc, perms in grouped.items():
        feature_own = any(p["own"] for p in perms)
        items.append({"feature_code": fc, "permissions": perms, "own": feature_own})
    items.sort(key=lambda x: x["own"], reverse=True)
    # paginate theo group
    start = (page - 1) * page_size
    end = start + page_size
    paginated_items = items[start:end]

    return {
        "items": paginated_items,
        "total": len(items),  # tổng số group theo feature_code
        "page": page,
        "page_size": page_size,
    }

@router.get("/permissions/{permission_id}", response_model=dict, name="get_permission")
def get_permission(
    permission_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "PERMISSION", "get_permission")
    perm = db.query(Permission).filter(Permission.id == permission_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    return perm.serialize


@router.post("/permissions", response_model=List[dict], name="create_permission")
def create_permission(
    payload: List[dict],
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "PERMISSION", "create_permission")
    role_id = None
    feature_id = []
    operation = []
    for p in payload:
        required = ["role_id", "feature_id", "operation"]
        if any(k not in (p or {}) for k in required):
            raise HTTPException(status_code=400, detail="Missing required fields")
        role_id = p["role_id"]
        feature_id.append(p["feature_id"])
        operation.append(p["operation"])

    # Get role_code from role table
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Get feature_code and operation from feature_operations table using feature_id + operation
    feature_operation = (
        db.query(FeatureOperation)
        .filter(
            FeatureOperation.feature_id.in_(feature_id),
            FeatureOperation.operation.in_(operation),
        )
        .all()
    )
    if not feature_operation:
        print(feature_operation)
        raise HTTPException(status_code=404, detail="Feature operation not found")
    if len(feature_operation) != len(feature_id):
        print(len(feature_operation), len(feature_id))
        raise HTTPException(status_code=404, detail="Feature operation not found")
    datas = []
    now = datetime.now()
    perms = []
    for fo in feature_operation:
        # Check if permission already exists for this role + feature + operation
        existing = db.query(Permission).filter(
            Permission.role_id == role_id,
            Permission.feature_code == fo.feature_code,
            Permission.operation == fo.operation
        ).first()
        
        if existing:
            # Skip if already exists - không tạo duplicate
            continue
        
        data = {
            "id": str(uuid.uuid4()),
            "role_id": role_id,
            "role_code": role.code,
            "feature_id": fo.feature_id,
            "feature_code": fo.feature_code,
            "operation": fo.operation,
            "created_at": now,
            "updated_at": now,
        }
        datas.append(data)
        perms.append(Permission(data))
    
    if not perms:
        raise HTTPException(status_code=400, detail="All permissions already exist for this role")
    
    db.add_all(perms)
    db.commit()

    # Sync casbin policy: p(role_code, feature_code, operation)
    for perm in perms:
        enforcer = request.app.state.enforcer
        enforcer.add_policy(
            role.code, perm.feature_code, perm.operation
        )
        enforcer.save_policy()

    return datas


@router.get(
    "/permissions/operations/by-feature/{feature_id}",
    response_model=List[dict],
    name="get_operations_by_feature",
)
def get_operations_by_feature(
    feature_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "PERMISSION", "get_operations_by_feature")
    """Get all operations for a specific feature"""
    feature_operations = (
        db.query(FeatureOperation)
        .filter(FeatureOperation.feature_id == feature_id)
        .all()
    )

    if not feature_operations:
        return []

    return [
        {"operation": fo.operation, "feature_code": fo.feature_code}
        for fo in feature_operations
    ]


class PermissionDeleteRequest(BaseModel):
    ids: List[str]


@router.delete("/permissions", name="delete_permission")
def delete_permission(
    payload: PermissionDeleteRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "PERMISSION", "delete_permission")
    ids = payload.ids
    perms = db.query(Permission).filter(Permission.id.in_(ids)).all()
    if not perms:
        raise HTTPException(status_code=404, detail="Permission not found")

    # Remove casbin policy first
    enforcer = request.app.state.enforcer
    for perm in perms:
        enforcer.remove_policy(perm.role_code, perm.feature_code, perm.operation)
        db.delete(perm)
    enforcer.save_policy()

    db.commit()
    return {"message": "Permission deleted successfully"}

