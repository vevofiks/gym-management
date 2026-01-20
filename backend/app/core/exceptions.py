"""
Custom exception classes for the application.
"""
from fastapi import HTTPException, status


class CustomHTTPException(HTTPException):
    """Base custom HTTP exception."""
    
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class UserAlreadyExistsException(CustomHTTPException):
    """Raised when attempting to create a user that already exists."""
    
    def __init__(self, detail: str = "User with this username, email, or phone already exists"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)


class TenantAlreadyExistsException(CustomHTTPException):
    """Raised when attempting to create a tenant that already exists."""
    
    def __init__(self, detail: str = "Tenant with this name already exists"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)


class InvalidCredentialsException(CustomHTTPException):
    """Raised when authentication credentials are invalid."""
    
    def __init__(self, detail: str = "Incorrect username or password"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)


class InactiveUserException(CustomHTTPException):
    """Raised when user account is inactive."""
    
    def __init__(self, detail: str = "User account is inactive"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)


class InsufficientPermissionsException(CustomHTTPException):
    """Raised when user doesn't have required permissions."""
    
    def __init__(self, detail: str = "Insufficient permissions to perform this action"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)


class ResourceNotFoundException(CustomHTTPException):
    """Raised when a requested resource is not found."""
    
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)


class ValidationException(CustomHTTPException):
    """Raised when data validation fails."""
    
    def __init__(self, detail: str = "Validation error"):
        super().__init__(detail=detail, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
