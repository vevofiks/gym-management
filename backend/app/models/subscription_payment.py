from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class SubscriptionPayment(Base):

    __tablename__ = "subscription_payments"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    subscription_id = Column(
        Integer,
        ForeignKey("tenant_subscriptions.id", ondelete="CASCADE"),
        nullable=False,
    )
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)

    # Payment details
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    payment_method = Column(
        String(50), nullable=True
    )  # "razorpay", "upi", "card", etc.

    # Razorpay fields (TO BE IMPLEMENTED BY USER)
    # razorpay_order_id = Column(String(100), nullable=True)
    # razorpay_payment_id = Column(String(100), nullable=True, unique=True)
    # razorpay_signature = Column(String(500), nullable=True)

    # Status
    status = Column(
        Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True
    )
    payment_date = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    notes = Column(String(500), nullable=True)  # Any additional notes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tenant = relationship("Tenant")
    subscription = relationship("TenantSubscription", back_populates="payments")
    plan = relationship("SubscriptionPlan")

    def __repr__(self) -> str:
        return f"<SubscriptionPayment(id={self.id}, tenant_id={self.tenant_id}, amount=₹{self.amount}, status='{self.status}')>"
