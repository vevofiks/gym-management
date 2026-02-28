from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Optional
import io

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
from app.services.exporter_service import exporter_service

router = APIRouter(prefix="/reports", tags=["Advanced Analytics"])


@router.get("/export")
def export_report(
    report_type: str = Query(
        ..., description="Type of report: financial, members, dues"
    ),
    format: str = Query("csv", description="File format: csv, excel, pdf"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(check_feature_access("advanced_analytics")),
):
    """
    Export reports in various formats.
    """
    if not start_date:
        start_date = date.today().replace(day=1)
    if not end_date:
        end_date = date.today()

    data = []
    filename = f"{report_type}_report_{start_date}_to_{end_date}"

    if report_type == "all":
        # Handle Mega Export
        reports_data = {
            "Financials": report_service.get_raw_member_fees(
                db, current_user.tenant_id, start_date, end_date
            )
            + report_service.get_raw_expenses(
                db, current_user.tenant_id, start_date, end_date
            ),
            "Members": report_service.get_raw_member_data(db, current_user.tenant_id),
            "Outstanding Dues": [
                d.dict()
                for d in report_service.get_outstanding_dues(db, current_user.tenant_id)
            ],
        }

        if format == "csv":
            output = exporter_service.export_bulk_to_zip(reports_data)
            media_type = "application/zip"
            extension = "zip"
        elif format == "excel":
            output = exporter_service.export_bulk_to_excel(reports_data)
            media_type = (
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            extension = "xlsx"
        elif format == "pdf":
            output = exporter_service.export_bulk_to_pdf(
                reports_data, title=f"Mega Report ({start_date} to {end_date})"
            )
            media_type = "application/pdf"
            extension = "pdf"
        else:
            raise HTTPException(status_code=400, detail="Invalid format")
    else:
        # Handle individual reports
        if report_type == "financial":
            # Get raw financial data (fees and expenses)
            fees = report_service.get_raw_member_fees(
                db, current_user.tenant_id, start_date, end_date
            )
            expenses = report_service.get_raw_expenses(
                db, current_user.tenant_id, start_date, end_date
            )
            data = fees + expenses
        elif report_type == "members":
            data = report_service.get_raw_member_data(db, current_user.tenant_id)
        elif report_type == "dues":
            dues = report_service.get_outstanding_dues(db, current_user.tenant_id)
            data = [d.dict() for d in dues]
        else:
            raise HTTPException(status_code=400, detail="Invalid report type")

    # Validate format early (Format Check)
    if format not in ["csv", "excel", "pdf"]:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")

    # Determine media type and extension
    if format == "csv":
        media_type = "text/csv"
        extension = "csv"
    elif format == "excel":
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        extension = "xlsx"
    else:  # pdf
        media_type = "application/pdf"
        extension = "pdf"

    # Export using centralized service (Format Check implementation)
    title = f"{report_type.replace('_', ' ').title()} Report"
    output = exporter_service.export(data, format, title=title)

    return Response(
        content=output.getvalue(),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}.{extension}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )


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
