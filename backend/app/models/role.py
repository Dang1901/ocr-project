import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.user_roles import user_roles

# Constants
IS_ACTIVE = 1


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, nullable=False)
    code = Column(String(128), unique=True, nullable=False, index=True)
    level = Column(String(128))  # e.g., "Kế toán viên"
    level_int = Column(Integer)  # Hierarchy level
    department_id = Column(String(36), ForeignKey("departments.id"))
    
    # Legacy fields (for backward compatibility)
    name = Column(String(128))
    is_active = Column(Integer, default=IS_ACTIVE)
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
    )

    # Relationships
    department = relationship("Department", back_populates="roles")
    users = relationship(
        "User", 
        secondary=user_roles, 
        back_populates="roles",
        primaryjoin="Role.id == user_roles.c.role_id",
        secondaryjoin="User.id == user_roles.c.user_id"
    )
    document_permissions = relationship("DocumentPermission", back_populates="role")

    def __init__(self, data: dict = None):
        if data:
            self.id = data.get("id")
            self.code = data.get("code")
            self.level = data.get("level")
            self.level_int = data.get("level_int")
            self.department_id = data.get("department_id")
            # Legacy fields
            self.name = data.get("name")
            self.is_active = data.get("is_active", IS_ACTIVE)

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        # Check if department is loaded before accessing
        department_data = None
        try:
            # Try to access department, if it's loaded
            if self.department:
                department_data = self.department.serialize if hasattr(self.department, 'serialize') else None
        except:
            # If department is not loaded or detached, return None
            department_data = None
        
        return {
            "id": self.id,
            "code": self.code,
            "level": self.level,
            "level_int": self.level_int,
            "department_id": self.department_id,
            "department": department_data,
            # Legacy fields
            "name": self.name,
            "is_active": self.is_active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

