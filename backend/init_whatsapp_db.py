import sys
import os

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from app.core.database import SessionLocal, engine, Base
from app.models.tenant import Tenant
from app.models.whatsapp_settings import WhatsAppSettings

def init_whatsapp_settings():
    """Ensure the WhatsAppSettings table exists and seed for the first tenant if missing"""
    print("Ensuring WhatsAppSettings table exists...")
    try:
        # Create table if it doesn't exist
        Base.metadata.create_all(bind=engine)
        print("Table ensured.")
    except Exception as e:
        print(f"Error ensuring table: {e}")
        return

    db = SessionLocal()
    try:
        # Find the first tenant (if any) to seed default settings
        tenant = db.query(Tenant).first()
        if tenant:
            settings = db.query(WhatsAppSettings).filter(WhatsAppSettings.tenant_id == tenant.id).first()
            if not settings:
                settings = WhatsAppSettings(
                    tenant_id=tenant.id,
                    is_enabled=True,
                    welcome_message_enabled=True,
                    payment_receipt_enabled=True,
                    membership_expiry_reminder_enabled=True,
                    expiry_reminder_days=3
                )
                db.add(settings)
                db.commit()
                print(f"Created default WhatsApp settings for tenant: {tenant.name}")
            else:
                print(f"WhatsApp settings already exist for tenant: {tenant.name}")
        else:
            print("No tenants found. Could not seed WhatsApp settings. Run a tenant creation script first.")
    except Exception as e:
        print(f"Error seeding WhatsApp settings: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_whatsapp_settings()
