from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Optional

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.users import User
from app.schemas.analytics import (
    MemberGrowthResponse,
    MemberStats,
    ChurnRate,
    PlanDistributionResponse,
)
from app.services import analytics_service
from loguru import logger

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/member-growth", response_model=MemberGrowthResponse)
def get_member_growth(
    start_date: Optional[date] = Query(None, description="Start date for analysis"),
    end_date: Optional[date] = Query(None, description="End date for analysis"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get member growth data over time.
    Returns daily new member counts and cumulative totals.
    """
    # Default to last 30 days if not provided
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    logger.info(
        f"Fetching member growth for tenant {current_user.tenant_id} from {start_date} to {end_date}"
    )

    growth_data = analytics_service.get_member_growth(
        db, current_user.tenant_id, start_date, end_date
    )

    total_new = sum(d.count for d in growth_data)

    return MemberGrowthResponse(
        data=growth_data,
        total_new_members=total_new,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/member-stats", response_model=MemberStats)
def get_member_stats(
    start_date: Optional[date] = Query(None, description="Start date for analysis"),
    end_date: Optional[date] = Query(None, description="End date for analysis"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get member statistics for a date range.
    Returns counts and percentages of active/expired/inactive members who joined in the period.
    """
    # Default to last 30 days if not provided
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    logger.info(
        f"Fetching member stats for tenant {current_user.tenant_id} from {start_date} to {end_date}"
    )

    stats = analytics_service.get_member_stats(
        db, current_user.tenant_id, start_date, end_date
    )

    return stats


@router.get("/churn-rate", response_model=ChurnRate)
def get_churn_rate(
    start_date: Optional[date] = Query(None, description="Start date for analysis"),
    end_date: Optional[date] = Query(None, description="End date for analysis"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Calculate churn rate for a date range.
    Churn = members whose membership expired and didn't renew.
    """
    # Default to last 30 days if not provided
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    logger.info(
        f"Calculating churn rate for tenant {current_user.tenant_id} from {start_date} to {end_date}"
    )

    churn = analytics_service.get_churn_rate(
        db, current_user.tenant_id, start_date, end_date
    )

    return churn


@router.get("/plan-distribution", response_model=PlanDistributionResponse)
def get_plan_distribution(
    start_date: Optional[date] = Query(None, description="Start date for analysis"),
    end_date: Optional[date] = Query(None, description="End date for analysis"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get distribution of members across different plans for a date range.
    Returns count and percentage for each plan for members who joined in the period.
    """
    # Default to last 30 days if not provided
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    logger.info(
        f"Fetching plan distribution for tenant {current_user.tenant_id} from {start_date} to {end_date}"
    )

    distribution = analytics_service.get_plan_distribution(
        db, current_user.tenant_id, start_date, end_date
    )

    total_members = sum(d.member_count for d in distribution)

    return PlanDistributionResponse(data=distribution, total_members=total_members)


@router.get("/average-tenure")
def get_average_tenure(
    start_date: Optional[date] = Query(None, description="Start date for analysis"),
    end_date: Optional[date] = Query(None, description="End date for analysis"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get average member tenure in days for members who joined in the date range.
    """
    # Default to last 30 days if not provided
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    logger.info(
        f"Calculating average tenure for tenant {current_user.tenant_id} from {start_date} to {end_date}"
    )

    avg_tenure = analytics_service.get_average_member_tenure(
        db, current_user.tenant_id, start_date, end_date
    )

    return {"average_tenure_days": avg_tenure}
