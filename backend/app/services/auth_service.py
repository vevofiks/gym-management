from sqlalchemy.orm import Session
from app.models.users import User
from app.core.security import pwd_context

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not pwd_context.verify(password, str(user.hashed_password)):
        return None
    return user