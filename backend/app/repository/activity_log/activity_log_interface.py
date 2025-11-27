from abc import ABC, abstractmethod
from datetime import datetime


class ActivityLogInterface(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def log(self, user_id: None | str, path: str, method: str, name: str, time: datetime, status: int):
        pass