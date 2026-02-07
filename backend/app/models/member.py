from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime, Enum, Numeric, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class MemberStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    INACTIVE = "inactive"


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index = True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)

    first_name = Column(String(50), index=True, nullable=False)
    last_name = Column(String(50), index=True, nullable=False)
    phone_number = Column(String(15), index=True, nullable=False)
    email = Column(String(255), index=True, nullable=True)

    joining_date = Column(Date, nullable=False)
    membership_expiry_date = Column(Date, nullable=False)
    status = Column(Enum(MemberStatus), default=MemberStatus.ACTIVE, nullable=False)
    
    # Profile photos
    before_photo_url = Column(String(500), nullable=True)
    after_photo_url = Column(String(500), nullable=True)
    
    # Plan and fee tracking
    plan_id = Column(Integer, ForeignKey("membership_plans.id"), nullable=True)
    current_plan_start_date = Column(Date, nullable=True)
    total_fees_paid = Column(Numeric(10, 2), default=0.00)
    outstanding_dues = Column(Numeric(10, 2), default=0.00) # Any amount that is due but not paid

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True) # For soft delete

    # Relationships
    tenant = relationship("Tenant", back_populates="members")
    plan = relationship("MembershipPlan", back_populates="members")
    fees = relationship("MemberFee", back_populates="member", cascade="all, delete-orphan")    
    
    __table_args__ = (
        UniqueConstraint('tenant_id', 'phone_number', name='unique_member_per_tenant'),
        Index('ix_members_tenant_active', 'tenant_id', 'is_active'),
    )
    
    def __repr__(self) -> str:
        return f"<Member(id={self.id}, first_name='{self.first_name}', last_name='{self.last_name}', phone_number='{self.phone_number}')>"