from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel


class DepartmentBase(BaseModel):
    name: str


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None


class Department(DepartmentBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginatedDepartmentResponse(BaseModel):
    items: List[Department]
    total: int
    page: int
    page_size: int


# Department Type Schemas
class DepartmentTypeBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None


class DepartmentTypeCreate(DepartmentTypeBase):
    pass


class DepartmentTypeUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None


class DepartmentType(DepartmentTypeBase):
    id: str
    created_at: Optional[date] = None
    updated_at: Optional[date] = None

    class Config:
        from_attributes = True


class PaginatedDepartmentTypeResponse(BaseModel):
    items: List[DepartmentType]
    total: int
    page: int
    page_size: int

