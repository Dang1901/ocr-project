import requests
import json
import logging

from app.db.session import SessionLocal as Session
from sqlalchemy import or_
from sqlalchemy.orm import joinedload
from typing import Tuple
from app.repository.user.user_interface import UserInterface
from app.models.user import User as UserEntity
from app.models.user_roles import user_roles
from app.models.role import Role
from app.core.config import settings

# Constants - match with app.models.user
IS_DELETED = "1"
IS_NOT_DELETED = "0"
IS_ACTIVE = "1"  # String in database


class UserImplement(UserInterface):
    def __init__(self):
        super().__init__()

    def get_users(self, q: str, page: int, page_size: int) -> Tuple:
        """Get all users (both active and inactive, but not deleted)"""
        session = Session()
        try:
            query = session.query(UserEntity).options(
                joinedload(UserEntity.roles),
                joinedload(UserEntity.department)
            ).filter(
                # Only filter out deleted users, not inactive users
                # Inactive users (is_active="0") should still be visible
                UserEntity.is_deleted == IS_NOT_DELETED,
            )
            if q:
                query = query.filter(
                    or_(
                        UserEntity.username.ilike(f"%{q}%"),
                        UserEntity.email.ilike(f"%{q}%"),
                        UserEntity.first_name.ilike(f"%{q}%"),
                        UserEntity.last_name.ilike(f"%{q}%"),
                    )
                )

            # count
            count = query.count()

            users = (
                query.order_by(UserEntity.created_at.desc())
                .limit(page_size)
                .offset((page - 1) * page_size)
                .all()
            )

            if users:
                return users, count
        except Exception as e:
            session.rollback()
            logging.error(f"Error when get list of users: {e}")
        finally:
            session.close()

        return [], 0

    def get_user_by_id(self, user_id: str) -> UserEntity:
        session = Session()
        try:
            user = (
                session.query(UserEntity)
                .options(
                    joinedload(UserEntity.roles),
                    joinedload(UserEntity.department)
                )
                .filter(
                    UserEntity.id == user_id,
                    UserEntity.is_deleted == IS_NOT_DELETED,
                )
                .first()
            )

            if user:
                return user
        except Exception as e:
            session.rollback()
            logging.error(f"Error when get user by id: {e}")
        finally:
            session.close()

        return None

    def get_user_by_email(self, email: str) -> UserEntity:
        session = Session()
        try:
            user = (
                session.query(UserEntity)
                .options(
                    joinedload(UserEntity.roles),
                    joinedload(UserEntity.department)
                )
                .filter(
                    UserEntity.email == email,
                    # UserEntity.is_deleted == IS_NOT_DELETED, 
                    # UserEntity.is_active == IS_ACTIVE, 
                )
                .first()
            )
            
            if user:
                logging.info(f"Found user: email={user.email}, is_active={user.is_active} (type: {type(user.is_active)}), is_deleted={user.is_deleted} (type: {type(user.is_deleted)})")
                return user
        except Exception as e:
            session.rollback()
            logging.error(f"Error when get user by email: {e}")
        finally:
            session.close()
        
        return None

    def get_user_by_username(self, username: str) -> UserEntity:
        session = Session()
        try:
            user = (
                session.query(UserEntity)
                .options(
                    joinedload(UserEntity.roles),
                    joinedload(UserEntity.department)
                )
                .filter(
                    UserEntity.username == username,
                    UserEntity.is_deleted == IS_NOT_DELETED,
                    UserEntity.is_active == IS_ACTIVE,
                )
                .first()
            )

            if user:
                return user
        except Exception as e:
            session.rollback()
            logging.error(f"Error when get user by username: {e}")
        finally:
            session.close()

        return None

    def insert_users(self, users: [UserEntity]) -> bool:
        session = Session()
        try:
            session.bulk_save_objects(users)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logging.error(f"Error when insert users: {e}")
        finally:
            session.close()

        return False

    def delete_user(self, user: UserEntity) -> bool:
        session = Session()
        try:
            user = session.merge(user)
            user.is_deleted = IS_DELETED
            session.commit()

            return True
        except Exception as e:
            session.rollback()
            logging.error(f"Error when delete user: {e}")
        finally:
            session.close()

        return False

    def search_user_by_username(self, username: str) -> list:
        session = Session()
        try:
            users = session.query(UserEntity).filter(
                UserEntity.username.ilike(f"%{username}%"),
                UserEntity.is_deleted == IS_NOT_DELETED,
                UserEntity.is_active == IS_ACTIVE,
            ).all()
            return users
        except Exception as e:
            session.rollback()
            logging.error(f"Error when search user by username: {e}")
        finally:
            session.close()
        return []

    def search_user_by_email(self, email: str) -> list:
        session = Session()
        try:
            users = session.query(UserEntity).filter(
                UserEntity.email.ilike(f"%{email}%"),
                UserEntity.is_deleted == IS_NOT_DELETED,
                UserEntity.is_active == IS_ACTIVE,
            ).all()
            return users
        except Exception as e:
            session.rollback()
            logging.error(f"Error when search user by email: {e}")
        finally:
            session.close()
        return []

    def get_users_from_api(self) -> dict:
        try:
            url = (
                settings.LOOKUP_USER_URL
                + f"?page=1&page_size=20000"
            )
            logging.info(f"REQUEST get users from api with url={url}")
            resp = requests.get(
                url,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.LOOKUP_USER_TOKEN}",
                },
                timeout=20,
            )

            status_code = resp.status_code
            logging.info(
                f"RESPONSE get users from api with status code: {status_code} "
                f"and response time: {resp.elapsed.total_seconds()}"
            )

            if status_code == 200:
                json_data = json.loads(resp.text)
                users_data = json_data.get('data', [])
                total = json_data.get('total', len(users_data))
                return {"data": users_data, "total": total}
        except Exception as e:
            logging.error(f"Exception when get users from api: {e}")

        return {"data": [], "total": 0}

    def assign_roles_to_user(self, user_id: str, role_ids: list) -> bool:
        """Assign roles to a user"""
        session = Session()
        try:
            # Get user to get username
            user = session.query(UserEntity).filter(UserEntity.id == user_id).first()
            if not user:
                logging.error(f"User not found: {user_id}")
                return False
            
            # Get roles to get role_code
            roles = session.query(Role).filter(Role.id.in_(role_ids)).all()
            if len(roles) != len(role_ids):
                logging.error(f"Some roles not found. Expected {len(role_ids)}, found {len(roles)}")
                return False
            
            # Check existing assignments to avoid duplicates
            existing_assignments = session.execute(
                user_roles.select().where(
                    user_roles.c.user_id == user_id
                )
            ).fetchall()
            existing_role_ids = {row.role_id for row in existing_assignments}
            
            # Insert new role assignments (only if not already assigned)
            # Insert both new columns (user_id, role_id) and old columns (username, role_code) for compatibility
            inserted_count = 0
            for role in roles:
                if role.id not in existing_role_ids:
                    try:
                        # Insert with both new and old columns for database compatibility
                        session.execute(
                            user_roles.insert().values(
                                user_id=user_id,
                                role_id=role.id,
                                username=user.username,  # For backward compatibility
                                role_code=role.code      # For backward compatibility
                            )
                        )
                        inserted_count += 1
                    except Exception as e:
                        # Skip if duplicate (shouldn't happen but just in case)
                        logging.warning(f"Role {role.id} already assigned to user {user_id}: {e}")
                        continue
            
            if inserted_count > 0:
                session.commit()
                logging.info(f"Assigned {inserted_count} new role(s) to user {user_id}")
            else:
                logging.info(f"All roles already assigned to user {user_id}")
                session.commit()
            
            return True
        except Exception as e:
            session.rollback()
            logging.error(f"Error when assigning roles to user {user_id}: {e}")
        finally:
            session.close()
        return False

    def remove_roles_to_user(self, user_id: str, role_ids: list) -> bool:
        """Remove roles from a user"""
        session = Session()
        try:
            # Delete role assignments
            for role_id in role_ids:
                session.execute(
                    user_roles.delete().where(
                        user_roles.c.user_id == user_id,
                        user_roles.c.role_id == role_id
                    )
                )
            
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logging.error(f"Error when removing roles from user {user_id}: {e}")
        finally:
            session.close()
        return False

    def get_user_roles(self, user_id: str) -> list:
        """Get all roles assigned to a user"""
        session = Session()
        try:
            # Get roles through user_roles table
            roles = session.query(Role).join(
                user_roles, Role.id == user_roles.c.role_id
            ).filter(
                user_roles.c.user_id == user_id
            ).all()
            
            return roles
        except Exception as e:
            session.rollback()
            logging.error(f"Error when getting roles for user {user_id}: {e}")
        finally:
            session.close()
        return []

    def update_user_roles(self, user_id: str, role_ids: list) -> bool:
        """Update user roles (replace all existing roles with new ones)"""
        session = Session()
        try:
            # Get user to get username
            user = session.query(UserEntity).filter(UserEntity.id == user_id).first()
            if not user:
                logging.error(f"User not found: {user_id}")
                return False
            
            # Get roles to get role_code
            roles = session.query(Role).filter(Role.id.in_(role_ids)).all()
            if len(roles) != len(role_ids):
                logging.error(f"Some roles not found. Expected {len(role_ids)}, found {len(roles)}")
                return False
            
            # Remove all existing roles
            session.execute(
                user_roles.delete().where(user_roles.c.user_id == user_id)
            )
            
            # Add new roles with both new and old columns for compatibility
            for role in roles:
                session.execute(
                    user_roles.insert().values(
                        user_id=user_id,
                        role_id=role.id,
                        username=user.username,  # For backward compatibility
                        role_code=role.code      # For backward compatibility
                    )
                )
            
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logging.error(f"Error when updating roles for user {user_id}: {e}")
        finally:
            session.close()
        return False

    def get_users_by_role(self, role_id: str, q: str, page: int, page_size: int) -> Tuple:
        """Get users by role with pagination and search"""
        session = Session()
        try:
            # Query users through user_roles table
            query = session.query(UserEntity).join(
                user_roles, UserEntity.id == user_roles.c.user_id
            ).filter(
                user_roles.c.role_id == role_id,
                UserEntity.is_deleted == IS_NOT_DELETED,
                UserEntity.is_active == IS_ACTIVE,
            )
            
            if q:
                query = query.filter(
                    or_(
                        UserEntity.username.ilike(f"%{q}%"),
                        UserEntity.email.ilike(f"%{q}%"),
                        UserEntity.first_name.ilike(f"%{q}%"),
                        UserEntity.last_name.ilike(f"%{q}%"),
                    )
                )

            # Count total
            count = query.count()

            # Get paginated results
            users = (
                query.order_by(UserEntity.created_at.desc())
                .limit(page_size)
                .offset((page - 1) * page_size)
                .all()
            )

            return users, count
        except Exception as e:
            session.rollback()
            logging.error(f"Error when getting users by role {role_id}: {e}")
        finally:
            session.close()
        return [], 0
    
    def update_user(self, user: UserEntity) -> bool:
        """Update user information"""
        session = Session()
        try:
            session.merge(user)
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            logging.error(f"Error when updating user: {e}")
            return False
        finally:
            session.close()

