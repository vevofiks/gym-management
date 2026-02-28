from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.users import User
from app.core.deps import get_current_gym_user
from app.schemas.progress import (
    MemberProgressCreate,
    MemberProgressUpdate,
    MemberProgressResponse,
    MemberProgressList,
)
from app.services import progress_service
from loguru import logger

router = APIRouter(prefix="/members", tags=["Member Progress"])


@router.post(
    "/{member_id}/progress",
    response_model=MemberProgressResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_member_progress(
    member_id: int,
    progress: MemberProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_user),
):
    """Record a new measurement for a member."""
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        return progress_service.create_progress_record(
            db, member_id, current_user.tenant_id, progress
        )
    except Exception as e:
        logger.error(f"Error creating progress record: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record measurement",
        )


@router.get(
    "/{member_id}/progress",
    response_model=MemberProgressList,
    status_code=status.HTTP_200_OK,
)
def get_member_progress_history(
    member_id: int,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_user),
):
    """Get measurement history for a member."""
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    records = progress_service.get_member_progress_history(
        db, member_id, current_user.tenant_id, limit
    )
    return MemberProgressList(data=records, total=len(records))


@router.put(
    "/progress/{record_id}",
    response_model=MemberProgressResponse,
    status_code=status.HTTP_200_OK,
)
def update_member_progress(
    record_id: int,
    progress: MemberProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_user),
):
    """Update an existing measurement record."""
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    updated = progress_service.update_progress_record(
        db, record_id, current_user.tenant_id, progress
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Measurement record not found"
        )
    return updated


@router.delete("/progress/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member_progress(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_user),
):
    """Delete a measurement record."""
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    success = progress_service.delete_progress_record(
        db, record_id, current_user.tenant_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Measurement record not found"
        )
    return None
