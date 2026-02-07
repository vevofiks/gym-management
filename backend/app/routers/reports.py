from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Optional

from app.core.database import get_db
from app.models.users import User
from app.core.deps import get_current_user, check_feature_access
from app.schemas.reports import (
    FinancialReportResponse,
    MemberReportResponse,
    DuesReportItem,
    FinancialSummary,
)
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Advanced Analytics"])


# ENFORCE PRO PLAN ACCESS
# All endpoints in this router require "advanced_analytics" feature
# which is only enabled in Pro plans (or trials).
@router.get("/financial", response_model=FinancialReportResponse)
def get_financial_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(check_feature_access("advanced_analytics")),
):
    """
    Get detailed financial analytics (Revenue, Expenses, Trends).

    **Pro Plan Only**.
    """
    if not start_date:
        start_date = date.today().replace(day=1)  # Start of this month
    if not end_date:
        end_date = date.today()

    # 1. Summary
    summary = report_service.get_financial_summary(
        db, current_user.tenant_id, start_date, end_date
    )

    # 2. Trends (Last 6 months)
    rev_trend, exp_trend = report_service.get_monthly_trends(
        db, current_user.tenant_id, months=6
    )

    # 3. Breakdowns
    rev_by_method = report_service.get_payment_method_breakdown(
        db, current_user.tenant_id
    )
    exp_by_cat = report_service.get_category_breakdown(db, current_user.tenant_id)

    return FinancialReportResponse(
        summary=summary,
        revenue_trend=rev_trend,
        expense_trend=exp_trend,
        revenue_by_method=rev_by_method,
        expense_by_category=exp_by_cat,
    )


@router.get("/members", response_model=MemberReportResponse)
def get_member_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(check_feature_access("advanced_analytics")),
):
    """
    Get detailed member growth and retention analytics.

    **Pro Plan Only**.
    """
    # 1. Stats
    stats = report_service.get_member_stats(db, current_user.tenant_id)

    # 2. Plan Distribution
    distribution = report_service.get_plan_distribution(db, current_user.tenant_id)

    # 3. Growth Trend (using mock for now or implement similar to financial)
    # Reusing financial trend logic for member growth requires complex date queries
    # For now returning empty list or implementing simple version if needed
    growth_trend = []

    return MemberReportResponse(
        stats=stats,
        growth_trend=growth_trend,
        plan_distribution=distribution,
        retention_rate=100.0 - stats.churn_rate_percent,
    )


@router.get("/dues", response_model=List[DuesReportItem])
def get_outstanding_dues_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(check_feature_access("advanced_analytics")),
):
    """
    Get list of all members with outstanding dues.

    **Pro Plan Only**.
    """
    return report_service.get_outstanding_dues(db, current_user.tenant_id)
