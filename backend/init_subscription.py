import sys
import os

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.models.subscription_plans import SubscriptionPlan

def init_subscriptions():
    """Create the Starter and Pro subscription plans if they don't exist"""
    db = SessionLocal()
    try:
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
                "price_monthly": 2499.00,
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
                "price_monthly": 6999.00,
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
    except Exception as e:
        print(f"Error seeding plans: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_subscriptions()
