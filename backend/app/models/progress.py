from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    Date,
    ForeignKey,
    DateTime,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class MemberProgress(Base):
    __tablename__ = "member_progress"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(
        Integer,
        ForeignKey("members.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    measurement_date = Column(Date, nullable=False, default=func.current_date())

    # Measurements
    weight = Column(Numeric(5, 2), nullable=True)  # in kg
    height = Column(Numeric(5, 2), nullable=True)  # in cm
    bmi = Column(Numeric(4, 1), nullable=True)
    body_fat_percentage = Column(Numeric(4, 1), nullable=True)

    # Body measurements (optional, in inches or cm)
    chest = Column(Numeric(5, 2), nullable=True)
    waist = Column(Numeric(5, 2), nullable=True)
    hips = Column(Numeric(5, 2), nullable=True)
    arms = Column(Numeric(5, 2), nullable=True)
    thighs = Column(Numeric(5, 2), nullable=True)

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    member = relationship("Member")
    tenant = relationship("Tenant")

    def __repr__(self) -> str:
        return f"<MemberProgress(member_id={self.member_id}, date={self.measurement_date}, weight={self.weight})>"
