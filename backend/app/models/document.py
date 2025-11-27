import datetime
import uuid
from sqlalchemy import Column, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, nullable=False, default=_generate_uuid)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"))
    status = Column(String(64))
    document_type = Column(String(128))  # e.g., "bao_cao_tai_chinh", "luong", "ke_hoach", "nhan_su"
    created_by = Column(String(64), ForeignKey("users.username"))
    owner = Column(String(64), ForeignKey("users.username"))  # Owner of the document (same as created_by when uploaded)
    created_at = Column(Date, default=datetime.date.today)
    
    # Relationships
    department = relationship("Department", back_populates="documents")
    creator = relationship("User", foreign_keys=[created_by], back_populates="documents")
    
    def __init__(self, data: dict = None):
        if data:
            self.id = data.get("id") or _generate_uuid()
            self.filename = data.get("filename")
            self.file_path = data.get("file_path")
            self.department_id = data.get("department_id")
            self.status = data.get("status")
            self.document_type = data.get("document_type")
            self.created_by = data.get("created_by")
            self.owner = data.get("owner")
            self.created_at = data.get("created_at")
    
    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    @property
    def serialize(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "file_path": self.file_path,
            "department_id": self.department_id,
            "status": self.status,
            "document_type": self.document_type,
            "created_by": self.created_by,
            "owner": self.owner,
            "created_at": str(self.created_at) if self.created_at else None,
            "department": self.department.serialize if self.department else None,
        }

