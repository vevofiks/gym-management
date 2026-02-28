from typing import Optional, Dict, Any, List
import httpx
from datetime import date
from loguru import logger
from app.core.config import settings


class WhatsAppService:
    def __init__(self):
        self.base_url = settings.WPPCONNECT_BASE_URL
        self.secret_key = settings.WPPCONNECT_SECRET_KEY
        self.enabled = settings.WHATSAPP_ENABLED
        self._tokens: Dict[str, str] = {}  # Cache for session tokens

        if not self.base_url:
            logger.warning(
                "WPPConnect base URL not configured. Service will be disabled."
            )
            self.enabled = False

    def _get_api_url(self, session: str, endpoint: str) -> str:
        """Construct WPPConnect API URL for a given session and endpoint."""
        return f"{self.base_url}/api/{session}/{endpoint}"

    async def _get_token(self, session: str) -> Optional[str]:
        """Generate/Retrieve a token for the WPPConnect session."""
        if not self.secret_key:
            return None

        if session in self._tokens:
            return self._tokens[session]

        try:
            # URL encode the secret key to handle special characters like $, #, etc.
            from urllib.parse import quote

            encoded_key = quote(self.secret_key)

            # WPPConnect token generation endpoint: /api/:session/:secretkey/generate-token
            url = f"{self.base_url}/api/{session}/{encoded_key}/generate-token"
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url)
                response.raise_for_status()
                data = response.json()

                # WPPConnect usually returns token in 'token' or 'full' field
                token = data.get("token") or data.get("full")
                if token:
                    self._tokens[session] = token
                    return token
        except Exception as e:
            logger.error(f"Error generating WPPConnect token for {session}: {e}")
        return None

    async def _get_headers(self, session: str) -> Dict[str, str]:
        """Construct headers for WPPConnect API requests."""
        headers = {}
        token = await self._get_token(session)
        if token:
            headers["Authorization"] = f"Bearer {token}"
        elif self.secret_key:
            # Fallback for older versions or misconfigured servers
            headers["Authorization"] = f"Bearer {self.secret_key}"
        return headers

    def format_phone_number(self, phone: str) -> str:
        phone = "".join(filter(str.isdigit, phone))

        if not phone.startswith("91") and len(phone) == 10:
            phone = "91" + phone

        return phone

    async def get_status(self, tenant_id: int) -> Dict[str, Any]:
        """Check the status of the WhatsApp session for a tenant."""
        if not self.enabled:
            return {
                "success": False,
                "status": "disabled",
                "error": "WhatsApp service disabled",
            }

        try:
            session = f"tenant-{tenant_id}"
            url = self._get_api_url(session, "status-session")

            headers = await self._get_headers(session)
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=headers)
                if response.status_code == 404:
                    return {"success": True, "status": "not_initialized"}

                response.raise_for_status()
                result = response.json()
                # WPPConnect status can be: INITIALIZING, AUTHENTICATED, NOT_LOGGED, etc.
                status = result.get("status", "unknown")
                return {"success": True, "status": status, "data": result}
        except Exception as e:
            logger.error(f"Error checking WhatsApp status for tenant {tenant_id}: {e}")
            return {"success": False, "status": "error", "error": str(e)}

    async def get_qr_code(self, tenant_id: int) -> Dict[str, Any]:
        """Get the QR code for WhatsApp connection."""
        if not self.enabled:
            return {"success": False, "error": "WhatsApp service disabled"}

        try:
            session = f"tenant-{tenant_id}"

            # Optimization: Check status first. If it's already in QRCODE state, don't restart the session.
            status_res = await self.get_status(tenant_id)
            current_status = status_res.get("status")

            # Only "start" if it's explicitly not running or in error
            if current_status in [
                "not_initialized",
                "error",
                "CLOSED",
                "DISCONNECTED",
                "unknown",
            ]:
                logger.info(
                    f"Starting new search session for tenant {tenant_id} (current: {current_status})"
                )
                start_url = self._get_api_url(session, "start-session")
                headers = await self._get_headers(session)
                async with httpx.AsyncClient(timeout=15.0) as client:
                    await client.post(start_url, headers=headers)
            else:
                logger.info(
                    f"Session for tenant {tenant_id} already exists ({current_status}), skipping start."
                )

            # Now get QR
            qr_url = self._get_api_url(session, "qr-code")
            headers = await self._get_headers(session)
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(qr_url, headers=headers)

                if (
                    response.status_code == 200
                ):  # Using parenthesized condition for multi-line if
                    data = response.json()
                    qr_code = (
                        data.get("qrcode")
                        or data.get("url")
                        or data.get("qrCode")
                        or data.get("base64")
                    )

                    logger.info(
                        f"QR code retrieved for tenant {tenant_id} via dedicated endpoint."
                    )
                    return {"success": True, "data": {"qrCode": qr_code, "raw": data}}
                elif response.status_code == 404 or response.status_code == 400:
                    # Fallback: Check status-session, it often includes the QR code directly
                    logger.info(
                        f"QR endpoint {response.status_code} for tenant {tenant_id}, falling back to status check."
                    )
                    # Refresh status (wait a bit for it to generate)
                    # import asyncio
                    # await asyncio.sleep(1)
                    status_res = await self.get_status(tenant_id)
                    if status_res.get("success") and status_res.get("data"):
                        data = status_res["data"]
                        qr_code = (
                            data.get("qrcode")
                            or data.get("qrCode")
                            or data.get("base64")
                        )
                        if qr_code:
                            return {
                                "success": True,
                                "data": {"qrCode": qr_code, "raw": data},
                            }

                    return {
                        "success": False,
                        "error": "QR code not available yet. Please wait...",
                    }
                else:
                    logger.error(
                        f"Failed to retrieve QR code for tenant {tenant_id}: Status {response.status_code}"
                    )
                    return {
                        "success": False,
                        "error": f"Failed to retrieve QR code: {response.status_code}",
                    }
        except Exception as e:
            logger.error(f"Error getting QR code for tenant {tenant_id}: {e}")
            return {"success": False, "error": str(e)}

    async def logout(self, tenant_id: int) -> Dict[str, Any]:
        """Logout/Disconnect the WhatsApp session."""
        if not self.enabled:
            return {"success": False, "error": "WhatsApp service disabled"}

        try:
            session = f"tenant-{tenant_id}"
            url = self._get_api_url(session, "logout-session")

            headers = await self._get_headers(session)
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers)
                # Even if logout fails, we want to try closing the session
                if response.status_code != 200:
                    logger.warning(
                        f"Logout failed for {tenant_id}, force closing session..."
                    )
                    await self.close_session(tenant_id)
                    return {"success": True, "message": "Session reset/closed"}

                return {"success": True, "message": "Logged out successfully"}
        except Exception as e:
            logger.error(f"Error logging out WhatsApp for tenant {tenant_id}: {e}")
            # Try force close on error
            await self.close_session(tenant_id)
            return {"success": True, "message": "Session closed after error"}

    async def close_session(self, tenant_id: int) -> Dict[str, Any]:
        """Force close the WhatsApp session (kills browser instance)."""
        if not self.enabled:
            return {"success": False, "error": "WhatsApp service disabled"}

        try:
            session = f"tenant-{tenant_id}"
            url = self._get_api_url(session, "close-session")
            headers = await self._get_headers(session)

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers)
                return {"success": response.status_code == 200}
        except Exception as e:
            logger.error(f"Error closing WhatsApp session for tenant {tenant_id}: {e}")
            return {"success": False, "error": str(e)}

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
            logger.debug(f"WPPConnect Payload: {payload}")

            headers = await self._get_headers(session)
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()

                result = response.json()
                logger.info(
                    f"WPPConnect message sent to {phone_number} (tenant {tenant_id})"
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

            headers = await self._get_headers(session)
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
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
        gym_name: str,
    ) -> Dict[str, Any]:

        message = f"""🎉 *Welcome to {gym_name}!* 🎉

Hello {member_name}! 👋 Welcome to the {gym_name} family! 💪

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
        gym_name: str,
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
        gym_name: str,
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
        gym_name: str,
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
        gym_name: str,
        transaction_id: Optional[str] = None,
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
        gym_name: str,
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
        gym_name: str,
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
        logger.info(f"Dispatching diet plan '{diet_plan_name}' to {member_name}")
        return await self.send_text_message(
            db, tenant_id, phone_number, diet_plan_content
        )

    async def send_broadcast(
        self,
        db,
        tenant_id: int,
        phone_numbers: List[str],
        message: str,
    ) -> Dict[str, Any]:
        """Send a broadcast message to multiple recipients."""
        if not self.enabled:
            return {"success": False, "error": "WhatsApp service disabled"}

        # Check if tenant has WhatsApp feature access (Pro plan)
        from app.services.subscription_service import check_feature_access

        if not check_feature_access(db, tenant_id, "whatsapp"):
            return {
                "success": False,
                "error": "WhatsApp not available for your subscription plan",
            }

        success_count = 0
        failed_count = 0

        # WPPConnect handling of bulk sending. Sequential await for now.
        for phone in phone_numbers:
            try:
                result = await self.send_text_message(db, tenant_id, phone, message)
                if result.get("success"):
                    success_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                logger.error(f"Error in broadcast to {phone}: {e}")
                failed_count += 1

        return {
            "success": True,
            "success_count": success_count,
            "failed_count": failed_count,
            "total": len(phone_numbers),
        }


# Create a singleton instance
whatsapp_service = WhatsAppService()
