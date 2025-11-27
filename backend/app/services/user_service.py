import inject
import uuid
import logging
from datetime import datetime
from typing import Tuple, Optional

from app.repository.user.user_interface import UserInterface
from app.models.user import User as UserEntity, IS_ACTIVE, IS_NOT_DELETED
from app.utils.utils import data_time_serialize
from app.core.security import get_password_hash
from fastapi_mail import FastMail, MessageSchema
from app.core.email_config import mail_conf
from app.core.config import settings


class UserService:
    """Service for managing user operations"""
    
    @inject.autoparams()
    def __init__(self, user: UserInterface):
        self.__user = user

    # USER RETRIEVAL METHODS
    def get_users(self, q: str, page: int, page_size: int) -> Tuple:
        """Get paginated list of users with search query"""
        users, count = self.__user.get_users(q=q, page=page, page_size=page_size)
        
        # Safely serialize users - skip users that fail to serialize
        serialized_users = []
        for user in users:
            try:
                serialized_users.append(user.serialize)
            except Exception as e:
                logging.error(f"Error serializing user {getattr(user, 'id', 'unknown')}: {e}")
                # Add basic info if serialize fails
                try:
                    serialized_users.append({
                        "id": getattr(user, 'id', None),
                        "username": getattr(user, 'username', None),
                        "email": getattr(user, 'email', None),
                        "fullname": getattr(user, 'fullname', None),
                        "department_id": getattr(user, 'department_id', None),
                        "department": None,
                        "roles": [],
                        "error": "Failed to serialize user data"
                    })
                except:
                    # If even basic info fails, skip this user entirely
                    logging.warning(f"Could not serialize even basic info for user {getattr(user, 'id', 'unknown')}")
                    pass
        
        return (
            data_time_serialize(serialized_users),
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
        if not user:
            return None
        try:
            return data_time_serialize(user.serialize)
        except Exception as e:
            logging.error(f"Error serializing user {user_id}: {e}")
            # Return basic info if serialize fails
            try:
                return data_time_serialize({
                    "id": getattr(user, 'id', None),
                    "username": getattr(user, 'username', None),
                    "email": getattr(user, 'email', None),
                    "fullname": getattr(user, 'fullname', None),
                    "department_id": getattr(user, 'department_id', None),
                    "department": None,
                    "roles": [],
                    "error": "Failed to serialize user data"
                })
            except:
                return None

    # USER SEARCH METHODS
    def search_user_by_username(self, username: str) -> list:
        """Search users by username"""
        users = self.__user.search_user_by_username(username)
        serialized_users = []
        for user in users:
            try:
                serialized_users.append(user.serialize)
            except Exception as e:
                logging.error(f"Error serializing user {getattr(user, 'id', 'unknown')}: {e}")
                try:
                    serialized_users.append({
                        "id": getattr(user, 'id', None),
                        "username": getattr(user, 'username', None),
                        "email": getattr(user, 'email', None),
                        "fullname": getattr(user, 'fullname', None),
                        "department_id": getattr(user, 'department_id', None),
                        "department": None,
                        "roles": [],
                    })
                except:
                    pass
        return data_time_serialize(serialized_users)

    def search_user_by_email(self, email: str) -> list:
        """Search users by email"""
        users = self.__user.search_user_by_email(email)
        serialized_users = []
        for user in users:
            try:
                serialized_users.append(user.serialize)
            except Exception as e:
                logging.error(f"Error serializing user {getattr(user, 'id', 'unknown')}: {e}")
                try:
                    serialized_users.append({
                        "id": getattr(user, 'id', None),
                        "username": getattr(user, 'username', None),
                        "email": getattr(user, 'email', None),
                        "fullname": getattr(user, 'fullname', None),
                        "department_id": getattr(user, 'department_id', None),
                        "department": None,
                        "roles": [],
                    })
                except:
                    pass
        return data_time_serialize(serialized_users)

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
            
            # Preserve is_deleted value to ensure it doesn't change during status toggle
            current_is_deleted = user.is_deleted
            
            # Convert boolean to string format used in database ("1" = active, "0" = inactive)
            user.is_active = "1" if is_active else "0"
            user.status = "ACTIVE" if is_active else "INACTIVE"
            user.updated_at = datetime.now()
            
            # Ensure is_deleted is not changed - only toggle is_active and status
            user.is_deleted = current_is_deleted
            
            return self.__user.update_user(user)
        except Exception as e:
            logging.error(f"Error toggling user status for user {user_id}: {e}")
            raise
    
    async def reset_user_password(self, user_id: str) -> None:
        """Reset user password and send new password via email"""
        import secrets
        import string
        from datetime import datetime as dt
        
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise ValueError("User not found")
            
            if not user.email:
                raise ValueError("User email not found. Cannot send password reset email.")
            
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
            
            # Send email with new password
            if mail_conf.MAIL_USERNAME and mail_conf.MAIL_PASSWORD:
                try:
                    app_name = settings.APP_NAME
                    logo_url = settings.APP_LOGO_URL
                    app_domain = settings.APP_DOMAIN
                    
                    html_body = f"""
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Password Reset - {app_name}</title>
                        <style>
                            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                                   line-height: 1.6; color: #333333; background-color: #f5f5f5; }}
                            .email-wrapper {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
                            .email-header {{ background: linear-gradient(135deg, #1A3636 0%, #2d4f4f 100%); padding: 40px 30px; text-align: center; }}
                            .logo-container {{ margin-bottom: 20px; }}
                            .logo {{ max-width: 180px; height: auto; display: inline-block; }}
                            .email-header h1 {{ color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; }}
                            .email-body {{ padding: 40px 30px; background-color: #ffffff; }}
                            .greeting {{ font-size: 16px; color: #333333; margin-bottom: 20px; }}
                            .message {{ font-size: 15px; color: #666666; margin-bottom: 30px; line-height: 1.8; }}
                            .password-container {{ background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                                                border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; 
                                                border: 2px dashed #1A3636; }}
                            .password-label {{ font-size: 14px; color: #666666; margin-bottom: 15px; text-transform: uppercase; 
                                            letter-spacing: 1px; font-weight: 600; }}
                            .password-code {{ font-size: 32px; font-weight: 700; color: #1A3636; letter-spacing: 4px; 
                                           font-family: 'Courier New', monospace; margin: 10px 0; word-break: break-all; }}
                            .warning-box {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; 
                                          margin: 25px 0; border-radius: 4px; }}
                            .warning-box p {{ font-size: 14px; color: #856404; margin: 0; line-height: 1.6; }}
                            .warning-icon {{ font-size: 18px; margin-right: 8px; }}
                            .email-footer {{ background-color: #f8f9fa; padding: 30px; text-align: center; 
                                           border-top: 1px solid #e9ecef; }}
                            .footer-text {{ font-size: 12px; color: #999999; margin-bottom: 10px; line-height: 1.6; }}
                            .footer-links {{ margin-top: 15px; }}
                            .footer-links a {{ color: #1A3636; text-decoration: none; margin: 0 10px; font-size: 12px; }}
                            .footer-links a:hover {{ text-decoration: underline; }}
                            .divider {{ height: 1px; background-color: #e9ecef; margin: 25px 0; }}
                            @media only screen and (max-width: 600px) {{
                                .email-body {{ padding: 25px 20px; }}
                                .email-header {{ padding: 30px 20px; }}
                                .password-code {{ font-size: 24px; letter-spacing: 2px; }}
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="email-wrapper">
                            <div class="email-header">
                                <div class="logo-container">
                                    <img src="{logo_url}" alt="{app_name} Logo" class="logo" />
                                </div>
                                <h1>Password Reset</h1>
                            </div>
                            
                            <div class="email-body">
                                <div class="greeting">
                                    <strong>Hello {user.username or user.email},</strong>
                                </div>
                                
                                <div class="message">
                                    <p>Your password has been reset by an administrator. Please use the new password below to log in to your <strong>{app_name}</strong> account.</p>
                                </div>
                                
                                <div class="password-container">
                                    <div class="password-label">Your New Password</div>
                                    <div class="password-code">{new_password}</div>
                                </div>
                                
                                <div class="warning-box">
                                    <p>
                                        <span class="warning-icon">⚠️</span>
                                        <strong>Security Notice:</strong> Please change this password after logging in for security purposes. 
                                        If you did not request this password reset, please contact your administrator immediately.
                                    </p>
                                </div>
                                
                                <div class="divider"></div>
                                
                                <div class="message">
                                    <p style="font-size: 14px; color: #999999;">
                                        <strong>Need help?</strong> If you're having trouble, please contact our support team 
                                        or visit our help center.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="email-footer">
                                <div class="footer-text">
                                    <p>This is an automated message from <strong>{app_name}</strong>.</p>
                                    <p>Please do not reply to this email. This mailbox is not monitored.</p>
                                </div>
                                <div class="footer-links">
                                    <a href="{app_domain}">Visit Website</a> |
                                    <a href="{app_domain}/support">Support</a> |
                                    <a href="{app_domain}/privacy">Privacy Policy</a>
                                </div>
                                <div class="footer-text" style="margin-top: 20px;">
                                    <p>© {dt.utcnow().year} {app_name}. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    
                    message = MessageSchema(
                        subject="🔐 Password Reset - New Password",
                        recipients=[user.email],
                        body=html_body,
                        subtype="html",
                    )
                    
                    fm = FastMail(mail_conf)
                    await fm.send_message(message)
                    logging.info(f"Password reset email sent to {user.email}")
                    
                except Exception as email_error:
                    logging.error(f"Failed to send password reset email to {user.email}: {email_error}", exc_info=True)
                    # In dev mode, log password for testing
                    if not mail_conf.MAIL_USERNAME or not mail_conf.MAIL_PASSWORD:
                        logging.info(f"[DEV MODE] Password reset for {user.email}: {new_password}")
                    raise ValueError(f"Password reset but failed to send email: {str(email_error)}")
            else:
                # Dev mode: log password if email config is not available
                logging.info(f"[DEV MODE] Password reset for {user.email}: {new_password}")
            
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
                # Generate UUID if id is not provided
                if not user_dict.get("id"):
                    user_dict["id"] = str(uuid.uuid4())
                filtered_data = {k: v for k, v in user_dict.items() if k in user_fields}
                # Check by email and id
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
            if not roles:
                return []
            serialized_roles = []
            for role in roles:
                try:
                    serialized_roles.append(role.serialize)
                except Exception as e:
                    logging.error(f"Error serializing role {getattr(role, 'id', 'unknown')}: {e}")
                    try:
                        serialized_roles.append({
                            "id": getattr(role, 'id', None),
                            "code": getattr(role, 'code', None),
                            "level": getattr(role, 'level', None),
                            "level_int": getattr(role, 'level_int', None),
                            "department_id": getattr(role, 'department_id', None),
                            "department": None,
                        })
                    except:
                        pass
            return data_time_serialize(serialized_roles)
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
            serialized_users = []
            for user in users:
                try:
                    serialized_users.append(user.serialize)
                except Exception as e:
                    logging.error(f"Error serializing user {getattr(user, 'id', 'unknown')}: {e}")
                    try:
                        serialized_users.append({
                            "id": getattr(user, 'id', None),
                            "username": getattr(user, 'username', None),
                            "email": getattr(user, 'email', None),
                            "fullname": getattr(user, 'fullname', None),
                            "department_id": getattr(user, 'department_id', None),
                            "department": None,
                            "roles": [],
                        })
                    except:
                        pass
            return (
                data_time_serialize(serialized_users),
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
            
            # Preserve is_deleted value to ensure it doesn't change during status toggle
            current_is_deleted = user.is_deleted
            
            # Convert boolean to string format used in database ("1" = active, "0" = inactive)
            user.is_active = "1" if is_active else "0"
            user.status = "ACTIVE" if is_active else "INACTIVE"
            user.updated_at = datetime.now()
            
            # Ensure is_deleted is not changed - only toggle is_active and status
            user.is_deleted = current_is_deleted
            
            return self.__user.update_user(user)
        except Exception as e:
            logging.error(f"Error toggling user status for user {user_id}: {e}")
            raise
    
    async def reset_user_password(self, user_id: str) -> None:
        """Reset user password and send new password via email"""
        import secrets
        import string
        from datetime import datetime as dt
        
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                raise ValueError("User not found")
            
            if not user.email:
                raise ValueError("User email not found. Cannot send password reset email.")
            
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
            
            # Send email with new password
            if mail_conf.MAIL_USERNAME and mail_conf.MAIL_PASSWORD:
                try:
                    app_name = settings.APP_NAME
                    logo_url = settings.APP_LOGO_URL
                    app_domain = settings.APP_DOMAIN
                    
                    html_body = f"""
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Password Reset - {app_name}</title>
                        <style>
                            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                                   line-height: 1.6; color: #333333; background-color: #f5f5f5; }}
                            .email-wrapper {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
                            .email-header {{ background: linear-gradient(135deg, #1A3636 0%, #2d4f4f 100%); padding: 40px 30px; text-align: center; }}
                            .logo-container {{ margin-bottom: 20px; }}
                            .logo {{ max-width: 180px; height: auto; display: inline-block; }}
                            .email-header h1 {{ color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; }}
                            .email-body {{ padding: 40px 30px; background-color: #ffffff; }}
                            .greeting {{ font-size: 16px; color: #333333; margin-bottom: 20px; }}
                            .message {{ font-size: 15px; color: #666666; margin-bottom: 30px; line-height: 1.8; }}
                            .password-container {{ background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                                                border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; 
                                                border: 2px dashed #1A3636; }}
                            .password-label {{ font-size: 14px; color: #666666; margin-bottom: 15px; text-transform: uppercase; 
                                            letter-spacing: 1px; font-weight: 600; }}
                            .password-code {{ font-size: 32px; font-weight: 700; color: #1A3636; letter-spacing: 4px; 
                                           font-family: 'Courier New', monospace; margin: 10px 0; word-break: break-all; }}
                            .warning-box {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; 
                                          margin: 25px 0; border-radius: 4px; }}
                            .warning-box p {{ font-size: 14px; color: #856404; margin: 0; line-height: 1.6; }}
                            .warning-icon {{ font-size: 18px; margin-right: 8px; }}
                            .email-footer {{ background-color: #f8f9fa; padding: 30px; text-align: center; 
                                           border-top: 1px solid #e9ecef; }}
                            .footer-text {{ font-size: 12px; color: #999999; margin-bottom: 10px; line-height: 1.6; }}
                            .footer-links {{ margin-top: 15px; }}
                            .footer-links a {{ color: #1A3636; text-decoration: none; margin: 0 10px; font-size: 12px; }}
                            .footer-links a:hover {{ text-decoration: underline; }}
                            .divider {{ height: 1px; background-color: #e9ecef; margin: 25px 0; }}
                            @media only screen and (max-width: 600px) {{
                                .email-body {{ padding: 25px 20px; }}
                                .email-header {{ padding: 30px 20px; }}
                                .password-code {{ font-size: 24px; letter-spacing: 2px; }}
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="email-wrapper">
                            <div class="email-header">
                                <div class="logo-container">
                                    <img src="{logo_url}" alt="{app_name} Logo" class="logo" />
                                </div>
                                <h1>Password Reset</h1>
                            </div>
                            
                            <div class="email-body">
                                <div class="greeting">
                                    <strong>Hello {user.username or user.email},</strong>
                                </div>
                                
                                <div class="message">
                                    <p>Your password has been reset by an administrator. Please use the new password below to log in to your <strong>{app_name}</strong> account.</p>
                                </div>
                                
                                <div class="password-container">
                                    <div class="password-label">Your New Password</div>
                                    <div class="password-code">{new_password}</div>
                                </div>
                                
                                <div class="warning-box">
                                    <p>
                                        <span class="warning-icon">⚠️</span>
                                        <strong>Security Notice:</strong> Please change this password after logging in for security purposes. 
                                        If you did not request this password reset, please contact your administrator immediately.
                                    </p>
                                </div>
                                
                                <div class="divider"></div>
                                
                                <div class="message">
                                    <p style="font-size: 14px; color: #999999;">
                                        <strong>Need help?</strong> If you're having trouble, please contact our support team 
                                        or visit our help center.
                                    </p>
                                </div>
                            </div>
                            
                            <div class="email-footer">
                                <div class="footer-text">
                                    <p>This is an automated message from <strong>{app_name}</strong>.</p>
                                    <p>Please do not reply to this email. This mailbox is not monitored.</p>
                                </div>
                                <div class="footer-links">
                                    <a href="{app_domain}">Visit Website</a> |
                                    <a href="{app_domain}/support">Support</a> |
                                    <a href="{app_domain}/privacy">Privacy Policy</a>
                                </div>
                                <div class="footer-text" style="margin-top: 20px;">
                                    <p>© {dt.utcnow().year} {app_name}. All rights reserved.</p>
                                </div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    
                    message = MessageSchema(
                        subject="🔐 Password Reset - New Password",
                        recipients=[user.email],
                        body=html_body,
                        subtype="html",
                    )
                    
                    fm = FastMail(mail_conf)
                    await fm.send_message(message)
                    logging.info(f"Password reset email sent to {user.email}")
                    
                except Exception as email_error:
                    logging.error(f"Failed to send password reset email to {user.email}: {email_error}", exc_info=True)
                    # In dev mode, log password for testing
                    if not mail_conf.MAIL_USERNAME or not mail_conf.MAIL_PASSWORD:
                        logging.info(f"[DEV MODE] Password reset for {user.email}: {new_password}")
                    raise ValueError(f"Password reset but failed to send email: {str(email_error)}")
            else:
                # Dev mode: log password if email config is not available
                logging.info(f"[DEV MODE] Password reset for {user.email}: {new_password}")
            
        except Exception as e:
            logging.error(f"Error resetting password for user {user_id}: {e}")
            raise

