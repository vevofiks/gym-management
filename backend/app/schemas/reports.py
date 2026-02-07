from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date
from decimal import Decimal


class ChartPoint(BaseModel):
    """Generic data point for charts (line/bar)"""

    label: str  # Month/Date/Category name
    value: Decimal


class BreakdownItem(BaseModel):
    """Item for pie charts/breakdowns"""

    label: str  # Category name
    value: Decimal
    percentage: float
    count: Optional[int] = None


class FinancialSummary(BaseModel):
    """High-level financial overview"""

    total_revenue: Decimal
    total_expenses: Decimal
    net_profit: Decimal
    profit_margin_percent: float
    outstanding_dues: Decimal
    period_label: str  # "Last 30 Days", "This Month", etc.


class MemberGrowthStats(BaseModel):
    """Member growth analytics"""

    total_active_members: int
    new_members_this_month: int
    expiring_soon_count: int  # Expiring in next 7 days
    expired_members_count: int
    churn_rate_percent: float  # (Lost / Total) * 100


class DuesReportItem(BaseModel):
    """Detailed item for dues report"""

    member_id: int
    member_name: str
    phone_number: str
    plan_name: Optional[str]
    amount_due: Decimal
    last_payment_date: Optional[date]
    days_overdue: int  # Days since expiry if expired, else 0


class FinancialReportResponse(BaseModel):
    """Complete response for financial report page"""

    summary: FinancialSummary
    revenue_trend: List[ChartPoint]  # Last 6-12 months trend
    expense_trend: List[ChartPoint]
    revenue_by_method: List[BreakdownItem]  # Cash vs UPI
    expense_by_category: List[BreakdownItem]  # Rent vs Salaries


class MemberReportResponse(BaseModel):
    """Complete response for member analytics page"""

    stats: MemberGrowthStats
    growth_trend: List[ChartPoint]  # New members over time
    plan_distribution: List[BreakdownItem]  # Which plans are popular
    retention_rate: float
