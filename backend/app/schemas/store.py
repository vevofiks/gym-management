from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class StoreProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Decimal = Field(..., gt=0)
    quantity: int = Field(0, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: bool = True


class StoreProductCreate(StoreProductBase):
    pass


class StoreProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[Decimal] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class StoreProductResponse(StoreProductBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True


class StoreSaleBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    payment_method: str = Field(..., pattern="^(cash|upi|card)$")


class StoreSaleCreate(StoreSaleBase):
    pass


class StoreSaleResponse(BaseModel):
    id: int
    tenant_id: int
    product_id: int
    quantity: int
    total_amount: Decimal
    payment_method: str
    sale_date: datetime
    sold_by: int
    product_name: Optional[str] = None

    class Config:
        from_attributes = True


class StoreStats(BaseModel):
    total_sales_amount: Decimal
    total_sales_count: int
    product_count: int
    low_stock_products: List[StoreProductResponse]
