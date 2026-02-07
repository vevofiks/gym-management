from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    Boolean,
    JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class DietPlanTemplate(Base):
    """Diet plan templates created by gym owners"""

    __tablename__ = "diet_plan_templates"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String(100), nullable=False)  # e.g., "Weight Loss Plan"
    category = Column(
        String(50), nullable=False
    )  # weight_loss, weight_gain, muscle_building, maintenance
    description = Column(Text, nullable=True)

    # Diet plan content (JSON structure)
    meals = Column(JSON, nullable=False)  # Array of meals with timings and food items
    instructions = Column(Text, nullable=True)  # General instructions

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="diet_plan_templates")
    creator = relationship("User")
    assignments = relationship(
        "DietPlanAssignment", back_populates="template", cascade="all, delete-orphan"
    )


class DietPlanAssignment(Base):
    """Track which members have been assigned which diet plans"""

    __tablename__ = "diet_plan_assignments"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("diet_plan_templates.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    assigned_at = Column(DateTime, default=datetime.utcnow)
    sent_via_whatsapp = Column(Boolean, default=False)
    whatsapp_sent_at = Column(DateTime, nullable=True)

    notes = Column(Text, nullable=True)  # Custom notes for this member

    # Relationships
    template = relationship("DietPlanTemplate", back_populates="assignments")
    member = relationship("Member")
    assigner = relationship("User")
