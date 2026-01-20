from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import date, timedelta
from typing import Optional
from app.models.member import Member, MemberStatus
from app.schemas.members import MemberCreate, MemberUpdate, MemberRenew
from app.core.exceptions import UserAlreadyExistsException
from loguru import logger


def calculate_expiry_date(joining_date: date, membership_type: str) -> date:
    """
    Calculate membership expiry date based on membership type.
    
    Args:
        joining_date: Date when member joined
        membership_type: Type of membership
        
    Returns:
        Calculated expiry date
    """
    if membership_type == "Monthly":
        return joining_date + timedelta(days=30)
    elif membership_type == "3 Months":
        return joining_date + timedelta(days=90)
    elif membership_type == "6 Months":
        return joining_date + timedelta(days=180)
    elif membership_type == "1 Year":
        return joining_date + timedelta(days=365)
    else:
        raise ValueError(f"Invalid membership type: {membership_type}")


def update_member_status(member: Member) -> MemberStatus:
    """
    Update member status based on expiry date.
    
    Args:
        member: Member object
        
    Returns:
        Updated status
    """
    if not member.is_active:
        return MemberStatus.INACTIVE
    
    today = date.today()
    if member.membership_expiry_date < today:
        return MemberStatus.EXPIRED
    else:
        return MemberStatus.ACTIVE


def create_member(db: Session, member_create: MemberCreate, tenant_id: int) -> Member:
    """
    Create a new member.
    
    Args:
        db: Database session
        member_create: Member creation schema
        tenant_id: Tenant ID
        
    Returns:
        Created member
        
    Raises:
        UserAlreadyExistsException: If phone number already exists for this tenant
    """
    # Check if phone number already exists for this tenant
    existing_member = db.query(Member).filter(
        and_(
            Member.tenant_id == tenant_id,
            Member.phone_number == member_create.phone_number,
            Member.is_active == True
        )
    ).first()
    
    if existing_member:
        raise UserAlreadyExistsException("A member with this phone number already exists")
    
    # Calculate expiry date
    expiry_date = calculate_expiry_date(
        member_create.joining_date,
        member_create.membership_type
    )
    
    # Create member
    db_member = Member(
        tenant_id=tenant_id,
        first_name=member_create.first_name,
        last_name=member_create.last_name,
        phone_number=member_create.phone_number,
        email=member_create.email,
        joining_date=member_create.joining_date,
        membership_expiry_date=expiry_date,
        membership_type=member_create.membership_type,
        status=MemberStatus.ACTIVE
    )
    
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    
    logger.info(f"New member created: {db_member.first_name} {db_member.last_name} (ID: {db_member.id})")
    return db_member


def get_member_by_id(db: Session, member_id: int, tenant_id: int) -> Optional[Member]:
    """
    Get member by ID with tenant validation.
    
    Args:
        db: Database session
        member_id: Member ID
        tenant_id: Tenant ID for validation
        
    Returns:
        Member object or None
    """
    member = db.query(Member).filter(
        and_(
            Member.id == member_id,
            Member.tenant_id == tenant_id,
            Member.is_active == True
        )
    ).first()
    
    if member:
        # Update status based on expiry
        new_status = update_member_status(member)
        if member.status != new_status:
            member.status = new_status
            db.commit()
            db.refresh(member)
    
    return member


def get_members_by_tenant(
    db: Session,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[MemberStatus] = None
) -> tuple[list[Member], int]:
    """
    Get all members for a tenant with pagination and filtering.
    
    Args:
        db: Database session
        tenant_id: Tenant ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        search: Search term for name or phone
        status: Filter by status
        
    Returns:
        Tuple of (members list, total count)
    """
    query = db.query(Member).filter(
        and_(
            Member.tenant_id == tenant_id,
            Member.is_active == True
        )
    )
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Member.first_name.ilike(search_term),
                Member.last_name.ilike(search_term),
                Member.phone_number.like(search_term)
            )
        )
    
    # Apply status filter
    if status:
        query = query.filter(Member.status == status)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    members = query.order_by(Member.created_at.desc()).offset(skip).limit(limit).all()
    
    # Update statuses
    for member in members:
        new_status = update_member_status(member)
        if member.status != new_status:
            member.status = new_status
    
    if members:
        db.commit()
    
    return members, total


def update_member(
    db: Session,
    member_id: int,
    tenant_id: int,
    member_update: MemberUpdate
) -> Optional[Member]:
    """
    Update member details.
    
    Args:
        db: Database session
        member_id: Member ID
        tenant_id: Tenant ID for validation
        member_update: Member update schema
        
    Returns:
        Updated member or None
        
    Raises:
        UserAlreadyExistsException: If phone number already exists
    """
    member = get_member_by_id(db, member_id, tenant_id)
    if not member:
        return None
    
    # Check phone number uniqueness if being updated
    if member_update.phone_number and member_update.phone_number != member.phone_number:
        existing = db.query(Member).filter(
            and_(
                Member.tenant_id == tenant_id,
                Member.phone_number == member_update.phone_number,
                Member.is_active == True,
                Member.id != member_id
            )
        ).first()
        
        if existing:
            raise UserAlreadyExistsException("A member with this phone number already exists")
    
    # Update fields
    update_data = member_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)
    
    db.commit()
    db.refresh(member)
    
    logger.info(f"Member updated: {member.first_name} {member.last_name} (ID: {member.id})")
    return member


def delete_member(db: Session, member_id: int, tenant_id: int) -> bool:
    """
    Soft delete a member.
    
    Args:
        db: Database session
        member_id: Member ID
        tenant_id: Tenant ID for validation
        
    Returns:
        True if deleted, False if not found
    """
    member = get_member_by_id(db, member_id, tenant_id)
    if not member:
        return False
    
    member.is_active = False
    member.status = MemberStatus.INACTIVE
    db.commit()
    
    logger.info(f"Member deleted: {member.first_name} {member.last_name} (ID: {member.id})")
    return True


def renew_membership(
    db: Session,
    member_id: int,
    tenant_id: int,
    renewal: MemberRenew
) -> Optional[Member]:
    """
    Renew member's membership.
    
    Args:
        db: Database session
        member_id: Member ID
        tenant_id: Tenant ID for validation
        renewal: Renewal schema with new membership type
        
    Returns:
        Updated member or None
    """
    member = get_member_by_id(db, member_id, tenant_id)
    if not member:
        return None
    
    # Calculate new expiry date from today or current expiry (whichever is later)
    start_date = max(date.today(), member.membership_expiry_date)
    new_expiry = calculate_expiry_date(start_date, renewal.membership_type)
    
    member.membership_expiry_date = new_expiry
    member.membership_type = renewal.membership_type
    member.status = MemberStatus.ACTIVE
    
    db.commit()
    db.refresh(member)
    
    logger.info(f"Membership renewed: {member.first_name} {member.last_name} (ID: {member.id}) until {new_expiry}")
    return member
