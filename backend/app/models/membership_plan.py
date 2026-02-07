from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey, DateTime, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class MembershipPlan(Base):
    __tablename__ = "membership_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    duration_days = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    features = Column(Text, nullable=True)  # JSON string of features
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="membership_plans")
    members = relationship("Member", back_populates="plan")
    fees = relationship("MemberFee", back_populates="plan")
    
    __table_args__ = (
        UniqueConstraint('tenant_id', 'name', name='unique_plan_per_tenant'),
        Index('idx_plans_tenant', 'tenant_id', 'is_active'),
    )
    
    def __repr__(self):
        return f"<MembershipPlan(id={self.id}, name='{self.name}', tenant_id={self.tenant_id})>"
