from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.tenant_service import create_tenant
from app.schemas.tenant import TenantCreate, TenantResponse
from app.models.tenant import Tenant


router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.post("/create", response_model=TenantResponse)
def create_new_tenant(tenant: TenantCreate, db: Session = Depends(get_db)):
    try:
        db_tenant = db.query(Tenant).filter(Tenant.name == tenant.name).first()
        if not db_tenant:
            new_tenant = create_tenant(db, tenant)
            return new_tenant
        else:
            raise HTTPException(
                status_code=400, detail="Tenant with given name already exists"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
