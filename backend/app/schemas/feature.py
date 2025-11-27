from typing import List, Optional, Union
from datetime import datetime
from pydantic import BaseModel, field_validator


class FeatureBase(BaseModel):
    name: str
    code: str  # Changed to str
    url: Optional[str] = None


class FeatureCreate(FeatureBase):
    pass


class FeatureUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None  # Changed to str
    url: Optional[str] = None


class Feature(FeatureBase):
    id: Union[str, int]  # Accept both for backward compatibility
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_validator('id', mode='before')
    @classmethod
    def convert_id_to_str(cls, v):
        """Convert id to string"""
        if v is None:
            return None
        return str(v)

    @field_validator('code', mode='before')
    @classmethod
    def convert_code_to_str(cls, v):
        """Convert code to string"""
        if v is None:
            return None
        return str(v)

    class Config:
        from_attributes = True


class PaginatedFeatureResponse(BaseModel):
    items: List[Feature]
    total: int
    page: int
    page_size: int

