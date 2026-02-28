from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_
from typing import Optional, List, Tuple
from decimal import Decimal
from datetime import date, datetime
import asyncio

from app.models.member_fee import MemberFee
from app.models.member import Member
from app.models.membership_plan import MembershipPlan
from app.schemas.member_fee import PaymentMethod, PaymentStatus
from app.services.whatsapp_service import whatsapp_service
from app.services.audit_service import log_activity
from loguru import logger


def record_fee(
    db: Session,
    member_id: int,
    tenant_id: int,
    fee_data,
    user_id: int,
    background_tasks: Optional[any] = None,
) -> MemberFee:
    # Verify member exists and belongs to tenant
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

    if not member:
        raise ValueError("Member not found")

    # Verify plan if provided
    if fee_data.plan_id:
        plan = (
            db.query(MembershipPlan)
            .filter(
                and_(
                    MembershipPlan.id == fee_data.plan_id,
                    MembershipPlan.tenant_id == tenant_id,
                    MembershipPlan.is_active == True,
                )
            )
            .first()
        )

        if not plan:
            raise ValueError("Plan not found")

    # Create fee record
    db_fee = MemberFee(
        member_id=member_id,
        tenant_id=tenant_id,
        plan_id=fee_data.plan_id,
        amount=fee_data.amount,
        payment_method=fee_data.payment_method.value,
        payment_date=fee_data.payment_date,
        payment_status=PaymentStatus.PAID.value,
        transaction_id=fee_data.transaction_id,
        notes=fee_data.notes,
        created_by=user_id,
    )

    db.add(db_fee)

    # Update member's total fees paid
    member.total_fees_paid = (member.total_fees_paid or Decimal(0)) + fee_data.amount

    # Update member's outstanding dues (reduce by payment amount)
    member.outstanding_dues = max(
        Decimal(0), (member.outstanding_dues or Decimal(0)) - fee_data.amount
    )

    db.commit()
    db.refresh(db_fee)

    # Log activity
    log_activity(
        db,
        tenant_id=tenant_id,
        user_id=user_id,
        type="payment",
        description=f"Payment of ₹{fee_data.amount} received from {member.first_name} {member.last_name}",
        meta={
            "member_id": member_id,
            "amount": float(fee_data.amount),
            "fee_id": db_fee.id,
        },
    )

    logger.info(
        f"Recorded fee: ₹{fee_data.amount} for member {member_id} by user {user_id}"
    )

    # Get plan details for original amount
    plan = (
        db.query(MembershipPlan).filter(MembershipPlan.id == fee_data.plan_id).first()
        if fee_data.plan_id
        else None
    )
    original_amount = float(plan.price) if plan else float(fee_data.amount)

    # Get gym name
    gym_name = member.tenant.name if member.tenant else "Our Gym"

    # Send WhatsApp payment confirmation (non-blocking)
    try:
        if background_tasks:
            background_tasks.add_task(
                whatsapp_service.send_payment_confirmation,
                db=db,
                tenant_id=tenant_id,
                phone_number=member.phone_number,
                member_name=f"{member.first_name} {member.last_name}",
                amount=float(fee_data.amount),
                payment_method=fee_data.payment_method.value,
                payment_date=fee_data.payment_date,
                gym_name=gym_name,
            )
        else:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(
                        whatsapp_service.send_payment_confirmation(
                            db=db,
                            tenant_id=tenant_id,
                            phone_number=member.phone_number,
                            member_name=f"{member.first_name} {member.last_name}",
                            amount=float(fee_data.amount),
                            payment_method=fee_data.payment_method.value,
                            payment_date=fee_data.payment_date,
                            gym_name=gym_name,
                        )
                    )
            except Exception:
                pass
    except Exception as e:
        logger.warning(f"Failed to send WhatsApp payment confirmation: {e}")

    # Send detailed payment receipt (non-blocking)
    try:
        if background_tasks:
            background_tasks.add_task(
                whatsapp_service.send_payment_receipt,
                db=db,
                tenant_id=tenant_id,
                phone_number=member.phone_number,
                member_name=f"{member.first_name} {member.last_name}",
                amount_paid=float(fee_data.amount),
                original_amount=original_amount,
                outstanding_dues=float(member.outstanding_dues),
                payment_method=fee_data.payment_method.value,
                payment_date=fee_data.payment_date,
                transaction_id=fee_data.transaction_id,
                gym_name=gym_name,
            )
        else:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(
                        whatsapp_service.send_payment_receipt(
                            db=db,
                            tenant_id=tenant_id,
                            phone_number=member.phone_number,
                            member_name=f"{member.first_name} {member.last_name}",
                            amount_paid=float(fee_data.amount),
                            original_amount=original_amount,
                            outstanding_dues=float(member.outstanding_dues),
                            payment_method=fee_data.payment_method.value,
                            payment_date=fee_data.payment_date,
                            transaction_id=fee_data.transaction_id,
                            gym_name=gym_name,
                        )
                    )
            except Exception:
                pass
    except Exception as e:
        logger.warning(f"Failed to send WhatsApp payment receipt: {e}")

    return db_fee


def get_member_fees(
    db: Session,
    member_id: int,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Tuple[List[MemberFee], int, Decimal]:
    """Get all fee payments for a member."""
    # Verify member belongs to tenant
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

    if not member:
        return [], 0, Decimal(0)

    query = db.query(MemberFee).filter(
        and_(MemberFee.member_id == member_id, MemberFee.tenant_id == tenant_id)
    )

    # Apply date filters
    if start_date:
        query = query.filter(MemberFee.payment_date >= start_date)
    if end_date:
        query = query.filter(MemberFee.payment_date <= end_date)

    total = query.count()
    fees = query.order_by(MemberFee.payment_date.desc()).offset(skip).limit(limit).all()

    # Calculate total amount
    total_amount = db.query(func.sum(MemberFee.amount)).filter(
        and_(
            MemberFee.member_id == member_id,
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_status == PaymentStatus.PAID.value,
        )
    ).scalar() or Decimal(0)

    return fees, total, total_amount


def get_tenant_fees(
    db: Session,
    tenant_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    payment_method: Optional[PaymentMethod] = None,
    skip: int = 0,
    limit: int = 100,
) -> Tuple[List[MemberFee], int, Decimal]:
    """Get all fee payments for a tenant with filters."""
    query = db.query(MemberFee).filter(MemberFee.tenant_id == tenant_id)

    # Apply date filters
    if start_date:
        query = query.filter(MemberFee.payment_date >= start_date)
    if end_date:
        query = query.filter(MemberFee.payment_date <= end_date)

    # Apply payment method filter
    if payment_method:
        query = query.filter(MemberFee.payment_method == payment_method.value)

    total = query.count()
    fees = query.order_by(MemberFee.payment_date.desc()).offset(skip).limit(limit).all()

    # Calculate total amount for paid fees
    amount_query = (
        db.query(func.sum(MemberFee.amount))
        .join(Member, MemberFee.member_id == Member.id)
        .filter(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_status == PaymentStatus.PAID.value,
            Member.is_deleted == False,
        )
    )

    if start_date:
        amount_query = amount_query.filter(MemberFee.payment_date >= start_date)
    if end_date:
        amount_query = amount_query.filter(MemberFee.payment_date <= end_date)
    if payment_method:
        amount_query = amount_query.filter(
            MemberFee.payment_method == payment_method.value
        )

    total_amount = amount_query.scalar() or Decimal(0)

    return fees, total, total_amount


def calculate_outstanding_dues(db: Session, member_id: int, tenant_id: int) -> Decimal:
    """Calculate outstanding dues for a member."""
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

    if not member:
        return Decimal(0)

    return member.outstanding_dues or Decimal(0)


def get_financial_report(
    db: Session, tenant_id: int, start_date: date, end_date: date
) -> dict:
    """Generate financial report for a tenant."""
    # Total revenue
    total_revenue = db.query(func.sum(MemberFee.amount)).join(
        Member, MemberFee.member_id == Member.id
    ).filter(
        and_(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_date >= start_date,
            MemberFee.payment_date <= end_date,
            MemberFee.payment_status == PaymentStatus.PAID.value,
            Member.is_deleted == False,
        )
    ).scalar() or Decimal(
        0
    )

    # Revenue by payment method
    cash_payments = db.query(func.sum(MemberFee.amount)).join(
        Member, MemberFee.member_id == Member.id
    ).filter(
        and_(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_date >= start_date,
            MemberFee.payment_date <= end_date,
            MemberFee.payment_method == PaymentMethod.CASH.value,
            MemberFee.payment_status == PaymentStatus.PAID.value,
            Member.is_deleted == False,
        )
    ).scalar() or Decimal(
        0
    )

    upi_payments = db.query(func.sum(MemberFee.amount)).join(
        Member, MemberFee.member_id == Member.id
    ).filter(
        and_(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_date >= start_date,
            MemberFee.payment_date <= end_date,
            MemberFee.payment_method == PaymentMethod.UPI.value,
            MemberFee.payment_status == PaymentStatus.PAID.value,
            Member.is_deleted == False,
        )
    ).scalar() or Decimal(
        0
    )

    card_payments = db.query(func.sum(MemberFee.amount)).join(
        Member, MemberFee.member_id == Member.id
    ).filter(
        and_(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_date >= start_date,
            MemberFee.payment_date <= end_date,
            MemberFee.payment_method == PaymentMethod.CARD.value,
            MemberFee.payment_status == PaymentStatus.PAID.value,
            Member.is_deleted == False,
        )
    ).scalar() or Decimal(
        0
    )

    bank_transfer_payments = db.query(func.sum(MemberFee.amount)).join(
        Member, MemberFee.member_id == Member.id
    ).filter(
        and_(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_date >= start_date,
            MemberFee.payment_date <= end_date,
            MemberFee.payment_method == PaymentMethod.BANK_TRANSFER.value,
            MemberFee.payment_status == PaymentStatus.PAID.value,
            Member.is_deleted == False,
        )
    ).scalar() or Decimal(
        0
    )

    # Payment count
    payment_count = (
        db.query(func.count(MemberFee.id))
        .join(Member, MemberFee.member_id == Member.id)
        .filter(
            and_(
                MemberFee.tenant_id == tenant_id,
                MemberFee.payment_date >= start_date,
                MemberFee.payment_date <= end_date,
                MemberFee.payment_status == PaymentStatus.PAID.value,
                Member.is_deleted == False,
            )
        )
        .scalar()
        or 0
    )

    # Unique members who paid
    member_count = (
        db.query(func.count(func.distinct(MemberFee.member_id)))
        .join(Member, MemberFee.member_id == Member.id)
        .filter(
            and_(
                MemberFee.tenant_id == tenant_id,
                MemberFee.payment_date >= start_date,
                MemberFee.payment_date <= end_date,
                MemberFee.payment_status == PaymentStatus.PAID.value,
                Member.is_deleted == False,
            )
        )
        .scalar()
        or 0
    )

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_revenue": total_revenue,
        "cash_payments": cash_payments,
        "upi_payments": upi_payments,
        "card_payments": card_payments,
        "bank_transfer_payments": bank_transfer_payments,
        "payment_count": payment_count,
        "member_count": member_count,
    }


def get_fee_statistics(db: Session, tenant_id: int) -> dict:
    """Get fee statistics for a tenant."""
    # Total collected
    total_collected = db.query(func.sum(MemberFee.amount)).join(
        Member, MemberFee.member_id == Member.id
    ).filter(
        and_(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_status == PaymentStatus.PAID.value,
            Member.is_deleted == False,
        )
    ).scalar() or Decimal(
        0
    )

    # Total pending
    total_pending = db.query(func.sum(MemberFee.amount)).filter(
        and_(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_status == PaymentStatus.PENDING.value,
        )
    ).scalar() or Decimal(0)

    # Total refunded
    total_refunded = db.query(func.sum(MemberFee.amount)).filter(
        and_(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_status == PaymentStatus.REFUNDED.value,
        )
    ).scalar() or Decimal(0)

    # Payment count
    payment_count = (
        db.query(func.count(MemberFee.id))
        .join(Member, MemberFee.member_id == Member.id)
        .filter(
            and_(
                MemberFee.tenant_id == tenant_id,
                MemberFee.payment_status == PaymentStatus.PAID.value,
                Member.is_deleted == False,
            )
        )
        .scalar()
        or 0
    )

    return {
        "total_collected": total_collected,
        "total_pending": total_pending,
        "total_refunded": total_refunded,
        "payment_count": payment_count,
    }


def get_all_fees_for_export(db: Session, tenant_id: int):
    """
    Get all fee records for a tenant for CSV export.
    Includes member information.
    """
    return (
        db.query(MemberFee)
        .join(Member, MemberFee.member_id == Member.id)
        .filter(
            and_(
                MemberFee.tenant_id == tenant_id,
                Member.is_deleted == False,
            )
        )
        .order_by(MemberFee.payment_date.desc())
        .all()
    )
