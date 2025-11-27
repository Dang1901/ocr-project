from typing import List, Optional
from datetime import date
from pydantic import BaseModel


class DepartmentSummary(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    filename: str
    file_path: str
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


class Document(DocumentBase):
    id: str
    created_by: Optional[str] = None
    owner: Optional[str] = None
    created_at: Optional[date] = None
    department: Optional[DepartmentSummary] = None

    class Config:
        from_attributes = True


class PaginatedDocumentResponse(BaseModel):
    items: List[Document]
    total: int
    page: int
    page_size: int

