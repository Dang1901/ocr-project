from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserRoleAssignment(BaseModel):
    user_id: str
    role_ids: List[str]

class UserRoleRemoval(BaseModel):
    user_id: str
    role_ids: List[str]

class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64, description="Username")
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=6, description="User password")
    first_name: Optional[str] = Field(None, max_length=64, description="First name")
    last_name: Optional[str] = Field(None, max_length=64, description="Last name")

class ToggleUserStatusRequest(BaseModel):
    is_active: bool = Field(..., description="User active status (true = active, false = inactive)")

class ResetPasswordResponse(BaseModel):
    new_password: str = Field(..., description="Generated new password")

