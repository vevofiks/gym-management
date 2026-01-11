from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class TenantBase(BaseModel):
    name: str


class TenantCreate(TenantBase):
    google_map: Optional[str] = None
    upi_id: Optional[str] = None
    whatsapp_access_token: Optional[str] = None
    whatsapp_phone_id: Optional[str] = None
    address: Optional[str] = None


class TenantResponse(TenantBase):
    id: int
    is_active: bool
    paid_until: Optional[date] = None
    upi_id: Optional[str] = None

    class Config:
        from_attributes = True
