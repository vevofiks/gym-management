import os
from dotenv import load_dotenv
import sys
from decimal import Decimal

# Load env from backend/.env
backend_path = os.path.join(os.getcwd(), "backend")
load_dotenv(os.path.join(backend_path, ".env"))

# Add backend to path to import models
sys.path.append(backend_path)

from app.core.database import SessionLocal
from app.services import dashboard_service, fee_service
from datetime import date


def verify_fix():
    db = SessionLocal()
    tenant_id = 4

    print(f"--- Verification for Tenant {tenant_id} ---")

    # 1. Dashboard Stats
    stats = dashboard_service.get_dashboard_stats(db, tenant_id)
    print(f"Dashboard - Monthly Revenue: {stats.monthly_revenue}")
    print(f"Dashboard - Total Revenue: {stats.total_revenue}")
    print(f"Dashboard - Total Members: {stats.total_members}")

    # 2. Financial Report
    today = date.today()
    start_date = date(today.year, today.month, 1)
    if today.month == 12:
        end_date = date(
            today.year + 1, 1, 1
        )  # This is not exactly end_date for service, but service uses >= and <=
        # Wait, service uses <= end_date. So let's use actual month end
        import calendar

        _, last_day = calendar.monthrange(today.year, today.month)
        end_date = date(today.year, today.month, last_day)
    else:
        import calendar

        _, last_day = calendar.monthrange(today.year, today.month)
        end_date = date(today.year, today.month, last_day)

    report = fee_service.get_financial_report(db, tenant_id, start_date, end_date)
    print(f"Finance Report - Total Revenue: {report['total_revenue']}")
    print(f"Finance Report - Member Count: {report['member_count']}")

    # 3. All Fees for Export
    export_fees = fee_service.get_all_fees_for_export(db, tenant_id)
    print(f"Export Fees Count: {len(export_fees)}")
    for f in export_fees:
        print(f"  Fee ID: {f.id}, Member ID: {f.member_id}, Amount: {f.amount}")

    db.close()


if __name__ == "__main__":
    verify_fix()
