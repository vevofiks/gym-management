from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, Dict, Any
from decimal import Decimal
from app.models.tenant_subscription import SubscriptionStatus
from app.models.subscription_payment import PaymentStatus


class SubscriptionPlanResponse(BaseModel):
    """Subscription plan details"""

    id: int
    name: str
    price_monthly: Decimal
    max_members: int
    max_staff: int
    max_plans: int
    whatsapp_enabled: bool
    advanced_analytics: bool
    description: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class TenantSubscriptionResponse(BaseModel):
    """Current subscription status"""

    id: int
    tenant_id: int
    plan_id: Optional[int]
    status: SubscriptionStatus
    trial_start_date: Optional[date]
    trial_end_date: Optional[date]
    is_trial_used: bool
    subscription_start_date: Optional[date]
    subscription_end_date: Optional[date]
    auto_renew: bool
    created_at: datetime
    updated_at: datetime

    # Include plan details if available
    plan: Optional[SubscriptionPlanResponse] = None

    class Config:
        from_attributes = True


class SubscriptionStatusResponse(BaseModel):
    """Flattened subscription status for easy frontend consumption"""

    has_subscription: bool
    is_active: bool
    status: Optional[str] = None
    is_trial: bool = False
    days_remaining: Optional[int] = None
    plan: Optional[Dict[str, Any]] = None  # Simplified plan details {id, name, price}
    current_usage: Dict[str, int]  # {member_count, staff_count, plan_count}
    plan_limits: Dict[str, int]  # {max_members, max_staff, max_plans}
    features: Dict[str, bool]  # {whatsapp, advanced_analytics}
    expires_at: Optional[datetime] = None
    auto_renew: bool = False


class SubscriptionUpgradeRequest(BaseModel):
    """Request to upgrade/downgrade plan"""

    plan_id: int = Field(..., description="ID of the plan to upgrade/downgrade to")


# Payment schemas (structure ready for Razorpay implementation)
class PaymentInitiateRequest(BaseModel):
    """Request to initiate payment"""

    plan_id: int = Field(..., description="Plan to subscribe to")
    # Add more fields as needed for Razorpay


class PaymentVerifyRequest(BaseModel):
    """Request to verify payment (Razorpay)"""

    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    payment_id: int  # Internal payment ID
    invoice_url: Optional[str] = None


class SubscriptionPaymentResponse(BaseModel):
    """Payment record"""

    id: int
    tenant_id: int
    subscription_id: int
    plan_id: int
    amount: Decimal
    currency: str
    payment_method: Optional[str]
    status: PaymentStatus
    payment_date: Optional[datetime]
    notes: Optional[str]
    invoice_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentHistoryResponse(BaseModel):
    """List of payments"""

    payments: list[SubscriptionPaymentResponse]
    total: int
