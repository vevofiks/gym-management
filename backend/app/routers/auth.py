from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.deps import get_current_user
from app.services.auth_service import authenticate_user, change_user_password
from app.schemas.token import Token
from app.schemas.users import ChangePassword
from app.models.users import User
from loguru import logger


router = APIRouter(tags=["Authentication"])


@router.post("/auth/login", response_model=Token)   
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
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
    
    access_token = create_access_token(
        data={
            "sub": user.username,
            "role": user.role,
            "tenant_id": user.tenant_id
        }
    )
    
    logger.info(f"User {user.username} logged in successfully")
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/change-password", status_code=status.HTTP_200_OK)
def change_password_endpoint(
    password_data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Change password for authenticated user.
    
    Requires old password verification.
    """
    success = change_user_password(
        db,
        current_user.id,
        password_data.old_password,
        password_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password or user not found"
        )
    
    return {"message": "Password changed successfully"}