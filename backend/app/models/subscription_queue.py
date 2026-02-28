from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class QueueStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    CANCELLED = "cancelled"


class SubscriptionQueue(Base):
    """
    Queue for future subscriptions.
    When a user buys a plan while another is active, it goes here.
    """

    __tablename__ = "subscription_queue"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=False)
    payment_id = Column(Integer, ForeignKey("subscription_payments.id"), nullable=True)

    status = Column(
        Enum(QueueStatus),
        default=QueueStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    activated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    tenant = relationship("Tenant")
    plan = relationship("SubscriptionPlan")
    payment = relationship("SubscriptionPayment")

    def __repr__(self) -> str:
        return f"<SubscriptionQueue(id={self.id}, tenant_id={self.tenant_id}, plan_id={self.plan_id}, status='{self.status}')>"
