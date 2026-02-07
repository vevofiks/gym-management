from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from app.models.expenses import ExpenseCategory, PaymentMethod


class ExpenseBase(BaseModel):
    category: ExpenseCategory = Field(..., description="Expense category")
    amount: Decimal = Field(..., gt=0, description="Expense amount (must be positive)")
    payment_method: PaymentMethod = Field(..., description="Payment method used")
    expense_date: date = Field(..., description="Date of the expense")
    description: Optional[str] = Field(
        None, max_length=500, description="Additional notes about the expense"
    )

    @field_validator("expense_date")
    @classmethod
    def validate_expense_date(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Expense date cannot be in the future")
        return v


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category: Optional[ExpenseCategory] = None
    amount: Optional[Decimal] = Field(None, gt=0)
    payment_method: Optional[PaymentMethod] = None
    expense_date: Optional[date] = None
    description: Optional[str] = Field(None, max_length=500)

    @field_validator("expense_date")
    @classmethod
    def validate_expense_date(cls, v: Optional[date]) -> Optional[date]:
        if v and v > date.today():
            raise ValueError("Expense date cannot be in the future")
        return v


class ExpenseResponse(ExpenseBase):
    id: int
    tenant_id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True


class ExpenseListResponse(BaseModel):
    expenses: list[ExpenseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CategorySummary(BaseModel):
    category: ExpenseCategory
    total_amount: Decimal
    count: int


class ExpenseSummary(BaseModel):
    """Summary of expenses for a date range"""

    total_expenses: Decimal
    total_count: int
    start_date: date
    end_date: date
    by_category: list[CategorySummary]
    by_payment_method: dict[str, Decimal]


class MonthlyExpense(BaseModel):
    """Monthly expense totals"""

    year: int
    month: int
    total_amount: Decimal
    expense_count: int
