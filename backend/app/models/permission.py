import datetime
from sqlalchemy import Column, String, DateTime, UniqueConstraint
from app.db.base import Base


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String(36), primary_key=True, nullable=False)
    role_id = Column(String(36), nullable=False)
    role_code = Column(String(128), nullable=False)
    feature_id = Column(String(36), nullable=False)
    feature_code = Column(String(128), nullable=False)
    operation = Column(String(64), nullable=False)  # Bỏ unique=True - nhiều roles có thể có cùng operation
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
    )
    
    # Composite unique constraint: mỗi role chỉ có một permission cho mỗi (feature_code, operation)
    __table_args__ = (
        UniqueConstraint('role_id', 'feature_code', 'operation', name='uq_permission_role_feature_operation'),
    )

    def __init__(self, data: dict):
        self.id = data.get("id")
        self.role_id = data.get("role_id")
        self.role_code = data.get("role_code")
        self.feature_id = data.get("feature_id")
        self.feature_code = data.get("feature_code")
        self.operation = data.get("operation")

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            "id": self.id,
            "role_id": self.role_id,
            "role_code": self.role_code,
            "feature_id": self.feature_id,
            "feature_code": self.feature_code,
            "operation": self.operation,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

