from pydantic import BaseModel
from typing import Optional


class WhatsAppSettingsBase(BaseModel):
    is_enabled: bool = True
    welcome_message_enabled: bool = True
    payment_receipt_enabled: bool = True
    membership_expiry_reminder_enabled: bool = True
    expiry_reminder_days: int = 3


class WhatsAppSettingsUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    welcome_message_enabled: Optional[bool] = None
    payment_receipt_enabled: Optional[bool] = None
    membership_expiry_reminder_enabled: Optional[bool] = None
    expiry_reminder_days: Optional[int] = None


class WhatsAppSettingsResponse(WhatsAppSettingsBase):
    id: int
    tenant_id: int

    class Config:
        from_attributes = True
