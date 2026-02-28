from sqlalchemy.orm import Session
from app.models.users import User
from app.core.security import pwd_context, hash_password
from loguru import logger


from fastapi import HTTPException, status


from datetime import datetime, timedelta
from app.services.email_service import generate_otp, email_service
from app.core.validators import validate_password_strength


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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been blocked. Please contact the administrator.",
        )

    if user.tenant_id:
        from app.models.tenant import Tenant

        tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
        if tenant and not tenant.is_active:
            logger.warning(
                f"User {username} attempted login for inactive tenant {tenant.name}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your gym's access has been suspended. Please contact the administrator.",
            )

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
    return user.is_active


def request_password_reset(db: Session, email: str) -> bool:
    """
    Request a password reset. Generates OTP, stores it, and sends email.
    """
    user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not user:
        logger.warning(f"Password reset requested for non-existent email: {email}")
        return False

    otp = generate_otp()
    expiry = datetime.now() + timedelta(minutes=15)  # OTP valid for 15 mins

    user.reset_password_otp = otp
    user.reset_password_otp_expiry = expiry
    db.commit()

    # Send email (async in a real app)
    email_service.send_otp_email(user.email, otp)
    logger.info(f"OTP sent to {user.email}")
    return True


def verify_reset_otp(db: Session, email: str, otp: str) -> bool:
    """
    Verify if the provided OTP is valid and not expired.
    """
    user = (
        db.query(User)
        .filter(
            User.email == email,
            User.reset_password_otp == otp,
            User.reset_password_otp_expiry > datetime.now(),
            User.is_deleted == False,
        )
        .first()
    )

    return user is not None


def reset_password_with_otp(
    db: Session, email: str, otp: str, new_password: str
) -> bool:
    """
    Reset user password if OTP is valid.
    """
    user = (
        db.query(User)
        .filter(
            User.email == email,
            User.reset_password_otp == otp,
            User.reset_password_otp_expiry > datetime.now(),
            User.is_deleted == False,
        )
        .first()
    )

    if not user:
        return False

    # Validate new password strength
    validate_password_strength(new_password)

    # Update password and clear OTP
    user.hashed_password = hash_password(new_password)
    user.reset_password_otp = None
    user.reset_password_otp_expiry = None
    db.commit()

    logger.info(f"Password reset successful for user: {user.username}")
    return True
