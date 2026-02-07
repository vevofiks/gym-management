from sqlalchemy import Column, Integer, String, Text, Numeric, Date, ForeignKey, DateTime, CheckConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class MemberFee(Base):
    """
    Fee payments made by members.
    Tracks all payment transactions for membership fees.
    """
    __tablename__ = "member_fees"
    
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("membership_plans.id"))
    original_amount = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50))  # cash, upi, card, bank_transfer
    payment_date = Column(Date, nullable=False)
    payment_status = Column(String(20), default='paid')  # paid, pending, refunded
    transaction_id = Column(String(100))
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    member = relationship("Member", back_populates="fees")
    tenant = relationship("Tenant")
    plan = relationship("MembershipPlan", back_populates="fees")
    created_by_user = relationship("User")
    
    __table_args__ = (
        CheckConstraint("payment_method IN ('cash', 'upi', 'card', 'bank_transfer')", name='check_payment_method'),
        CheckConstraint("payment_status IN ('paid', 'pending', 'refunded')", name='check_payment_status'),
        Index('idx_fees_member', 'member_id'),
        Index('idx_fees_tenant', 'tenant_id'),
        Index('idx_fees_date', 'payment_date'),
    )
    
    def __repr__(self):
        return f"<MemberFee(id={self.id}, member_id={self.member_id}, amount={self.amount})>"
