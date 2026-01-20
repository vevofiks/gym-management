from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
import json


class PlanBase(BaseModel):
    """Base schema for membership plans"""
    name: str = Field(..., min_length=3, max_length=100, description="Plan name")
    description: Optional[str] = Field(None, description="Plan description")
    duration_days: int = Field(..., gt=0, description="Plan duration in days")
    price: Decimal = Field(..., gt=0, description="Plan price")
    features: Optional[List[str]] = Field(default_factory=list, description="List of plan features")
    
    @field_validator('price')
    @classmethod
    def validate_price(cls, v: Decimal) -> Decimal:
        """Ensure price has max 2 decimal places"""
        if v <= 0:
            raise ValueError("Price must be greater than 0")
        return round(v, 2)
    
    @field_validator('features')
    @classmethod
    def validate_features(cls, v: Optional[List[str]]) -> List[str]:
        """Ensure features is a list"""
        if v is None:
            return []
        return v


class PlanCreate(PlanBase):
    """Schema for creating a new plan"""
    pass


class PlanUpdate(BaseModel):
    """Schema for updating a plan"""
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    duration_days: Optional[int] = Field(None, gt=0)
    price: Optional[Decimal] = Field(None, gt=0)
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None
    
    @field_validator('price')
    @classmethod
    def validate_price(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Ensure price has max 2 decimal places"""
        if v is not None:
            if v <= 0:
                raise ValueError("Price must be greater than 0")
            return round(v, 2)
        return v


class PlanResponse(PlanBase):
    """Schema for plan response"""
    id: int
    tenant_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PlanListResponse(BaseModel):
    """Schema for paginated plan list"""
    plans: List[PlanResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PlanStats(BaseModel):
    """Schema for plan statistics"""
    plan_id: int
    plan_name: str
    total_members: int
    active_members: int
    total_revenue: Decimal
    
    class Config:
        from_attributes = True
