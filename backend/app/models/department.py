import datetime
import uuid
from sqlalchemy import Column, String, DateTime, Date
from sqlalchemy.orm import relationship
from app.db.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class Department(Base):
    __tablename__ = "departments"
    
    id = Column(String(36), primary_key=True, nullable=False, default=_generate_uuid)
    name = Column(String(128), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
    )
    
    # Relationships
    users = relationship("User", back_populates="department")
    roles = relationship("Role", back_populates="department")
    documents = relationship("Document", back_populates="department")
    
    def __init__(self, data: dict = None):
        if data:
            self.id = data.get("id") or _generate_uuid()
            self.name = data.get("name")
            self.created_at = data.get("created_at")
            self.updated_at = data.get("updated_at")
    
    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    @property
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class DepartmentType(Base):
    __tablename__ = "department_types"
    
    id = Column(String(36), primary_key=True, nullable=False, default=_generate_uuid)
    code = Column(String(64), nullable=False, unique=True)  # e.g., "bao_cao_tai_chinh", "luong", "ke_hoach", "nhan_su"
    name = Column(String(255), nullable=False)  # e.g., "Báo cáo tài chính", "Lương", "Kế hoạch", "Nhân sự"
    description = Column(String(512), nullable=True)
    created_at = Column(Date, default=datetime.date.today)
    updated_at = Column(Date, default=datetime.date.today, onupdate=datetime.date.today)
    
    def __init__(self, data: dict = None):
        if data:
            self.id = data.get("id") or _generate_uuid()
            self.code = data.get("code")
            self.name = data.get("name")
            self.description = data.get("description")
            self.created_at = data.get("created_at")
            self.updated_at = data.get("updated_at")

