from typing import Optional, Dict, Any
import httpx
from datetime import date
from loguru import logger
from app.core.config import settings


class WhatsAppService:
    def __init__(self):
        self.base_url = settings.WPPCONNECT_BASE_URL
        self.secret_key = settings.WPPCONNECT_SECRET_KEY
        self.enabled = settings.WHATSAPP_ENABLED

        if not self.base_url:
            logger.warning(
                "WPPConnect base URL not configured. Service will be disabled."
            )
            self.enabled = False

    def _get_api_url(self, session: str, endpoint: str) -> str:
        """Construct WPPConnect API URL for a given session and endpoint."""
        return f"{self.base_url}/api/{session}/{endpoint}"

    def format_phone_number(self, phone: str) -> str:
        phone = "".join(filter(str.isdigit, phone))

        if not phone.startswith("91") and len(phone) == 10:
            phone = "91" + phone

        return phone

    async def send_text_message(
        self, db, tenant_id: int, phone_number: str, message: str
    ) -> Dict[str, Any]:
        """Send a text message via WPPConnect Server.

        Args:
            db: Database session for subscription checking
            tenant_id: Tenant ID for session naming and subscription verification
            phone_number: Recipient's phone number
            message: Message text to send

        Returns:
            Dict with success status and data/error
        """
        if not self.enabled:
            logger.warning("WPPConnect service is disabled. Message not sent.")
            return {"success": False, "error": "WhatsApp service disabled"}

        # Check if tenant has WhatsApp feature access (Pro plan)
        from app.services.subscription_service import check_feature_access

        if not check_feature_access(db, tenant_id, "whatsapp"):
            logger.warning(
                f"Tenant {tenant_id} does not have WhatsApp access. Message not sent."
            )
            return {
                "success": False,
                "error": "WhatsApp not available for your subscription plan",
            }

        try:
            formatted_phone = self.format_phone_number(phone_number)
            session = f"tenant-{tenant_id}"
            url = self._get_api_url(session, "send-message")

            payload = {"phone": formatted_phone, "message": message}

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()

                result = response.json()
                logger.info(
                    f"WPPConnect message sent to {phone_number} (tenant {tenant_id}): {result}"
                )
                return {"success": True, "data": result}

        except httpx.ConnectError as e:
            logger.error(
                f"WPPConnect server connection error for tenant {tenant_id}: {e}"
            )
            return {
                "success": False,
                "error": "WhatsApp server is currently unavailable",
            }
        except httpx.TimeoutException as e:
            logger.error(
                f"WPPConnect timeout sending message to {phone_number} (tenant {tenant_id}): {e}"
            )
            return {"success": False, "error": "WhatsApp server timeout"}
        except httpx.HTTPStatusError as e:
            logger.error(
                f"HTTP error sending WPPConnect message to {phone_number} (tenant {tenant_id}): {e}"
            )
            return {"success": False, "error": str(e)}
        except Exception as e:
            logger.error(
                f"Error sending WPPConnect message to {phone_number} (tenant {tenant_id}): {e}"
            )
            return {"success": False, "error": str(e)}

    async def send_image_message(
        self,
        db,
        tenant_id: int,
        phone_number: str,
        image_url: str,
        caption: Optional[str] = None,
    ) -> Dict[str, Any]:

        if not self.enabled:
            logger.warning("WPPConnect service is disabled. Image not sent.")
            return {"success": False, "error": "WhatsApp service disabled"}

        # Check if tenant has WhatsApp feature access (Pro plan)
        from app.services.subscription_service import check_feature_access

        if not check_feature_access(db, tenant_id, "whatsapp"):
            logger.warning(
                f"Tenant {tenant_id} does not have WhatsApp access. Image not sent."
            )
            return {
                "success": False,
                "error": "WhatsApp not available for your subscription plan",
            }

        try:
            formatted_phone = self.format_phone_number(phone_number)
            session = f"tenant-{tenant_id}"
            url = self._get_api_url(session, "send-image")

            payload = {
                "phone": formatted_phone,
                "path": image_url,
            }

            if caption:
                payload["caption"] = caption

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()

                result = response.json()
                logger.info(
                    f"WPPConnect image sent to {phone_number} (tenant {tenant_id}): {result}"
                )
                return {"success": True, "data": result}

        except httpx.ConnectError as e:
            logger.error(
                f"WPPConnect server connection error for tenant {tenant_id}: {e}"
            )
            return {
                "success": False,
                "error": "WhatsApp server is currently unavailable",
            }
        except httpx.TimeoutException as e:
            logger.error(
                f"WPPConnect timeout sending image to {phone_number} (tenant {tenant_id}): {e}"
            )
            return {"success": False, "error": "WhatsApp server timeout"}
        except httpx.HTTPStatusError as e:
            logger.error(
                f"HTTP error sending WPPConnect image to {phone_number} (tenant {tenant_id}): {e}"
            )
            return {"success": False, "error": str(e)}
        except Exception as e:
            logger.error(
                f"Error sending WPPConnect image to {phone_number} (tenant {tenant_id}): {e}"
            )
            return {"success": False, "error": str(e)}

    # ==================== Message Templates ====================

    async def send_welcome_message(
        self,
        db,
        tenant_id: int,
        phone_number: str,
        member_name: str,
        membership_type: str,
        joining_date: date,
        expiry_date: date,
        gym_name: str = "Our Gym",
    ) -> Dict[str, Any]:

        message = f"""🎉 *Welcome to {gym_name}!* 🎉

Hello {member_name}! 👋

We're thrilled to have you join our fitness family! 💪

📋 *Membership Details:*
• Plan: {membership_type}
• Start Date: {joining_date.strftime('%d %B %Y')}
• Valid Until: {expiry_date.strftime('%d %B %Y')}

Your fitness journey starts now! Our team is here to support you every step of the way.

If you have any questions, feel free to reach out to us.

Let's achieve your fitness goals together! 🏋️‍♂️

Best regards,
{gym_name} Team"""

        return await self.send_text_message(db, tenant_id, phone_number, message)

    async def send_renewal_confirmation(
        self,
        db,
        tenant_id: int,
        phone_number: str,
        member_name: str,
        membership_type: str,
        new_expiry_date: date,
        gym_name: str = "Our Gym",
    ) -> Dict[str, Any]:

        message = f"""✅ *Membership Renewed Successfully!* ✅

Hello {member_name}! 👋

Your membership has been renewed. Thank you for continuing your fitness journey with us! 💪

📋 *Renewal Details:*
• Plan: {membership_type}
• Valid Until: {new_expiry_date.strftime('%d %B %Y')}

Keep up the great work! We're excited to see you achieve your fitness goals.

Best regards,
{gym_name} Team"""

        return await self.send_text_message(db, tenant_id, phone_number, message)

    async def send_payment_confirmation(
        self,
        db,
        tenant_id: int,
        phone_number: str,
        member_name: str,
        amount: float,
        payment_method: str,
        payment_date: date,
        gym_name: str = "Our Gym",
    ) -> Dict[str, Any]:
        message = f"""💰 *Payment Received* 💰

Hello {member_name}! 👋

We have received your payment. Thank you! 🙏

📋 *Payment Details:*
• Amount: ₹{amount:.2f}
• Method: {payment_method}
• Date: {payment_date.strftime('%d %B %Y')}

This is your payment confirmation. Please keep this for your records.

Best regards,
{gym_name} Team"""

        return await self.send_text_message(db, tenant_id, phone_number, message)

    async def send_expiry_reminder(
        self,
        db,
        tenant_id: int,
        phone_number: str,
        member_name: str,
        expiry_date: date,
        days_remaining: int,
        gym_name: str = "Our Gym",
    ) -> Dict[str, Any]:
        message = f"""⏰ *Membership Expiry Reminder* ⏰

Hello {member_name}! 👋

Your membership is expiring soon. Don't let your fitness journey stop! 💪

📋 *Membership Status:*
• Expiry Date: {expiry_date.strftime('%d %B %Y')}
• Days Remaining: {days_remaining} days

Please renew your membership to continue enjoying our facilities and services.

Contact us today to renew! 📞

Best regards,
{gym_name} Team"""

        return await self.send_text_message(db, tenant_id, phone_number, message)

    async def send_payment_receipt(
        self,
        db,
        tenant_id: int,
        phone_number: str,
        member_name: str,
        amount_paid: float,
        original_amount: float,
        outstanding_dues: float,
        payment_method: str,
        payment_date: date,
        transaction_id: Optional[str] = None,
        gym_name: str = "Our Gym",
    ) -> Dict[str, Any]:
        payment_status = (
            "✅ *PAID IN FULL*" if outstanding_dues == 0 else "⚠️ *PARTIAL PAYMENT*"
        )

        message = f"""📄 *PAYMENT RECEIPT* 📄

Hello {member_name}! 👋

Thank you for your payment! Here are your payment details:

{payment_status}

💰 *Payment Breakdown:*
• Original Amount: ₹{original_amount:.2f}
• Amount Paid: ₹{amount_paid:.2f}
• Outstanding Dues: ₹{outstanding_dues:.2f}

📋 *Transaction Details:*
• Payment Method: {payment_method}
• Payment Date: {payment_date.strftime('%d %B %Y')}"""

        if transaction_id:
            message += f"\n• Transaction ID: {transaction_id}"

        if outstanding_dues > 0:
            message += f"""

💡 *Note:* You have an outstanding balance of ₹{outstanding_dues:.2f}. We'll send you a reminder mid-month to help you stay on track.

Please clear your dues at your earliest convenience."""

        message += f"""

Thank you for being a valued member! 💪

Best regards,
{gym_name} Team"""

        return await self.send_text_message(db, tenant_id, phone_number, message)

    async def send_due_reminder(
        self,
        db,
        tenant_id: int,
        phone_number: str,
        member_name: str,
        original_amount: float,
        amount_paid: float,
        outstanding_dues: float,
        payment_date: date,
        gym_name: str = "Our Gym",
    ) -> Dict[str, Any]:
        message = f"""🔔 *Payment Reminder* 🔔

Hello {member_name}! 👋

This is a friendly reminder about your outstanding membership dues.

💰 *Payment Summary:*
• Total Amount: ₹{original_amount:.2f}
• Amount Paid: ₹{amount_paid:.2f} (on {payment_date.strftime('%d %B %Y')})
• Outstanding Balance: ₹{outstanding_dues:.2f}

We kindly request you to clear your remaining dues at your earliest convenience to continue enjoying uninterrupted access to our facilities.

📞 If you have any questions or need assistance, please feel free to contact us.

Thank you for your cooperation! 💪

Best regards,
{gym_name} Team"""

        return await self.send_text_message(db, tenant_id, phone_number, message)

    async def send_diet_plan(
        self,
        db,
        tenant_id: int,
        phone_number: str,
        member_name: str,
        diet_plan_name: str,
        diet_plan_content: str,
        gym_name: str = "Our Gym",
    ) -> Dict[str, Any]:
        """
        Send a diet plan to a member via WhatsApp.

        Args:
            db: Database session
            tenant_id: Tenant ID
            phone_number: Member's phone number
            member_name: Member's full name
            diet_plan_name: Name of the diet plan
            diet_plan_content: Formatted diet plan message content
            gym_name: Name of the gym

        Returns:
            API response dictionary
        """
        # The diet_plan_content is already formatted by diet_plan_service
        # We just need to send it as-is
        return await self.send_text_message(
            db, tenant_id, phone_number, diet_plan_content
        )


# Create a singleton instance
whatsapp_service = WhatsAppService()
