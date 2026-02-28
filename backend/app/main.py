from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys
from app.core.database import engine
from app.models import *
from app.routers import (
    users,
    tenants,
    auth,
    members,
    admin,
    plans,
    fees,
    expenses,
    subscriptions,
    diet_plans,
    reports,
    analytics,
    dashboard,
    whatsapp,
    whatsapp_settings,
    progress,
    marketing,
    audit,
    store,
)
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
import os


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Multi-tenant gym management SaaS platform",
    debug=settings.DEBUG,
)


app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(tenants.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(plans.router, prefix="/api")
app.include_router(fees.router, prefix="/api")
app.include_router(expenses.router, prefix="/api")
app.include_router(subscriptions.router, prefix="/api")
app.include_router(diet_plans.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(analytics.router)
app.include_router(dashboard.router, prefix="/api")
app.include_router(whatsapp.router, prefix="/api")
app.include_router(whatsapp_settings.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(marketing.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(store.router, prefix="/api")

# Static Files
UPLOAD_DIR = "/home/amraz/My Works/vevofiks/gym-management/backend/uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Type", "Content-Length"],
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
        "environment": settings.ENVIRONMENT,
    }
