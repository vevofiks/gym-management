from pydantic import BaseModel, field_validator, Field
from datetime import datetime, date
from typing import Optional
from app.core.validators import validate_upi_id, validate_url


class TenantBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Gym/Tenant name")
    address: Optional[str] = Field(None, max_length=500, description="Physical address")
    contact_email: Optional[str] = Field(
        None, max_length=100, description="Gym contact email"
    )
    contact_phone: Optional[str] = Field(
        None, max_length=20, description="Gym contact phone"
    )
    city: Optional[str] = Field(None, max_length=100, description="City")
    state: Optional[str] = Field(None, max_length=100, description="State/Province")
    zip_code: Optional[str] = Field(None, max_length=20, description="Zip/Postal code")
    logo_url: Optional[str] = Field(None, max_length=500, description="Gym logo URL")
    google_map: Optional[str] = Field(
        None, max_length=500, description="Google Maps URL"
    )
    upi_id: Optional[str] = Field(
        None, max_length=100, description="UPI ID for payments"
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Tenant name cannot be empty")
        return v

    @field_validator("google_map")
    @classmethod
    def validate_google_map_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return validate_url(v)
        return v

    @field_validator("upi_id")
    @classmethod
    def validate_upi_format(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return validate_upi_id(v)
        return v


class TenantCreate(TenantBase):
    whatsapp_access_token: Optional[str] = Field(
        None, max_length=500, description="WhatsApp API access token"
    )
    whatsapp_phone_id: Optional[str] = Field(
        None, max_length=50, description="WhatsApp phone ID"
    )


class TenantResponse(TenantBase):
    id: int
    is_active: bool
    paid_until: Optional[date] = None
    payment_qr_code_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TenantUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    address: str | None = Field(None, max_length=500)
    google_map: str | None = Field(None, max_length=500)
    upi_id: str | None = Field(None, max_length=100)
    whatsapp_access_token: str | None = Field(None, max_length=500)
    whatsapp_phone_id: str | None = Field(None, max_length=50)
    contact_email: str | None = Field(None, max_length=100)
    contact_phone: str | None = Field(None, max_length=20)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    zip_code: str | None = Field(None, max_length=20)
    logo_url: str | None = Field(None, max_length=500)
    payment_qr_code_url: str | None = Field(None, max_length=500)
    is_active: bool | None = Field(None, description="Active status of the gym")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Tenant name cannot be empty")
        return v

    @field_validator("google_map")
    @classmethod
    def validate_google_map_url(cls, v: str | None) -> str | None:
        if v:
            return validate_url(v)
        return v

    @field_validator("upi_id")
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
    total_revenue: float = 0.0


class TenantListResponse(BaseModel):
    tenants: list[TenantResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
