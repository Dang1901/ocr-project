from pydantic import BaseModel
from typing import Optional


class DocumentPermissionBase(BaseModel):
    role_code: str
    document_type: str
    can_view: bool = False
    can_edit: bool = False
    can_delete: bool = False


class DocumentPermissionCreate(DocumentPermissionBase):
    pass


class DocumentPermissionUpdate(BaseModel):
    can_view: Optional[bool] = None
    can_edit: Optional[bool] = None
    can_delete: Optional[bool] = None


class DocumentPermission(DocumentPermissionBase):
    id: str

    class Config:
        from_attributes = True


class PaginatedDocumentPermissionResponse(BaseModel):
    items: list[DocumentPermission]
    total: int
    page: int
    page_size: int
