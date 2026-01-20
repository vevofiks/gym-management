from pydantic import BaseModel, field_validator, Field
from datetime import datetime, date
from typing import Optional
from app.core.validators import validate_upi_id, validate_url


class TenantBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Gym/Tenant name")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Tenant name cannot be empty")
        return v


class TenantCreate(TenantBase):
    google_map: Optional[str] = Field(None, max_length=500, description="Google Maps URL")
    upi_id: Optional[str] = Field(None, max_length=100, description="UPI ID for payments")
    whatsapp_access_token: Optional[str] = Field(None, max_length=500, description="WhatsApp API access token")
    whatsapp_phone_id: Optional[str] = Field(None, max_length=50, description="WhatsApp phone ID")
    address: Optional[str] = Field(None, max_length=500, description="Physical address")
    
    @field_validator('google_map')
    @classmethod
    def validate_google_map_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return validate_url(v)
        return v
    
    @field_validator('upi_id')
    @classmethod
    def validate_upi_format(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return validate_upi_id(v)
        return v


class TenantResponse(TenantBase):
    id: int
    is_active: bool
    paid_until: Optional[date] = None
    upi_id: Optional[str] = None

    class Config:
        from_attributes = True


class TenantUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    address: str | None = Field(None, max_length=500)
    google_map: str | None = Field(None, max_length=500)
    upi_id: str | None = Field(None, max_length=100)
    whatsapp_access_token: str | None = Field(None, max_length=500)
    whatsapp_phone_id: str | None = Field(None, max_length=50)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Tenant name cannot be empty")
        return v
    
    @field_validator('google_map')
    @classmethod
    def validate_google_map_url(cls, v: str | None) -> str | None:
        if v:
            return validate_url(v)
        return v
    
    @field_validator('upi_id')
    @classmethod
    def validate_upi_format(cls, v: str | None) -> str | None:
        if v:
            return validate_upi_id(v)
        return v


class UpdateSubscription(BaseModel):
    paid_until: date = Field(..., description="Subscription paid until date")


class TenantStats(BaseModel):
    tenant_id: int
    tenant_name: str
    total_members: int
    active_members: int
    expired_members: int
    is_active: bool
    paid_until: Optional[date] = None


class TenantListResponse(BaseModel):
    tenants: list[TenantResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
