from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract, or_
from datetime import date, timedelta, datetime
from typing import List, Optional
from calendar import month_abbr

from app.models import Member, MemberStatus
from app.models import MemberFee
from app.models import Expense
from app.models import MembershipPlan
from app.schemas.dashboard import (
    DashboardStats,
    RevenueChartDataPoint,
    ExpiringMember,
    RecentActivity,
    UpcomingBirthday,
)
from loguru import logger


def get_dashboard_stats(db: Session, tenant_id: int) -> DashboardStats:
    """
    Get dashboard statistics with month-over-month comparisons.
    """
    today = date.today()

    # Current month dates
    current_month_start = date(today.year, today.month, 1)
    if today.month == 12:
        next_month_start = date(today.year + 1, 1, 1)
    else:
        next_month_start = date(today.year, today.month + 1, 1)

    # Previous month dates
    if today.month == 1:
        prev_month_start = date(today.year - 1, 12, 1)
        prev_month_end = date(today.year, 1, 1) - timedelta(days=1)
    else:
        prev_month_start = date(today.year, today.month - 1, 1)
        prev_month_end = current_month_start - timedelta(days=1)

    # Total members (current)
    total_members = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
            )
        )
        .scalar()
        or 0
    )

    # Total members (last month)
    total_members_prev = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.created_at <= prev_month_end,
            )
        )
        .scalar()
        or 0
    )

    total_members_change = (
        ((total_members - total_members_prev) / total_members_prev * 100)
        if total_members_prev > 0
        else 0.0
    )

    # Active members (current)
    active_members = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.status == MemberStatus.ACTIVE,
            )
        )
        .scalar()
        or 0
    )

    # Active members (prev)
    # This is slightly complex to track accurately without historical status snapshots,
    # so we'll approximate based on those joined by then who aren't currently expired
    # but for simplicity we'll just use current count vs last month's active count if possible
    active_members_prev = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.created_at <= prev_month_end,
                Member.status == MemberStatus.ACTIVE,
            )
        )
        .scalar()
        or 0
    )

    active_members_change = (
        ((active_members - active_members_prev) / active_members_prev * 100)
        if active_members_prev > 0
        else 0.0
    )

    # Monthly revenue (current month)
    monthly_revenue = float(
        db.query(func.sum(MemberFee.amount))
        .join(Member, MemberFee.member_id == Member.id)
        .filter(
            and_(
                MemberFee.tenant_id == tenant_id,
                MemberFee.payment_date >= current_month_start,
                MemberFee.payment_date < next_month_start,
                Member.is_deleted == False,
            )
        )
        .scalar()
        or 0.0
    )

    # Monthly revenue (previous month)
    monthly_revenue_prev = float(
        db.query(func.sum(MemberFee.amount))
        .join(Member, MemberFee.member_id == Member.id)
        .filter(
            and_(
                MemberFee.tenant_id == tenant_id,
                MemberFee.payment_date >= prev_month_start,
                MemberFee.payment_date <= prev_month_end,
                Member.is_deleted == False,
            )
        )
        .scalar()
        or 0.0
    )

    monthly_revenue_change = (
        ((monthly_revenue - monthly_revenue_prev) / monthly_revenue_prev * 100)
        if monthly_revenue_prev > 0
        else 0.0
    )

    # New joiners (current month)
    new_joiners = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.joining_date >= current_month_start,
                Member.joining_date < next_month_start,
            )
        )
        .scalar()
        or 0
    )

    # New joiners (previous month)
    new_joiners_prev = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.joining_date >= prev_month_start,
                Member.joining_date <= prev_month_end,
            )
        )
        .scalar()
        or 0
    )

    new_joiners_change = (
        ((new_joiners - new_joiners_prev) / new_joiners_prev * 100)
        if new_joiners_prev > 0
        else 0.0
    )

    # Retention rate (Loyalty)
    active_last_month = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.joining_date <= prev_month_end,
                Member.status == MemberStatus.ACTIVE,
            )
        )
        .scalar()
        or 0
    )

    expired_this_month = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.membership_expiry_date >= current_month_start,
                Member.membership_expiry_date < next_month_start,
                Member.status == MemberStatus.EXPIRED,
            )
        )
        .scalar()
        or 0
    )

    retention_rate = (
        ((active_last_month - expired_this_month) / active_last_month * 100)
        if active_last_month > 0
        else 100.0
    )

    active_two_months_ago = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.joining_date <= prev_month_start - timedelta(days=1),
                Member.status == MemberStatus.ACTIVE,
            )
        )
        .scalar()
        or 0
    )

    expired_last_month = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.membership_expiry_date >= prev_month_start,
                Member.membership_expiry_date <= prev_month_end,
                Member.status == MemberStatus.EXPIRED,
            )
        )
        .scalar()
        or 0
    )

    retention_rate_prev = (
        ((active_two_months_ago - expired_last_month) / active_two_months_ago * 100)
        if active_two_months_ago > 0
        else 100.0
    )

    retention_rate_change = retention_rate - retention_rate_prev

    # Outstanding Dues
    outstanding_dues = (
        db.query(func.sum(Member.outstanding_dues))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
            )
        )
        .scalar()
        or 0.0
    )

    # Outstanding Dues Change (compared to last month's end)
    # This is also an approximation
    outstanding_dues_prev = (
        db.query(func.sum(Member.outstanding_dues))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.created_at <= prev_month_end,
            )
        )
        .scalar()
        or 0.0
    )

    outstanding_dues_change = (
        (
            (float(outstanding_dues) - float(outstanding_dues_prev))
            / float(outstanding_dues_prev)
            * 100
        )
        if outstanding_dues_prev > 0
        else 0.0
    )

    # Total Lifetime Revenue
    total_revenue = (
        db.query(func.sum(MemberFee.amount))
        .join(Member, MemberFee.member_id == Member.id)
        .filter(
            and_(
                MemberFee.tenant_id == tenant_id,
                Member.is_deleted == False,
            )
        )
        .scalar()
        or 0.0
    )

    # Total Lifetime Expenses
    total_expenses = (
        db.query(func.sum(Expense.amount))
        .filter(and_(Expense.tenant_id == tenant_id, Expense.is_deleted == False))
        .scalar()
        or 0.0
    )

    return DashboardStats(
        total_members=total_members,
        total_members_change=round(total_members_change, 1),
        active_members=active_members,
        active_members_change=round(active_members_change, 1),
        monthly_revenue=float(monthly_revenue),
        monthly_revenue_change=round(monthly_revenue_change, 1),
        new_joiners=new_joiners,
        new_joiners_change=round(new_joiners_change, 1),
        retention_rate=round(retention_rate, 1),
        retention_rate_change=round(retention_rate_change, 1),
        outstanding_dues=float(outstanding_dues),
        outstanding_dues_change=round(outstanding_dues_change, 1),
        total_revenue=float(total_revenue),
        total_expenses=float(total_expenses),
    )


def get_revenue_chart_data(
    db: Session, tenant_id: int, months: int = 6
) -> List[RevenueChartDataPoint]:
    """
    Get revenue and expense data for the last N months.
    """
    today = date.today()
    result = []

    for i in range(months - 1, -1, -1):
        if today.month - i <= 0:
            month = 12 + (today.month - i)
            year = today.year - 1
        else:
            month = today.month - i
            year = today.year

        month_start = date(year, month, 1)
        if month == 12:
            month_end = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            month_end = date(year, month + 1, 1) - timedelta(days=1)

        revenue = (
            db.query(func.sum(MemberFee.amount))
            .join(Member, MemberFee.member_id == Member.id)
            .filter(
                and_(
                    MemberFee.tenant_id == tenant_id,
                    Member.is_deleted == False,
                    MemberFee.payment_date >= month_start,
                    MemberFee.payment_date <= month_end,
                )
            )
            .scalar()
            or 0.0
        )

        expenses = (
            db.query(func.sum(Expense.amount))
            .filter(
                and_(
                    Expense.tenant_id == tenant_id,
                    Expense.is_deleted == False,
                    Expense.expense_date >= month_start,
                    Expense.expense_date <= month_end,
                )
            )
            .scalar()
            or 0.0
        )

        result.append(
            RevenueChartDataPoint(
                month=month_abbr[month],
                revenue=float(revenue),
                expenses=float(expenses),
            )
        )

    return result


def get_expiring_members(
    db: Session, tenant_id: int, days: int = 7
) -> List[ExpiringMember]:
    """
    Get members whose membership is expiring in the next N days.
    """
    today = date.today()
    expiry_date = today + timedelta(days=days)

    members = (
        db.query(Member, MembershipPlan.name)
        .outerjoin(MembershipPlan, Member.plan_id == MembershipPlan.id)
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.membership_expiry_date >= today,
                Member.membership_expiry_date <= expiry_date,
                Member.status.in_([MemberStatus.ACTIVE, MemberStatus.EXPIRED]),
            )
        )
        .order_by(Member.membership_expiry_date)
        .all()
    )

    result = []
    for member, plan_name in members:
        days_until_expiry = (member.membership_expiry_date - today).days
        result.append(
            ExpiringMember(
                id=member.id,
                first_name=member.first_name,
                last_name=member.last_name,
                phone_number=member.phone_number,
                email=member.email,
                membership_expiry_date=member.membership_expiry_date,
                days_until_expiry=days_until_expiry,
                plan_name=plan_name,
                outstanding_dues=float(member.outstanding_dues or 0),
            )
        )

    return result


def get_recent_activities(
    db: Session, tenant_id: int, limit: int = 10
) -> List[RecentActivity]:
    """
    Get recent system activities by combining data from different collections.
    """
    activities = []

    # 1. Recent Member Registrations
    members = (
        db.query(Member)
        .filter(and_(Member.tenant_id == tenant_id, Member.is_deleted == False))
        .order_by(Member.created_at.desc())
        .limit(limit)
        .all()
    )
    for m in members:
        activities.append(
            RecentActivity(
                id=f"reg_{m.id}",
                type="member_registration",
                description=f"New member registered: {m.first_name} {m.last_name}",
                timestamp=(
                    m.created_at.date()
                    if hasattr(m.created_at, "date")
                    else m.created_at
                ),
                meta={"member_id": m.id},
            )
        )

    # 2. Recent Payments
    payments = (
        db.query(MemberFee, Member.first_name, Member.last_name)
        .join(Member, MemberFee.member_id == Member.id)
        .filter(
            and_(
                MemberFee.tenant_id == tenant_id,
                Member.is_deleted == False,
            )
        )
        .order_by(MemberFee.payment_date.desc())
        .limit(limit)
        .all()
    )
    for p, fname, lname in payments:
        activities.append(
            RecentActivity(
                id=f"pay_{p.id}",
                type="payment",
                description=f"Payment of ₹{p.amount} received from {fname} {lname}",
                timestamp=p.payment_date,
                meta={"member_id": p.member_id, "amount": float(p.amount)},
            )
        )

    # Sort all activities by timestamp and return top N
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    return activities[:limit]


def get_upcoming_birthdays(
    db: Session, tenant_id: int, days: int = 7
) -> List[UpcomingBirthday]:
    """
    Get members having birthdays in the next N days.
    """
    today = date.today()
    upcoming = []

    # Query all members with DOB (this might be slow for huge gyms, but okay for now)
    members = (
        db.query(Member)
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.date_of_birth != None,
            )
        )
        .all()
    )

    for m in members:
        # Calculate anniversary this year
        try:
            bday_this_year = date(
                today.year, m.date_of_birth.month, m.date_of_birth.day
            )
        except ValueError:  # Feb 29
            bday_this_year = date(today.year, 2, 28)

        # If already passed this year, look at next year
        if bday_this_year < today:
            try:
                bday_next_year = date(
                    today.year + 1, m.date_of_birth.month, m.date_of_birth.day
                )
            except ValueError:
                bday_next_year = date(today.year + 1, 2, 28)
            bday_to_check = bday_next_year
        else:
            bday_to_check = bday_this_year

        days_until = (bday_to_check - today).days

        if 0 <= days_until <= days:
            age = today.year - m.date_of_birth.year
            upcoming.append(
                UpcomingBirthday(
                    id=m.id,
                    name=f"{m.first_name} {m.last_name}",
                    date_of_birth=m.date_of_birth,
                    age=age,
                    days_until=days_until,
                )
            )

    upcoming.sort(key=lambda x: x.days_until)
    return upcoming
