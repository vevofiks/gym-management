from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class WhatsAppStatusResponse(BaseModel):
    success: bool
    status: str  # INITIALIZING, AUTHENTICATED, NOT_LOGGED, etc.
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class WhatsAppQRCodeResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class WhatsAppMessageResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class WhatsAppBroadcastRequest(BaseModel):
    phone_numbers: List[str]
    message: str


class WhatsAppBroadcastResponse(BaseModel):
    success: bool
    success_count: int
    failed_count: int
    total: int
    error: Optional[str] = None
