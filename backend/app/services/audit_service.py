from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogCreate
from typing import List, Tuple, Optional


def log_activity(
    db: Session,
    tenant_id: int,
    type: str,
    description: str,
    user_id: Optional[int] = None,
    meta: Optional[dict] = None,
):
    """Log a new system activity."""
    db_log = AuditLog(
        tenant_id=tenant_id,
        user_id=user_id,
        type=type,
        description=description,
        meta=meta,
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_activities(
    db: Session,
    tenant_id: int,
    page: int = 1,
    size: int = 20,
    search: Optional[str] = None,
    activity_type: Optional[str] = None,
) -> Tuple[List[AuditLog], int]:
    """Get paginated activities with filters."""
    query = db.query(AuditLog).filter(AuditLog.tenant_id == tenant_id)

    if activity_type:
        query = query.filter(AuditLog.type == activity_type)

    if search:
        query = query.filter(
            or_(
                AuditLog.description.ilike(f"%{search}%"),
                AuditLog.type.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    items = (
        query.order_by(desc(AuditLog.created_at))
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return items, total
