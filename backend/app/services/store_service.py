from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from app.models.store import StoreProduct, StoreSale
from app.schemas.store import StoreProductCreate, StoreProductUpdate, StoreSaleCreate
from app.models.users import User


def get_products(
    db: Session, tenant_id: int, active_only: bool = True
) -> List[StoreProduct]:
    """Get all products for a tenant."""
    query = db.query(StoreProduct).filter(
        and_(StoreProduct.tenant_id == tenant_id, StoreProduct.is_deleted == False)
    )
    if active_only:
        query = query.filter(StoreProduct.is_active == True)
    return query.order_by(StoreProduct.name).all()


def get_product(db: Session, product_id: int, tenant_id: int) -> Optional[StoreProduct]:
    """Get a specific product."""
    return (
        db.query(StoreProduct)
        .filter(
            and_(
                StoreProduct.id == product_id,
                StoreProduct.tenant_id == tenant_id,
                StoreProduct.is_deleted == False,
            )
        )
        .first()
    )


def create_product(
    db: Session, product_in: StoreProductCreate, tenant_id: int
) -> StoreProduct:
    """Create a new product."""
    product = StoreProduct(**product_in.model_dump(), tenant_id=tenant_id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(
    db: Session, product_id: int, product_in: StoreProductUpdate, tenant_id: int
) -> Optional[StoreProduct]:
    """Update an existing product."""
    product = get_product(db, product_id, tenant_id)
    if not product:
        return None

    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int, tenant_id: int) -> bool:
    """Soft delete a product."""
    product = get_product(db, product_id, tenant_id)
    if not product:
        return False

    product.is_deleted = True
    db.commit()
    return True


def record_sale(
    db: Session, sale_in: StoreSaleCreate, tenant_id: int, user_id: int
) -> Optional[StoreSale]:
    """Record a new sale and update product quantity."""
    product = get_product(db, sale_in.product_id, tenant_id)
    if not product or product.quantity < sale_in.quantity:
        return None

    total_amount = Decimal(sale_in.quantity) * product.price

    sale = StoreSale(
        tenant_id=tenant_id,
        product_id=sale_in.product_id,
        quantity=sale_in.quantity,
        total_amount=total_amount,
        payment_method=sale_in.payment_method,
        sold_by=user_id,
    )

    # Update product stock
    product.quantity -= sale_in.quantity

    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


def get_sales(
    db: Session, tenant_id: int, skip: int = 0, limit: int = 100
) -> List[StoreSale]:
    """Get sales history for a tenant."""
    return (
        db.query(StoreSale)
        .filter(StoreSale.tenant_id == tenant_id)
        .order_by(StoreSale.sale_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_store_stats(db: Session, tenant_id: int) -> dict:
    """Get store statistics."""
    total_sales = (
        db.query(func.sum(StoreSale.total_amount), func.count(StoreSale.id))
        .filter(StoreSale.tenant_id == tenant_id)
        .first()
    )

    product_count = (
        db.query(func.count(StoreProduct.id))
        .filter(
            and_(StoreProduct.tenant_id == tenant_id, StoreProduct.is_deleted == False)
        )
        .scalar()
    )

    low_stock = (
        db.query(StoreProduct)
        .filter(
            and_(
                StoreProduct.tenant_id == tenant_id,
                StoreProduct.is_deleted == False,
                StoreProduct.quantity <= 5,  # Low stock threshold
            )
        )
        .all()
    )

    return {
        "total_sales_amount": total_sales[0] or Decimal(0),
        "total_sales_count": total_sales[1] or 0,
        "product_count": product_count or 0,
        "low_stock_products": low_stock,
    }
