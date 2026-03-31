import sys
import os

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from app.core.database import SessionLocal
from app.models.users import User, UserRole
from app.core.security import hash_password

def create_super_admin():
    """Create the platform-level super admin user"""
    db = SessionLocal()
    try:
        super_admin_username = "super-admin"
        user = db.query(User).filter(User.username == super_admin_username).first()
        if not user:
            user = User(
                name="Super Admin",
                username=super_admin_username,
                email="admin@fitdash.com",
                phone_number="0000000000",
                hashed_password=hash_password("Amrazamraz@123"),
                role=UserRole.SUPERADMIN.value,
                is_active=True,
                tenant_id=None,  # Superadmins are platform-level
            )
            db.add(user)
            db.commit()
            print(f"Created super-admin: {user.username}")
        else:
            # Update password just in case or ensure role is correct
            user.hashed_password = hash_password("superadmin@123")
            user.role = UserRole.SUPERADMIN.value
            db.commit()
            print(f"Updated/Verified super-admin: {user.username}")

    except Exception as e:
        print(f"Error seeding super-admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()
