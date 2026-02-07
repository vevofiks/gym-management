from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MealItem(BaseModel):
    """Individual meal in a diet plan"""

    time: str  # e.g., "7:00 AM"
    name: str  # e.g., "Breakfast"
    items: List[str]  # e.g., ["2 boiled eggs", "1 bowl oats"]


class DietPlanTemplateCreate(BaseModel):
    """Schema for creating a new diet plan template"""

    name: str
    category: str  # weight_loss, weight_gain, muscle_building, maintenance
    description: Optional[str] = None
    meals: List[MealItem]
    instructions: Optional[str] = None


class DietPlanTemplateUpdate(BaseModel):
    """Schema for updating a diet plan template"""

    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    meals: Optional[List[MealItem]] = None
    instructions: Optional[str] = None
    is_active: Optional[bool] = None


class DietPlanTemplateResponse(BaseModel):
    """Schema for diet plan template response"""

    id: int
    tenant_id: int
    created_by: int
    name: str
    category: str
    description: Optional[str]
    meals: List[dict]  # JSON field
    instructions: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DietPlanAssignmentCreate(BaseModel):
    """Schema for assigning a diet plan to a member"""

    template_id: int
    member_id: int
    notes: Optional[str] = None
    send_whatsapp: bool = True  # Automatically send via WhatsApp


class DietPlanAssignmentResponse(BaseModel):
    """Schema for diet plan assignment response"""

    id: int
    tenant_id: int
    template_id: int
    member_id: int
    assigned_by: int
    assigned_at: datetime
    sent_via_whatsapp: bool
    whatsapp_sent_at: Optional[datetime]
    notes: Optional[str]

    class Config:
        from_attributes = True


class DietPlanListResponse(BaseModel):
    """Schema for list of diet plan templates"""

    templates: List[DietPlanTemplateResponse]
    total: int
