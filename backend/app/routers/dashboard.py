from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models import User
from app.routers.auth import get_current_user
from app.schemas.dashboard import (
    DashboardStatsResponse,
    RevenueChartResponse,
    ExpiringMembersResponse,
    RecentActivitiesResponse,
    UpcomingBirthdaysResponse,
)
from app.services import dashboard_service
from loguru import logger

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get dashboard statistics with month-over-month comparisons.
    Returns total members, revenue, new joiners, retention rate, etc.
    """
    logger.info(f"Fetching dashboard stats for tenant {current_user.tenant_id}")

    stats = dashboard_service.get_dashboard_stats(db, current_user.tenant_id)

    return DashboardStatsResponse(stats=stats)


@router.get("/revenue-chart", response_model=RevenueChartResponse)
def get_revenue_chart(
    months: int = Query(6, ge=1, le=12, description="Number of months to retrieve"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get revenue and expense data for the last N months.
    Default is 6 months.
    """
    logger.info(
        f"Fetching revenue chart data for tenant {current_user.tenant_id} ({months} months)"
    )

    data = dashboard_service.get_revenue_chart_data(db, current_user.tenant_id, months)

    return RevenueChartResponse(data=data)


@router.get("/expiring-members", response_model=ExpiringMembersResponse)
def get_expiring_members(
    days: int = Query(
        7, ge=1, le=30, description="Number of days to look ahead for expirations"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get members whose membership is expiring in the next N days.
    Default is 7 days.
    """
    logger.info(
        f"Fetching expiring members for tenant {current_user.tenant_id} (next {days} days)"
    )

    members = dashboard_service.get_expiring_members(db, current_user.tenant_id, days)

    return ExpiringMembersResponse(members=members, total_count=len(members))


@router.get("/activities", response_model=RecentActivitiesResponse)
def get_activities(
    limit: int = Query(10, ge=1, le=50, description="Number of activities to retrieve"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get recent system activities.
    """
    logger.info(f"Fetching recent activities for tenant {current_user.tenant_id}")

    activities = dashboard_service.get_recent_activities(
        db, current_user.tenant_id, limit
    )

    return RecentActivitiesResponse(activities=activities)


@router.get("/upcoming-birthdays", response_model=UpcomingBirthdaysResponse)
def get_upcoming_birthdays(
    days: int = Query(7, ge=1, le=30, description="Number of days to look ahead"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get members having birthdays in the next N days.
    """
    logger.info(f"Fetching upcoming birthdays for tenant {current_user.tenant_id}")

    birthdays = dashboard_service.get_upcoming_birthdays(
        db, current_user.tenant_id, days
    )

    return UpcomingBirthdaysResponse(birthdays=birthdays)
