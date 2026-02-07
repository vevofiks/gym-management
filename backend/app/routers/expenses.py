from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil
from datetime import date, datetime

from app.core.database import get_db
from app.models.users import User
from app.models.expenses import ExpenseCategory, PaymentMethod
from app.core.deps import get_current_gym_owner
from app.schemas.expenses import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseListResponse,
    ExpenseSummary,
    MonthlyExpense,
)
from app.services.expense_service import (
    create_expense,
    get_expense_by_id,
    list_expenses,
    update_expense,
    delete_expense,
    get_expense_summary,
    get_monthly_expenses,
    get_category_breakdown,
)
from loguru import logger


router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_new_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Create a new expense.

    Requires gym owner or gym staff authentication.
    """
    if current_user.tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant to create expenses",
        )

    try:
        new_expense = create_expense(
            db, expense, current_user.tenant_id, current_user.id  # type: ignore
        )
        logger.info(
            f"Expense created by user {current_user.username}: {new_expense.category} - ₹{new_expense.amount}"
        )
        return new_expense
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating expense: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the expense",
        )


@router.get(
    "/{expense_id}", response_model=ExpenseResponse, status_code=status.HTTP_200_OK
)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Get a single expense by ID.
    """
    if current_user.tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    expense = get_expense_by_id(db, expense_id, current_user.tenant_id)  # type: ignore
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found"
        )

    return expense


@router.get("/", response_model=ExpenseListResponse, status_code=status.HTTP_200_OK)
def list_all_expenses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    category: Optional[ExpenseCategory] = Query(None, description="Filter by category"),
    start_date: Optional[date] = Query(None, description="Filter from this date"),
    end_date: Optional[date] = Query(None, description="Filter until this date"),
    payment_method: Optional[PaymentMethod] = Query(
        None, description="Filter by payment method"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    List all expenses with pagination and filtering.

    Filters:
    - category: Filter by expense category
    - start_date: Show expenses from this date onwards
    - end_date: Show expenses until this date
    - payment_method: Filter by payment method
    """
    if current_user.tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    skip = (page - 1) * page_size
    expenses, total = list_expenses(
        db,
        current_user.tenant_id,  # type: ignore
        skip=skip,
        limit=page_size,
        category=category,
        start_date=start_date,
        end_date=end_date,
        payment_method=payment_method,
    )

    total_pages = ceil(total / page_size) if total > 0 else 1

    return ExpenseListResponse(
        expenses=[ExpenseResponse.from_orm(e) for e in expenses],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.put(
    "/{expense_id}", response_model=ExpenseResponse, status_code=status.HTTP_200_OK
)
def update_expense_details(
    expense_id: int,
    expense_update: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Update expense details.
    """
    if current_user.tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        updated_expense = update_expense(db, expense_id, current_user.tenant_id, expense_update)  # type: ignore
        if not updated_expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found"
            )

        logger.info(f"Expense {expense_id} updated by user {current_user.username}")
        return updated_expense
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating expense: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the expense",
        )


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense_by_id(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Delete an expense (soft delete).

    Only gym owners can delete expenses.
    """
    if current_user.tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    success = delete_expense(db, expense_id, current_user.tenant_id)  # type: ignore
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found"
        )

    logger.info(f"Expense {expense_id} deleted by user {current_user.username}")
    return None


@router.get("/summary", response_model=ExpenseSummary, status_code=status.HTTP_200_OK)
def get_expenses_summary(
    start_date: date = Query(..., description="Start date for summary"),
    end_date: date = Query(..., description="End date for summary"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Get expense summary for a date range.

    Returns:
    - Total expenses
    - Breakdown by category
    - Breakdown by payment method
    """
    if current_user.tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start_date must be before or equal to end_date",
        )

    summary = get_expense_summary(db, current_user.tenant_id, start_date, end_date)  # type: ignore
    return summary


@router.get(
    "/monthly", response_model=list[MonthlyExpense], status_code=status.HTTP_200_OK
)
def get_monthly_expense_report(
    year: int = Query(..., description="Year for the report"),
    month: Optional[int] = Query(
        None, ge=1, le=12, description="Optional specific month"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Get monthly expense totals.

    If month is provided, returns data for that specific month.
    If month is not provided, returns data for all months in the year.
    """
    if current_user.tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    monthly_data = get_monthly_expenses(db, current_user.tenant_id, year, month)  # type: ignore
    return monthly_data


@router.get("/by-category", response_model=list[dict], status_code=status.HTTP_200_OK)
def get_expenses_by_category(
    start_date: Optional[date] = Query(None, description="Optional start date filter"),
    end_date: Optional[date] = Query(None, description="Optional end date filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
):
    """
    Get expenses grouped by category with totals and averages.

    Optionally filter by date range.
    """
    if current_user.tenant_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start_date must be before or equal to end_date",
        )

    category_data = get_category_breakdown(db, current_user.tenant_id, start_date, end_date)  # type: ignore
    return category_data
