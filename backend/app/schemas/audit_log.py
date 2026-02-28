from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any


class AuditLogBase(BaseModel):
    type: str
    description: str
    meta: Optional[dict] = None


class AuditLogCreate(AuditLogBase):
    tenant_id: int
    user_id: Optional[int] = None


class AuditLog(AuditLogBase):
    id: int
    tenant_id: int
    user_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    items: List[AuditLog]
    total: int
    page: int
    size: int
    pages: int
