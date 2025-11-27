from typing import Optional
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.role import Role as RoleModel
from app.models.department import Department
from app.authentication.dependencies import require_session
from app.authorization.utils import check_casbin_permission
from app.schemas.role import (
    Role as RoleSchema,
    PaginatedRoleResponse,
    RoleCreate,
    RoleUpdate,
)


router = APIRouter(dependencies=[Depends(require_session)])


@router.get("/roles", response_model=PaginatedRoleResponse, name="list_roles")
def list_roles(
    request: Request,
    q: Optional[str] = Query(None, description="Search by role name, code or level"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "ROLE", "list_roles")
    query = db.query(RoleModel).options(joinedload(RoleModel.department))
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                RoleModel.name.ilike(like),
                RoleModel.code.ilike(like),
                RoleModel.level.ilike(like),
            )
        )

    total = query.count()
    items = (
        query.order_by(RoleModel.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/roles/{role_id}", response_model=RoleSchema, name="get_role")
def get_role(
    role_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "ROLE", "get_role")
    role = (
        db.query(RoleModel)
        .options(joinedload(RoleModel.department))
        .filter(RoleModel.id == role_id)
        .first()
    )
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


def _validate_department(db: Session, department_id: Optional[str]) -> Optional[Department]:
    if department_id is None:
        return None

    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.post("/roles", response_model=RoleSchema, name="create_role")
def create_role(
    payload: RoleCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "ROLE", "create_role")
    # Check duplicate by code
    existed_by_code = db.query(RoleModel).filter(RoleModel.code == payload.code).first()
    if existed_by_code:
        raise HTTPException(status_code=400, detail="Role code already exists")

    if payload.name:
        existed_by_name = db.query(RoleModel).filter(RoleModel.name == payload.name).first()
        if existed_by_name:
            raise HTTPException(status_code=400, detail="Role name already exists")

    department_id = payload.department_id.strip() if payload.department_id else None
    _validate_department(db, department_id)

    now = datetime.now()
    data = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "code": payload.code,
        "level": payload.level,
        "level_int": payload.level_int,
        "department_id": department_id,
        "is_active": payload.is_active if payload.is_active is not None else 1,
        "created_at": now,
        "updated_at": now,
    }
    role = RoleModel(data)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.put("/roles/{role_id}", response_model=RoleSchema, name="update_role")
def update_role(
    role_id: str,
    payload: RoleUpdate,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "ROLE", "update_role")
    role = db.query(RoleModel).filter(RoleModel.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    if payload.name and payload.name != role.name:
        dup_name = db.query(RoleModel).filter(RoleModel.name == payload.name).first()
        if dup_name:
            raise HTTPException(status_code=400, detail="Role name already exists")
        role.name = payload.name

    if payload.level is not None:
        role.level = payload.level
    if payload.level_int is not None:
        role.level_int = payload.level_int

    if payload.department_id is not None:
        department_id = payload.department_id.strip() or None
        _validate_department(db, department_id)
        role.department_id = department_id

    if payload.is_active is not None:
        if role.code == "ADMIN" and payload.is_active == 0:
            raise HTTPException(status_code=400, detail="Cannot deactivate Administrator role")
        role.is_active = payload.is_active

    role.updated_at = datetime.now()
    db.commit()
    db.refresh(role)
    return role


@router.delete("/roles/{role_id}", name="delete_role")
def delete_role(
    role_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "ROLE", "delete_role")
    role = db.query(RoleModel).filter(RoleModel.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    if role.code == "ADMIN":
        raise HTTPException(status_code=400, detail="Cannot delete Administrator")
    db.delete(role)
    db.commit()
    return {"message": "Role deleted successfully"}

