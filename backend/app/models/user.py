import datetime
import logging
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.user_roles import user_roles

# Constants
IS_ACTIVE = 1
IS_NOT_DELETED = 0


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, nullable=False)
    username = Column(String(64), unique=True, nullable=False, index=True)
    fullname = Column(String(128))
    password = Column(String(255))
    email = Column(String(64), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"))
    
    # Legacy fields (for backward compatibility, can be removed later)
    first_name = Column(String(64))
    last_name = Column(String(64))
    status = Column(String(64), default="ACTIVE")
    is_deleted = Column(String(64), default=IS_NOT_DELETED)
    is_active = Column(String(64), default=IS_ACTIVE)
    created_at = Column(DateTime, default=datetime.datetime.now)
    created_by = Column(String(36))
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now(),
        onupdate=datetime.datetime.now,
    )
    updated_by = Column(String(36))

    # Relationships
    department = relationship("Department", back_populates="users")
    roles = relationship(
        "Role", 
        secondary=user_roles, 
        back_populates="users", 
        lazy="joined",
        primaryjoin="User.id == user_roles.c.user_id",
        secondaryjoin="Role.id == user_roles.c.role_id"
    )
    documents = relationship("Document", foreign_keys="Document.created_by", back_populates="creator")

    def __init__(self, data: dict = None):
        if data:
            self.id = data.get("id")
            self.username = data.get("username")
            self.fullname = data.get("fullname")
            self.password = data.get("password")
            self.email = data.get("email")
            self.department_id = data.get("department_id")
            self.first_name = data.get("first_name")
            self.last_name = data.get("last_name")
            self.status = data.get("status", "ACTIVE")
            self.is_active = data.get("is_active", IS_ACTIVE)
            self.is_deleted = data.get("is_deleted", IS_NOT_DELETED)
            self.created_at = data.get("created_at")
            self.created_by = data.get("created_by")
            self.updated_at = data.get("updated_at")
            self.updated_by = data.get("updated_by")

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        # Safely serialize roles - don't fail entire user serialization if one role fails
        roles_data = []
        if self.roles:
            for role in self.roles:
                try:
                    roles_data.append(role.serialize)
                except Exception as e:
                    # Log error but don't fail the entire user serialization
                    logging.warning(f"Error serializing role {getattr(role, 'id', 'unknown')}: {e}")
                    # Add basic role info if serialize fails
                    roles_data.append({
                        "id": getattr(role, 'id', None),
                        "code": getattr(role, 'code', None),
                        "level": getattr(role, 'level', None),
                        "level_int": getattr(role, 'level_int', None),
                        "department_id": getattr(role, 'department_id', None),
                        "department": None,  # Failed to serialize department
                    })
        
        # Safely serialize department
        department_data = None
        try:
            if self.department:
                department_data = self.department.serialize if hasattr(self.department, 'serialize') else None
        except Exception as e:
            logging.warning(f"Error serializing department for user {self.id}: {e}")
            department_data = None
        
        return {
            "id": self.id,
            "username": self.username,
            "fullname": self.fullname,
            "email": self.email,
            "department_id": self.department_id,
            "department": department_data,
            "roles": roles_data,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
