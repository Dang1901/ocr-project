"""
Error handling utilities for consistent error responses
"""
import traceback
from typing import Optional, Dict, Any
from fastapi import HTTPException
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base application error"""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AppError):
    """Validation error (400)"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=400, details=details)


class NotFoundError(AppError):
    """Not found error (404)"""
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=404, details=details)


class PermissionError(AppError):
    """Permission error (403)"""
    def __init__(self, message: str = "Permission denied", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=403, details=details)


class UnauthorizedError(AppError):
    """Unauthorized error (401)"""
    def __init__(self, message: str = "Unauthorized", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=401, details=details)


def handle_error(error: Exception) -> JSONResponse:
    """
    Centralized error handler
    
    Args:
        error: Exception to handle
        
    Returns:
        JSONResponse with error details
    """
    if isinstance(error, AppError):
        logger.warning(f"Application error: {error.message}", extra={"details": error.details})
        return JSONResponse(
            status_code=error.status_code,
            content={
                "status": "error",
                "message": error.message,
                "details": error.details
            }
        )
    
    if isinstance(error, HTTPException):
        logger.warning(f"HTTP exception: {error.detail}")
        return JSONResponse(
            status_code=error.status_code,
            content={
                "status": "error",
                "message": error.detail
            }
        )
    
    # Unexpected error
    error_detail = traceback.format_exc()
    logger.error(f"Unexpected error: {str(error)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "details": {
                "error": str(error) if logger.level <= logging.DEBUG else None
            }
        }
    )


def validate_required(value: Any, field_name: str) -> None:
    """
    Validate that a required field is not None or empty
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If value is None or empty
    """
    if value is None or (isinstance(value, str) and not value.strip()):
        raise ValidationError(f"{field_name} is required")


def validate_not_found(value: Any, resource_name: str) -> None:
    """
    Validate that a resource exists
    
    Args:
        value: Resource to check
        resource_name: Name of the resource for error message
        
    Raises:
        NotFoundError: If value is None
    """
    if value is None:
        raise NotFoundError(f"{resource_name} not found")

