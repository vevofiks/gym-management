from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
import enum
from sqlalchemy.sql import func
from app.core.database import Base


class UserRole(enum.Enum):
    SUPERADMIN = "super_admin"
    GYMADMIN = "gym_admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.GYMADMIN.value)
    is_active = Column(Boolean, default=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    tenant = relationship("Tenant", backref="users")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
