from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional
from datetime import date
from app.models.tenant import Tenant
from app.models.member import Member, MemberStatus
from app.schemas.tenant import TenantCreate, TenantUpdate
from app.core.exceptions import TenantAlreadyExistsException
from loguru import logger


def create_tenant(db: Session, tenant: TenantCreate) -> Tenant:
    """
    Create a new tenant/gym in the database.
    
    Args:
        db: Database session
        tenant: Tenant creation schema with validated data
        
    Returns:
        Created Tenant object
        
    Raises:
        TenantAlreadyExistsException: If tenant name already exists
    """
    # Check if tenant name already exists
    existing = db.query(Tenant).filter(Tenant.name == tenant.name).first()
    if existing:
        raise TenantAlreadyExistsException("Tenant name already exists")
    
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
    
    logger.info(f"Tenant created: {db_tenant.name} (ID: {db_tenant.id})")
    return db_tenant


def get_tenant_by_id(db: Session, tenant_id: int) -> Optional[Tenant]:
    """
    Get tenant by ID.
    
    Args:
        db: Database session
        tenant_id: Tenant ID
        
    Returns:
        Tenant object or None
    """
    return db.query(Tenant).filter(
        Tenant.id == tenant_id,
        Tenant.is_active == True
    ).first()


def get_all_tenants(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    active_only: bool = True
) -> tuple[list[Tenant], int]:
    """
    Get all tenants with pagination and filtering.
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records to return
        search: Search term for tenant name
        active_only: Filter for active tenants only
        
    Returns:
        Tuple of (tenants list, total count)
    """
    query = db.query(Tenant)
    
    if active_only:
        query = query.filter(Tenant.is_active == True)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(Tenant.name.ilike(search_term))
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    tenants = query.order_by(Tenant.created_at.desc()).offset(skip).limit(limit).all()
    
    return tenants, total


def update_tenant(
    db: Session,
    tenant_id: int,
    tenant_update: TenantUpdate
) -> Optional[Tenant]:
    """
    Update tenant details.
    
    Args:
        db: Database session
        tenant_id: Tenant ID
        tenant_update: Tenant update schema
        
    Returns:
        Updated tenant or None
        
    Raises:
        TenantAlreadyExistsException: If new name already exists
    """
    tenant = get_tenant_by_id(db, tenant_id)
    if not tenant:
        return None
    
    # Check name uniqueness if being updated
    update_data = tenant_update.model_dump(exclude_unset=True)
    
    if 'name' in update_data and update_data['name'] != tenant.name:
        existing = db.query(Tenant).filter(
            Tenant.name == update_data['name'],
            Tenant.is_active == True,
            Tenant.id != tenant_id
        ).first()
        if existing:
            raise TenantAlreadyExistsException("Tenant name already exists")
    
    # Update fields
    for field, value in update_data.items():
        setattr(tenant, field, value)
    
    db.commit()
    db.refresh(tenant)
    
    logger.info(f"Tenant updated: {tenant.name} (ID: {tenant.id})")
    return tenant


def delete_tenant(db: Session, tenant_id: int) -> bool:
    """
    Soft delete a tenant.
    
    Args:
        db: Database session
        tenant_id: Tenant ID
        
    Returns:
        True if deleted, False if not found
    """
    tenant = get_tenant_by_id(db, tenant_id)
    if not tenant:
        return False
    
    tenant.is_active = False
    db.commit()
    
    logger.info(f"Tenant deleted: {tenant.name} (ID: {tenant.id})")
    return True


def update_subscription(
    db: Session,
    tenant_id: int,
    paid_until: date
) -> Optional[Tenant]:
    """
    Update tenant subscription/payment status.
    
    Args:
        db: Database session
        tenant_id: Tenant ID
        paid_until: New paid until date
        
    Returns:
        Updated tenant or None
    """
    tenant = get_tenant_by_id(db, tenant_id)
    if not tenant:
        return None
    
    tenant.paid_until = paid_until
    db.commit()
    db.refresh(tenant)
    
    logger.info(f"Subscription updated for tenant {tenant.name} (ID: {tenant.id}) until {paid_until}")
    return tenant


def get_tenant_stats(db: Session, tenant_id: int) -> Optional[dict]:
    """
    Get statistics for a tenant.
    
    Args:
        db: Database session
        tenant_id: Tenant ID
        
    Returns:
        Dictionary with statistics or None if tenant not found
    """
    tenant = get_tenant_by_id(db, tenant_id)
    if not tenant:
        return None
    
    # Get member counts
    total_members = db.query(func.count(Member.id)).filter(
        Member.tenant_id == tenant_id,
        Member.is_active == True
    ).scalar()
    
    active_members = db.query(func.count(Member.id)).filter(
        Member.tenant_id == tenant_id,
        Member.is_active == True,
        Member.status == MemberStatus.ACTIVE
    ).scalar()
    
    expired_members = db.query(func.count(Member.id)).filter(
        Member.tenant_id == tenant_id,
        Member.is_active == True,
        Member.status == MemberStatus.EXPIRED
    ).scalar()
    
    return {
        "tenant_id": tenant_id,
        "tenant_name": tenant.name,
        "total_members": total_members or 0,
        "active_members": active_members or 0,
        "expired_members": expired_members or 0,
        "is_active": tenant.is_active,
        "paid_until": tenant.paid_until
    }