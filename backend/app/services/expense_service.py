from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from datetime import date
from typing import Optional
from decimal import Decimal
from app.models.expenses import Expense, ExpenseCategory, PaymentMethod
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate
from loguru import logger


def create_expense(
    db: Session, expense_create: ExpenseCreate, tenant_id: int, created_by: int
) -> Expense:
    """
    Create a new expense.

    Args:
        db: Database session
        expense_create: Expense creation schema
        tenant_id: Tenant ID
        created_by: User ID who created the expense

    Returns:
        Created expense
    """
    db_expense = Expense(
        tenant_id=tenant_id,
        category=expense_create.category,
        amount=expense_create.amount,
        payment_method=expense_create.payment_method,
        expense_date=expense_create.expense_date,
        description=expense_create.description,
        created_by=created_by,
    )

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    logger.info(
        f"New expense created: {db_expense.category} - ₹{db_expense.amount} (ID: {db_expense.id})"
    )
    return db_expense


def get_expense_by_id(
    db: Session, expense_id: int, tenant_id: int
) -> Optional[Expense]:
    """
    Get expense by ID with tenant validation.

    Args:
        db: Database session
        expense_id: Expense ID
        tenant_id: Tenant ID for validation

    Returns:
        Expense object or None
    """
    return (
        db.query(Expense)
        .filter(
            and_(
                Expense.id == expense_id,
                Expense.tenant_id == tenant_id,
                Expense.is_deleted == False,
            )
        )
        .first()
    )


def list_expenses(
    db: Session,
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    category: Optional[ExpenseCategory] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    payment_method: Optional[PaymentMethod] = None,
) -> tuple[list[Expense], int]:
    """
    Get all expenses for a tenant with pagination and filtering.

    Args:
        db: Database session
        tenant_id: Tenant ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        category: Filter by expense category
        start_date: Filter expenses from this date
        end_date: Filter expenses until this date
        payment_method: Filter by payment method

    Returns:
        Tuple of (expenses list, total count)
    """
    query = db.query(Expense).filter(
        and_(Expense.tenant_id == tenant_id, Expense.is_deleted == False)
    )

    # Apply filters
    if category:
        query = query.filter(Expense.category == category)

    if start_date:
        query = query.filter(Expense.expense_date >= start_date)

    if end_date:
        query = query.filter(Expense.expense_date <= end_date)

    if payment_method:
        query = query.filter(Expense.payment_method == payment_method)

    # Get total count
    total = query.count()

    # Get paginated results
    expenses = (
        query.order_by(Expense.expense_date.desc()).offset(skip).limit(limit).all()
    )

    return expenses, total


def update_expense(
    db: Session, expense_id: int, tenant_id: int, expense_update: ExpenseUpdate
) -> Optional[Expense]:
    """
    Update expense details.

    Args:
        db: Database session
        expense_id: Expense ID
        tenant_id: Tenant ID for validation
        expense_update: Expense update schema

    Returns:
        Updated expense or None
    """
    expense = get_expense_by_id(db, expense_id, tenant_id)
    if not expense:
        return None

    # Update fields
    update_data = expense_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)

    logger.info(
        f"Expense updated: {expense.category} - ₹{expense.amount} (ID: {expense.id})"
    )
    return expense


def delete_expense(db: Session, expense_id: int, tenant_id: int) -> bool:
    """
    Soft delete an expense.

    Args:
        db: Database session
        expense_id: Expense ID
        tenant_id: Tenant ID for validation

    Returns:
        True if deleted, False if not found
    """
    expense = get_expense_by_id(db, expense_id, tenant_id)
    if not expense:
        return False

    expense.is_deleted = True
    db.commit()

    logger.info(
        f"Expense deleted: {expense.category} - ₹{expense.amount} (ID: {expense.id})"
    )
    return True


def get_expense_summary(
    db: Session,
    tenant_id: int,
    start_date: date,
    end_date: date,
) -> dict:
    """
    Get expense summary for a date range.

    Args:
        db: Database session
        tenant_id: Tenant ID
        start_date: Start date
        end_date: End date

    Returns:
        Dictionary with expense summary
    """
    # Get total expenses
    total_query = (
        db.query(
            func.sum(Expense.amount).label("total"),
            func.count(Expense.id).label("count"),
        )
        .filter(
            and_(
                Expense.tenant_id == tenant_id,
                Expense.is_deleted == False,
                Expense.expense_date >= start_date,
                Expense.expense_date <= end_date,
            )
        )
        .first()
    )

    total_amount = total_query.total if total_query.total else Decimal(0)
    total_count = total_query.count if total_query.count else 0

    # Get expenses by category
    category_query = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("total"),
            func.count(Expense.id).label("count"),
        )
        .filter(
            and_(
                Expense.tenant_id == tenant_id,
                Expense.is_deleted == False,
                Expense.expense_date >= start_date,
                Expense.expense_date <= end_date,
            )
        )
        .group_by(Expense.category)
        .all()
    )

    by_category = [
        {"category": row.category, "total_amount": row.total, "count": row.count}
        for row in category_query
    ]

    # Get expenses by payment method
    payment_query = (
        db.query(Expense.payment_method, func.sum(Expense.amount).label("total"))
        .filter(
            and_(
                Expense.tenant_id == tenant_id,
                Expense.is_deleted == False,
                Expense.expense_date >= start_date,
                Expense.expense_date <= end_date,
            )
        )
        .group_by(Expense.payment_method)
        .all()
    )

    by_payment_method = {row.payment_method: row.total for row in payment_query}

    return {
        "total_expenses": total_amount,
        "total_count": total_count,
        "start_date": start_date,
        "end_date": end_date,
        "by_category": by_category,
        "by_payment_method": by_payment_method,
    }


def get_monthly_expenses(
    db: Session,
    tenant_id: int,
    year: int,
    month: Optional[int] = None,
) -> list[dict]:
    """
    Get monthly expense totals.

    Args:
        db: Database session
        tenant_id: Tenant ID
        year: Year
        month: Optional month (if None, returns all months in year)

    Returns:
        List of monthly expense summaries
    """
    query = db.query(
        extract("year", Expense.expense_date).label("year"),
        extract("month", Expense.expense_date).label("month"),
        func.sum(Expense.amount).label("total_amount"),
        func.count(Expense.id).label("expense_count"),
    ).filter(
        and_(
            Expense.tenant_id == tenant_id,
            Expense.is_deleted == False,
            extract("year", Expense.expense_date) == year,
        )
    )

    if month:
        query = query.filter(extract("month", Expense.expense_date) == month)

    query = query.group_by("year", "month").order_by("year", "month")

    results = query.all()

    return [
        {
            "year": int(row.year),
            "month": int(row.month),
            "total_amount": row.total_amount,
            "expense_count": row.expense_count,
        }
        for row in results
    ]


def get_category_breakdown(
    db: Session,
    tenant_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[dict]:
    """
    Get expenses grouped by category.

    Args:
        db: Database session
        tenant_id: Tenant ID
        start_date: Optional start date filter
        end_date: Optional end date filter

    Returns:
        List of category summaries
    """
    query = db.query(
        Expense.category,
        func.sum(Expense.amount).label("total_amount"),
        func.count(Expense.id).label("count"),
        func.avg(Expense.amount).label("avg_amount"),
    ).filter(
        and_(
            Expense.tenant_id == tenant_id,
            Expense.is_deleted == False,
        )
    )

    if start_date:
        query = query.filter(Expense.expense_date >= start_date)

    if end_date:
        query = query.filter(Expense.expense_date <= end_date)

    query = query.group_by(Expense.category).order_by(func.sum(Expense.amount).desc())

    results = query.all()

    return [
        {
            "category": row.category,
            "total_amount": row.total_amount,
            "count": row.count,
            "average_amount": row.avg_amount,
        }
        for row in results
    ]
