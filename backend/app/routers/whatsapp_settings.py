from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, WhatsAppSettings
from app.core.deps import get_current_user
from app.schemas.whatsapp_settings import (
    WhatsAppSettingsResponse,
    WhatsAppSettingsUpdate,
)
from loguru import logger

router = APIRouter(prefix="/whatsapp/settings", tags=["WhatsApp Settings"])


@router.get("/", response_model=WhatsAppSettingsResponse)
def get_whatsapp_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get WhatsApp automation settings for the current tenant.
    """
    settings = (
        db.query(WhatsAppSettings)
        .filter(WhatsAppSettings.tenant_id == current_user.tenant_id)
        .first()
    )

    if not settings:
        # Create default settings if not exists
        settings = WhatsAppSettings(tenant_id=current_user.tenant_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.patch("/", response_model=WhatsAppSettingsResponse)
def update_whatsapp_settings(
    settings_update: WhatsAppSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update WhatsApp automation settings for the current tenant.
    """
    settings = (
        db.query(WhatsAppSettings)
        .filter(WhatsAppSettings.tenant_id == current_user.tenant_id)
        .first()
    )

    if not settings:
        settings = WhatsAppSettings(tenant_id=current_user.tenant_id)
        db.add(settings)

    update_data = settings_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    logger.info(f"Updated WhatsApp settings for tenant {current_user.tenant_id}")
    return settings
