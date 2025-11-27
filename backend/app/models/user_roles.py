from sqlalchemy import Table, Column, String, ForeignKey
from app.db.base import Base

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", String(36), ForeignKey("users.id"), primary_key=True),
    Column("role_id", String(36), ForeignKey("roles.id"), primary_key=True),
    Column("username", String(64), nullable=True),
    Column("role_code", String(128), nullable=True),
)

