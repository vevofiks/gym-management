from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class SubscriptionPlan(Base):
    """
    Platform subscription plans (Starter and Pro).
    These are the plans that gym owners subscribe to.
    """

    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(
        String(50), unique=True, nullable=False, index=True
    )  # "Starter" or "Pro"
    price_monthly = Column(Numeric(10, 2), nullable=False)  # ₹1,499 or ₹3,499

    # Feature Limits
    max_members = Column(Integer, nullable=False)  # 100 or 200
    max_staff = Column(Integer, nullable=False)  # 3 or 5
    max_plans = Column(Integer, nullable=False)  # 5 or -1 (unlimited)
    max_diet_templates = Column(
        Integer, nullable=False, default=2
    )  # 2 or -1 (unlimited)

    # Feature Flags
    whatsapp_enabled = Column(
        Boolean, default=False, nullable=False
    )  # False for Starter, True for Pro
    advanced_analytics = Column(
        Boolean, default=False, nullable=False
    )  # False for Starter, True for Pro

    # Metadata
    description = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    subscriptions = relationship("TenantSubscription", back_populates="plan")

    def __repr__(self) -> str:
        return f"<SubscriptionPlan(id={self.id}, name='{self.name}', price=₹{self.price_monthly})>"
