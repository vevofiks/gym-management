from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from decimal import Decimal


class MemberProgressBase(BaseModel):
    measurement_date: date
    weight: Optional[Decimal] = None
    height: Optional[Decimal] = None
    bmi: Optional[Decimal] = None
    body_fat_percentage: Optional[Decimal] = None
    chest: Optional[Decimal] = None
    waist: Optional[Decimal] = None
    hips: Optional[Decimal] = None
    arms: Optional[Decimal] = None
    thighs: Optional[Decimal] = None
    notes: Optional[str] = None


class MemberProgressCreate(MemberProgressBase):
    pass


class MemberProgressUpdate(BaseModel):
    measurement_date: Optional[date] = None
    weight: Optional[Decimal] = None
    height: Optional[Decimal] = None
    bmi: Optional[Decimal] = None
    body_fat_percentage: Optional[Decimal] = None
    chest: Optional[Decimal] = None
    waist: Optional[Decimal] = None
    hips: Optional[Decimal] = None
    arms: Optional[Decimal] = None
    thighs: Optional[Decimal] = None
    notes: Optional[str] = None


class MemberProgressResponse(MemberProgressBase):
    id: int
    member_id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MemberProgressList(BaseModel):
    data: list[MemberProgressResponse]
    total: int
