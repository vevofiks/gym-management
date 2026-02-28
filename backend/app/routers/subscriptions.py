from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.users import User
from app.core.deps import (
    get_current_gym_owner,
    get_current_superuser,
    get_current_gym_user,
)
from app.schemas.subscriptions import (
    SubscriptionPlanResponse,
    TenantSubscriptionResponse,
    SubscriptionUpgradeRequest,
    SubscriptionPaymentResponse,
    PaymentHistoryResponse,
    PaymentInitiateRequest,
    PaymentVerifyRequest,
)
from app.services.subscription_service import (
    get_all_plans,
    get_current_subscription,
    get_subscription_status_detail,
    cancel_subscription,
    activate_subscription,
    get_payment_history,
)
from loguru import logger


router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


# Import Razorpay service
from app.services.razorpay_service import (
    create_razorpay_order,
    verify_razorpay_signature,
)
from app.services.subscription_service import (
    get_subscription_plan,
    activate_subscription,
)
from app.models.subscription_payment import SubscriptionPayment, PaymentStatus
from app.models.tenant_subscription import TenantSubscription


@router.get(
    "/plans",
    response_model=List[SubscriptionPlanResponse],
    status_code=status.HTTP_200_OK,
)
def list_subscription_plans(db: Session = Depends(get_db)):
    plans = get_all_plans(db)
    return plans


@router.get(
    "/me", response_model=TenantSubscriptionResponse, status_code=status.HTTP_200_OK
)
def get_my_subscription(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_gym_owner)
):
    """
    Get current subscription for logged-in tenant.

    Returns subscription details including trial/active status,
    dates, and plan information.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    subscription = get_current_subscription(db, current_user.tenant_id)

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No subscription found for tenant",
        )

    return subscription


@router.get("/me/status", response_model=dict, status_code=status.HTTP_200_OK)
def get_subscription_status(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_gym_user)
):
    """
    Get detailed subscription status with usage limits and features.

    Returns:
    - Current subscription status (trial/active/expired)
    - Days remaining
    - Current usage (members, staff, plans)
    - Plan limits
    - Available features (WhatsApp, analytics)
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    from app.services.subscription_service import check_and_process_queue

    check_and_process_queue(db, current_user.tenant_id)

    status_detail = get_subscription_status_detail(db, current_user.tenant_id)
    return status_detail


@router.post("/cancel", status_code=status.HTTP_200_OK)
def cancel_auto_renewal(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_gym_owner)
):
    """
    Cancel auto-renewal of subscription.

    Subscription will remain active until the end date,
    but will not automatically renew.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    success = cancel_subscription(db, current_user.tenant_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No subscription found"
        )

    logger.info(f"Auto-renewal cancelled for tenant {current_user.tenant_id}")
    return {"message": "Auto-renewal cancelled successfully"}


@router.post("/subscribe", response_model=dict, status_code=status.HTTP_200_OK)
def subscribe_to_plan(
    request: SubscriptionUpgradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Directly subscribe to a plan (bypasses payment for now).
    Used for testing or manual plan selection.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        subscription = activate_subscription(
            db=db, tenant_id=current_user.tenant_id, plan_id=request.plan_id
        )

        from app.services.subscription_service import get_subscription_plan

        plan = get_subscription_plan(db, request.plan_id)

        return {
            "success": True,
            "message": f"Successfully subscribed to {plan.name if plan else 'plan'}",
            "plan_name": plan.name if plan else "Unknown",
            "expiry_date": subscription.subscription_end_date,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error subscribing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe",
        )


@router.get(
    "/payment/history",
    response_model=PaymentHistoryResponse,
    status_code=status.HTTP_200_OK,
)
def get_payment_history_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Get payment history for tenant.

    Returns list of all subscription payments (successful, failed, pending).
    """

    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    payments = get_payment_history(db, current_user.tenant_id)

    return {
        "payments": payments,
        "total": len(payments),
    }


# ============================================================================
# PAYMENT ENDPOINTS (Structure ready for Razorpay implementation)
# ============================================================================


@router.post(
    "/payment/razorpay/initiate", response_model=dict, status_code=status.HTTP_200_OK
)
def initiate_razorpay_payment(
    request: PaymentInitiateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Initiate payment for subscription using Razorpay.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    plan = get_subscription_plan(db, request.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan {request.plan_id} not found",
        )

    # Get current subscription to link payment
    subscription = (
        db.query(TenantSubscription)
        .filter(TenantSubscription.tenant_id == current_user.tenant_id)
        .first()
    )
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No subscription found for tenant",
        )

    # Create Razorpay order
    receipt_str = f"pay_{current_user.tenant_id}_{request.plan_id}_{int(datetime.now().timestamp())}"
    order = create_razorpay_order(float(plan.price_monthly), receipt_str)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create Razorpay order",
        )

    # Create internal payment record
    payment = SubscriptionPayment(
        tenant_id=current_user.tenant_id,
        subscription_id=subscription.id,
        plan_id=plan.id,
        amount=plan.price_monthly,
        currency="INR",
        payment_method="razorpay",
        razorpay_order_id=order["id"],
        status=PaymentStatus.PENDING,
        notes=f"Razorpay subscription for {plan.name}",
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    from app.core.config import settings

    return {
        "payment_id": payment.id,
        "razorpay_order_id": order["id"],
        "amount": float(payment.amount),
        "currency": payment.currency,
        "key_id": settings.RAZORPAY_KEY_ID,
        "plan_name": plan.name,
        "gym_name": current_user.tenant.name if current_user.tenant else "Your Gym",
        "user_name": current_user.name,
        "user_email": current_user.email,
        "user_phone": current_user.phone_number,
    }


@router.post(
    "/payment/razorpay/verify", response_model=dict, status_code=status.HTTP_200_OK
)
def verify_razorpay_payment(
    request: PaymentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Verify Razorpay payment and activate subscription.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    # Check internal payment record
    payment = (
        db.query(SubscriptionPayment)
        .filter(
            and_(
                SubscriptionPayment.id == request.payment_id,
                SubscriptionPayment.tenant_id == current_user.tenant_id,
            )
        )
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found",
        )

    # Verify signature
    is_valid = verify_razorpay_signature(
        request.razorpay_order_id,
        request.razorpay_payment_id,
        request.razorpay_signature,
    )

    if not is_valid:
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature",
        )

    # Update payment record
    import json

    payment.status = PaymentStatus.SUCCESS
    payment.razorpay_payment_id = request.razorpay_payment_id
    payment.razorpay_signature = request.razorpay_signature
    payment.payment_date = datetime.now()
    payment.payment_metadata = json.dumps(
        {
            "razorpay_order_id": request.razorpay_order_id,
            "razorpay_payment_id": request.razorpay_payment_id,
            "razorpay_signature": request.razorpay_signature,
            "invoice_url": request.invoice_url,
        }
    )

    logger.info(
        f"💰 Payment {payment.id} verified successfully. Metadata saved. Order: {request.razorpay_order_id}"
    )

    if request.invoice_url:
        payment.invoice_url = request.invoice_url

    # Commit payment success first to avoid data loss if activation fails
    db.commit()

    try:
        # Activate subscription
        activate_subscription(db, current_user.tenant_id, payment.plan_id, payment.id)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to activate subscription after payment {payment.id}: {e}")
        # We don't rollback payment status because the payment WAS successful.
        # Admin or user will need to contact support, or we can have a reconciliation job.
        # But we return success to the frontend so they see "Payment Successful".
        return {
            "success": True,
            "message": "Payment verified. Subscription activation pending (contact support if not active within 5 minutes).",
            "payment_id": payment.id,
            "activation_error": str(e),
        }

    return {
        "success": True,
        "message": "Payment verified and subscription activated successfully",
        "payment_id": payment.id,
    }


# @router.get("/payment/history", response_model=PaymentHistoryResponse, status_code=status.HTTP_200_OK)
# def get_payment_history(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_gym_owner)
# ):
#     """
#     Get payment history for tenant.
#
#     Returns list of all subscription payments.
#     """
#     pass


# ============================================================================
# ADMIN ENDPOINTS (Superadmin only)
# ============================================================================

# @router.put("/admin/{tenant_id}/extend", status_code=status.HTTP_200_OK)
# def extend_subscription(
#     tenant_id: int,
#     days: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_superuser)
# ):
#     """
#     Manually extend subscription for a tenant.
#
#     Superadmin only - for customer support purposes.
#     """
#     pass


# @router.put("/admin/{tenant_id}/suspend", status_code=status.HTTP_200_OK)
# def suspend_tenant(
#     tenant_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_superuser)
# ):
#     """
#     Suspend tenant account.
#
#     Superadmin only - blocks all access.
#     """
#     pass
