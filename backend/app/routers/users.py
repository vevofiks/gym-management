from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.users import User
from app.services.user_service import create_user
from app.schemas.users import UserCreate, UserResponse
from app.core.deps import get_current_user


router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user : User = Depends(get_current_user)):
    return current_user

@router.post("/create", response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if Username OR Email OR Phone already exists
        db_user = (
            db.query(User)
            .filter(
                or_(
                    User.username == user.username,
                    User.email == user.email,
                    User.phone_number == user.phone_number,
                )
            )
            .first()
        )

        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this username, email, or phone already exists",
            )

        new_user = create_user(db, user)
        return new_user

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
