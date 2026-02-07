from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from math import ceil

from app.core.database import get_db
from app.models.users import User
from app.core.deps import get_current_user, check_plan_limit
from app.schemas.membership_plan import (
    PlanCreate,
    PlanUpdate,
    PlanResponse,
    PlanListResponse,
    PlanStats,
)
from app.services.plan_service import (
    create_plan,
    get_plan_by_id,
    get_plans_by_tenant,
    update_plan,
    delete_plan,
    get_plan_statistics,
)
from app.core.exceptions import UserAlreadyExistsException
from loguru import logger


router = APIRouter(prefix="/plans", tags=["Membership Plans"])


@router.post("/", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def create_membership_plan(
    plan: PlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(check_plan_limit),
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        new_plan = create_plan(db, plan, current_user.tenant_id)
        logger.info(f"User {current_user.username} created plan: {new_plan.name}")
        return new_plan

    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating plan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the plan",
        )


@router.get("/", response_model=PlanListResponse, status_code=status.HTTP_200_OK)
def list_membership_plans(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    active_only: bool = Query(True, description="Show only active plans"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    skip = (page - 1) * page_size
    plans, total = get_plans_by_tenant(
        db, current_user.tenant_id, skip=skip, limit=page_size, active_only=active_only
    )

    total_pages = ceil(total / page_size) if total > 0 else 1

    return PlanListResponse(
        plans=plans,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{plan_id}", response_model=PlanResponse, status_code=status.HTTP_200_OK)
def get_membership_plan_by_id(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    plan = get_plan_by_id(db, plan_id, current_user.tenant_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found"
        )

    return plan


@router.put("/{plan_id}", response_model=PlanResponse, status_code=status.HTTP_200_OK)
def update_membership_plan(
    plan_id: int,
    plan_update: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        updated_plan = update_plan(plan_id, plan_update, current_user.tenant_id, db)
        if not updated_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found"
            )

        logger.info(f"User {current_user.username} updated plan {plan_id}")
        return updated_plan

    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error updating plan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the plan",
        )


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_membership_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    try:
        success = delete_plan(db, plan_id, current_user.tenant_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found"
            )

        logger.info(f"User {current_user.username} deleted plan {plan_id}")
        return None

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error deleting plan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the plan",
        )


@router.get(
    "/{plan_id}/stats", response_model=PlanStats, status_code=status.HTTP_200_OK
)
def get_plan_stats(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must be associated with a tenant",
        )

    stats = get_plan_statistics(db, plan_id, current_user.tenant_id)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found"
        )

    return stats
