from app.core.database import SessionLocal
from app.models.subscription_plans import SubscriptionPlan
from loguru import logger


def update_starter_plan():
    db = SessionLocal()
    try:
        starter = (
            db.query(SubscriptionPlan)
            .filter(SubscriptionPlan.name == "Starter")
            .first()
        )
        if starter:
            logger.info(
                f"Updating Starter plan: Members {starter.max_members}->100, Staff {starter.max_staff}->2"
            )
            starter.max_members = 100
            starter.max_staff = 2
            db.commit()
            logger.info("✅ Starter plan updated successfully")
        else:
            logger.warning("Starter plan not found")
    except Exception as e:
        logger.error(f"Error updating plan: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    update_starter_plan()
