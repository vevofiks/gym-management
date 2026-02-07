from sqlalchemy.orm import Session
from app.models.subscription_plans import SubscriptionPlan
from loguru import logger


def create_subscription_plans(db: Session):
    
    existing_plans = db.query(SubscriptionPlan).count()
    if existing_plans > 0:
        logger.info(
            f"Subscription plans already exist ({existing_plans} plans). Skipping seed."
        )
        return

    plans = [
        SubscriptionPlan(
            name="Starter",
            price_monthly=1499.00,
            max_members=100,
            max_staff=2,
            max_plans=5,
            whatsapp_enabled=False,
            advanced_analytics=False,
            description="Perfect for small gyms and personal trainers",
            is_active=True,
        ),
        SubscriptionPlan(
            name="Pro",
            price_monthly=3499.00,
            max_members=-1,
            max_staff=5,
            max_plans=-1,
            whatsapp_enabled=True,
            advanced_analytics=True,
            description="For established gyms with advanced needs",
            is_active=True,
        ),
    ]

    for plan in plans:
        db.add(plan)

    db.commit()
    logger.info(
        f"✅ Created {len(plans)} subscription plans: Starter (₹1,499) and Pro (₹3,499)"
    )


if __name__ == "__main__":
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        create_subscription_plans(db)
    finally:
        db.close()
