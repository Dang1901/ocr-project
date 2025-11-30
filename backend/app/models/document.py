import datetime
import uuid
from sqlalchemy import Column, String, ForeignKey, Integer, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, nullable=False, default=_generate_uuid)
    filename = Column(String(255), nullable=True)
    file_path = Column(String(512), nullable=True)
    department_id = Column(String(36), ForeignKey("departments.id"))
    status = Column(String(64), nullable=True, default="uploading")
    document_type = Column(String(128), nullable=True)  # e.g., "bao_cao_tai_chinh", "luong", "ke_hoach", "nhan_su"
    created_by = Column(String(64), ForeignKey("users.username"))
    owner = Column(String(64), ForeignKey("users.username"))  # Owner of the document (same as created_by when uploaded)
    total_pages = Column(Integer, nullable=False, default=0)
    
    # Relationships
    department = relationship("Department", back_populates="documents")
    creator = relationship("User", foreign_keys=[created_by], back_populates="documents")
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __init__(self, data: dict):
        if data:
            self.id = data.get("id") or _generate_uuid()
            self.filename = data.get("filename")
            self.file_path = data.get("file_path") or data.get("s3_path") # Support backward compatibility when creating
            self.department_id = data.get("department_id")
            self.status = data.get("status", "uploading")  # Fixed: was data.get("uploading")
            self.document_type = data.get("document_type")
            self.created_by = data.get("created_by")
            self.owner = data.get("owner")
            self.total_pages = data.get("total_pages", 0)
            self.created_at = data.get("created_at")
            self.updated_at = data.get("updated_at")
            
    def __repr__(self):
        return str(self.as_dict())       
    
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
            "owner": self.owner,
            "department": self.department.serialize if self.department else None,
            "total_pages": self.total_pages,
            "created_at": str(self.created_at) if self.created_at else None,
            "updated_at": str(self.updated_at) if self.updated_at else None,
        }

