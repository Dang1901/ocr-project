import datetime
from typing import Any

from sqlalchemy import Column, Integer, String, DateTime
from database import Base

class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(Integer(), primary_key=True, nullable=False)
    user_id = Column(String(36), nullable=True) # There might be anonymous calls
    path = Column(String(8000), nullable=False)
    method = Column(String(200), nullable=False)
    name = Column(String(200), nullable=True)

    response_status = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.now)
    deleted_at = Column(DateTime, default=None, nullable=True)

    def __init__(self, data: dict, **kw: Any):
        super().__init__(**kw)
        self.id = data.get("id", None)
        self.user_id = data.get("user_id", None)
        self.path = data.get("path", None)
        self.method = data.get("method", None)
        self.response_status = data.get("response_status", None)
        self.name = data.get("name", None)

        self.created_at = data.get("created_at", None)
        self.deleted_at = data.get("deleted_at", None)

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "path": self.path,
            "method": self.method,
            "response_status": self.response_status,
            "name": self.name,

            "created_at": self.created_at,
            "deleted_at": self.deleted_at,
        }