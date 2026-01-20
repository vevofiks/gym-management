from pydantic import BaseModel, field_validator, Field
from datetime import date, datetime
from typing import Optional
from app.models.member import MemberStatus
from app.core.validators import validate_email, validate_phone_number


class MemberBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50, description="Member's first name")
    last_name: str = Field(..., min_length=2, max_length=50, description="Member's last name")
    phone_number: str = Field(..., description="Member's phone number")
    email: Optional[str] = Field(None, max_length=255, description="Member's email address (optional)")
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        if not v.replace(" ", "").isalpha():
            raise ValueError("Name must contain only letters")
        return v.title()
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_format(cls, v: str) -> str:
        return validate_phone_number(v)
    
    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == "":
            return None
        return validate_email(v)


class MemberCreate(MemberBase):
    joining_date: date = Field(..., description="Date when member joined")
    membership_type: str = Field(..., description="Type of membership (Monthly, 3 Months, 6 Months, 1 Year)")
    
    @field_validator('joining_date')
    @classmethod
    def validate_joining_date(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Joining date cannot be in the future")
        return v
    
    @field_validator('membership_type')
    @classmethod
    def validate_membership_type(cls, v: str) -> str:
        valid_types = ["Monthly", "3 Months", "6 Months", "1 Year"]
        if v not in valid_types:
            raise ValueError(f"Membership type must be one of: {', '.join(valid_types)}")
        return v


class MemberUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=50)
    last_name: Optional[str] = Field(None, min_length=2, max_length=50)
    phone_number: Optional[str] = Field(None)
    email: Optional[str] = Field(None, max_length=255)
    membership_type: Optional[str] = Field(None)
    status: Optional[MemberStatus] = Field(None)
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        if not v.replace(" ", "").isalpha():
            raise ValueError("Name must contain only letters")
        return v.title()
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return validate_phone_number(v)
    
    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == "":
            return None
        return validate_email(v)
    
    @field_validator('membership_type')
    @classmethod
    def validate_membership_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        valid_types = ["Monthly", "3 Months", "6 Months", "1 Year"]
        if v not in valid_types:
            raise ValueError(f"Membership type must be one of: {', '.join(valid_types)}")
        return v


class MemberRenew(BaseModel):
    membership_type: str = Field(..., description="New membership type")
    
    @field_validator('membership_type')
    @classmethod
    def validate_membership_type(cls, v: str) -> str:
        valid_types = ["Monthly", "3 Months", "6 Months", "1 Year"]
        if v not in valid_types:
            raise ValueError(f"Membership type must be one of: {', '.join(valid_types)}")
        return v


class MemberResponse(MemberBase):
    id: int
    tenant_id: int
    joining_date: date
    membership_expiry_date: date
    membership_type: str
    status: MemberStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MemberListResponse(BaseModel):
    members: list[MemberResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
