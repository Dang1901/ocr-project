import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class DocumentPermission(Base):
    __tablename__ = "document_permissions"
    
    id = Column(String(36), primary_key=True, nullable=False, default=_generate_uuid)
    role_code = Column(String(128), ForeignKey("roles.code"), nullable=False)
    document_type = Column(String(128), nullable=False)
    can_view = Column(Boolean, default=False)
    can_edit = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    
    # Relationships
    role = relationship("Role", back_populates="document_permissions")
    
    def __init__(self, data: dict = None):
        if data:
            self.id = data.get("id") or _generate_uuid()
            self.role_code = data.get("role_code")
            self.document_type = data.get("document_type")
            self.can_view = data.get("can_view", False)
            self.can_edit = data.get("can_edit", False)
            self.can_delete = data.get("can_delete", False)
    
    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    @property
    def serialize(self):
        return {
            "id": self.id,
            "role_code": self.role_code,
            "document_type": self.document_type,
            "can_view": self.can_view,
            "can_edit": self.can_edit,
            "can_delete": self.can_delete,
        }

