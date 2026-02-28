from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class WhatsAppSettings(Base):
    __tablename__ = "whatsapp_settings"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Feature toggles
    is_enabled = Column(Boolean, default=True)
    welcome_message_enabled = Column(Boolean, default=True)
    payment_receipt_enabled = Column(Boolean, default=True)
    membership_expiry_reminder_enabled = Column(Boolean, default=True)
    expiry_reminder_days = Column(Integer, default=3)

    # Relationship
    tenant = relationship("Tenant", backref="whatsapp_settings_backref")

    def __repr__(self) -> str:
        return f"<WhatsAppSettings(tenant_id={self.tenant_id}, is_enabled={self.is_enabled})>"
