from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel


class DepartmentSummary(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    filename: Optional[str] = None
    file_path: Optional[str] = None
    department_id: Optional[str] = None
    status: Optional[str] = None
    document_type: Optional[str] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    filename: Optional[str] = None
    file_path: Optional[str] = None
    department_id: Optional[str] = None
    status: Optional[str] = None
    document_type: Optional[str] = None


class Document(BaseModel):
    id: str
    filename: Optional[str] = None
    file_path: Optional[str] = None
    department_id: Optional[str] = None
    status: Optional[str] = None
    document_type: Optional[str] = None
    created_by: Optional[str] = None
    owner: Optional[str] = None
    total_pages: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    department: Optional[DepartmentSummary] = None

    class Config:
        from_attributes = True


class PaginatedDocumentResponse(BaseModel):
    items: List[Document]
    total: int
    page: int
    page_size: int

