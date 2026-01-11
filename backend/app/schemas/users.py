from pydantic import BaseModel
from app.models.users import UserRole


class UserBase(BaseModel):
    name: str
    username: str
    email: str
    phone_number: str
    role: UserRole = UserRole.GYMADMIN


class UserCreate(UserBase):
    email: str
    password: str
    tenant_id: int


class UserResponse(UserBase):
    id: int
    is_active: bool = True
    tenant_id: int

    class Config:
        from_attributes = True
