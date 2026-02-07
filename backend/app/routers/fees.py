from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil
from datetime import date

from app.core.database import get_db
from app.models.users import User
from app.core.deps import get_current_user
from app.schemas.member_fee import (
    FeeCreate,
    FeeResponse,
    FeeListResponse,
    FeeStats,
    FinancialReport,
    PaymentMethod,
)
from app.services.fee_service import (
    record_fee,
    get_member_fees,
    get_tenant_fees,
    get_financial_report,
    get_fee_statistics,
)
from loguru import logger


router = APIRouter(prefix="/fees", tags=["Fee Management"])


@router.post(
    "/members/{member_id}",
    response_model=FeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def record_member_payment(
    member_id: int,
    fee: FeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        new_fee = record_fee(
            db, member_id, current_user.tenant_id, fee, current_user.id
        )
        logger.info(
            f"User {current_user.username} recorded payment for member {member_id}"
        )
        return new_fee

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Error recording fee: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while recording the payment",
        )


@router.get(
    "/members/{member_id}",
    response_model=FeeListResponse,
    status_code=status.HTTP_200_OK,
)
def get_member_payment_history(
    member_id: int,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get payment history for a specific member.

    Returns paginated list of all payments made by the member.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    skip = (page - 1) * page_size
    fees, total, total_amount = get_member_fees(
        db, member_id, current_user.tenant_id, skip=skip, limit=page_size
    )

    total_pages = ceil(total / page_size) if total > 0 else 1

    return FeeListResponse(
        fees=fees,
        total=total,
        total_amount=total_amount,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/", response_model=FeeListResponse, status_code=status.HTTP_200_OK)
def list_all_fees(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    start_date: Optional[date] = Query(None, description="Filter from date"),
    end_date: Optional[date] = Query(None, description="Filter to date"),
    payment_method: Optional[PaymentMethod] = Query(
        None, description="Filter by payment method"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all fee payments for the gym.

    Supports filtering by date range and payment method.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    skip = (page - 1) * page_size
    fees, total, total_amount = get_tenant_fees(
        db,
        current_user.tenant_id,
        start_date=start_date,
        end_date=end_date,
        payment_method=payment_method,
        skip=skip,
        limit=page_size,
    )

    total_pages = ceil(total / page_size) if total > 0 else 1

    return FeeListResponse(
        fees=fees,
        total=total,
        total_amount=total_amount,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/report", response_model=FinancialReport, status_code=status.HTTP_200_OK)
def get_financial_report_endpoint(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate financial report for a date range.

    Returns revenue breakdown by payment method and member statistics.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date must be before end date",
        )

    try:
        report = get_financial_report(db, current_user.tenant_id, start_date, end_date)
        logger.info(
            f"User {current_user.username} generated financial report for {start_date} to {end_date}"
        )
        return report

    except Exception as e:
        logger.error(f"Error generating financial report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating the report",
        )


@router.get("/stats", response_model=FeeStats, status_code=status.HTTP_200_OK)
def get_fee_stats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Get overall fee statistics for the gym.

    Returns total collected, pending, refunded amounts and payment count.
    """
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        stats = get_fee_statistics(db, current_user.tenant_id)
        return stats

    except Exception as e:
        logger.error(f"Error getting fee statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while getting statistics",
        )
