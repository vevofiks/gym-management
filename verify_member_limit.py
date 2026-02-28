import os
import sys
from datetime import date
from decimal import Decimal

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock environment variables for Pydantic Settings
os.environ["DATABASE_URL"] = "postgresql://postgres:amraz@localhost/gym_management"
os.environ["DATABASE_NAME"] = "gym_management"
os.environ["DATABASE_USER"] = "postgres"
os.environ["DATABASE_PASSWORD"] = "amraz"
os.environ["SECRET_KEY"] = (
    "1ab5a132a42cef53b4ad64d12533c9fc7e26525ba0d8614b4b041187448b1d94"
)
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_DAYS"] = "1"

from app.core.database import SessionLocal
from app.models.tenant_subscription import TenantSubscription, SubscriptionStatus
from app.models.subscription_plans import SubscriptionPlan
from app.models.member import Member
from app.services.subscription_service import check_member_limit


def test_member_limit():
    db = SessionLocal()
    try:
        # 1. Find a tenant with a Starter plan
        starter_plan = (
            db.query(SubscriptionPlan)
            .filter(SubscriptionPlan.name == "Starter")
            .first()
        )
        if not starter_plan:
            print("Starter plan not found in database!")
            return

        print(f"Starter Plan Max Members: {starter_plan.max_members}")

        # 2. Get a tenant on this plan
        sub = (
            db.query(TenantSubscription)
            .filter(TenantSubscription.plan_id == starter_plan.id)
            .first()
        )
        if not sub:
            print("No tenant found on Starter plan. Creating a temporary test state...")
            # For verification, we can just pick ANY tenant and check what check_member_limit says
            sub = db.query(TenantSubscription).first()
            if not sub:
                print("No tenants or subscriptions found at all!")
                return

            # Temporarily set this tenant to Starter plan for testing
            original_plan_id = sub.plan_id
            sub.plan_id = starter_plan.id
            db.commit()
            print(f"Temporarily switched Tenant {sub.tenant_id} to Starter plan.")
        else:
            original_plan_id = sub.plan_id
            print(f"Using Tenant {sub.tenant_id} (already on Starter plan).")

        tenant_id = sub.tenant_id

        # 3. Check current member count
        member_count = (
            db.query(Member)
            .filter(Member.tenant_id == tenant_id, Member.is_deleted == False)
            .count()
        )
        print(f"Current active members for Tenant {tenant_id}: {member_count}")

        # 4. Temporarily set max_members to member_count to simulate limit reached
        original_max = starter_plan.max_members
        starter_plan.max_members = member_count
        db.commit()
        print(f"Set Starter plan limit to {member_count} for testing.")

        # 5. Call check_member_limit
        can_add, message = check_member_limit(db, tenant_id)
        print(f"Check Result: can_add={can_add}, message='{message}'")

        if not can_add and "Member limit reached" in message:
            print("✅ SUCCESS: Member limit correctly enforced and message generated!")
        else:
            print("❌ FAILURE: Limit check did not behave as expected.")

        # 6. Cleanup
        starter_plan.max_members = original_max
        sub.plan_id = original_plan_id
        db.commit()
        print("Restored original state.")

    finally:
        db.close()


if __name__ == "__main__":
    test_member_limit()
