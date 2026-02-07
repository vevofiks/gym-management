from sqlalchemy.orm import Session
from app.models.users import User
from app.core.security import pwd_context, hash_password
from loguru import logger


def authenticate_user(db: Session, username: str, password: str):
    """
    Authenticate user with username and password.

    Args:
        db: Database session
        username: Username to authenticate
        password: Plain text password to verify

    Returns:
        User object if authentication successful, None otherwise
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not user.is_active:
        logger.warning(f"Inactive user attempted login: {username}")
        return None
    if not pwd_context.verify(password, str(user.hashed_password)):
        return None
    return user


def verify_user_active(db: Session, user_id: int) -> bool:
    """
    Check if user account is active.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        True if user is active, False otherwise
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    return user.is_active
