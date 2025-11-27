from typing import Optional
from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.feature import Feature
from app.authentication.dependencies import require_session
from app.authorization.utils import check_casbin_permission
from app.schemas.feature import (
    Feature as FeatureSchema,
    FeatureCreate,
    FeatureUpdate,
    PaginatedFeatureResponse,
)

router = APIRouter(dependencies=[Depends(require_session)])


@router.get("/features", response_model=PaginatedFeatureResponse, name="list_features")
def list_features(
    request: Request,
    q: Optional[str] = Query(None, description="Search by feature name, code or url"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    # Check permission
    check_casbin_permission(request, "FEATURE", "list_features")
    query = db.query(Feature)
    if q:
        like = f"%{q}%"
        filters = [
            Feature.name.ilike(like),
            Feature.url.ilike(like),
            Feature.code.ilike(like),  # Search by code as string
        ]
        query = query.filter(or_(*filters))

    total = query.count()
    items = (
        query.order_by(Feature.created_at.desc())
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


@router.get("/features/{feature_id}", response_model=FeatureSchema, name="get_feature")
def get_feature(
    feature_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check permission
    check_casbin_permission(request, "FEATURE", "get_feature")
    feature = db.query(Feature).filter(Feature.id == feature_id).first()
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feature



