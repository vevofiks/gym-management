from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys
from app.core.database import engine
from app.models import *
from app.routers import users, tenants, auth, members, admin
from app.core.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Multi-tenant gym management SaaS platform",
    debug=settings.DEBUG
)


app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(tenants.router)
app.include_router(members.router)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    
    Returns application status and version information.
    """
    return {
        "status": "running",
        "message": "Gym Management SaaS is Live",
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT
    }
