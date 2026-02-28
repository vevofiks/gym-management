from app.core.database import SessionLocal
from app.models.subscription_plans import SubscriptionPlan
from loguru import logger


def enable_store_for_pro():
    db = SessionLocal()
    try:
        pro = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Pro").first()
        if pro:
            logger.info(f"Enabling Store for Pro plan")
            pro.store_enabled = True
            db.commit()
            logger.info("✅ Pro plan updated with Store enabled")
        else:
            logger.warning("Pro plan not found")

        # Also ensure Starter doesn't have it (though default is False)
        starter = (
            db.query(SubscriptionPlan)
            .filter(SubscriptionPlan.name == "Starter")
            .first()
        )
        if starter:
            starter.store_enabled = False
            db.commit()

    except Exception as e:
        logger.error(f"Error updating plan: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    enable_store_for_pro()
