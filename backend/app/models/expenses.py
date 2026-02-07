from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Boolean,
    ForeignKey,
    DateTime,
    Enum,
    Numeric,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class ExpenseCategory(str, enum.Enum):
    RENT = "rent"
    UTILITIES = "utilities"
    EQUIPMENT = "equipment"
    MAINTENANCE = "maintenance"
    SALARIES = "salaries"
    MARKETING = "marketing"
    SUPPLIES = "supplies"
    MISCELLANEOUS = "miscellaneous"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    UPI = "upi"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    category = Column(Enum(ExpenseCategory), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    expense_date = Column(Date, nullable=False, index=True)
    description = Column(String(500), nullable=True)

    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    is_deleted = Column(Boolean, default=False)  # Soft delete

    # Relationships
    tenant = relationship("Tenant", back_populates="expenses")
    creator = relationship("User")

    __table_args__ = (
        Index("ix_expenses_tenant_date", "tenant_id", "expense_date"),
        Index("ix_expenses_tenant_category", "tenant_id", "category"),
        Index("ix_expenses_tenant_deleted", "tenant_id", "is_deleted"),
    )

    def __repr__(self) -> str:
        return f"<Expense(id={self.id}, category='{self.category}', amount={self.amount}, date='{self.expense_date}')>"
