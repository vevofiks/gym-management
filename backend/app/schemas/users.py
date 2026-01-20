from pydantic import BaseModel, field_validator, Field
from app.models.users import UserRole
from app.core.validators import (
    validate_email,
    validate_phone_number,
    validate_password_strength,
    validate_username,
)


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the user")
    username: str = Field(..., min_length=3, max_length=30, description="Unique username")
    email: str = Field(..., max_length=255, description="Email address")
    phone_number: str = Field(..., description="Phone number")
    role: UserRole = Field(default=UserRole.GYMOWNER, description="User role")
    
    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        return validate_email(v)
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_format(cls, v: str) -> str:
        return validate_phone_number(v)
    
    @field_validator('username')
    @classmethod
    def validate_username_format(cls, v: str) -> str:
        return validate_username(v)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    # tenant_id: int | None = Field(None, gt=0, description="Tenant ID")
    
    @field_validator('password')
    @classmethod
    def validate_password_format(cls, v: str) -> str:
        return validate_password_strength(v)


class UserResponse(UserBase):
    id: int
    is_active: bool = True
    tenant_id: int | None = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    email: str | None = Field(None, max_length=255)
    phone_number: str | None = Field(None)
    role: UserRole | None = Field(None)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v
    
    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validate_email(v)
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_format(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return validate_phone_number(v)


class ChangePassword(BaseModel):
    old_password: str = Field(..., min_length=8, description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")
    
    @field_validator('new_password')
    @classmethod
    def validate_password_format(cls, v: str) -> str:
        return validate_password_strength(v)


class UserListResponse(BaseModel):
    users: list[UserResponse]
    total: int | None = None
    page: int | None = None
    page_size: int | None = None
    total_pages: int | None = None
