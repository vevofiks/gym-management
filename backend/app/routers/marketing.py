from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.users import User
from app.core.deps import get_current_gym_user
from app.schemas.whatsapp import WhatsAppBroadcastRequest, WhatsAppBroadcastResponse
from app.services.whatsapp_service import whatsapp_service
from loguru import logger

router = APIRouter(prefix="/marketing", tags=["Marketing"])


@router.post("/broadcast", response_model=WhatsAppBroadcastResponse)
async def send_whatsapp_broadcast(
    request: WhatsAppBroadcastRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_user),
):
    """
    Send a WhatsApp broadcast to multiple phone numbers.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    logger.info(
        f"User {current_user.username} (tenant {current_user.tenant_id}) triggers broadcast to {len(request.phone_numbers)} recipients."
    )

    try:
        gym_name = current_user.tenant.name if current_user.tenant else "Our Gym"
        broadcast_message = f"{request.message}\n\nBest regards,\n{gym_name} Team"

        result = await whatsapp_service.send_broadcast(
            db, current_user.tenant_id, request.phone_numbers, broadcast_message
        )
        return result
    except Exception as e:
        logger.error(f"Error in broadcast: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Broadcast failed: {str(e)}",
        )
