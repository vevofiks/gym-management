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
    username = Column(String(30), index=True, nullable=False)
    email = Column(String(255), index=True, nullable=False)
    phone_number = Column(String(15), index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String(20), default=UserRole.GYMOWNER.value, index=True)
    is_active = Column(Boolean, default=True, index=True)
    tenant_id = Column(
        Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True, index=True
    )
    avatar_url = Column(String(255), nullable=True)
    tenant = relationship("Tenant", back_populates="users")
    is_deleted = Column(Boolean, default=False, index=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Forgot Password OTP
    reset_password_otp = Column(String(6), nullable=True)
    reset_password_otp_expiry = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("ix_users_tenant_role", "tenant_id", "role"),
        Index("ix_users_tenant_active", "tenant_id", "is_active"),
        Index(
            "unique_user_username",
            "username",
            unique=True,
            postgresql_where=(is_deleted == False),
        ),
        Index(
            "unique_user_email",
            "email",
            unique=True,
            postgresql_where=(is_deleted == False),
        ),
        Index(
            "unique_user_phone",
            "phone_number",
            unique=True,
            postgresql_where=(is_deleted == False),
        ),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}', role='{self.role}')>"
