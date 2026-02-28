from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional
import math

from app.core.deps import get_db, get_current_gym_owner
from app.models.users import User
from app.schemas.audit_log import AuditLogListResponse
from app.services import audit_service

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("", response_model=AuditLogListResponse)
def get_audit_logs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Get paginated audit logs for the current gym.
    """
    items, total = audit_service.get_activities(
        db,
        current_user.tenant_id,
        page=page,
        size=size,
        search=search,
        activity_type=type,
    )

    pages = math.ceil(total / size) if total > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }
