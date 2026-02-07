from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import date, timedelta
from typing import Optional
from app.models.member import Member, MemberStatus
from app.models.membership_plan import MembershipPlan
from app.schemas.members import MemberCreate, MemberUpdate, MemberRenew
from app.core.exceptions import UserAlreadyExistsException
from loguru import logger


def calculate_expiry_date(joining_date: date, membership_type: str) -> date:
    """
    Calculate membership expiry date based on membership type.

    Args:
        joining_date: Date when member joined
        membership_type: Type of membership

    Returns:
        Calculated expiry date
    """
    if membership_type == "Monthly":
        return joining_date + timedelta(days=30)
    elif membership_type == "3 Months":
        return joining_date + timedelta(days=90)
    elif membership_type == "6 Months":
        return joining_date + timedelta(days=180)
    elif membership_type == "1 Year":
        return joining_date + timedelta(days=365)
    else:
        raise ValueError(f"Invalid membership type: {membership_type}")


def update_member_status(member: Member) -> MemberStatus:
    """
    Update member status based on expiry date.

    Args:
        member: Member object

    Returns:
        Updated status
    """
    if not member.is_active:
        return MemberStatus.INACTIVE

    today = date.today()
    if member.membership_expiry_date < today:
        return MemberStatus.EXPIRED
    else:
        return MemberStatus.ACTIVE


def create_member(db: Session, member_create: MemberCreate, tenant_id: int) -> Member:
    """
    Create a new member.

    Args:
        db: Database session
        member_create: Member creation schema
        tenant_id: Tenant ID

    Returns:
        Created member

    Raises:
        UserAlreadyExistsException: If phone number already exists for this tenant
    """
    # Check if phone number already exists for this tenant
    existing_member = (
        db.query(Member)
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.phone_number == member_create.phone_number,
                Member.is_active == True,
            )
        )
        .first()
    )

    if existing_member:
        raise UserAlreadyExistsException(
            "A member with this phone number already exists"
        )

    # Handle plan-based or legacy membership
    plan_name = None
    duration_days = None

    if member_create.plan_id:
        # Using custom plan
        plan = (
            db.query(MembershipPlan)
            .filter(
                and_(
                    MembershipPlan.id == member_create.plan_id,
                    MembershipPlan.tenant_id == tenant_id,
                    MembershipPlan.is_active == True,
                )
            )
            .first()
        )

        if not plan:
            raise ValueError("Plan not found or not available")

        plan_name = plan.name
        duration_days = plan.duration_days
    elif member_create.membership_type:
        # Using legacy membership type
        plan_name = member_create.membership_type
        duration_days = _get_duration_from_type(member_create.membership_type)
    else:
        raise ValueError("Either plan_id or membership_type must be provided")

    # Calculate expiry date
    expiry_date = member_create.joining_date + timedelta(days=duration_days)

    # Create member
    db_member = Member(
        tenant_id=tenant_id,
        first_name=member_create.first_name,
        last_name=member_create.last_name,
        phone_number=member_create.phone_number,
        email=member_create.email,
        joining_date=member_create.joining_date,
        membership_expiry_date=expiry_date,
        plan_id=member_create.plan_id,
        current_plan_start_date=(
            member_create.joining_date if member_create.plan_id else None
        ),
        status=MemberStatus.ACTIVE,
    )

    db.add(db_member)
    db.commit()
    db.refresh(db_member)

    logger.info(
        f"New member created: {db_member.first_name} {db_member.last_name} (ID: {db_member.id})"
    )

    # TODO: Send WhatsApp welcome message (requires async context)
    # WhatsApp notifications are disabled for now to avoid asyncio errors in sync context

    return db_member


def _get_duration_from_type(membership_type: str) -> int:
    """Helper function to get duration days from membership type."""
    duration_map = {"Monthly": 30, "3 Months": 90, "6 Months": 180, "1 Year": 365}
    return duration_map.get(membership_type, 30)


def get_member_by_id(db: Session, member_id: int, tenant_id: int) -> Optional[Member]:
    member = (
        db.query(Member)
        .filter(
            and_(
                Member.id == member_id,
                Member.tenant_id == tenant_id,
                Member.is_active == True,
            )
        )
        .first()
    )

    if member:
        # Update status based on expiry
        new_status = update_member_status(member)
        if member.status != new_status:
            member.status = new_status
            db.commit()
            db.refresh(member)

    return member


def get_members_by_tenant(
    db: Session,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[MemberStatus] = None,
) -> tuple[list[Member], int]:
    query = db.query(Member).filter(
        and_(Member.tenant_id == tenant_id, Member.is_active == True)
    )

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Member.first_name.ilike(search_term),
                Member.last_name.ilike(search_term),
                Member.phone_number.like(search_term),
            )
        )

    # Apply status filter
    if status:
        query = query.filter(Member.status == status)

    # Get total count
    total = query.count()

    # Get paginated results
    members = query.order_by(Member.created_at.desc()).offset(skip).limit(limit).all()

    # Update statuses
    for member in members:
        new_status = update_member_status(member)
        if member.status != new_status:
            member.status = new_status

    if members:
        db.commit()

    return members, total


def update_member(
    db: Session, member_id: int, tenant_id: int, member_update: MemberUpdate
) -> Optional[Member]:
    member = get_member_by_id(db, member_id, tenant_id)
    if not member:
        return None

    # Check phone number uniqueness if being updated
    if member_update.phone_number and member_update.phone_number != member.phone_number:
        existing = (
            db.query(Member)
            .filter(
                and_(
                    Member.tenant_id == tenant_id,
                    Member.phone_number == member_update.phone_number,
                    Member.is_active == True,
                    Member.id != member_id,
                )
            )
            .first()
        )

        if existing:
            raise UserAlreadyExistsException(
                "A member with this phone number already exists"
            )

    # Update fields
    update_data = member_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)

    logger.info(
        f"Member updated: {member.first_name} {member.last_name} (ID: {member.id})"
    )
    return member


def delete_member(db: Session, member_id: int, tenant_id: int) -> bool:
    member = get_member_by_id(db, member_id, tenant_id)
    if not member:
        return False

    member.is_active = False
    member.status = MemberStatus.INACTIVE
    db.commit()

    logger.info(
        f"Member deleted: {member.first_name} {member.last_name} (ID: {member.id})"
    )
    return True


def renew_membership(
    db: Session, member_id: int, tenant_id: int, renewal: MemberRenew
) -> Optional[Member]:
    member = get_member_by_id(db, member_id, tenant_id)
    if not member:
        return None

    # Determine renewal date (use provided or today)
    renewal_date = renewal.renewal_date if renewal.renewal_date else date.today()

    # Calculate new expiry date from renewal_date or current expiry (whichever is later)
    start_date = max(renewal_date, member.membership_expiry_date)

    # Handle plan-based or legacy renewal
    plan_name = None
    duration_days = None

    if renewal.plan_id:
        # Renewing with custom plan
        plan = (
            db.query(MembershipPlan)
            .filter(
                and_(
                    MembershipPlan.id == renewal.plan_id,
                    MembershipPlan.tenant_id == tenant_id,
                    MembershipPlan.is_active == True,
                )
            )
            .first()
        )

        if not plan:
            raise ValueError("Plan not found or not available")

        plan_name = plan.name
        duration_days = plan.duration_days
        member.plan_id = renewal.plan_id
        member.current_plan_start_date = start_date
    elif renewal.membership_type:
        # Renewing with legacy membership type
        plan_name = renewal.membership_type
        duration_days = _get_duration_from_type(renewal.membership_type)
    else:
        raise ValueError("Either plan_id or membership_type must be provided")

    # Calculate new expiry
    new_expiry = start_date + timedelta(days=duration_days)

    member.membership_expiry_date = new_expiry
    member.status = MemberStatus.ACTIVE

    db.commit()
    db.refresh(member)

    logger.info(
        f"Membership renewed: {member.first_name} {member.last_name} (ID: {member.id}) until {new_expiry}"
    )

    # TODO: Send WhatsApp renewal confirmation (requires async context)
    # WhatsApp notifications are disabled for now to avoid asyncio errors in sync context

    return member


def update_member_photo(
    db: Session, member_id: int, tenant_id: int, photo_type: str, photo_url: str
) -> Optional[Member]:
    member = get_member_by_id(db, member_id, tenant_id)
    if not member:
        return None

    if photo_type.lower() == "before":
        member.before_photo_url = photo_url
    elif photo_type.lower() == "after":
        member.after_photo_url = photo_url
    else:
        raise ValueError("photo_type must be 'before' or 'after'")

    db.commit()
    db.refresh(member)

    logger.info(
        f"Member photo updated: {member.first_name} {member.last_name} (ID: {member.id}) - {photo_type}"
    )
    return member


def get_member_profile_detailed(db: Session, member_id: int, tenant_id: int):
    from app.models.member_fee import MemberFee

    member = get_member_by_id(db, member_id, tenant_id)
    if not member:
        return None

    # Get recent payments (last 10)
    recent_fees = (
        db.query(MemberFee)
        .filter(
            and_(
                MemberFee.member_id == member_id,
                MemberFee.tenant_id == tenant_id,
            )
        )
        .order_by(MemberFee.payment_date.desc())
        .limit(10)
        .all()
    )

    # Calculate days remaining in membership
    days_remaining = None
    if member.membership_expiry_date:
        days_remaining = (member.membership_expiry_date - date.today()).days
        if days_remaining < 0:
            days_remaining = 0

    # Build profile response
    profile = {
        "id": member.id,
        "first_name": member.first_name,
        "last_name": member.last_name,
        "phone_number": member.phone_number,
        "email": member.email,
        "joining_date": member.joining_date,
        "membership_expiry_date": member.membership_expiry_date,
        "status": member.status,
        "before_photo_url": member.before_photo_url,
        "after_photo_url": member.after_photo_url,
        "plan": None,
        "current_plan_start_date": member.current_plan_start_date,
        "plan_days_remaining": days_remaining,
        "total_fees_paid": (
            float(member.total_fees_paid) if member.total_fees_paid else 0.0
        ),
        "outstanding_dues": (
            float(member.outstanding_dues) if member.outstanding_dues else 0.0
        ),
        "recent_payments": [
            {
                "id": fee.id,
                "payment_date": fee.payment_date,
                "amount": float(fee.amount),
                "payment_method": fee.payment_method,
                "payment_status": fee.payment_status,
                "notes": fee.notes,
            }
            for fee in recent_fees
        ],
        "is_active": member.is_active,
        "created_at": member.created_at,
        "updated_at": member.updated_at,
    }

    # Add plan details if member has a plan
    if member.plan:
        profile["plan"] = {
            "id": member.plan.id,
            "name": member.plan.name,
            "duration_days": member.plan.duration_days,
            "price": float(member.plan.price),
            "description": member.plan.description,
        }

    return profile


async def send_expiry_reminders(
    db: Session, tenant_id: int, days_before_expiry: int = 7
) -> dict:
    from datetime import timedelta

    target_date = date.today() + timedelta(days=days_before_expiry)

    # Find members whose membership expires on the target date
    expiring_members = (
        db.query(Member)
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_active == True,
                Member.status == MemberStatus.ACTIVE,
                Member.membership_expiry_date == target_date,
            )
        )
        .all()
    )

    sent_count = 0
    failed_count = 0

    for member in expiring_members:
        try:
            result = await whatsapp_service.send_expiry_reminder(
                db=db,
                tenant_id=tenant_id,
                phone_number=member.phone_number,
                member_name=f"{member.first_name} {member.last_name}",
                expiry_date=member.membership_expiry_date,
                days_remaining=days_before_expiry,
            )

            if result.get("success"):
                sent_count += 1
                logger.info(
                    f"Sent expiry reminder to {member.first_name} {member.last_name} (ID: {member.id})"
                )
            else:
                failed_count += 1
                logger.warning(
                    f"Failed to send expiry reminder to {member.first_name} {member.last_name} (ID: {member.id})"
                )
        except Exception as e:
            failed_count += 1
            logger.error(
                f"Error sending expiry reminder to {member.first_name} {member.last_name} (ID: {member.id}): {e}"
            )

    logger.info(
        f"Expiry reminders sent: {sent_count} successful, {failed_count} failed"
    )

    return {
        "total_members": len(expiring_members),
        "sent_count": sent_count,
        "failed_count": failed_count,
        "days_before_expiry": days_before_expiry,
    }
