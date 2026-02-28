from sqlalchemy.orm import Session
from sqlalchemy import and_, func, case
from datetime import date, timedelta
from typing import List
from decimal import Decimal

from app.models.member import Member, MemberStatus
from app.models.membership_plan import MembershipPlan
from app.schemas.analytics import (
    MemberGrowthData,
    MemberStats,
    ChurnRate,
    PlanDistribution,
)
from loguru import logger


def get_member_growth(
    db: Session, tenant_id: int, start_date: date, end_date: date
) -> List[MemberGrowthData]:
    """
    Get member growth data for a date range.
    Returns daily count of new members and cumulative total.
    """
    # Get all members created within the date range
    members = (
        db.query(
            func.date(Member.created_at).label("join_date"),
            func.count(Member.id).label("count"),
        )
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                func.date(Member.created_at) >= start_date,
                func.date(Member.created_at) <= end_date,
            )
        )
        .group_by(func.date(Member.created_at))
        .order_by(func.date(Member.created_at))
        .all()
    )

    # Get cumulative count up to start_date
    cumulative_before = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                func.date(Member.created_at) < start_date,
            )
        )
        .scalar()
        or 0
    )

    # Build response with cumulative counts
    result = []
    cumulative = cumulative_before

    # Create a dict for quick lookup
    member_dict = {str(m.join_date): m.count for m in members}

    # Fill in all dates in range (including days with 0 new members)
    current_date = start_date
    while current_date <= end_date:
        daily_count = member_dict.get(str(current_date), 0)
        cumulative += daily_count

        result.append(
            MemberGrowthData(
                date=current_date, count=daily_count, cumulative_count=cumulative
            )
        )
        current_date += timedelta(days=1)

    return result


def get_member_stats(
    db: Session, tenant_id: int, start_date: date, end_date: date
) -> MemberStats:
    """
    Get member statistics for a date range.
    Returns counts and percentages of active/expired/inactive members who joined in the period.
    """
    # Get counts by status for members who joined in the date range
    stats = (
        db.query(
            Member.status,
            func.count(Member.id).label("count"),
        )
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.joining_date >= start_date,
                Member.joining_date <= end_date,
            )
        )
        .group_by(Member.status)
        .all()
    )

    # Build stats dict
    status_counts = {stat.status: stat.count for stat in stats}

    total_members = sum(status_counts.values())
    active_members = status_counts.get(MemberStatus.ACTIVE, 0)
    expired_members = status_counts.get(MemberStatus.EXPIRED, 0)
    inactive_members = status_counts.get(MemberStatus.INACTIVE, 0)

    active_rate = (active_members / total_members * 100) if total_members > 0 else 0.0

    return MemberStats(
        total_members=total_members,
        active_members=active_members,
        expired_members=expired_members,
        inactive_members=inactive_members,
        active_rate=round(active_rate, 2),
    )


def get_churn_rate(
    db: Session, tenant_id: int, start_date: date, end_date: date
) -> ChurnRate:
    """
    Calculate churn rate for a date range.
    Churn = members whose membership expired in the period and didn't renew.
    """
    # Members whose membership expired during the period
    expired_in_period = (
        db.query(Member)
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.membership_expiry_date >= start_date,
                Member.membership_expiry_date <= end_date,
            )
        )
        .all()
    )

    total_eligible = len(expired_in_period)

    # Count those who are still expired (didn't renew)
    # If they renewed, their expiry date would be in the future
    today = date.today()
    churned = sum(
        1
        for m in expired_in_period
        if m.membership_expiry_date < today and m.status == MemberStatus.EXPIRED
    )

    churn_rate = (churned / total_eligible * 100) if total_eligible > 0 else 0.0

    return ChurnRate(
        churn_rate=round(churn_rate, 2),
        churned_members=churned,
        total_eligible=total_eligible,
        period_start=start_date,
        period_end=end_date,
    )


def get_plan_distribution(
    db: Session, tenant_id: int, start_date: date, end_date: date
) -> List[PlanDistribution]:
    """
    Get distribution of members across different plans for a date range.
    Returns count and percentage for each plan for members who joined in the period.
    """
    # Get total members who joined in the date range
    total_members = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.joining_date >= start_date,
                Member.joining_date <= end_date,
            )
        )
        .scalar()
        or 0
    )

    if total_members == 0:
        return []

    # Get members grouped by plan who joined in the date range
    plan_stats = (
        db.query(
            MembershipPlan.name.label("plan_name"),
            func.count(Member.id).label("member_count"),
        )
        .join(Member, Member.plan_id == MembershipPlan.id)
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.joining_date >= start_date,
                Member.joining_date <= end_date,
                MembershipPlan.tenant_id == tenant_id,
            )
        )
        .group_by(MembershipPlan.name)
        .all()
    )

    # Count members without a plan (legacy members) who joined in the date range
    no_plan_count = (
        db.query(func.count(Member.id))
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.plan_id == None,
                Member.joining_date >= start_date,
                Member.joining_date <= end_date,
            )
        )
        .scalar()
        or 0
    )

    result = []

    # Add plan-based members
    for stat in plan_stats:
        percentage = stat.member_count / total_members * 100
        result.append(
            PlanDistribution(
                plan_name=stat.plan_name,
                member_count=stat.member_count,
                percentage=round(percentage, 2),
            )
        )

    # Add legacy members if any
    if no_plan_count > 0:
        percentage = no_plan_count / total_members * 100
        result.append(
            PlanDistribution(
                plan_name="Legacy/No Plan",
                member_count=no_plan_count,
                percentage=round(percentage, 2),
            )
        )

    # Sort by member count descending
    result.sort(key=lambda x: x.member_count, reverse=True)

    return result


def get_average_member_tenure(
    db: Session, tenant_id: int, start_date: date, end_date: date
) -> float:
    """
    Calculate average member tenure in days for members who joined in the date range.
    For active members: days since joining
    For expired/inactive: days from joining to expiry
    """
    today = date.today()

    # Get members who joined in the date range
    members = (
        db.query(Member)
        .filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.is_deleted == False,
                Member.joining_date >= start_date,
                Member.joining_date <= end_date,
            )
        )
        .all()
    )

    if not members:
        return 0.0

    total_days = 0
    for member in members:
        if member.status == MemberStatus.ACTIVE:
            # Active members: days since joining
            tenure = (today - member.joining_date).days
        else:
            # Expired/inactive: days from joining to expiry
            tenure = (member.membership_expiry_date - member.joining_date).days

        total_days += tenure

    avg_tenure = total_days / len(members)
    return round(avg_tenure, 1)
