import inject
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from starlette.middleware.sessions import SessionMiddleware

from app.db.session import engine
from app.core.config import settings
from app.api.v1.router import api_router
from app.services.user_service import UserService
from app.services.session_service import SessionService
from app.repository.user.user_interface import UserInterface
from app.repository.user.user_implement import UserImplement
from app.repository.session.session_interface import SessionInterface
from app.repository.session.session_implement import SessionImplement
from app.repository.otp.otp_interface import OTPInterface
from app.repository.otp.otp_implement import OTPImplement
from app.ocr.ocr import worker_loop
from app.utils.minio_client import MinioService
import threading
# Import controllers
from app.authorization.controller import (
    role_controller,
    permission_controller,
    department_controller,
    user_controller,
    document_permission_controller,
)
from app.controllers.v1 import (
    document_controller, 
    activity_log,
    ocr
    )

from app.middleware.activity_log import ActivityLogMiddleware
from app.repository.activity_log.activity_log_interface import ActivityLogInterface
from app.repository.activity_log.activity_log_implement import ActivityLogImplement
from app.authorization.controller.current_user_controller import router as current_user_router
from app.authorization.casbin_enforcer import get_enforcer
from app.authorization.create_operations import sync_feature_operations


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Chạy khi server khởi động
    print("🚀 Starting OCR Project API...")
        # Start OCR worker threads
    workers = []
    for i in range(settings.OCR_WORKER_THREADS):
        t = threading.Thread(target=worker_loop, args=(i + 1,), daemon=True)
        t.start()
        workers.append(t)

    # Start MinIO cache cleanup thread
    threading.Thread(
        target=MinioService().loop_clear_expired_cache,
        daemon=True
    ).start()
    app.state.enforcer = get_enforcer()
    setup_entities()
    
    yield  # Ứng dụng chạy ở đây (nhận requests)
    
    # Shutdown: Chạy khi server tắt
    print("🛑 Shutting down OCR Project API...")
    print("👋 Application stopped.")


app = FastAPI(title="OCR Project", lifespan=lifespan)


def configure_injector(binder):
    binder.bind_to_constructor(UserService, UserService)
    binder.bind_to_constructor(SessionService, SessionService)
    binder.bind(UserInterface, UserImplement())
    binder.bind(SessionInterface, SessionImplement())
    binder.bind(OTPInterface, OTPImplement())  
    binder.bind(ActivityLogInterface, ActivityLogImplement())


def setup_entities():
    from app.models.activity_log import ActivityLog
    ActivityLog.__table__.create(bind=engine, checkfirst=True)

if not inject.is_configured():
    inject.configure(configure_injector)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "actor",
    ],
    expose_headers=["*"],
    max_age=3600,
)

app.add_middleware(SessionMiddleware, secret_key="secret")
app.add_middleware(ActivityLogMiddleware)

# Include routers
app.include_router(api_router, prefix="/api/v1")
app.include_router(user_controller.router, prefix="/api/v1", tags=["USER"])
app.include_router(role_controller.router, prefix="/api/v1", tags=["ROLE"])
app.include_router(permission_controller.router, prefix="/api/v1", tags=["PERMISSION"])
app.include_router(department_controller.router, prefix="/api/v1", tags=["DEPARTMENT"])
app.include_router(document_controller.router, prefix="/api/v1", tags=["DOCUMENT"])
app.include_router(document_permission_controller.router, prefix="/api/v1", tags=["DOCUMENT_PERMISSION"])
app.include_router(current_user_router, prefix="/api/v1", tags=["CURRENT_USER"])
app.include_router(ocr.router, prefix="/api/v1", tags=["OCR"])
app.include_router(activity_log.router, prefix="/api/v1", tags=["ACTIVITY_LOG"])

# Sync feature operations từ API routes (sau khi tất cả routers đã được include)
# print("🔄 Syncing feature operations...")
# try:
#     count = sync_feature_operations(app)
#     print(f"✅ Synced {count} feature operations")
# except Exception as e:
#     print(f"⚠️  Warning: Failed to sync feature operations: {e}")


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to OCR Project API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=False)

