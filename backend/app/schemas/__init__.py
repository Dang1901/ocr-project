# Schemas package
from app.schemas.user import UserRoleAssignment, UserRoleRemoval
from app.schemas.auth import LoginRequest, RefreshTokenRequest, TokenResponse, ValidateTokenResponse
from app.schemas.role import RoleBase, Role, PaginatedRoleResponse
from app.schemas.permission import (
    PermissionBase, Permission, PermissionCustom, 
    PermissionResponse, PaginatedPermissionResponse
)
from app.schemas.feature import FeatureBase, Feature, PaginatedFeatureResponse
from app.schemas.department import (
    DepartmentBase,
    DepartmentCreate,
    DepartmentUpdate,
    Department,
    PaginatedDepartmentResponse,
)
from app.schemas.document import (
    DocumentBase,
    DocumentCreate,
    DocumentUpdate,
    Document,
    PaginatedDocumentResponse,
)

__all__ = [
    "UserRoleAssignment", "UserRoleRemoval", 
    "LoginRequest", "RefreshTokenRequest", "TokenResponse", "ValidateTokenResponse",
    "RoleBase", "Role", "PaginatedRoleResponse",
    "PermissionBase", "Permission", "PermissionCustom", "PermissionResponse", "PaginatedPermissionResponse",
    "FeatureBase", "Feature", "PaginatedFeatureResponse",
    "DepartmentBase", "DepartmentCreate", "DepartmentUpdate", "Department", "PaginatedDepartmentResponse",
    "DocumentBase", "DocumentCreate", "DocumentUpdate", "Document", "PaginatedDocumentResponse",
]

