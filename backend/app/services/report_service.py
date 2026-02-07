from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, case, desc
from datetime import date, timedelta
from typing import List, Tuple, Dict
from decimal import Decimal

from app.models.member_fee import MemberFee
from app.models.expenses import Expense
from app.models.member import Member, MemberStatus
from app.models.membership_plan import MembershipPlan
from app.schemas.reports import (
    FinancialSummary,
    ChartPoint,
    BreakdownItem,
    MemberGrowthStats,
    DuesReportItem,
    FinancialReportResponse,
    MemberReportResponse,
)


class ReportService:
    """Service for Advanced Analytics & Reporting"""

    def get_financial_summary(
        self, db: Session, tenant_id: int, start_date: date, end_date: date
    ) -> FinancialSummary:
        """
        Calculate generic financial stats for a given period.
        """
        # Total Revenue (Sum of MemberFees paid)
        revenue_q = db.query(func.sum(MemberFee.amount_paid)).filter(
            MemberFee.tenant_id == tenant_id,
            MemberFee.payment_date >= start_date,
            MemberFee.payment_date <= end_date,
            MemberFee.payment_status == "paid",  # Assume "paid" string based on model
        )
        total_revenue = revenue_q.scalar() or Decimal(0)

        # Total Expenses
        expense_q = db.query(func.sum(Expense.amount)).filter(
            Expense.tenant_id == tenant_id,
            Expense.expense_date >= start_date,
            Expense.expense_date <= end_date,
            Expense.is_deleted == False,
        )
        total_expenses = expense_q.scalar() or Decimal(0)

        # Net Profit
        net_profit = total_revenue - total_expenses

        # Profit Margin
        if total_revenue > 0:
            profit_margin = (net_profit / total_revenue) * 100
        else:
            profit_margin = 0.0

        # Outstanding Dues (Total of member.outstanding_dues)
        # This is a snapshot of CURRENT outstanding, not historical
        outstanding_q = db.query(func.sum(Member.outstanding_dues)).filter(
            Member.tenant_id == tenant_id, Member.is_active == True
        )
        outstanding_dues = outstanding_q.scalar() or Decimal(0)

        return FinancialSummary(
            total_revenue=total_revenue,
            total_expenses=total_expenses,
            net_profit=net_profit,
            profit_margin_percent=round(float(profit_margin), 2),
            outstanding_dues=outstanding_dues,
            period_label=f"{start_date.strftime('%b %d')} - {end_date.strftime('%b %d')}",
        )

    def get_monthly_trends(
        self, db: Session, tenant_id: int, months: int = 6
    ) -> Tuple[List[ChartPoint], List[ChartPoint]]:
        """
        Get last N months revenue vs expense line chart data.
        """
        end_date = date.today()
        start_date = (end_date.replace(day=1) - timedelta(days=1)).replace(day=1)
        # Adjust start date to N months ago roughly
        # Better approach: Iterate backwards N times

        revenue_points = []
        expense_points = []

        # Iterate last 6 months
        curr = end_date
        for _ in range(months):
            # Define month range
            m_end = curr
            m_start = curr.replace(day=1)
            label = m_start.strftime("%b %Y")  # e.g. "Jan 2024"

            # Query Month Revenue
            m_rev = db.query(func.sum(MemberFee.amount_paid)).filter(
                MemberFee.tenant_id == tenant_id,
                MemberFee.payment_date >= m_start,
                MemberFee.payment_date <= m_end,
                MemberFee.payment_status == "paid",
            ).scalar() or Decimal(0)

            revenue_points.append(ChartPoint(label=label, value=m_rev))

            # Query Month Expenses
            m_exp = db.query(func.sum(Expense.amount)).filter(
                Expense.tenant_id == tenant_id,
                Expense.expense_date >= m_start,
                Expense.expense_date <= m_end,
                Expense.is_deleted == False,
            ).scalar() or Decimal(0)

            expense_points.append(ChartPoint(label=label, value=m_exp))

            # Move to previous month
            curr = m_start - timedelta(days=1)

        # Reverse to show chronological order
        return revenue_points[::-1], expense_points[::-1]

    def get_category_breakdown(
        self, db: Session, tenant_id: int
    ) -> List[BreakdownItem]:
        """
        Breakdown of expenses by category (Pie chart).
        """
        # Aggregation
        results = (
            db.query(Expense.category, func.sum(Expense.amount))
            .filter(Expense.tenant_id == tenant_id, Expense.is_deleted == False)
            .group_by(Expense.category)
            .all()
        )

        total_expenses = sum(r[1] for r in results) or Decimal(1)  # void div by zero

        items = []
        for cat, amt in results:
            if not amt:
                continue
            items.append(
                BreakdownItem(
                    label=cat.value.title(),
                    value=amt,
                    percentage=round((float(amt) / float(total_expenses)) * 100, 1),
                )
            )

        return sorted(items, key=lambda x: x.value, reverse=True)

    def get_payment_method_breakdown(
        self, db: Session, tenant_id: int
    ) -> List[BreakdownItem]:
        """
        Breakdown of revenue by payment method.
        """
        results = (
            db.query(MemberFee.payment_method, func.sum(MemberFee.amount_paid))
            .filter(
                MemberFee.tenant_id == tenant_id, MemberFee.payment_status == "paid"
            )
            .group_by(MemberFee.payment_method)
            .all()
        )

        total_rev = sum(r[1] for r in results) or Decimal(1)

        items = []
        for method, amt in results:
            if not method or not amt:
                continue
            items.append(
                BreakdownItem(
                    label=method.replace("_", " ").title(),
                    value=amt,
                    percentage=round((float(amt) / float(total_rev)) * 100, 1),
                )
            )

        return sorted(items, key=lambda x: x.value, reverse=True)

    def get_member_stats(self, db: Session, tenant_id: int) -> MemberGrowthStats:
        """
        Get member growth KPIs.
        """
        today = date.today()
        first_of_month = today.replace(day=1)

        # Active Members
        active_count = (
            db.query(func.count(Member.id))
            .filter(
                Member.tenant_id == tenant_id,
                Member.status == MemberStatus.ACTIVE,
                Member.is_active == True,
            )
            .scalar()
            or 0
        )

        # New Members This Month
        new_count = (
            db.query(func.count(Member.id))
            .filter(
                Member.tenant_id == tenant_id,
                Member.joining_date >= first_of_month,
                Member.is_active == True,
            )
            .scalar()
            or 0
        )

        # Expired Members
        expired_count = (
            db.query(func.count(Member.id))
            .filter(
                Member.tenant_id == tenant_id,
                Member.status == MemberStatus.EXPIRED,
                Member.is_active == True,
            )
            .scalar()
            or 0
        )

        # Expiring Soon (Next 7 days)
        seven_days_later = today + timedelta(days=7)
        expiring_soon = (
            db.query(func.count(Member.id))
            .filter(
                Member.tenant_id == tenant_id,
                Member.status == MemberStatus.ACTIVE,
                Member.membership_expiry_date <= seven_days_later,
                Member.membership_expiry_date >= today,
                Member.is_active == True,
            )
            .scalar()
            or 0
        )

        # Churn Rate (Expired / (Active + Expired)) roughly
        total_pool = active_count + expired_count
        churn_rate = (expired_count / total_pool * 100) if total_pool > 0 else 0.0

        return MemberGrowthStats(
            total_active_members=active_count,
            new_members_this_month=new_count,
            expiring_soon_count=expiring_soon,
            expired_members_count=expired_count,
            churn_rate_percent=round(churn_rate, 1),
        )

    def get_plan_distribution(self, db: Session, tenant_id: int) -> List[BreakdownItem]:
        """
        Which plans are most popular?
        """
        results = (
            db.query(MembershipPlan.name, func.count(Member.id))
            .join(Member.plan)
            .filter(
                Member.tenant_id == tenant_id,
                Member.status == MemberStatus.ACTIVE,
                Member.is_active == True,
            )
            .group_by(MembershipPlan.name)
            .all()
        )

        total = sum(r[1] for r in results) or 1

        items = []
        for name, count in results:
            items.append(
                BreakdownItem(
                    label=name,
                    value=Decimal(count),  # Using decimal for compatibility
                    percentage=round((count / total) * 100, 1),
                    count=count,
                )
            )

        return sorted(items, key=lambda x: x.count or 0, reverse=True)

    def get_outstanding_dues(self, db: Session, tenant_id: int) -> List[DuesReportItem]:
        """
        List of members who owe money.
        """
        members = (
            db.query(Member)
            .filter(
                Member.tenant_id == tenant_id,
                Member.outstanding_dues > 0,
                Member.is_active == True,
            )
            .order_by(desc(Member.outstanding_dues))
            .all()
        )

        report = []
        today = date.today()

        for m in members:
            # Calc days overdue (if expired)
            days = 0
            if m.status == MemberStatus.EXPIRED and m.membership_expiry_date < today:
                days = (today - m.membership_expiry_date).days

            report.append(
                DuesReportItem(
                    member_id=m.id,
                    member_name=f"{m.first_name} {m.last_name}",
                    phone_number=m.phone_number,
                    plan_name=m.plan.name if m.plan else None,
                    amount_due=m.outstanding_dues,
                    last_payment_date=None,  # Optimization: skip querying last payment for now or add separate join
                    days_overdue=days,
                )
            )

        return report


report_service = ReportService()
