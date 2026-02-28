from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.models import User
from app.core.deps import get_current_user
from app.services.whatsapp_service import whatsapp_service
from app.schemas.whatsapp import (
    WhatsAppStatusResponse,
    WhatsAppQRCodeResponse,
    WhatsAppMessageResponse,
)
from loguru import logger

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])


@router.get("/status", response_model=WhatsAppStatusResponse)
async def get_whatsapp_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Check the current status of the WhatsApp session for the tenant.
    """
    logger.info(f"Checking WhatsApp status for tenant {current_user.tenant_id}")
    result = await whatsapp_service.get_status(current_user.tenant_id)
    return result


@router.get("/qr", response_model=WhatsAppQRCodeResponse)
async def get_whatsapp_qr(
    current_user: User = Depends(get_current_user),
):
    """
    Start/Retrieve the QR code for WhatsApp connection.
    """
    logger.info(f"Retrieving WhatsApp QR code for tenant {current_user.tenant_id}")
    result = await whatsapp_service.get_qr_code(current_user.tenant_id)
    return result


@router.post("/logout", response_model=WhatsAppMessageResponse)
async def logout_whatsapp(
    current_user: User = Depends(get_current_user),
):
    """
    Disconnect/Logout the current WhatsApp session.
    """
    logger.info(f"Logging out WhatsApp for tenant {current_user.tenant_id}")
    result = await whatsapp_service.logout(current_user.tenant_id)
    return result


@router.post("/test-message", response_model=WhatsAppMessageResponse)
async def send_test_message(
    phone_number: str,
    message: str = "This is a test message from FitDash! 💪",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send a test WhatsApp message to verify connection.
    """
    logger.info(f"Sending test WhatsApp message for tenant {current_user.tenant_id}")
    result = await whatsapp_service.send_text_message(
        db, current_user.tenant_id, phone_number, message
    )
    return result


@router.post("/reset", response_model=WhatsAppMessageResponse)
async def reset_whatsapp_session(
    current_user: User = Depends(get_current_user),
):
    """
    Force-close and reset the current WhatsApp session.
    """
    logger.info(f"Resetting WhatsApp session for tenant {current_user.tenant_id}")
    result = await whatsapp_service.close_session(current_user.tenant_id)
    if result.get("success"):
        return {
            "success": True,
            "message": "Session reset successfully. Please wait a few seconds before trying again.",
        }
    return result
