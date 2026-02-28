from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import date, timedelta, datetime
from typing import Optional, Tuple
from decimal import Decimal

from app.models.subscription_plans import SubscriptionPlan
from app.models.tenant_subscription import TenantSubscription, SubscriptionStatus
from app.models.subscription_payment import SubscriptionPayment, PaymentStatus
from app.models.tenant import Tenant
from app.models.member import Member
from app.models.users import User
from app.models.membership_plan import MembershipPlan
from app.models.subscription_queue import SubscriptionQueue, QueueStatus
from loguru import logger


# TRIAL MANAGEMENT
# ============================================================================


def start_trial(db: Session, tenant_id: int) -> TenantSubscription:
    """
    Start 7-day free trial for a new tenant.

    Trial gives Pro plan features (unlimited members, 5 staff, unlimited plans)
    but WhatsApp is disabled.

    """
    # Check if trial already exists
    existing = (
        db.query(TenantSubscription)
        .filter(TenantSubscription.tenant_id == tenant_id)
        .first()
    )

    if existing:
        logger.warning(f"Trial already exists for tenant {tenant_id}")
        return existing

    # Create trial subscription
    trial_start = date.today()
    trial_end = trial_start + timedelta(days=7)

    subscription = TenantSubscription(
        tenant_id=tenant_id,
        plan_id=None,  # No plan during trial
        status=SubscriptionStatus.TRIAL,
        trial_start_date=trial_start,
        trial_end_date=trial_end,
        is_trial_used=True,  # Mark trial as used
        auto_renew=True,
    )

    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    logger.info(f"✅ Started 7-day trial for tenant {tenant_id} (expires: {trial_end})")
    return subscription


def check_trial_status(db: Session, tenant_id: int) -> Tuple[bool, Optional[int]]:
    """
    Check if trial is active and how many days remaining.

    Returns:
        Tuple of (is_active, days_remaining)
    """
    subscription = (
        db.query(TenantSubscription)
        .filter(TenantSubscription.tenant_id == tenant_id)
        .first()
    )

    if not subscription or subscription.status != SubscriptionStatus.TRIAL:
        return (False, None)

    if not subscription.trial_end_date:
        return (False, None)

    today = date.today()
    if today > subscription.trial_end_date:
        # Trial expired
        return (False, 0)

    days_remaining = (subscription.trial_end_date - today).days
    return (True, days_remaining)


def expire_trial(db: Session, tenant_id: int) -> bool:
    """
    Expire trial and set status to EXPIRED.

    Returns:
        True if trial was expired, False if not found or already expired
    """
    subscription = (
        db.query(TenantSubscription)
        .filter(
            TenantSubscription.tenant_id == tenant_id,
            TenantSubscription.status == SubscriptionStatus.TRIAL,
        )
        .first()
    )

    if not subscription:
        return False

    subscription.status = SubscriptionStatus.EXPIRED
    db.commit()

    logger.info(f"Trial expired for tenant {tenant_id}")
    return True


# ============================================================================
# SUBSCRIPTION MANAGEMENT
# ============================================================================


def get_current_subscription(
    db: Session, tenant_id: int
) -> Optional[TenantSubscription]:
    """Get current subscription for tenant"""
    return (
        db.query(TenantSubscription)
        .filter(TenantSubscription.tenant_id == tenant_id)
        .first()
    )


def get_subscription_plan(db: Session, plan_id: int) -> Optional[SubscriptionPlan]:
    """Get subscription plan by ID"""
    return (
        db.query(SubscriptionPlan)
        .filter(
            and_(SubscriptionPlan.id == plan_id, SubscriptionPlan.is_deleted == False)
        )
        .first()
    )


def get_all_plans(db: Session) -> list[SubscriptionPlan]:
    """Get all active subscription plans"""
    return (
        db.query(SubscriptionPlan)
        .filter(
            SubscriptionPlan.is_active == True, SubscriptionPlan.is_deleted == False
        )
        .order_by(SubscriptionPlan.price_monthly)
        .all()
    )


def activate_subscription(
    db: Session, tenant_id: int, plan_id: int, payment_id: Optional[int] = None
) -> TenantSubscription:
    """
    Activate paid subscription for tenant.

    Args:
        db: Database session
        tenant_id: Tenant ID
        plan_id: Plan to activate
        payment_id: Optional payment ID that triggered activation

    Returns:
        Updated TenantSubscription
    """
    subscription = get_current_subscription(db, tenant_id)

    if not subscription:
        raise ValueError("No subscription found for tenant")

    plan = get_subscription_plan(db, plan_id)
    if not plan:
        raise ValueError(f"Plan {plan_id} not found")

    # Check if there is an active subscription
    today = date.today()
    if subscription.status == SubscriptionStatus.ACTIVE:
        if (
            subscription.subscription_end_date
            and subscription.subscription_end_date >= today
        ):
            # Active subscription exists, queue this one
            queue_item = SubscriptionQueue(
                tenant_id=tenant_id,
                plan_id=plan_id,
                payment_id=payment_id,
                status=QueueStatus.PENDING,
            )
            db.add(queue_item)
            db.commit()
            db.refresh(queue_item)

            logger.info(f"⏳ Queued {plan.name} subscription for tenant {tenant_id}")
            return subscription

    # Determine duration based on plan name
    duration_days = 30
    if "quarterly" in plan.name.lower():
        duration_days = 90
    elif "yearly" in plan.name.lower():
        duration_days = 365

    subscription.plan_id = plan_id
    subscription.status = SubscriptionStatus.ACTIVE
    subscription.subscription_start_date = today
    subscription.subscription_end_date = today + timedelta(days=duration_days)
    subscription.auto_renew = True

    db.commit()
    db.refresh(subscription)

    logger.info(
        f"✅ Activated {plan.name} subscription for tenant {tenant_id} (expires: {subscription.subscription_end_date})"
    )
    return subscription


def check_and_process_queue(db: Session, tenant_id: int) -> bool:
    """
    Check if there are queued subscriptions and activate the next one if current is expired.

    Returns:
        True if a queued subscription was activated
    """
    subscription = get_current_subscription(db, tenant_id)
    if not subscription:
        return False

    # Only process if current is expired or trial expired
    is_active = False
    if (
        subscription.status == SubscriptionStatus.ACTIVE
        and subscription.subscription_end_date
    ):
        if date.today() <= subscription.subscription_end_date:
            is_active = True
    elif (
        subscription.status == SubscriptionStatus.TRIAL and subscription.trial_end_date
    ):
        if date.today() <= subscription.trial_end_date:
            is_active = True

    if is_active:
        return False

    # Check queue
    next_in_queue = (
        db.query(SubscriptionQueue)
        .filter(
            SubscriptionQueue.tenant_id == tenant_id,
            SubscriptionQueue.status == QueueStatus.PENDING,
        )
        .order_by(SubscriptionQueue.created_at.asc())
        .first()
    )

    if not next_in_queue:
        return False

    # Activate next plan
    logger.info(
        f"🚀 Activating queued subscription {next_in_queue.id} for tenant {tenant_id}"
    )

    # Update current subscription
    today = date.today()
    plan = get_subscription_plan(db, next_in_queue.plan_id)

    # Determine duration based on plan name
    duration_days = 30
    if "quarterly" in plan.name.lower():
        duration_days = 90
    elif "yearly" in plan.name.lower():
        duration_days = 365

    subscription.plan_id = next_in_queue.plan_id
    subscription.status = SubscriptionStatus.ACTIVE
    subscription.subscription_start_date = today
    subscription.subscription_end_date = today + timedelta(days=duration_days)
    subscription.auto_renew = True

    # Mark queue item as active/completed
    next_in_queue.status = QueueStatus.ACTIVE
    next_in_queue.activated_at = datetime.now()

    db.commit()
    return True


def cancel_subscription(db: Session, tenant_id: int) -> bool:
    """
    Cancel auto-renewal of subscription.
    Subscription remains active until end date.
    """
    subscription = get_current_subscription(db, tenant_id)

    if not subscription:
        return False

    subscription.auto_renew = False
    db.commit()

    logger.info(f"Cancelled auto-renewal for tenant {tenant_id}")
    return True


# ============================================================================
# FEATURE LIMIT CHECKS
# ============================================================================


def get_current_limits(db: Session, tenant_id: int) -> dict:
    """
    Get current usage counts for tenant.

    Returns:
        Dict with member_count, staff_count, plan_count
    """
    member_count = (
        db.query(func.count(Member.id))
        .filter(and_(Member.tenant_id == tenant_id, Member.is_active == True))
        .scalar()
        or 0
    )

    staff_count = (
        db.query(func.count(User.id))
        .filter(
            and_(
                User.tenant_id == tenant_id,
                User.is_active == True,
                User.role == "gym_staff",
            )
        )
        .scalar()
        or 0
    )

    plan_count = (
        db.query(func.count(MembershipPlan.id))
        .filter(
            and_(
                MembershipPlan.tenant_id == tenant_id, MembershipPlan.is_active == True
            )
        )
        .scalar()
        or 0
    )

    return {
        "member_count": member_count,
        "staff_count": staff_count,
        "plan_count": plan_count,
    }


def get_plan_limits(db: Session, tenant_id: int) -> dict:
    """
    Get plan limits for tenant.

    During trial: Pro plan limits (unlimited members, 5 staff, unlimited plans)
    After subscription: Based on subscribed plan

    Returns:
        Dict with max_members, max_staff, max_plans (-1 means unlimited)
    """
    subscription = get_current_subscription(db, tenant_id)

    if not subscription:
        # No subscription record - return Trial limits (Pro plan features)
        pro_plan = (
            db.query(SubscriptionPlan)
            .filter(
                SubscriptionPlan.name == "Pro", SubscriptionPlan.is_deleted == False
            )
            .first()
        )

        if pro_plan:
            return {
                "max_members": pro_plan.max_members,
                "max_staff": pro_plan.max_staff,
                "max_plans": pro_plan.max_plans,
                "max_diet_templates": pro_plan.max_diet_templates,
            }

        # Fallback if Pro plan doesn't exist
        return {
            "max_members": -1,
            "max_staff": 5,
            "max_plans": -1,
            "max_diet_templates": -1,
        }

    # During trial: Pro plan limits (unlimited templates)
    if subscription.status == SubscriptionStatus.TRIAL:
        pro_plan = (
            db.query(SubscriptionPlan)
            .filter(
                SubscriptionPlan.name == "Pro", SubscriptionPlan.is_deleted == False
            )
            .first()
        )

        if pro_plan:
            return {
                "max_members": pro_plan.max_members,
                "max_staff": pro_plan.max_staff,
                "max_plans": pro_plan.max_plans,
                "max_diet_templates": pro_plan.max_diet_templates,
            }

    # Active subscription: Use plan limits
    if subscription.plan_id and subscription.status == SubscriptionStatus.ACTIVE:
        plan = get_subscription_plan(db, subscription.plan_id)
        if plan:
            return {
                "max_members": plan.max_members,
                "max_staff": plan.max_staff,
                "max_plans": plan.max_plans,
                "max_diet_templates": plan.max_diet_templates,
            }

    # Expired/suspended: Return 0 limits
    return {"max_members": 0, "max_staff": 0, "max_plans": 0, "max_diet_templates": 0}


def check_member_limit(db: Session, tenant_id: int) -> Tuple[bool, str]:
    """
    Check if tenant can add more members.

    Returns:
        Tuple of (can_add, message)
    """
    current = get_current_limits(db, tenant_id)
    limits = get_plan_limits(db, tenant_id)

    max_members = limits["max_members"]
    current_members = current["member_count"]

    # -1 means unlimited
    if max_members == -1:
        return (True, "")

    if current_members >= max_members:
        return (
            False,
            f"Member limit reached ({current_members}/{max_members}). Upgrade your plan to add more members.",
        )

    return (True, "")


def check_staff_limit(db: Session, tenant_id: int) -> Tuple[bool, str]:
    """
    Check if tenant can add more staff.

    Returns:
        Tuple of (can_add, message)
    """
    current = get_current_limits(db, tenant_id)
    limits = get_plan_limits(db, tenant_id)

    max_staff = limits["max_staff"]
    current_staff = current["staff_count"]

    # -1 means unlimited
    if max_staff == -1:
        return (True, "")

    if current_staff >= max_staff:
        return (
            False,
            f"Staff limit reached ({current_staff}/{max_staff}). Upgrade your plan to add more staff.",
        )

    return (True, "")


def check_plan_limit(db: Session, tenant_id: int) -> Tuple[bool, str]:
    """
    Check if tenant can create more membership plans.

    Returns:
        Tuple of (can_create, message)
    """
    current = get_current_limits(db, tenant_id)
    limits = get_plan_limits(db, tenant_id)

    max_plans = limits["max_plans"]
    current_plans = current["plan_count"]

    # -1 means unlimited
    if max_plans == -1:
        return (True, "")

    if current_plans >= max_plans:
        return (
            False,
            f"Membership plan limit reached ({current_plans}/{max_plans}). Upgrade your plan to create more plans.",
        )

    return (True, "")


def check_feature_access(db: Session, tenant_id: int, feature: str) -> bool:
    """
    Check if tenant has access to a specific feature.

    Features: "whatsapp", "advanced_analytics", "diet_plans"

    Returns:
        True if feature is available, False otherwise
    """
    subscription = get_current_subscription(db, tenant_id)

    if not subscription:
        return False

    # During trial: WhatsApp disabled, Diet Plans and Analytics available
    if subscription.status == SubscriptionStatus.TRIAL:
        if feature == "whatsapp":
            return True  # Enabled during trial for testing
        if feature in ["advanced_analytics", "diet_plans"]:
            return True  # Available during trial

    # Active subscription: Check plan features
    if subscription.plan_id and subscription.status == SubscriptionStatus.ACTIVE:
        plan = get_subscription_plan(db, subscription.plan_id)
        if plan:
            if feature == "whatsapp":
                return plan.whatsapp_enabled
            if feature == "advanced_analytics":
                return plan.advanced_analytics
            if feature == "store":
                return plan.store_enabled
            if feature == "diet_plans":
                # Both Starter and Pro have diet plans, but limits differ (handled in get_plan_limits)
                return True

    return False


# ============================================================================
# STATUS CHECKS
# ============================================================================


def is_subscription_active(db: Session, tenant_id: int) -> bool:
    """
    Check if subscription is active (trial or paid).

    Returns:
        True if active, False if expired/suspended
    """
    subscription = get_current_subscription(db, tenant_id)

    if not subscription:
        return False

    # Trial active?
    if subscription.status == SubscriptionStatus.TRIAL:
        # Use Tenant.created_at to determine precise trial end (7 full days)
        if subscription.tenant and subscription.tenant.created_at:
            # Convert to date for comparison if needed, or use datetime
            trial_end_dt = subscription.tenant.created_at + timedelta(days=7)
            if datetime.now(trial_end_dt.tzinfo) <= trial_end_dt:
                return True
        elif (
            subscription.trial_end_date and date.today() <= subscription.trial_end_date
        ):
            return True

        # Trial expired, update status
        expire_trial(db, tenant_id)

        # Also mark tenant as inactive
        if subscription.tenant:
            subscription.tenant.is_active = False
            db.commit()

        return False

    # Subscription active?
    if subscription.status == SubscriptionStatus.ACTIVE:
        if (
            subscription.subscription_end_date
            and date.today() <= subscription.subscription_end_date
        ):
            return True
        else:
            # Subscription expired
            # Try to activate queued subscription
            if check_and_process_queue(db, tenant_id):
                return True

            subscription.status = SubscriptionStatus.EXPIRED
            db.commit()
            logger.info(f"Subscription expired for tenant {tenant_id}")
            return False

    return False


def should_block_access(db: Session, tenant_id: int) -> Tuple[bool, str]:
    """
    Check if tenant should be blocked from accessing the system.

    Returns:
        Tuple of (should_block, reason)
    """
    subscription = get_current_subscription(db, tenant_id)

    if not subscription:
        return (True, "No subscription found")

    # Check if active
    if is_subscription_active(db, tenant_id):
        return (False, "")

    # Subscription is not active
    if subscription.status == SubscriptionStatus.EXPIRED:
        return (True, "Subscription expired. Please renew to continue.")

    if subscription.status == SubscriptionStatus.SUSPENDED:
        return (True, "Account suspended. Please contact support.")

    if subscription.status == SubscriptionStatus.CANCELLED:
        return (True, "Subscription cancelled. Please reactivate to continue.")

    return (True, "Subscription inactive")


def get_subscription_status_detail(db: Session, tenant_id: int) -> dict:
    """
    Get detailed subscription status with all information.

    Returns comprehensive status dict for frontend display.
    """
    subscription = get_current_subscription(db, tenant_id)

    # If no subscription exists, return Trial defaults
    if not subscription:
        # Get Pro plan limits for Trial users
        pro_plan = (
            db.query(SubscriptionPlan)
            .filter(
                SubscriptionPlan.name == "Pro", SubscriptionPlan.is_deleted == False
            )
            .first()
        )

        trial_limits = {
            "max_members": pro_plan.max_members if pro_plan else -1,
            "max_staff": pro_plan.max_staff if pro_plan else 5,
            "max_plans": pro_plan.max_plans if pro_plan else -1,
        }

        current_usage = get_current_limits(db, tenant_id)

        # Calculate expires_at for this automatic trial
        from app.services.tenant_service import get_tenant_by_id

        tenant = get_tenant_by_id(db, tenant_id)
        expires_at = None
        if tenant and tenant.created_at:
            expires_at = tenant.created_at + timedelta(days=7)

        return {
            "has_subscription": False,
            "is_active": True,  # Trial is considered active
            "status": "trial",
            "is_trial": True,
            "days_remaining": (
                max(0, (expires_at.date() - date.today()).days) if expires_at else 0
            ),
            "expires_at": expires_at,
            "plan_name": "Trial",
            "current_usage": current_usage,
            "plan_limits": trial_limits,
            "features": {
                "whatsapp_enabled": True,  # Trial gets all features
                "analytics_enabled": True,
                "store_enabled": True,
                "diet_plans_enabled": True,
            },
        }

    is_active = is_subscription_active(db, tenant_id)
    current_limits = get_current_limits(db, tenant_id)
    plan_limits = get_plan_limits(db, tenant_id)

    # Calculate days remaining
    days_remaining = None
    if subscription.status == SubscriptionStatus.TRIAL and subscription.trial_end_date:
        days_remaining = (subscription.trial_end_date - date.today()).days
    elif (
        subscription.status == SubscriptionStatus.ACTIVE
        and subscription.subscription_end_date
    ):
        days_remaining = (subscription.subscription_end_date - date.today()).days

    # Get plan details
    plan_details = None
    plan_name = "Trial"
    if subscription.plan_id:
        plan = get_subscription_plan(db, subscription.plan_id)
        if plan:
            plan_name = plan.name
            plan_details = {
                "id": plan.id,
                "name": plan.name,
                "price": float(plan.price_monthly),
            }

    # Determine exact expiration timestamp for countdown
    expires_at = None
    if subscription.status == SubscriptionStatus.TRIAL:
        # Priority 1: Tenant.created_at + 7 days (exact to the second)
        if subscription.tenant and subscription.tenant.created_at:
            expires_at = subscription.tenant.created_at + timedelta(days=7)
        # Priority 2: subscription.created_at + 7 days
        elif subscription.created_at:
            expires_at = subscription.created_at + timedelta(days=7)
        # Priority 3: trial_end_date (at end of day)
        elif subscription.trial_end_date:
            expires_at = datetime.combine(
                subscription.trial_end_date, datetime.max.time()
            )
    elif (
        subscription.status == SubscriptionStatus.ACTIVE
        and subscription.subscription_end_date
    ):
        # Priority 1: subscription_end_date (at end of day)
        expires_at = datetime.combine(
            subscription.subscription_end_date, datetime.max.time()
        )

    # Ensure expires_at is definitely sent if the subscription is active
    if not expires_at and is_active:
        # Ultimate fallback: Current time + days_remaining
        expires_at = datetime.now() + timedelta(days=days_remaining or 0)

    # Get queued subscriptions
    queued_subscriptions = (
        db.query(SubscriptionQueue)
        .filter(
            SubscriptionQueue.tenant_id == tenant_id,
            SubscriptionQueue.status == QueueStatus.PENDING,
        )
        .order_by(SubscriptionQueue.created_at.asc())
        .all()
    )

    queued_list = []
    for q in queued_subscriptions:
        q_plan = get_subscription_plan(db, q.plan_id)
        if q_plan:
            queued_list.append(
                {
                    "id": q.id,
                    "plan_name": q_plan.name,
                    "plan_id": q.plan_id,
                    "created_at": q.created_at,
                }
            )

    return {
        "has_subscription": True,
        "is_active": is_active,
        "status": subscription.status.value,
        "is_trial": subscription.status == SubscriptionStatus.TRIAL,
        "days_remaining": days_remaining,
        "expires_at": expires_at,
        "plan_name": plan_name,
        "plan": plan_details,
        "current_usage": current_limits,
        "plan_limits": plan_limits,
        "queued_subscriptions": queued_list,
        "features": {
            "whatsapp_enabled": check_feature_access(db, tenant_id, "whatsapp"),
            "analytics_enabled": check_feature_access(
                db, tenant_id, "advanced_analytics"
            ),
            "store_enabled": check_feature_access(db, tenant_id, "store"),
            "diet_plans_enabled": check_feature_access(db, tenant_id, "diet_plans"),
        },
        "auto_renew": subscription.auto_renew,
    }


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
