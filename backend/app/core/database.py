from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()


# 2. The Engine
# This is the "Car" that drives queries to your database.
engine = create_engine(
    f"postgresql://{os.getenv("DATABASE_USER")}:{os.getenv("DATABASE_PASSWORD")}@localhost/{os.getenv("DATABASE_NAME")}",
    echo=True,
)

# 3. The Session
# This is a "temporary workspace". When you want to add a user,
# you open a session, do the work, and close it.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. The Base
# This is the "Blueprint". All your Models (Gym, User, Payment)
# will inherit from this class so Python knows they are database tables.
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
