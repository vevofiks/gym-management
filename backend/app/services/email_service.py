import random
import string
from datetime import datetime, timedelta
from loguru import logger
from typing import Optional


def generate_otp(length: int = 6) -> str:
    """Generate a random numeric OTP."""
    return "".join(random.choices(string.digits, k=length))


import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


class EmailService:
    @staticmethod
    def send_otp_email(email: str, otp: str):
        """
        Sends an OTP email to the user using SMTP.
        """
        logger.info(f"Attempting to send OTP email to {email}")

        # If no SMTP credentials, log to console and return (for dev/testing)
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            logger.warning("SMTP credentials not configured. Logging OTP to console.")
            logger.info(f"--- EMAIL SERVICE: OTP for {email} is {otp} ---")
            return True

        try:
            msg = MIMEMultipart()
            msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
            msg["To"] = email
            msg["Subject"] = f"{otp} is your FitDash verification code"

            body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; rounded: 10px;">
                        <h2 style="color: #4F46E5; text-align: center;">FitDash Verification Code</h2>
                        <p>Hello,</p>
                        <p>You recently requested to reset your password. Use the verification code below to proceed:</p>
                        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; margin: 20px 0; border-radius: 8px;">
                            {otp}
                        </div>
                        <p>This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2026 FitDash Admin. All rights reserved.</p>
                    </div>
                </body>
            </html>
            """
            msg.attach(MIMEText(body, "html"))

            server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
            if settings.MAIL_STARTTLS:
                server.starttls()

            server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
            server.send_message(msg)
            server.quit()

            logger.info(f"Successfully sent OTP email to {email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {e}")
            # Fallback for development if configured incorrectly
            logger.info(f"--- FALLBACK: OTP for {email} is {otp} ---")
            return False


email_service = EmailService()
