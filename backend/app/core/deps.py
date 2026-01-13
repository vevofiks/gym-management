from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.users import User, UserRole


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token : str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username : str | None = payload.get("sub")

        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise credentials_exception
    return user



def get_current_superuser(current_user : User  = Depends(get_current_user)):
    if not bool(current_user.is_active):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    if str(current_user.role) != UserRole.SUPERADMIN.value:
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    
    return current_user