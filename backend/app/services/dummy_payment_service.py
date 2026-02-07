"""
Dummy Payment Gateway Service for Subscription Payments

This service simulates a payment gateway for testing purposes.
In production, replace this with actual payment gateway integration (Razorpay, Stripe, etc.)
"""

from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Optional, Tuple
import secrets

from app.models.subscription_payment import SubscriptionPayment, PaymentStatus
from app.models.tenant_subscription import TenantSubscription
from app.models.subscription_plans import SubscriptionPlan
from app.services.subscription_service import (
    get_current_subscription,
    get_subscription_plan,
    activate_subscription,
)
from loguru import logger


def generate_dummy_order_id() -> str:
    """Generate a dummy order ID for simulation"""
    return f"DUMMY_ORD_{secrets.token_hex(8).upper()}"


def generate_dummy_transaction_id() -> str:
    """Generate a dummy transaction ID for simulation"""
    return f"DUMMY_TXN_{secrets.token_hex(12).upper()}"


def initiate_dummy_payment(
    db: Session,
    tenant_id: int,
    plan_id: int,
    payment_method: str = "dummy_gateway",
    notes: Optional[str] = None,
) -> Tuple[SubscriptionPayment, str]:
    """
    Initiate a dummy payment for subscription.

    This simulates the payment initiation process.
    In production, this would create a Razorpay/Stripe order.

    Args:
        db: Database session
        tenant_id: Tenant ID making the payment
        plan_id: Plan to subscribe to
        payment_method: Payment method (dummy_gateway, upi, card)
        notes: Optional notes

    Returns:
        Tuple of (SubscriptionPayment, dummy_order_id)
    """
    # Get subscription
    subscription = get_current_subscription(db, tenant_id)
    if not subscription:
        raise ValueError("No subscription found for tenant")

    # Get plan
    plan = get_subscription_plan(db, plan_id)
    if not plan:
        raise ValueError(f"Plan {plan_id} not found")

    # Generate dummy order ID
    dummy_order_id = generate_dummy_order_id()

    # Create payment record with PENDING status
    payment = SubscriptionPayment(
        tenant_id=tenant_id,
        subscription_id=subscription.id,
        plan_id=plan_id,
        amount=plan.price_monthly,
        currency="INR",
        payment_method=payment_method,
        status=PaymentStatus.PENDING,
        notes=notes or f"Dummy payment for {plan.name} plan",
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    logger.info(
        f"💳 Dummy payment initiated: Payment ID {payment.id}, "
        f"Order ID {dummy_order_id}, Amount ₹{payment.amount} for tenant {tenant_id}"
    )

    return payment, dummy_order_id


def complete_dummy_payment(
    db: Session,
    payment_id: int,
    dummy_transaction_id: str,
    payment_status: str = "success",
) -> SubscriptionPayment:
    """
    Complete/verify a dummy payment.

    This simulates the payment verification process.
    In production, this would verify Razorpay/Stripe signature.

    Args:
        db: Database session
        payment_id: Payment ID to complete
        dummy_transaction_id: Simulated transaction ID from frontend
        payment_status: Payment result (success/failed)

    Returns:
        Updated SubscriptionPayment
    """
    # Get payment
    payment = (
        db.query(SubscriptionPayment)
        .filter(SubscriptionPayment.id == payment_id)
        .first()
    )

    if not payment:
        raise ValueError(f"Payment {payment_id} not found")

    if payment.status != PaymentStatus.PENDING:
        raise ValueError(f"Payment {payment_id} is not in pending status")

    # Simulate payment processing
    if payment_status.lower() == "success":
        # Mark payment as successful
        payment.status = PaymentStatus.SUCCESS
        payment.payment_date = datetime.utcnow()
        payment.notes = (
            payment.notes or ""
        ) + f" | Transaction ID: {dummy_transaction_id}"

        db.commit()
        db.refresh(payment)

        # Activate subscription
        activate_subscription(db, payment.tenant_id, payment.plan_id, payment.id)

        logger.info(
            f"✅ Dummy payment completed successfully: Payment ID {payment.id}, "
            f"Transaction ID {dummy_transaction_id}, Tenant {payment.tenant_id}"
        )

    elif payment_status.lower() == "failed":
        # Mark payment as failed
        payment.status = PaymentStatus.FAILED
        payment.notes = (
            payment.notes or ""
        ) + f" | Failed Transaction ID: {dummy_transaction_id}"

        db.commit()
        db.refresh(payment)

        logger.warning(
            f"❌ Dummy payment failed: Payment ID {payment.id}, "
            f"Transaction ID {dummy_transaction_id}, Tenant {payment.tenant_id}"
        )
    else:
        raise ValueError(f"Invalid payment status: {payment_status}")

    return payment


def get_payment_history(
    db: Session, tenant_id: int, limit: int = 50
) -> list[SubscriptionPayment]:
    """
    Get payment history for a tenant.

    Args:
        db: Database session
        tenant_id: Tenant ID
        limit: Maximum number of payments to return

    Returns:
        List of SubscriptionPayment records
    """
    payments = (
        db.query(SubscriptionPayment)
        .filter(SubscriptionPayment.tenant_id == tenant_id)
        .order_by(SubscriptionPayment.created_at.desc())
        .limit(limit)
        .all()
    )

    return payments


def refund_payment(
    db: Session, payment_id: int, reason: str = "Customer request"
) -> SubscriptionPayment:
    """
    Refund a payment (dummy implementation).

    In production, this would call the payment gateway's refund API.

    Args:
        db: Database session
        payment_id: Payment ID to refund
        reason: Refund reason

    Returns:
        Updated SubscriptionPayment
    """
    payment = (
        db.query(SubscriptionPayment)
        .filter(SubscriptionPayment.id == payment_id)
        .first()
    )

    if not payment:
        raise ValueError(f"Payment {payment_id} not found")

    if payment.status != PaymentStatus.SUCCESS:
        raise ValueError(f"Can only refund successful payments")

    # Mark as refunded
    payment.status = PaymentStatus.REFUNDED
    payment.notes = (payment.notes or "") + f" | Refunded: {reason}"

    db.commit()
    db.refresh(payment)

    logger.info(f"💸 Payment refunded: Payment ID {payment.id}, Reason: {reason}")

    return payment
