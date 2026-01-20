from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.users import User, UserRole
from app.core.exceptions import InactiveUserException, InsufficientPermissionsException
from loguru import logger


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Validate JWT token and return current authenticated user.
    
    Args:
        token: JWT access token from Authorization header
        db: Database session
        
    Returns:
        User object if token is valid
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")

        if not username:
            logger.warning("Token missing username in payload")
            raise credentials_exception
            
    except JWTError as e:
        logger.warning(f"JWT validation error: {str(e)}")
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        logger.warning(f"User not found: {username}")
        raise credentials_exception
    
    if not user.is_active:
        logger.warning(f"Inactive user attempted access: {username}")
        raise InactiveUserException()
    
    return user


def get_current_gym_owner(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify that current user has GYMOWNER role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object if user is GYMOWNER
        
    Raises:
        HTTPException: If user is not active or not GYMOWNER
    """
    if not current_user.is_active:
        logger.warning(f"Inactive gym owner attempted access: {current_user.username}")
        raise InactiveUserException()
    
    if str(current_user.role) != UserRole.GYMOWNER.value:
        logger.warning(f"Non-gym owner attempted gym owner action: {current_user.username}")
        raise InsufficientPermissionsException("GYMOWNER role required")
    
    return current_user



def get_current_superuser(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify that current user has SUPERADMIN role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User object if user is SUPERADMIN
        
    Raises:
        HTTPException: If user is not active or not SUPERADMIN
    """
    if not current_user.is_active:
        logger.warning(f"Inactive superuser attempted access: {current_user.username}")
        raise InactiveUserException()
    
    if str(current_user.role) != UserRole.SUPERADMIN.value:
        logger.warning(f"Non-superuser attempted admin action: {current_user.username}")
        raise InsufficientPermissionsException("SUPERADMIN role required")
    
    return current_user