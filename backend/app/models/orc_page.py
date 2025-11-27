import datetime
from sqlalchemy import (
    Column, String, DateTime, Enum, Text, func, UniqueConstraint, ForeignKey, Integer
)
from sqlalchemy.dialects.mysql import JSON
from app.db.base import Base


class OcrPage(Base):
    __tablename__ = "ocr_pages"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
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

    def __init__(self, data: dict):
        if "id" in data:
            self.id = data.get("id")
        self.document_id = data.get("document_id")
        self.page_number = data.get("page_number")
        self.status = data.get("status", "pending")
        self.ocr_markdown = data.get("ocr_markdown")
        self.llm_json = data.get("llm_json")
        self.llm_json_alt = data.get("llm_json_alt")

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