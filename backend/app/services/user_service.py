import inject
import uuid
import logging
from datetime import datetime
from typing import Tuple, Optional

from app.repository.user.user_interface import UserInterface
from app.models.user import User as UserEntity, IS_ACTIVE, IS_NOT_DELETED
from app.utils.utils import data_time_serialize
from app.core.security import get_password_hash


class UserService:
    """Service for managing user operations"""
    
    @inject.autoparams()
    def __init__(self, user: UserInterface):
        self.__user = user

    # USER RETRIEVAL METHODS
    def get_users(self, q: str, page: int, page_size: int) -> Tuple:
        """Get paginated list of users with search query"""
        users, count = self.__user.get_users(q=q, page=page, page_size=page_size)
        return (
            data_time_serialize([user.serialize for user in users]),
            count,
        )

    def get_user_by_id(self, user_id: str) -> UserEntity:
        """Get user by ID"""
        return self.__user.get_user_by_id(user_id=user_id)

    def get_user_by_email(self, email: str) -> UserEntity:
        """Get user by email"""
        return self.__user.get_user_by_email(email=email)

    def get_user_by_username(self, username: str) -> UserEntity:
        """Get user by username"""
        return self.__user.get_user_by_username(username=username)

    def get_user_info_by_id(self, user_id: str) -> UserEntity:
        """Get user info (serialized) by ID"""
        user = self.__user.get_user_by_id(user_id=user_id)
        return data_time_serialize(user.serialize) if user else None

    # USER SEARCH METHODS
    def search_user_by_username(self, username: str) -> list:
        """Search users by username"""
        users = self.__user.search_user_by_username(username)
        return data_time_serialize([user.serialize for user in users])

    def search_user_by_email(self, email: str) -> list:
        """Search users by email"""
        users = self.__user.search_user_by_email(email)
        return data_time_serialize([user.serialize for user in users])

    # USER CRUD OPERATIONS
    def insert_users(self, users: [UserEntity]) -> bool:
        """Insert multiple users"""
        return self.__user.insert_users(users=users)

    def delete_user(self, user: UserEntity) -> bool:
        """Delete a user"""
        return self.__user.delete_user(user=user)

    # USER CREATION & PASSWORD MANAGEMENT
    def create_user(self, username: str, email: str, password: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> UserEntity:
        """Create a new user with hashed password"""
        try:
            # Check if user already exists
            existing_user = self.get_user_by_email(email)
            if existing_user:
                raise ValueError("User with this email already exists")
            
            # Hash password
            hashed_password = get_password_hash(password)
            
            # Create user entity
            now = datetime.now()
            user_data = {
                "id": str(uuid.uuid4()),
                "username": username,
                "email": email,
                "password": hashed_password,
                "first_name": first_name,
                "last_name": last_name,
                "status": "ACTIVE",
                "is_active": IS_ACTIVE,
                "is_deleted": IS_NOT_DELETED,
                "created_at": now,
                "updated_at": now,
            }
            
            user = UserEntity(user_data)
            
            # Insert user
            success = self.__user.insert_users([user])
            if not success:
                raise ValueError("Failed to create user")
            
            return user
        except Exception as e:
            logging.error(f"Error creating user: {e}")
            raise
    
    def update_user_password(self, user_id: str, hashed_password: str) -> bool:
        """Update user password"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise ValueError("User not found")
            
            user.password = hashed_password
            user.updated_at = datetime.now()
            
            return self.__user.update_user(user)
        except Exception as e:
            logging.error(f"Error updating user password: {e}")
            raise
    
    def toggle_user_status(self, user_id: str, is_active: bool) -> bool:
        """Toggle user active/inactive status"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise ValueError("User not found")
            
            # Convert boolean to string format used in database ("1" = active, "0" = inactive)
            user.is_active = "1" if is_active else "0"
            user.status = "ACTIVE" if is_active else "INACTIVE"
            user.updated_at = datetime.now()
            
            return self.__user.update_user(user)
        except Exception as e:
            logging.error(f"Error toggling user status for user {user_id}: {e}")
            raise
    
    def reset_user_password(self, user_id: str) -> str:
        """Reset user password and return the new generated password"""
        import secrets
        import string
        
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise ValueError("User not found")
            
            # Generate a random password (12 characters: letters + digits)
            alphabet = string.ascii_letters + string.digits
            new_password = ''.join(secrets.choice(alphabet) for i in range(12))
            
            # Hash the new password
            hashed_password = get_password_hash(new_password)
            
            # Update user password
            user.password = hashed_password
            user.updated_at = datetime.now()
            
            success = self.__user.update_user(user)
            if not success:
                raise ValueError("Failed to reset password")
            
            return new_password
        except Exception as e:
            logging.error(f"Error resetting password for user {user_id}: {e}")
            raise

    # USER-ROLE MANAGEMENT
    def assign_roles_to_user(self, user_id: str, role_ids: list) -> bool:
        """Assign roles to a user"""
        try:
            return self.__user.assign_roles_to_user(user_id, role_ids)
        except Exception as e:
            logging.error(f"Error assigning roles to user {user_id}: {e}")
            return False

    def remove_roles_from_user(self, user_id: str, role_ids: list) -> bool:
        """Remove roles from a user"""
        try:
            return self.__user.remove_roles_to_user(user_id, role_ids)
        except Exception as e:
            logging.error(f"Error removing roles from user {user_id}: {e}")
            return False

    def get_user_roles(self, user_id: str) -> list:
        """Get all roles assigned to a user"""
        try:
            roles = self.__user.get_user_roles(user_id)
            return data_time_serialize([role.serialize for role in roles]) if roles else []
        except Exception as e:
            logging.error(f"Error getting roles for user {user_id}: {e}")
            return []

    def update_user_roles(self, user_id: str, role_ids: list) -> bool:
        """Update user roles (replace all existing roles with new ones)"""
        try:
            return self.__user.update_user_roles(user_id, role_ids)
        except Exception as e:
            logging.error(f"Error updating roles for user {user_id}: {e}")
            return False

    def get_users_by_role(self, role_id: str, q: str, page: int, page_size: int) -> Tuple:
        """Get all users assigned to a specific role"""
        try:
            users, count = self.__user.get_users_by_role(role_id, q=q, page=page, page_size=page_size)
            return (
                data_time_serialize([user.serialize for user in users]),
                count,
            )
        except Exception as e:
            logging.error(f"Error getting users for role {role_id}: {e}")
            return [], 0

    # USER SYNCHRONIZATION
    def sync_users_from_api(self) -> bool:
        users_response = self.__user.get_users_from_api()
        if not users_response or users_response.get("total", 0) == 0:
            return True

        users_data = users_response.get("data", [])
        if not users_data:
            return True

        try:
            existing_users = self.get_users(q="", page=1, page_size=100000)[0]
            existing_emails = set(user["email"] for user in existing_users)
            existing_ids = set(user["id"] for user in existing_users)

            new_users = []
            user_fields = set(c.name for c in UserEntity.__table__.columns)
            for user_dict in users_data:
                if "user_name" in user_dict:
                    user_dict["username"] = user_dict.pop("user_name")
                if not user_dict.get("id"):
                    user_dict["id"] = str(uuid.uuid4())
                filtered_data = {k: v for k, v in user_dict.items() if k in user_fields}
                if filtered_data["email"] not in existing_emails and filtered_data["id"] not in existing_ids:
                    user = UserEntity(filtered_data)
                    new_users.append(user)
            if new_users:
                logging.info(f"Sync users from API - insert {len(new_users)} new users")
                return self.insert_users(new_users)
            return True
        except Exception as e:
            logging.error(f"Error syncing users from API: {e}")
            return False

    def search_user_by_username(self, username: str) -> list:
        users = self.__user.search_user_by_username(username)
        return data_time_serialize([user.serialize for user in users])

    def search_user_by_email(self, email: str) -> list:
        users = self.__user.search_user_by_email(email)
        return data_time_serialize([user.serialize for user in users])

    def assign_roles_to_user(self, user_id: str, role_ids: list) -> bool:
        """Assign roles to a user"""
        try:
            return self.__user.assign_roles_to_user(user_id, role_ids)
        except Exception as e:
            logging.error(f"Error assigning roles to user {user_id}: {e}")
            return False

    def remove_roles_from_user(self, user_id: str, role_ids: list) -> bool:
        """Remove roles from a user"""
        try:
            return self.__user.remove_roles_to_user(user_id, role_ids)
        except Exception as e:
            logging.error(f"Error removing roles from user {user_id}: {e}")
            return False

    def get_user_roles(self, user_id: str) -> list:
        """Get all roles assigned to a user"""
        try:
            roles = self.__user.get_user_roles(user_id)
            return data_time_serialize([role.serialize for role in roles]) if roles else []
        except Exception as e:
            logging.error(f"Error getting roles for user {user_id}: {e}")
            return []

    def update_user_roles(self, user_id: str, role_ids: list) -> bool:
        """Update user roles (replace all existing roles with new ones)"""
        try:
            return self.__user.update_user_roles(user_id, role_ids)
        except Exception as e:
            logging.error(f"Error updating roles for user {user_id}: {e}")
            return False

    def get_users_by_role(self, role_id: str, q: str, page: int, page_size: int) -> Tuple:
        """Get all users assigned to a specific role"""
        try:
            users, count = self.__user.get_users_by_role(role_id, q=q, page=page, page_size=page_size)
            return (
                data_time_serialize([user.serialize for user in users]),
                count,
            )
        except Exception as e:
            logging.error(f"Error getting users for role {role_id}: {e}")
            return [], 0

    def create_user(self, username: str, email: str, password: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> UserEntity:
        """Create a new user with hashed password"""
        try:
            # Check if user already exists
            existing_user = self.get_user_by_email(email)
            if existing_user:
                raise ValueError("User with this email already exists")
            
            # Hash password
            hashed_password = get_password_hash(password)
            
            # Create user entity
            now = datetime.now()
            user_data = {
                "id": str(uuid.uuid4()),
                "username": username,
                "email": email,
                "password": hashed_password,
                "first_name": first_name,
                "last_name": last_name,
                "status": "ACTIVE",
                "is_active": IS_ACTIVE,
                "is_deleted": IS_NOT_DELETED,
                "created_at": now,
                "updated_at": now,
            }
            
            user = UserEntity(user_data)
            
            # Insert user
            success = self.__user.insert_users([user])
            if not success:
                raise ValueError("Failed to create user")
            
            return user
        except Exception as e:
            logging.error(f"Error creating user: {e}")
            raise
    
    def update_user_password(self, user_id: str, hashed_password: str) -> bool:
        """Update user password"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise ValueError("User not found")
            
            user.password = hashed_password
            user.updated_at = datetime.now()
            
            return self.__user.update_user(user)
        except Exception as e:
            logging.error(f"Error updating user password: {e}")
            raise
    
    def toggle_user_status(self, user_id: str, is_active: bool) -> bool:
        """Toggle user active/inactive status"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise ValueError("User not found")
            
            # Convert boolean to string format used in database ("1" = active, "0" = inactive)
            user.is_active = "1" if is_active else "0"
            user.status = "ACTIVE" if is_active else "INACTIVE"
            user.updated_at = datetime.now()
            
            return self.__user.update_user(user)
        except Exception as e:
            logging.error(f"Error toggling user status for user {user_id}: {e}")
            raise
    
    def reset_user_password(self, user_id: str) -> str:
        """Reset user password and return the new generated password"""
        import secrets
        import string
        
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise ValueError("User not found")
            
            # Generate a random password (12 characters: letters + digits)
            alphabet = string.ascii_letters + string.digits
            new_password = ''.join(secrets.choice(alphabet) for i in range(12))
            
            # Hash the new password
            hashed_password = get_password_hash(new_password)
            
            # Update user password
            user.password = hashed_password
            user.updated_at = datetime.now()
            
            success = self.__user.update_user(user)
            if not success:
                raise ValueError("Failed to reset password")
            
            return new_password
        except Exception as e:
            logging.error(f"Error resetting password for user {user_id}: {e}")
            raise

