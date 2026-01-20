from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.users import User
from app.core.deps import get_current_user
from app.services.tenant_service import (
    get_tenant_by_id,
    update_tenant,
    get_tenant_stats
)
from app.schemas.tenant import (
    TenantResponse,
    TenantUpdate,
    TenantStats
)
from app.core.exceptions import TenantAlreadyExistsException
from loguru import logger


router = APIRouter(prefix="/tenants", tags=["Tenants"])


@router.get("/me", response_model=TenantResponse, status_code=status.HTTP_200_OK)
def get_my_tenant(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get own tenant information.
    
    Returns the tenant information for the current user's tenant.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with any tenant"
        )
    
    tenant = get_tenant_by_id(db, current_user.tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return tenant


@router.put("/me", response_model=TenantResponse, status_code=status.HTTP_200_OK)
def update_my_tenant(
    tenant_update: TenantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update own tenant information.
    
    Gym owners can update their own tenant's details.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with any tenant"
        )
    
    try:
        updated_tenant = update_tenant(db, current_user.tenant_id, tenant_update)
        if not updated_tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found"
            )
        
        logger.info(f"User {current_user.username} updated their tenant {current_user.tenant_id}")
        return updated_tenant
    
    except TenantAlreadyExistsException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating tenant: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the tenant"
        )


@router.get("/me/stats", response_model=TenantStats, status_code=status.HTTP_200_OK)
def get_my_tenant_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get statistics for own tenant.
    
    Returns member counts and other statistics for the current user's tenant.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not associated with any tenant"
        )
    
    stats = get_tenant_stats(db, current_user.tenant_id)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return stats