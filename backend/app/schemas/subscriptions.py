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

    # razorpay_order_id: str
    # razorpay_payment_id: str
    # razorpay_signature: str
    payment_id: int  # Internal payment ID
    # User will add Razorpay fields


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
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentHistoryResponse(BaseModel):
    """List of payments"""

    payments: list[SubscriptionPaymentResponse]
    total: int


# ============================================================================
# DUMMY PAYMENT GATEWAY SCHEMAS
# ============================================================================


class DummyPaymentInitiateRequest(BaseModel):
    """Request to initiate dummy payment for subscription"""

    plan_id: int = Field(..., description="Plan to subscribe to (1=Starter, 2=Pro)")
    payment_method: str = Field(
        default="dummy_gateway", description="Payment method (dummy_gateway, upi, card)"
    )
    notes: Optional[str] = Field(None, description="Optional payment notes")


class DummyPaymentInitiateResponse(BaseModel):
    """Response after initiating dummy payment"""

    payment_id: int = Field(..., description="Internal payment ID")
    order_id: str = Field(..., description="Dummy order ID (for simulation)")
    amount: Decimal = Field(..., description="Amount to be paid")
    currency: str = Field(default="INR")
    plan_name: str = Field(..., description="Name of the plan")
    status: str = Field(default="pending", description="Payment status")
    message: str = Field(..., description="Instructions for completing dummy payment")


class DummyPaymentCompleteRequest(BaseModel):
    """Request to complete/verify dummy payment"""

    payment_id: int = Field(..., description="Payment ID from initiate response")
    dummy_transaction_id: str = Field(
        ..., description="Simulated transaction ID from frontend"
    )
    payment_status: str = Field(
        default="success", description="Payment result (success/failed)"
    )


class DummyPaymentCompleteResponse(BaseModel):
    """Response after completing dummy payment"""

    success: bool
    message: str
    payment_id: int
    subscription_status: str
    subscription_end_date: Optional[date]
    plan_name: str
