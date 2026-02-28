import razorpay
from app.core.config import settings
from loguru import logger
from typing import Optional, Dict, Any

# Initialize Razorpay Client
client = None
if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
    try:
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        logger.info("✅ Razorpay client initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize Razorpay client: {e}")


def create_razorpay_order(
    amount: float, receipt: str, currency: str = "INR"
) -> Optional[Dict[str, Any]]:
    """
    Create a Razorpay order.

    Args:
        amount: Amount in Rupees
        receipt: Internal receipt/payment ID
        currency: Default "INR"

    Returns:
        Razorpay order dict if success, else None
    """
    if not client:
        logger.error("Razorpay client not initialized")
        return None

    try:
        # Amount must be in Paisa
        data = {
            "amount": int(amount * 100),
            "currency": currency,
            "receipt": receipt,
            "payment_capture": 1,  # Auto capture
        }
        order = client.order.create(data=data)
        logger.info(f"✅ Razorpay order created: {order['id']}")
        return order
    except Exception as e:
        logger.error(f"❌ Error creating Razorpay order: {e}")
        return None


def verify_razorpay_signature(
    razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str
) -> bool:
    """
    Verify the signature received from Razorpay after payment.
    """
    if not client:
        return False

    try:
        params_dict = {
            "razorpay_order_id": razorpay_order_id,
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
        }
        client.utility.verify_payment_signature(params_dict)
        logger.info(f"✅ Razorpay signature verified for order {razorpay_order_id}")
        return True
    except Exception as e:
        logger.error(f"❌ Razorpay signature verification failed: {e}")
        return False
