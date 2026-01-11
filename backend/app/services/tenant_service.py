from sqlalchemy.orm import Session
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate


def create_tenant(db: Session, tenant: TenantCreate) -> Tenant:
    db_tenant = Tenant(
        name=tenant.name,
        address=tenant.address,
        google_map=tenant.google_map,
        upi_id=tenant.upi_id,
        whatsapp_access_token=tenant.whatsapp_access_token,
        whatsapp_phone_id=tenant.whatsapp_phone_id,
    )
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant
