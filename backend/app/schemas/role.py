from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class DepartmentSummary(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


class RoleBase(BaseModel):
    name: Optional[str] = None
    code: str
    level: Optional[str] = None
    level_int: Optional[int] = None
    department_id: Optional[str] = None
    is_active: Optional[int] = 1


class RoleCreate(RoleBase):
    name: str


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    level: Optional[str] = None
    level_int: Optional[int] = None
    department_id: Optional[str] = None
    is_active: Optional[int] = None


class Role(RoleBase):
    id: str
    department: Optional[DepartmentSummary] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginatedRoleResponse(BaseModel):
    items: List[Role]
    total: int
    page: int
    page_size: int

