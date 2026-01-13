from sqlalchemy.orm import Session
from app.models.users import User
from app.schemas.users import UserCreate
from app.core.security import hash_password


def create_user(db: Session, user_create: UserCreate):
    hashed_password = hash_password(user_create.password)

    db_user = User(
        name=user_create.name,
        username=user_create.username,
        email=user_create.email,
        phone_number=user_create.phone_number,
        tenant_id=user_create.tenant_id,
        hashed_password=hashed_password,
        role=(
            user_create.role.value if hasattr(user_create.role, "value") else "gym_admin"
        ),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user
