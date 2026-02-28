from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date
from app.models.progress import MemberProgress
from app.schemas.progress import MemberProgressCreate, MemberProgressUpdate


def create_progress_record(
    db: Session, member_id: int, tenant_id: int, progress_data: MemberProgressCreate
) -> MemberProgress:
    """Create a new progress/measurement record for a member."""
    db_progress = MemberProgress(
        member_id=member_id, tenant_id=tenant_id, **progress_data.model_dump()
    )
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress


def get_member_progress_history(
    db: Session, member_id: int, tenant_id: int, limit: int = 50
) -> List[MemberProgress]:
    """Get measurement history for a member, ordered by date."""
    return (
        db.query(MemberProgress)
        .filter(
            and_(
                MemberProgress.member_id == member_id,
                MemberProgress.tenant_id == tenant_id,
            )
        )
        .order_by(MemberProgress.measurement_date.desc())
        .limit(limit)
        .all()
    )


def get_progress_record(
    db: Session, record_id: int, tenant_id: int
) -> Optional[MemberProgress]:
    """Get a single progress record."""
    return (
        db.query(MemberProgress)
        .filter(
            and_(MemberProgress.id == record_id, MemberProgress.tenant_id == tenant_id)
        )
        .first()
    )


def update_progress_record(
    db: Session, record_id: int, tenant_id: int, update_data: MemberProgressUpdate
) -> Optional[MemberProgress]:
    """Update an existing progress record."""
    db_progress = get_progress_record(db, record_id, tenant_id)
    if not db_progress:
        return None

    obj_data = update_data.model_dump(exclude_unset=True)
    for key, value in obj_data.items():
        setattr(db_progress, key, value)

    db.commit()
    db.refresh(db_progress)
    return db_progress


def delete_progress_record(db: Session, record_id: int, tenant_id: int) -> bool:
    """Delete a progress record."""
    db_progress = get_progress_record(db, record_id, tenant_id)
    if not db_progress:
        return False

    db.delete(db_progress)
    db.commit()
    return True
