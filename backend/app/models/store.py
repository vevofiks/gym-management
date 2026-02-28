from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Boolean,
    Numeric,
    Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class StoreProduct(Base):
    """
    Gym store products (e.g., Creatine, Protein, Tracksuits).
    """

    __tablename__ = "store_products"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, default=0, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    is_deleted = Column(Boolean, default=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    tenant = relationship("Tenant", back_populates="store_products")
    sales = relationship(
        "StoreSale", back_populates="product", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<StoreProduct(id={self.id}, name='{self.name}', price={self.price}, quantity={self.quantity})>"


class StoreSale(Base):
    """
    Tracks sales from the gym store.
    """

    __tablename__ = "store_sales"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        Integer, ForeignKey("store_products.id", ondelete="CASCADE"), nullable=False
    )
    quantity = Column(Integer, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(20), nullable=False)  # cash, upi, card
    sale_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    sold_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    tenant = relationship("Tenant", back_populates="store_sales")
    product = relationship("StoreProduct", back_populates="sales")
    seller = relationship("User")

    def __repr__(self) -> str:
        return f"<StoreSale(id={self.id}, product_id={self.product_id}, quantity={self.quantity}, amount={self.total_amount})>"
