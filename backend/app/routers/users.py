from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil

from app.core.database import get_db
from app.models.users import User, UserRole
from app.services.user_service import (
    create_user,
    get_user_by_id,
    get_users_by_tenant,
    update_user,
    delete_user,
    change_password,
)
from app.schemas.users import (
    UserCreate,
    UserResponse,
    UserUpdate,
    ChangePassword,
    UserListResponse,
)
from app.core.deps import get_current_user, check_staff_limit
from app.core.exceptions import UserAlreadyExistsException
from loguru import logger


router = APIRouter(prefix="/gym-owners", tags=["Gym Owners & Staff"])


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def read_user_me(current_user: User = Depends(get_current_user)):

    logger.info(f"Gym owner/staff {current_user.username} retrieved their profile")
    return current_user


@router.put("/me/password", status_code=status.HTTP_200_OK)
def change_own_password(
    password_data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = change_password(
        db, current_user.id, password_data.old_password, password_data.new_password
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect old password"
        )

    return {"message": "Password changed successfully"}


@router.get("/", response_model=UserListResponse, status_code=status.HTTP_200_OK)
def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(
        None, description="Search by name, username, or email"
    ),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List staff in own tenant.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    skip = (page - 1) * page_size
    users, total = get_users_by_tenant(
        db, current_user.tenant_id, skip=skip, limit=page_size, search=search, role=role
    )

    total_pages = ceil(total / page_size) if total > 0 else 1

    return UserListResponse(
        users=users,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_staff(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(check_staff_limit),  # Check staff limit before creating
):
    """
    Create a new gym staff member in own tenant.

    Only gym owners can create staff members.
    Gym staff cannot create users.
    Superadmins should use /admin/gym-owners endpoint to create gym owners.
    """
    # Check if user has tenant
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant to create users",
        )

    # Only gym owners can create staff
    if current_user.role != UserRole.GYM_OWNER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only gym owners can create staff members",
        )

    # Gym owners can only create gym_staff, not other gym_owners
    if user.role == UserRole.GYM_OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Gym owners cannot create other gym owners. Contact superadmin.",
        )

    if user.role == UserRole.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create superadmin users",
        )

    try:
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
            if db_user.username == user.username:
                raise UserAlreadyExistsException("Username already exists")
            elif db_user.email == user.email:
                raise UserAlreadyExistsException("Email already exists")
            else:
                raise UserAlreadyExistsException("Phone number already exists")

        # Create staff in current user's tenant
        new_user = create_user(db, user, current_user.tenant_id)
        logger.info(
            f"Gym owner {current_user.username} created new staff: {new_user.username} (ID: {new_user.id})"
        )
        return new_user

    except UserAlreadyExistsException:
        raise
    except ValueError as ve:
        logger.warning(f"Validation error during user creation: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the user",
        )


@router.get("/{user_id}", response_model=UserResponse)
def get_staff_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    user = get_user_by_id(db, user_id, current_user.tenant_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user


@router.put("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_staff_details(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        updated_user = update_user(db, user_id, user_update, current_user.tenant_id)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        logger.info(f"User {current_user.username} updated user {user_id}")
        return updated_user

    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the user",
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete (soft delete) a staff member in own tenant.

    This deletes staff accounts, NOT gym member (customer) accounts.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    # Prevent self-deletion
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    success = delete_user(db, user_id, current_user.tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    logger.info(f"User {current_user.username} deleted user {user_id}")
    return None
