from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional
from app.models.users import User, UserRole
from app.schemas.users import UserCreate, UserUpdate
from app.core.security import hash_password, pwd_context
from app.core.exceptions import UserAlreadyExistsException
from loguru import logger


def create_user(db: Session, user_create: UserCreate, tenant_id: Optional[int] = None) -> User:
    hashed_password = hash_password(user_create.password)
    
    final_tenant_id = tenant_id if tenant_id is not None else getattr(user_create, 'tenant_id', None)

    db_user = User(
        name=user_create.name,
        username=user_create.username,
        email=user_create.email,
        phone_number=user_create.phone_number,
        tenant_id=final_tenant_id,
        hashed_password=hashed_password,
        role=user_create.role.value if hasattr(user_create.role, "value") else user_create.role,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"User created: {db_user.username} (ID: {db_user.id})")
    return db_user


def get_user_by_id(db: Session, user_id: int, tenant_id: Optional[int] = None) -> Optional[User]:
    query = db.query(User).filter(User.id == user_id, User.is_active == True)
    
    if tenant_id is not None:
        query = query.filter(User.tenant_id == tenant_id)
    
    return query.first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username, User.is_active == True).first()


def get_users_by_tenant(
    db: Session,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    role: Optional[UserRole] = None
) -> tuple[list[User], int]:
    query = db.query(User).filter(
        and_(
            User.tenant_id == tenant_id,
            User.is_active == True
        )
    )
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.username.ilike(search_term),
                User.email.ilike(search_term)
            )
        )
    
    # Apply role filter
    if role:
        role_value = role.value if hasattr(role, 'value') else role
        query = query.filter(User.role == role_value)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return users, total


def get_all_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    role: Optional[UserRole] = None
) -> tuple[list[User], int]:
    """
    Get all users (superadmin only) with pagination and filtering.

    Returns:
        Tuple of (users list, total count)
    """
    query = db.query(User).filter(User.is_active == True)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.username.ilike(search_term),
                User.email.ilike(search_term)
            )
        )
    
    # Apply role filter
    if role:
        role_value = role.value if hasattr(role, 'value') else role
        query = query.filter(User.role == role_value)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    return users, total


def update_user(
    db: Session,
    user_id: int,
    user_update: UserUpdate,
    tenant_id: Optional[int] = None
) -> Optional[User]:
    user = get_user_by_id(db, user_id, tenant_id)
    if not user:
        return None
    
    # Check uniqueness if fields are being updated
    update_data = user_update.model_dump(exclude_unset=True)
    
    if 'username' in update_data and update_data['username'] != user.username:
        existing = db.query(User).filter(
            User.username == update_data['username'],
            User.is_active == True,
            User.id != user_id
        ).first()
        if existing:
            raise UserAlreadyExistsException("Username already exists")
    
    if 'email' in update_data and update_data['email'] != user.email:
        existing = db.query(User).filter(
            User.email == update_data['email'],
            User.is_active == True,
            User.id != user_id
        ).first()
        if existing:
            raise UserAlreadyExistsException("Email already exists")
    
    if 'phone_number' in update_data and update_data['phone_number'] != user.phone_number:
        existing = db.query(User).filter(
            User.phone_number == update_data['phone_number'],
            User.is_active == True,
            User.id != user_id
        ).first()
        if existing:
            raise UserAlreadyExistsException("Phone number already exists")
    
    # Update fields
    for field, value in update_data.items():
        if field == 'role' and hasattr(value, 'value'):
            setattr(user, field, value.value)
        else:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    logger.info(f"User updated: {user.username} (ID: {user.id})")
    return user


def delete_user(db: Session, user_id: int, tenant_id: Optional[int] = None) -> bool:
    """
    Soft delete a user.
    
    Args:
        db: Database session
        user_id: User ID
        tenant_id: Optional tenant ID for validation
        
    Returns:
        True if deleted, False if not found
    """
    user = get_user_by_id(db, user_id, tenant_id)
    if not user:
        return False
    
    user.is_active = False
    db.commit()
    
    logger.info(f"User deleted: {user.username} (ID: {user.id})")
    return True


def change_password(
    db: Session,
    user_id: int,
    old_password: str,
    new_password: str,
    tenant_id: Optional[int] = None
) -> bool:
    """
    Change user password with old password verification.
    
    Args:
        db: Database session
        user_id: User ID
        old_password: Current password
        new_password: New password
        tenant_id: Optional tenant ID for validation
        
    Returns:
        True if password changed, False if old password incorrect or user not found
    """
    user = get_user_by_id(db, user_id, tenant_id)
    if not user:
        return False
    
    # Verify old password
    if not pwd_context.verify(old_password, str(user.hashed_password)):
        return False
    
    # Set new password
    user.hashed_password = hash_password(new_password)
    db.commit()
    
    logger.info(f"Password changed for user: {user.username} (ID: {user.id})")
    return True


def update_user_role(
    db: Session,
    user_id: int,
    new_role: UserRole,
    tenant_id: Optional[int] = None
) -> Optional[User]:
    """
    Update user role.
    
    Args:
        db: Database session
        user_id: User ID
        new_role: New role
        tenant_id: Optional tenant ID for validation
        
    Returns:
        Updated user or None
    """
    user = get_user_by_id(db, user_id, tenant_id)
    if not user:
        return None
    
    role_value = new_role.value if hasattr(new_role, 'value') else new_role
    user.role = role_value
    db.commit()
    db.refresh(user)
    
    logger.info(f"Role updated for user {user.username} (ID: {user.id}) to {role_value}")
    return user