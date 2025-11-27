from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.authentication.dependencies import require_session
from app.authorization.utils import check_casbin_permission
from app.models.document_permission import DocumentPermission as DocumentPermissionModel
from app.schemas.document_permission import (
    DocumentPermissionCreate,
    DocumentPermissionUpdate,
    DocumentPermission,
    PaginatedDocumentPermissionResponse,
)

router = APIRouter(dependencies=[Depends(require_session)])


@router.get("/document-permissions", response_model=PaginatedDocumentPermissionResponse, name="list_document_permissions")
def list_document_permissions(
    request: Request,
    q: str | None = Query(None),
    role_code: str | None = Query(None, description="Filter by role code"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    check_casbin_permission(request, "DOCUMENT_PERMISSION", "list_document_permissions")

    query = db.query(DocumentPermissionModel)

    if role_code:
        query = query.filter(DocumentPermissionModel.role_code == role_code)

    if q:
        like = f"%{q}%"
        query = query.filter(
            (DocumentPermissionModel.role_code.ilike(like)) |
            (DocumentPermissionModel.document_type.ilike(like))
        )

    total = query.count()

    items = (
        query.order_by(DocumentPermissionModel.role_code.asc())
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


@router.get("/document-permissions/{permission_id}", response_model=DocumentPermission, name="get_document_permission")
def get_document_permission(
    request: Request,
    permission_id: str,
    db: Session = Depends(get_db),
):
    check_casbin_permission(request, "DOCUMENT_PERMISSION", "get_document_permission")

    perm = db.query(DocumentPermissionModel).filter_by(id=permission_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")

    return perm


@router.post("/document-permissions", response_model=DocumentPermission, name="create_document_permission")
def create_document_permission(
    request: Request,
    data: DocumentPermissionCreate,
    db: Session = Depends(get_db),
):
    check_casbin_permission(request, "DOCUMENT_PERMISSION", "create_document_permission")

    # Avoid duplicates
    exists = (
        db.query(DocumentPermissionModel)
        .filter_by(role_code=data.role_code, document_type=data.document_type)
        .first()
    )
    if exists:
        raise HTTPException(
            status_code=400,
            detail="Permission for this role and document_type already exists",
        )

    perm = DocumentPermissionModel(data.dict())
    db.add(perm)
    db.commit()
    db.refresh(perm)
    return perm


@router.put("/document-permissions/{permission_id}", response_model=DocumentPermission, name="update_document_permission")
def update_document_permission(
    request: Request,
    permission_id: str,
    data: DocumentPermissionUpdate,
    db: Session = Depends(get_db),
):
    check_casbin_permission(request, "DOCUMENT_PERMISSION", "update_document_permission")

    perm = db.query(DocumentPermissionModel).filter_by(id=permission_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(perm, field, value)

    db.commit()
    db.refresh(perm)
    return perm


@router.delete("/document-permissions/{permission_id}", name="delete_document_permission")
def delete_document_permission(
    request: Request,
    permission_id: str,
    db: Session = Depends(get_db),
):
    check_casbin_permission(request, "DOCUMENT_PERMISSION", "delete_document_permission")

    perm = db.query(DocumentPermissionModel).filter_by(id=permission_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")

    db.delete(perm)
    db.commit()

    return {"message": "Permission deleted"}
