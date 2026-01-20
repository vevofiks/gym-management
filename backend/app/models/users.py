from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
import enum
from sqlalchemy.sql import func
from app.core.database import Base


class UserRole(enum.Enum):
    SUPERADMIN = "super_admin"
    GYMOWNER = "gym_owner"
    GYMSTAFF = "gym_staff"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    username = Column(String(30), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String(20), default=UserRole.GYMOWNER.value, index=True)
    is_active = Column(Boolean, default=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True)
    tenant = relationship("Tenant", back_populates="users")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        Index('ix_users_tenant_role', 'tenant_id', 'role'),
        Index('ix_users_tenant_active', 'tenant_id', 'is_active'),
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}', role='{self.role}')>"
