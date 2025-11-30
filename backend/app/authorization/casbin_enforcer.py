import os
import logging
from pathlib import Path

import casbin
from casbin_sqlalchemy_adapter import Adapter

from app.db.session import engine

# Disable casbin and adapter verbose logging
logging.getLogger("casbin").setLevel(logging.WARNING)
logging.getLogger("casbin_sqlalchemy_adapter").setLevel(logging.WARNING)
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_enforcer() -> casbin.Enforcer:
    base_dir = Path(__file__).resolve().parent
    model_conf = base_dir / "model.conf"

    adapter = Adapter(engine)

    enforcer = casbin.Enforcer(str(model_conf), adapter)
    enforcer.load_policy()
    return enforcer

