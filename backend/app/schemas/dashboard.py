from pydantic import BaseModel
from datetime import date
from typing import List, Optional


class DashboardStats(BaseModel):
    """Dashboard statistics summary."""

    total_members: int
    total_members_change: float
    active_members: int
    active_members_change: float
    monthly_revenue: float
    monthly_revenue_change: float
    new_joiners: int
    new_joiners_change: float
    retention_rate: float
    retention_rate_change: float
    outstanding_dues: float
    outstanding_dues_change: float
    total_revenue: float
    total_expenses: float


class RecentActivity(BaseModel):
    """System activity item."""

    id: str
    type: str  # "member_registration", "payment", "membership_expired", "plan_created"
    description: str
    timestamp: date
    meta: Optional[dict] = None


class UpcomingBirthday(BaseModel):
    """Member with upcoming birthday."""

    id: int
    name: str
    date_of_birth: date
    age: int
    days_until: int


class DashboardStatsResponse(BaseModel):
    """Response for dashboard stats endpoint."""

    stats: DashboardStats


class RecentActivitiesResponse(BaseModel):
    """Response for recent activities endpoint."""

    activities: List[RecentActivity]


class UpcomingBirthdaysResponse(BaseModel):
    """Response for upcoming birthdays endpoint."""

    birthdays: List[UpcomingBirthday]


class RevenueChartDataPoint(BaseModel):
    """Single data point for revenue chart."""

    month: str  # Format: "Jan", "Feb", etc.
    revenue: float
    expenses: float


class ExpiringMember(BaseModel):
    """Member with expiring membership."""

    id: int
    first_name: str
    last_name: str
    phone_number: str
    email: Optional[str]
    membership_expiry_date: date
    days_until_expiry: int
    plan_name: Optional[str]
    outstanding_dues: float


class RevenueChartResponse(BaseModel):
    """Response for revenue chart endpoint."""

    data: List[RevenueChartDataPoint]


class ExpiringMembersResponse(BaseModel):
    """Response for expiring members endpoint."""

    members: List[ExpiringMember]
    total_count: int
