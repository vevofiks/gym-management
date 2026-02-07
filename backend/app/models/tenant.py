from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, unique=True, nullable=False)
    address = Column(String(500), nullable=True)
    google_map = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    paid_until = Column(Date, nullable=True, index=True)
    upi_id = Column(String(100), nullable=True)
    whatsapp_access_token = Column(String(500), nullable=True)
    whatsapp_phone_id = Column(String(50), nullable=True)
    payment_qr_code_url = Column(String(500), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    members = relationship(
        "Member", back_populates="tenant", cascade="all, delete-orphan"
    )
    membership_plans = relationship(
        "MembershipPlan", back_populates="tenant", cascade="all, delete-orphan"
    )
    expenses = relationship(
        "Expense", back_populates="tenant", cascade="all, delete-orphan"
    )
    diet_plan_templates = relationship(
        "DietPlanTemplate", back_populates="tenant", cascade="all, delete-orphan"
    )
    subscription = relationship(
        "TenantSubscription",
        back_populates="tenant",
        uselist=False,
        cascade="all, delete-orphan",
    )

    __table_args__ = (Index("ix_tenants_active_paid", "is_active", "paid_until"),)

    def __repr__(self) -> str:
        return f"<Tenant(id={self.id}, name='{self.name}', is_active={self.is_active})>"
