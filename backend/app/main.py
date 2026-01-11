from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models import Base
from app.routers import users, tenants
from app.routers import auth

Base.metadata.create_all(bind=engine)


app = FastAPI(title="GYM MANAGEMENT")


app.include_router(users.router)
app.include_router(tenants.router)
app.include_router(auth.router)


origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "running", "message": "Gym SaaS is Live"}
