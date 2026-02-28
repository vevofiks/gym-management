from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import UploadFile, File

from app.core.database import get_db
from app.models.users import User
from app.core.deps import get_current_gym_user, get_current_gym_owner
from app.schemas.store import (
    StoreProductCreate,
    StoreProductUpdate,
    StoreProductResponse,
    StoreSaleCreate,
    StoreSaleResponse,
    StoreStats,
)
from app.services import store_service, upload_service
from app.services.subscription_service import check_feature_access


router = APIRouter(prefix="/store", tags=["Store"])


def check_store_access(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_gym_user)
):
    """Dependency to check if the store feature is enabled for the tenant."""
    if not check_feature_access(db, current_user.tenant_id, "store"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Store feature is not enabled for your current plan. Please upgrade to Pro.",
        )
    return current_user


@router.get("/products", response_model=List[StoreProductResponse])
def list_products(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_store_access),
):
    """List all store products."""
    return store_service.get_products(db, current_user.tenant_id, active_only)


@router.post(
    "/products",
    response_model=StoreProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product_in: StoreProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
    _access=Depends(check_store_access),
):
    """Create a new product (Gym Owner only)."""
    return store_service.create_product(db, product_in, current_user.tenant_id)


@router.get("/products/{product_id}", response_model=StoreProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_store_access),
):
    """Get product details."""
    product = store_service.get_product(db, product_id, current_user.tenant_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/products/{product_id}", response_model=StoreProductResponse)
def update_product(
    product_id: int,
    product_in: StoreProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
    _access=Depends(check_store_access),
):
    """Update a product (Gym Owner only)."""
    product = store_service.update_product(
        db, product_id, product_in, current_user.tenant_id
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
    _access=Depends(check_store_access),
):
    """Delete a product (Gym Owner only)."""
    success = store_service.delete_product(db, product_id, current_user.tenant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")


@router.post(
    "/sales", response_model=StoreSaleResponse, status_code=status.HTTP_201_CREATED
)
def record_sale(
    sale_in: StoreSaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_store_access),
):
    """Record a sale and update product quantity."""
    sale = store_service.record_sale(
        db, sale_in, current_user.tenant_id, current_user.id
    )
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sale failed: Product not found or insufficient stock.",
        )
    return sale


@router.get("/sales", response_model=List[StoreSaleResponse])
def list_sales(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_store_access),
):
    """Get sales history."""
    sales = store_service.get_sales(db, current_user.tenant_id, skip, limit)
    # Add product name for better frontend experience
    for sale in sales:
        sale.product_name = sale.product.name if sale.product else "Deleted Product"
    return sales


@router.get("/stats", response_model=StoreStats)
def get_store_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_gym_owner),
    _access=Depends(check_store_access),
):
    """Get store statistics (Gym Owner only)."""
    return store_service.get_store_stats(db, current_user.tenant_id)


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_gym_owner),
    _access=Depends(check_store_access),
):
    """Upload a product image and return the filename."""
    filename = upload_service.save_upload_file(file)
    return {"filename": filename, "url": f"/uploads/{filename}"}
