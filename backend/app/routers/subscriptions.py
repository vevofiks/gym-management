from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.users import User
from app.core.deps import get_current_gym_owner, get_current_superuser
from app.schemas.subscriptions import (
    SubscriptionPlanResponse,
    TenantSubscriptionResponse,
    SubscriptionUpgradeRequest,
    SubscriptionPaymentResponse,
    PaymentHistoryResponse,
    DummyPaymentInitiateRequest,
    DummyPaymentCompleteRequest,
)
from app.services.subscription_service import (
    get_all_plans,
    get_current_subscription,
    get_subscription_status_detail,
    cancel_subscription,
    activate_subscription,
)
from loguru import logger


router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


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
    db: Session = Depends(get_db), current_user: User = Depends(get_current_gym_owner)
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


# ============================================================================
# DUMMY PAYMENT GATEWAY ENDPOINTS
# ============================================================================


@router.post(
    "/payment/dummy/initiate",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def initiate_dummy_payment_endpoint(
    request: DummyPaymentInitiateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Initiate a dummy payment for subscription.

    This is a DUMMY payment gateway for testing purposes.
    In production, replace with actual payment gateway (Razorpay, Stripe, etc.)

    Steps:
    1. Creates a payment record with PENDING status
    2. Returns dummy order details
    3. Frontend simulates payment and calls /payment/dummy/complete

    Returns:
        Payment initiation details with dummy order ID
    """
    from app.services.dummy_payment_service import initiate_dummy_payment

    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        payment, order_id = initiate_dummy_payment(
            db=db,
            tenant_id=current_user.tenant_id,
            plan_id=request.plan_id,
            payment_method=request.payment_method,
            notes=request.notes,
        )

        # Get plan details
        from app.services.subscription_service import get_subscription_plan

        plan = get_subscription_plan(db, request.plan_id)

        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plan {request.plan_id} not found",
            )

        return {
            "payment_id": payment.id,
            "order_id": order_id,
            "amount": float(payment.amount),
            "currency": payment.currency,
            "plan_name": plan.name,
            "status": "pending",
            "message": (
                "Dummy payment initiated. In production, this would redirect to payment gateway. "
                "For testing, call /payment/dummy/complete with this payment_id."
            ),
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error initiating dummy payment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate payment",
        )


@router.post(
    "/payment/dummy/complete",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def complete_dummy_payment_endpoint(
    request: DummyPaymentCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Complete/verify a dummy payment.

    This simulates payment verification.
    In production, this would verify payment gateway signature.

    Steps:
    1. Verifies payment exists and is pending
    2. Marks payment as SUCCESS or FAILED
    3. If successful, activates subscription
    4. Returns subscription status

    Returns:
        Payment completion status and subscription details
    """
    from app.services.dummy_payment_service import complete_dummy_payment
    from app.services.subscription_service import (
        get_current_subscription,
        get_subscription_plan,
    )

    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        # Complete payment
        payment = complete_dummy_payment(
            db=db,
            payment_id=request.payment_id,
            dummy_transaction_id=request.dummy_transaction_id,
            payment_status=request.payment_status,
        )

        # Get updated subscription
        subscription = get_current_subscription(db, current_user.tenant_id)
        plan = get_subscription_plan(db, payment.plan_id) if payment.plan_id else None

        if request.payment_status.lower() == "success":
            return {
                "success": True,
                "message": f"Payment successful! {plan.name if plan else 'Subscription'} activated.",
                "payment_id": payment.id,
                "subscription_status": (
                    subscription.status.value if subscription else "unknown"
                ),
                "subscription_end_date": (
                    subscription.subscription_end_date if subscription else None
                ),
                "plan_name": plan.name if plan else "Unknown",
            }
        else:
            return {
                "success": False,
                "message": "Payment failed. Please try again.",
                "payment_id": payment.id,
                "subscription_status": (
                    subscription.status.value if subscription else "unknown"
                ),
                "subscription_end_date": None,
                "plan_name": plan.name if plan else "Unknown",
            }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error completing dummy payment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete payment",
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
    from app.services.dummy_payment_service import get_payment_history

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

# @router.post("/payment/initiate", response_model=dict, status_code=status.HTTP_200_OK)
# def initiate_payment(
#     request: PaymentInitiateRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_gym_owner)
# ):
#     """
#     Initiate payment for subscription.
#
#     TO BE IMPLEMENTED BY USER with Razorpay integration.
#
#     Steps:
#     1. Create Razorpay order
#     2. Create SubscriptionPayment record with PENDING status
#     3. Return order details to frontend
#     """
#     pass


# @router.post("/payment/verify", response_model=dict, status_code=status.HTTP_200_OK)
# def verify_payment(
#     request: PaymentVerifyRequest,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_gym_owner)
# ):
#     """
#     Verify payment and activate subscription.
#
#     TO BE IMPLEMENTED BY USER with Razorpay integration.
#
#     Steps:
#     1. Verify Razorpay signature
#     2. Update SubscriptionPayment status to SUCCESS
#     3. Activate subscription using activate_subscription()
#     4. Return success response
#     """
#     pass


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
