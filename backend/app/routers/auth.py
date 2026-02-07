from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.deps import get_current_user
from app.services.auth_service import authenticate_user
from app.services.user_service import change_password
from app.schemas.token import Token
from app.schemas.users import ChangePassword
from app.models.users import User
from app.services.subscription_service import (
    get_current_subscription,
    get_subscription_plan,
)
from loguru import logger


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Login with username and password to get access token.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch subscription info to include in token
    plan_name = "Trial"
    subscription_status = "trial"

    if user.tenant_id:
        subscription = get_current_subscription(db, user.tenant_id)
        if subscription:
            subscription_status = subscription.status.value
            if subscription.plan_id:
                plan = get_subscription_plan(db, subscription.plan_id)
                if plan:
                    plan_name = plan.name

    access_token = create_access_token(
        data={
            "sub": user.username,
            "role": user.role,
            "tenant_id": user.tenant_id,
            "plan_name": plan_name,
            "subscription_status": subscription_status,
        }
    )

    logger.info(f"User {user.username} logged in successfully with plan {plan_name}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password_endpoint(
    password_data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change password for authenticated user.

    Requires old password verification.
    """
    success = change_password(
        db, current_user.id, password_data.old_password, password_data.new_password
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password or user not found",
        )

    return {"message": "Password changed successfully"}
