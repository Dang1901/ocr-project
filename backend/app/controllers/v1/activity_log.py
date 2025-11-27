from fastapi import APIRouter, Depends, Request, Response, HTTPException
from fastapi.openapi.models import Response
from sqlalchemy import bindparam
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.authentication.dependencies import require_token
from app.models.activity_log import ActivityLog

router = APIRouter(dependencies=[Depends(require_token)])

def sanitize_like(val: str) -> str:
    val = val.replace("\\", "\\\\")
    val = val.replace("%", "\\%")
    val = val.replace("_", "\\_")
    return val

@router.get("/activity_log/list", name="get_activity_log")
def get_activity_log_entries(
    request: Request,
    db: Session = Depends(get_db)
):
    """List activity log entries"""
    user_id = request.session.get("user_id")
    if not user_id:
        return {"error": "User not authenticated"}

    user_id = request.query_params.get("user_id")
    path = request.query_params.get("path")
    status = request.query_params.get("status")

    page = request.query_params.get("page")
    size = request.query_params.get("size")

    if page is not None and page != "":
        try:
            page = int(page)
        except ValueError:
            page = 0
    else:
        page = 0
    if page < 0:
        page = 0

    if size is not None and size != "":
        try:
            size = int(size)
        except ValueError:
            size = 10
    else:
        size = 10
    if size < 1:
        size = 10

    query = db.query(ActivityLog)
    if user_id is not None and user_id != "":
        query = query.filter(ActivityLog.user_id == user_id)

    if status is not None and status != "":
        try:
            status = int(status)
        except ValueError:
            raise HTTPException(400, "Invalid status code")

        if not (100 <= status <= 599):
            raise HTTPException(400, "Invalid status code: out of range")
        else:
            query = query.filter(ActivityLog.response_status == status)

    if path is not None and path != "":
        pattern = f"%{sanitize_like(path)}%"
        query = query.filter(ActivityLog.path.like(bindparam("p"), escape="\\")).params(p=pattern)

    total = query.count()

    query = query.offset(size * page).limit(size)
    result: list[ActivityLog] = query.all()

    return {
        "total": total,
        "count": len(result),
        "data": [{
            "id": log.id,
            "user_id": log.user_id,
            "method": log.method,
            "response_status": log.response_status,
            "path": log.path,
            "name": log.name,
            "created_at": log.created_at,
            "deleted_at": log.deleted_at,
        } for log in result],
    }