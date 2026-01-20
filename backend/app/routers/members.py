from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil

from app.core.database import get_db
from app.models.users import User
from app.models.member import MemberStatus
from app.core.deps import get_current_gym_owner
from app.core.exceptions import UserAlreadyExistsException
from app.schemas.members import (
    MemberCreate,
    MemberUpdate,
    MemberResponse,
    MemberListResponse,
    MemberRenew
)
from app.services.member_service import (
    create_member,
    get_member_by_id,
    get_members_by_tenant,
    update_member,
    delete_member,
    renew_membership
)
from loguru import logger


router = APIRouter(prefix="/members", tags=["members"])


@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_new_member(
    member: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner)
):
    """
    Create a new member.
    
    Requires authentication. Member will be associated with the current user's tenant.
    Validates phone number uniqueness within the tenant.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant to create members"
        )
    
    try:
        new_member = create_member(db, member, current_user.tenant_id)
        logger.info(f"Member created by user {current_user.username}: {new_member.first_name} {new_member.last_name}")
        return new_member
    except UserAlreadyExistsException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating member: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the member"
        )


@router.get("/{member_id}", response_model=MemberResponse, status_code=status.HTTP_200_OK)
def get_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner)
):
    """
    Get member by ID.
    
    Requires authentication. Only returns members from the current user's tenant.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant"
        )
    
    member = get_member_by_id(db, member_id, current_user.tenant_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    return member


@router.get("/", response_model=MemberListResponse, status_code=status.HTTP_200_OK)
def list_members(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or phone"),
    status_filter: Optional[MemberStatus] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner)
):
    """
    List all members for the current user's tenant.
    
    Supports pagination, search, and filtering by status.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant"
        )
    
    skip = (page - 1) * page_size
    members, total = get_members_by_tenant(
        db,
        current_user.tenant_id,
        skip=skip,
        limit=page_size,
        search=search,
        status=status_filter
    )
    
    total_pages = ceil(total / page_size) if total > 0 else 1
    
    return MemberListResponse(
        members=members,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.put("/{member_id}", response_model=MemberResponse, status_code=status.HTTP_200_OK)
def update_member_details(
    member_id: int,
    member_update: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner)
):
    """
    Update member details.
    
    Requires authentication. Only updates members from the current user's tenant.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant"
        )
    
    try:
        updated_member = update_member(db, member_id, current_user.tenant_id, member_update)
        if not updated_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )
        
        logger.info(f"Member {member_id} updated by user {current_user.username}")
        return updated_member
    except UserAlreadyExistsException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating member: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the member"
        )


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member_by_id(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner)
):
    """
    Delete (soft delete) a member.
    
    Requires authentication. Only deletes members from the current user's tenant.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant"
        )
    
    success = delete_member(db, member_id, current_user.tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    logger.info(f"Member {member_id} deleted by user {current_user.username}")
    return None


@router.post("/{member_id}/renew", response_model=MemberResponse, status_code=status.HTTP_200_OK)
def renew_member_membership(
    member_id: int,
    renewal: MemberRenew,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner)
):
    """
    Renew member's membership.
    
    Extends the membership expiry date based on the new membership type.
    If current membership is still active, extends from expiry date.
    If expired, extends from today.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant"
        )
    
    try:
        renewed_member = renew_membership(db, member_id, current_user.tenant_id, renewal)
        if not renewed_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found"
            )
        
        logger.info(f"Membership renewed for member {member_id} by user {current_user.username}")
        return renewed_member
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error renewing membership: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while renewing the membership"
        )
