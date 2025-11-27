import datetime
import uuid
from sqlalchemy import Column, String, DateTime
from app.db.base import Base


def _generate_uuid() -> str:
    return str(uuid.uuid4())


class Feature(Base):
    __tablename__ = "features"

    id = Column(String(36), primary_key=True, nullable=False, default=_generate_uuid)
    code = Column(String(128), unique=True, nullable=False)
    name = Column(String(256), nullable=False)
    url = Column(String(512))
    created_at = Column(DateTime, default=datetime.datetime.now)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.now,
        onupdate=datetime.datetime.now,
    )

    def __init__(self, data: dict = None):
        if data:
            self.id = data.get("id") or _generate_uuid()
            self.code = data.get("code")
            self.name = data.get("name")
            self.url = data.get("url")

    def __repr__(self):
        return str(self.as_dict())

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

    @property
    def serialize(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "url": self.url,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

