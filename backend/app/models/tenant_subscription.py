from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Boolean,
    ForeignKey,
    DateTime,
    Enum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class SubscriptionStatus(str, enum.Enum):
    """Subscription status enum"""

    TRIAL = "trial"  # 7-day free trial
    ACTIVE = "active"  # Paid and active
    EXPIRED = "expired"  # Subscription expired
    SUSPENDED = "suspended"  # Manually suspended by admin
    CANCELLED = "cancelled"  # User cancelled


class TenantSubscription(Base):
    """
    Tracks each tenant's subscription status.
    Each tenant has one active subscription at a time.
    """

    __tablename__ = "tenant_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    plan_id = Column(
        Integer, ForeignKey("subscription_plans.id"), nullable=True
    )  # Null during trial

    # Status
    status = Column(
        Enum(SubscriptionStatus),
        default=SubscriptionStatus.TRIAL,
        nullable=False,
        index=True,
    )

    # Trial tracking
    trial_start_date = Column(Date, nullable=True)
    trial_end_date = Column(Date, nullable=True)
    is_trial_used = Column(
        Boolean, default=False, nullable=False
    )  # Prevent multiple trials

    # Subscription tracking
    subscription_start_date = Column(Date, nullable=True)
    subscription_end_date = Column(Date, nullable=True)  # When subscription expires
    auto_renew = Column(Boolean, default=True, nullable=False)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tenant = relationship("Tenant", back_populates="subscription")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    payments = relationship(
        "SubscriptionPayment",
        back_populates="subscription",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<TenantSubscription(id={self.id}, tenant_id={self.tenant_id}, status='{self.status}')>"
