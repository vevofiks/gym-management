from pydantic import BaseModel
from datetime import date
from typing import List


class MemberGrowthData(BaseModel):
    """Member growth data for a specific date."""

    date: date
    count: int  # New members on this date
    cumulative_count: int  # Total members up to this date


class MemberStats(BaseModel):
    """Member statistics summary."""

    total_members: int
    active_members: int
    expired_members: int
    inactive_members: int
    active_rate: float  # Percentage of active members


class ChurnRate(BaseModel):
    """Churn rate calculation."""

    churn_rate: float  # Percentage
    churned_members: int  # Members who didn't renew
    total_eligible: int  # Members who were eligible to renew
    period_start: date
    period_end: date


class PlanDistribution(BaseModel):
    """Distribution of members across plans."""

    plan_name: str
    member_count: int
    percentage: float


class MemberGrowthResponse(BaseModel):
    """Response for member growth endpoint."""

    data: List[MemberGrowthData]
    total_new_members: int
    start_date: date
    end_date: date


class PlanDistributionResponse(BaseModel):
    """Response for plan distribution endpoint."""

    data: List[PlanDistribution]
    total_members: int
