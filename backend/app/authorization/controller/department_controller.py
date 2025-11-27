from typing import Optional
from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.authentication.dependencies import require_session
from app.authorization.utils import check_casbin_permission
from app.models.department import Department as DepartmentModel, DepartmentType as DepartmentTypeModel
from app.models.role import Role as RoleModel
from app.models.user import User as UserModel
from app.schemas.department import (
    Department as DepartmentSchema,
    DepartmentCreate,
    DepartmentUpdate,
    PaginatedDepartmentResponse,
    PaginatedDepartmentTypeResponse,
)
from sqlalchemy import or_


router = APIRouter(dependencies=[Depends(require_session)])


@router.get("/departments", response_model=PaginatedDepartmentResponse, name="list_departments")
def list_departments(
    request: Request,
    q: Optional[str] = Query(None, description="Search by department name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "DEPARTMENT", "list_departments")
    query = db.query(DepartmentModel)
    if q:
        like = f"%{q}%"
        query = query.filter(DepartmentModel.name.ilike(like))

    total = query.count()
    items = (
        query.order_by(DepartmentModel.name.asc())
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


@router.get("/departments/{department_id}", response_model=DepartmentSchema, name="get_department")
def get_department(
    department_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "DEPARTMENT", "get_department")
    department = db.query(DepartmentModel).filter(DepartmentModel.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.post("/departments", response_model=DepartmentSchema, name="create_department")
def create_department(
    payload: DepartmentCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "DEPARTMENT", "create_department")
    existed = db.query(DepartmentModel).filter(DepartmentModel.name == payload.name).first()
    if existed:
        raise HTTPException(status_code=400, detail="Department name already exists")

    now = datetime.now()
    department = DepartmentModel({
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "created_at": now,
        "updated_at": now,
    })

    db.add(department)
    db.commit()
    db.refresh(department)
    return department


@router.put("/departments/{department_id}", response_model=DepartmentSchema, name="update_department")
def update_department(
    department_id: str,
    payload: DepartmentUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "DEPARTMENT", "update_department")
    department = (
        db.query(DepartmentModel)
        .filter(DepartmentModel.id == department_id)
        .first()
    )
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    if payload.name and payload.name != department.name:
        dup = (
            db.query(DepartmentModel)
            .filter(
                DepartmentModel.name == payload.name,
                DepartmentModel.id != department_id,
            )
            .first()
        )
        if dup:
            raise HTTPException(status_code=400, detail="Department name already exists")
        department.name = payload.name

    department.updated_at = datetime.now()
    db.commit()
    db.refresh(department)
    return department


@router.delete("/departments/{department_id}", name="delete_department")
def delete_department(
    department_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "DEPARTMENT", "delete_department")
    department = db.query(DepartmentModel).filter(DepartmentModel.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    has_roles = db.query(RoleModel).filter(RoleModel.department_id == department_id).first()
    has_users = db.query(UserModel).filter(UserModel.department_id == department_id).first()
    if has_roles or has_users:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete department that is referenced by roles or users",
        )

    db.delete(department)
    db.commit()
    return {"message": "Department deleted successfully"}


# Department Type Endpoints
@router.get("/department-types", response_model=PaginatedDepartmentTypeResponse, name="list_department_types")
def list_department_types(
    request: Request,
    q: Optional[str] = Query(None, description="Search by code or name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "DEPARTMENT", "list_department_types")
    query = db.query(DepartmentTypeModel)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                DepartmentTypeModel.code.ilike(like),
                DepartmentTypeModel.name.ilike(like),
            )
        )

    total = query.count()
    items = (
        query.order_by(DepartmentTypeModel.created_at.desc())
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

