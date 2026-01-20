from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime
from enum import Enum


class PaymentMethod(str, Enum):
    """Payment method enum"""
    CASH = "cash"
    UPI = "upi"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"


class PaymentStatus(str, Enum):
    """Payment status enum"""
    PAID = "paid"
    PENDING = "pending"
    REFUNDED = "refunded"


class FeeBase(BaseModel):
    """Base schema for member fees"""
    amount: Decimal = Field(..., gt=0, description="Payment amount")
    payment_method: PaymentMethod = Field(..., description="Payment method")
    payment_date: date = Field(..., description="Payment date")
    transaction_id: Optional[str] = Field(None, max_length=100, description="Transaction ID")
    notes: Optional[str] = Field(None, description="Additional notes")
    
    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        """Ensure amount has max 2 decimal places"""
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return round(v, 2)


class FeeCreate(FeeBase):
    """Schema for creating a fee record"""
    plan_id: Optional[int] = Field(None, description="Associated plan ID")


class FeeResponse(FeeBase):
    """Schema for fee response"""
    id: int
    member_id: int
    tenant_id: int
    plan_id: Optional[int]
    payment_status: PaymentStatus
    created_by: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


class FeeListResponse(BaseModel):
    """Schema for paginated fee list"""
    fees: List[FeeResponse]
    total: int
    total_amount: Decimal
    page: int
    page_size: int
    total_pages: int


class FeeStats(BaseModel):
    """Schema for fee statistics"""
    total_collected: Decimal
    total_pending: Decimal
    total_refunded: Decimal
    payment_count: int
    
    class Config:
        from_attributes = True


class FinancialReport(BaseModel):
    """Schema for financial report"""
    start_date: date
    end_date: date
    total_revenue: Decimal
    cash_payments: Decimal
    upi_payments: Decimal
    card_payments: Decimal
    bank_transfer_payments: Decimal
    payment_count: int
    member_count: int
    
    class Config:
        from_attributes = True
