from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String, nullable=True)
    google_map = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    paid_until = Column(Date, nullable=True)
    upi_id = Column(String, nullable=True)
    whatsapp_access_token = Column(String, nullable=True)
    whatsapp_phone_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
