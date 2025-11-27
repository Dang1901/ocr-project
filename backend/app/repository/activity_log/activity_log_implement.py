import traceback
import logging
from datetime import datetime
from app.db.session import SessionLocal as Session
from app.models.activity_log import ActivityLog as ActivityLogEntity

from app.repository.activity_log.activity_log_interface import ActivityLogInterface

class ActivityLogImplement(ActivityLogInterface):
    def __init__(self):
        super().__init__()

    def log(self, user_id: None | str, path: str, method: str, name: str, time: datetime, status: int):
        session = Session()

        try:
            entity = ActivityLogEntity({})

            entity.path = path
            entity.method = method
            entity.created_at = time
            entity.updated_at = time
            entity.user_id = user_id
            entity.response_status = status
            entity.name = name

            logging.info(f"path={path} name={name}")


            session.add(entity)
            session.commit()
            session.refresh(entity)
        except Exception as e:
            session.rollback()
            traceback.print_exception(e)
            logging.error(f"Error adding activity log: {e}")
        finally:
            session.close()