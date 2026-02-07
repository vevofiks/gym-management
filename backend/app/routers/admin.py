from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from math import ceil

from app.core.database import get_db
from app.models.users import User, UserRole
from app.models.tenant import Tenant
from app.core.deps import get_current_superuser
from app.services.user_service import (
    get_user_by_id,
    get_all_users,
    update_user,
    delete_user,
    update_user_role,
    create_user,
)
from app.services.tenant_service import (
    create_tenant,
    get_tenant_by_id,
    get_all_tenants,
    update_tenant,
    delete_tenant,
    update_subscription,
    get_tenant_stats,
)
from app.schemas.users import UserResponse, UserUpdate, UserListResponse, UserCreate
from app.schemas.tenant import (
    TenantCreate,
    TenantResponse,
    TenantUpdate,
    UpdateSubscription,
    TenantStats,
    TenantListResponse,
)
from app.core.exceptions import UserAlreadyExistsException, TenantAlreadyExistsException
from loguru import logger


router = APIRouter(prefix="/admin", tags=["Admin"])


# ==================== TENANT MANAGEMENT ====================


@router.get(
    "/tenants", response_model=TenantListResponse, status_code=status.HTTP_200_OK
)
def admin_list_tenants(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: str | None = Query(None, description="Search by tenant name"),
    active_only: bool = Query(True, description="Filter active tenants only"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    List all tenants (SUPERADMIN only).

    Returns a paginated list of all gym tenants in the system.
    """
    skip = (page - 1) * page_size
    tenants, total = get_all_tenants(
        db, skip=skip, limit=page_size, search=search, active_only=active_only
    )

    total_pages = ceil(total / page_size) if total > 0 else 1

    logger.info(f"Admin {current_user.username} retrieved {len(tenants)} tenants")

    return TenantListResponse(
        tenants=tenants,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "/tenants", response_model=TenantResponse, status_code=status.HTTP_201_CREATED
)
def admin_create_tenant(
    tenant: TenantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Create a new tenant/gym (SUPERADMIN only).
    """
    try:
        new_tenant = create_tenant(db, tenant)
        logger.info(
            f"Admin {current_user.username} created tenant: {new_tenant.name} (ID: {new_tenant.id})"
        )
        return new_tenant

    except TenantAlreadyExistsException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as ve:
        logger.warning(f"Validation error during tenant creation: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error creating tenant: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the tenant",
        )


@router.get(
    "/tenants/{tenant_id}",
    response_model=TenantResponse,
    status_code=status.HTTP_200_OK,
)
def admin_get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Get tenant by ID (SUPERADMIN only).
    """
    tenant = get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
        )

    return tenant


@router.put(
    "/tenants/{tenant_id}",
    response_model=TenantResponse,
    status_code=status.HTTP_200_OK,
)
def admin_update_tenant(
    tenant_id: int,
    tenant_update: TenantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Update tenant details (SUPERADMIN only).
    """
    try:
        updated_tenant = update_tenant(db, tenant_id, tenant_update)
        if not updated_tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
            )

        logger.info(f"Admin {current_user.username} updated tenant {tenant_id}")
        return updated_tenant

    except TenantAlreadyExistsException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating tenant: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the tenant",
        )


@router.delete("/tenants/{tenant_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Delete (soft delete) a tenant (SUPERADMIN only).
    """
    success = delete_tenant(db, tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
        )

    logger.info(f"Admin {current_user.username} deleted tenant {tenant_id}")
    return None


@router.put(
    "/tenants/{tenant_id}/subscription",
    response_model=TenantResponse,
    status_code=status.HTTP_200_OK,
)
def admin_update_subscription(
    tenant_id: int,
    subscription: UpdateSubscription,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Update tenant subscription/payment status (SUPERADMIN only).
    """
    updated_tenant = update_subscription(db, tenant_id, subscription.paid_until)
    if not updated_tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
        )

    logger.info(
        f"Admin {current_user.username} updated subscription for tenant {tenant_id}"
    )
    return updated_tenant


@router.get(
    "/tenants/{tenant_id}/stats",
    response_model=TenantStats,
    status_code=status.HTTP_200_OK,
)
def admin_get_tenant_stats(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Get tenant statistics (SUPERADMIN only).
    """
    stats = get_tenant_stats(db, tenant_id)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found"
        )

    return stats


# ==================== GYM OWNER & STAFF MANAGEMENT ====================


@router.get(
    "/gym-owners", response_model=UserListResponse, status_code=status.HTTP_200_OK
)
def admin_list_gym_owners(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(
        None, description="Search by name, username, or email"
    ),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    List all gym owners and staff across all tenants (SUPERADMIN only).

    This endpoint manages gym owners and staff members, NOT gym members (customers).
    """
    skip = (page - 1) * page_size
    users, total = get_all_users(
        db, skip=skip, limit=page_size, search=search, role=role
    )

    total_pages = ceil(total / page_size) if total > 0 else 1

    logger.info(
        f"Admin {current_user.username} retrieved {len(users)} gym owners/staff"
    )

    return UserListResponse(
        users=users,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "/gym-owners", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def admin_create_gym_owner(
    user: UserCreate,
    tenant_id: int = Query(..., description="Tenant ID to assign the gym owner to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Create a new gym owner or staff member (SUPERADMIN only).

    Superadmins can create gym owners and assign them to tenants.
    This is the ONLY way to create gym owners.
    """
    try:
        # Check if tenant exists
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Tenant with ID {tenant_id} not found",
            )

        # Check if username, email, or phone already exists
        db_user = (
            db.query(User)
            .filter(
                or_(
                    User.username == user.username,
                    User.email == user.email,
                    User.phone_number == user.phone_number,
                )
            )
            .first()
        )

        if db_user:
            if db_user.username == user.username:
                raise UserAlreadyExistsException("Username already exists")
            elif db_user.email == user.email:
                raise UserAlreadyExistsException("Email already exists")
            else:
                raise UserAlreadyExistsException("Phone number already exists")

        # Create gym owner/staff
        new_user = create_user(db, user, tenant_id)
        logger.info(
            f"Superadmin {current_user.username} created gym owner/staff: {new_user.username} (ID: {new_user.id}) for tenant {tenant_id}"
        )
        return new_user

    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating gym owner/staff: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the gym owner/staff",
        )


@router.get(
    "/gym-owners/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK
)
def admin_get_gym_owner(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Get gym owner or staff member by ID (SUPERADMIN only).

    This retrieves gym owner/staff information, NOT gym member (customer) data.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Gym owner/staff not found"
        )

    return user


@router.put(
    "/gym-owners/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK
)
def admin_update_gym_owner(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Update gym owner or staff member details (SUPERADMIN only).

    This updates gym owner/staff information, NOT gym member (customer) data.
    """
    try:
        updated_user = update_user(db, user_id, user_update)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gym owner/staff not found",
            )

        logger.info(f"Admin {current_user.username} updated gym owner/staff {user_id}")
        return updated_user

    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating gym owner/staff: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the gym owner/staff",
        )


@router.delete("/gym-owners/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_gym_owner(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Delete (soft delete) a gym owner or staff member (SUPERADMIN only).

    This deletes gym owner/staff accounts, NOT gym member (customer) accounts.
    """
    # Prevent deleting self
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Gym owner/staff not found"
        )

    logger.info(f"Admin {current_user.username} deleted gym owner/staff {user_id}")
    return None


@router.put(
    "/gym-owners/{user_id}/role",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def admin_update_gym_owner_role(
    user_id: int,
    new_role: UserRole,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """
    Update gym owner or staff member role (SUPERADMIN only).

    This updates roles for gym owners/staff, NOT gym members (customers).
    """
    updated_user = update_user_role(db, user_id, new_role)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Gym owner/staff not found"
        )

    logger.info(
        f"Admin {current_user.username} updated gym owner/staff {user_id} role to {new_role.value}"
    )
    return updated_user


# ==================== SYSTEM STATISTICS ====================


@router.get("/stats/overview", status_code=status.HTTP_200_OK)
def admin_get_system_stats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_superuser)
):
    """
    Get system-wide statistics (SUPERADMIN only).
    """
    from app.models.tenant import Tenant
    from app.models.member import Member
    from sqlalchemy import func

    total_tenants = (
        db.query(func.count(Tenant.id)).filter(Tenant.is_active == True).scalar()
    )
    total_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    total_members = (
        db.query(func.count(Member.id)).filter(Member.is_active == True).scalar()
    )

    return {
        "total_tenants": total_tenants or 0,
        "total_users": total_users or 0,
        "total_members": total_members or 0,
    }
