"""
Validation utilities for common validation patterns
"""
from typing import Optional, List, Any
from app.utils.error_handler import ValidationError


def validate_string(value: Any, field_name: str, min_length: Optional[int] = None, max_length: Optional[int] = None) -> str:
    """
    Validate string value
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
        min_length: Minimum length (optional)
        max_length: Maximum length (optional)
        
    Returns:
        str: Validated string
        
    Raises:
        ValidationError: If validation fails
    """
    if value is None:
        raise ValidationError(f"{field_name} is required")
    
    if not isinstance(value, str):
        raise ValidationError(f"{field_name} must be a string")
    
    value = value.strip()
    
    if not value:
        raise ValidationError(f"{field_name} cannot be empty")
    
    if min_length is not None and len(value) < min_length:
        raise ValidationError(f"{field_name} must be at least {min_length} characters")
    
    if max_length is not None and len(value) > max_length:
        raise ValidationError(f"{field_name} must be at most {max_length} characters")
    
    return value


def validate_email(value: Any, field_name: str = "Email") -> str:
    """
    Validate email format
    
    Args:
        value: Email value to validate
        field_name: Name of the field for error message
        
    Returns:
        str: Validated email
        
    Raises:
        ValidationError: If validation fails
    """
    import re
    
    email = validate_string(value, field_name)
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValidationError(f"{field_name} must be a valid email address")
    
    return email


def validate_uuid(value: Any, field_name: str = "ID") -> str:
    """
    Validate UUID format
    
    Args:
        value: UUID value to validate
        field_name: Name of the field for error message
        
    Returns:
        str: Validated UUID
        
    Raises:
        ValidationError: If validation fails
    """
    import uuid
    
    if value is None:
        raise ValidationError(f"{field_name} is required")
    
    value = str(value).strip()
    
    try:
        uuid.UUID(value)
        return value
    except ValueError:
        raise ValidationError(f"{field_name} must be a valid UUID")


def validate_positive_integer(value: Any, field_name: str, min_value: Optional[int] = None) -> int:
    """
    Validate positive integer
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
        min_value: Minimum value (optional)
        
    Returns:
        int: Validated integer
        
    Raises:
        ValidationError: If validation fails
    """
    if value is None:
        raise ValidationError(f"{field_name} is required")
    
    try:
        int_value = int(value)
    except (ValueError, TypeError):
        raise ValidationError(f"{field_name} must be an integer")
    
    if int_value < 0:
        raise ValidationError(f"{field_name} must be a positive integer")
    
    if min_value is not None and int_value < min_value:
        raise ValidationError(f"{field_name} must be at least {min_value}")
    
    return int_value


def validate_list(value: Any, field_name: str, min_length: Optional[int] = None) -> List[Any]:
    """
    Validate list value
    
    Args:
        value: Value to validate
        field_name: Name of the field for error message
        min_length: Minimum length (optional)
        
    Returns:
        List[Any]: Validated list
        
    Raises:
        ValidationError: If validation fails
    """
    if value is None:
        raise ValidationError(f"{field_name} is required")
    
    if not isinstance(value, list):
        raise ValidationError(f"{field_name} must be a list")
    
    if min_length is not None and len(value) < min_length:
        raise ValidationError(f"{field_name} must have at least {min_length} items")
    
    return value

