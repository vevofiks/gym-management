from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.deps import get_current_user, get_db
from app.core.deps import check_feature_access
from app.models.users import User
from app.schemas.diet_plan import (
    DietPlanTemplateCreate,
    DietPlanTemplateUpdate,
    DietPlanTemplateResponse,
    DietPlanAssignmentCreate,
    DietPlanAssignmentResponse,
    DietPlanListResponse,
)
from app.services.diet_plan_service import diet_plan_service

router = APIRouter(prefix="/diet-plans", tags=["Diet Plans"])


@router.post(
    "/templates",
    response_model=DietPlanTemplateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_diet_plan_template(
    data: DietPlanTemplateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    _: None = Depends(check_feature_access("whatsapp")),
):
    """
    Create a new diet plan template (Pro plan feature).

    Only available for gyms on Pro plan with WhatsApp enabled.
    """

    template = diet_plan_service.create_template(
        db, current_user.tenant_id, current_user.id, data
    )
    return template


@router.get("/templates", response_model=DietPlanListResponse)
def list_diet_plan_templates(
    category: Optional[str] = None,
    active_only: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List all diet plan templates for the gym.

    Can filter by category (weight_loss, weight_gain, muscle_building, maintenance).
    """
    templates = diet_plan_service.list_templates(
        db, current_user.tenant_id, category, active_only
    )
    return {"templates": templates, "total": len(templates)}


@router.get("/templates/{template_id}", response_model=DietPlanTemplateResponse)
def get_diet_plan_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific diet plan template by ID"""
    template = diet_plan_service.get_template(db, current_user.tenant_id, template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Diet plan template not found"
        )
    return template


@router.put("/templates/{template_id}", response_model=DietPlanTemplateResponse)
def update_diet_plan_template(
    template_id: int,
    data: DietPlanTemplateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a diet plan template"""
    template = diet_plan_service.update_template(
        db, current_user.tenant_id, template_id, data
    )
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Diet plan template not found"
        )
    return template


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diet_plan_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft delete a diet plan template"""
    success = diet_plan_service.delete_template(db, current_user.tenant_id, template_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Diet plan template not found"
        )
    return None


@router.post(
    "/assign",
    response_model=DietPlanAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def assign_diet_plan_to_member(
    data: DietPlanAssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    _: None = Depends(check_feature_access("whatsapp")),
):
    """
    Assign a diet plan to a member and optionally send via WhatsApp.

    The diet plan will be formatted and sent to the member's WhatsApp
    if send_whatsapp is True.
    """
    assignment = diet_plan_service.assign_to_member(
        db, current_user.tenant_id, current_user.id, data
    )
    return assignment


@router.get(
    "/members/{member_id}/plans", response_model=List[DietPlanAssignmentResponse]
)
def get_member_diet_plans(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all diet plans assigned to a specific member"""
    assignments = diet_plan_service.get_member_diet_plans(
        db, current_user.tenant_id, member_id
    )
    return assignments
