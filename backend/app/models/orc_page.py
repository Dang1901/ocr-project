import datetime
import uuid
from sqlalchemy import (
    Column, String, DateTime, Enum, Text, func, UniqueConstraint, ForeignKey, Integer
)
from sqlalchemy.dialects.mysql import JSON
from app.db.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class OcrPage(Base):
    __tablename__ = "ocr_pages"

    id = Column(String(36), primary_key=True, nullable=False, default=_generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    status = Column(
        Enum("pending", "processing", "done", "failed", name="page_status"),
        default="pending",
        nullable=False
    )
    ocr_markdown = Column(Text, nullable=True)
    llm_json = Column(JSON, nullable=True)
    llm_json_alt = Column(JSON, nullable=True)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("document_id", "page_number", name="uq_document_page"),
    )

    def __init__(self, data: dict = None):
        if data:
            # Only set id if provided (for UUID, it will be auto-generated if not provided)
            if "id" in data and data.get("id") is not None:
                self.id = data.get("id")
            # Required fields - always set if in data
            if "document_id" in data:
                self.document_id = data.get("document_id")
            if "page_number" in data:
                self.page_number = data.get("page_number")
            # Status with default
            self.status = data.get("status")
            # Optional fields
            if "ocr_markdown" in data:
                self.ocr_markdown = data.get("ocr_markdown")
            if "llm_json" in data:
                self.llm_json = data.get("llm_json")
            if "llm_json_alt" in data:
                self.llm_json_alt = data.get("llm_json_alt")
            # Only set created_at/updated_at if explicitly provided
            # Otherwise let server_default handle it
            if "created_at" in data and data.get("created_at") is not None:
                self.created_at = data.get("created_at")
            if "updated_at" in data and data.get("updated_at") is not None:
                self.updated_at = data.get("updated_at")

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            "id": self.id,
            "document_id": self.document_id,
            "page_number": self.page_number,
            "status": self.status,
            "ocr_markdown": self.ocr_markdown,
            "llm_json": self.llm_json,
            "llm_json_alt": self.llm_json_alt,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }