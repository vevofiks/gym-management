import sys
import os
from datetime import date

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.models.users import User, UserRole
from app.models.tenant import Tenant
from app.models.tenant_subscription import TenantSubscription, SubscriptionStatus
from app.models.subscription_plans import SubscriptionPlan
from app.core.security import hash_password


def create_platform_subscription_plans(db):
    """Create the Starter and Pro subscription plans if they don't exist"""
    plans = [
        {
            "name": "Starter",
            "price_monthly": 1499.00,
            "max_members": 100,
            "max_staff": 1,
            "max_plans": 2,
            "max_diet_templates": 2,
            "whatsapp_enabled": False,
            "advanced_analytics": False,
            "description": "Perfect for small gyms and personal trainers",
        },
        {
            "name": "Pro",
            "price_monthly": 3499.00,
            "max_members": -1,
            "max_staff": 5,
            "max_plans": -1,
            "max_diet_templates": -1,
            "whatsapp_enabled": True,
            "advanced_analytics": True,
            "description": "For established gyms and fitness centers",
        },
        {
            "name": "Pro Quarterly",
            "price_monthly": 10000.00,
            "max_members": -1,
            "max_staff": 5,
            "max_plans": -1,
            "max_diet_templates": -1,
            "whatsapp_enabled": True,
            "advanced_analytics": True,
            "description": "Best value for established gyms (3 months)",
        },
    ]

    for plan_data in plans:
        plan = (
            db.query(SubscriptionPlan)
            .filter(SubscriptionPlan.name == plan_data["name"])
            .first()
        )
        if not plan:
            plan = SubscriptionPlan(**plan_data)
            db.add(plan)
            print(f"Created subscription plan: {plan_data['name']}")
        else:
            # Update existing plan prices/limits
            for key, value in plan_data.items():
                setattr(plan, key, value)
            print(f"Updated subscription plan: {plan_data['name']}")

    db.commit()


def seed_init():
    db = SessionLocal()
    try:
        # 1. Seed Platform Subscription Plans
        print("Seeding platform subscription plans...")
        create_platform_subscription_plans(db)

        # 2. Create Tenant
        tenant_name = "Premium Fitness Center"
        tenant = db.query(Tenant).filter(Tenant.name == tenant_name).first()
        if not tenant:
            tenant = Tenant(
                name=tenant_name,
                address="Admin Plaza, Fitness City",
                is_active=True,
                paid_until=date(2999, 12, 31),
            )
            db.add(tenant)
            db.commit()
            db.refresh(tenant)
            print(f"Created tenant: {tenant.name}")
        else:
            tenant.paid_until = date(2999, 12, 31)
            db.commit()
            print(f"Tenant {tenant.name} already exists, updated paid_until")

        # 3. Create Tenant Subscription
        pro_plan = (
            db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Pro").first()
        )
        subscription = (
            db.query(TenantSubscription)
            .filter(TenantSubscription.tenant_id == tenant.id)
            .first()
        )
        if not subscription:
            subscription = TenantSubscription(
                tenant_id=tenant.id,
                plan_id=pro_plan.id if pro_plan else None,
                status=SubscriptionStatus.ACTIVE,
                subscription_start_date=date.today(),
                subscription_end_date=date(2999, 12, 31),
                is_trial_used=True,
            )
            db.add(subscription)
            db.commit()
            print(f"Created tenant subscription until 2999")
        else:
            subscription.plan_id = pro_plan.id if pro_plan else subscription.plan_id
            subscription.subscription_end_date = date(2999, 12, 31)
            subscription.status = SubscriptionStatus.ACTIVE
            db.commit()
            print("Tenant subscription updated to Pro until 2999")

        # 4. Create Super Admin
        super_admin_username = "super-admin"
        user = db.query(User).filter(User.username == super_admin_username).first()
        if not user:
            user = User(
                name="Super Admin",
                username=super_admin_username,
                email="admin@vevofiks.com",
                phone_number="0000000000",
                hashed_password=hash_password("superadmin@123"),
                role=UserRole.SUPERADMIN.value,
                is_active=True,
                tenant_id=None,
            )
            db.add(user)
            db.commit()
            print(f"Created super-admin: {user.username}")
        else:
            # Update password just in case
            user.hashed_password = hash_password("superadmin@123")
            user.role = UserRole.SUPERADMIN.value
            db.commit()
            print(f"Updated super-admin password and role: {user.username}")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_init()
