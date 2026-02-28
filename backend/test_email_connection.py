import smtplib
from email.mime.text import MIMEText
from app.core.config import settings


def test_email_connection():
    print(f"Testing SMTP connection for {settings.MAIL_USERNAME}...")

    if not settings.MAIL_PASSWORD or "INSERT_YOUR" in settings.MAIL_PASSWORD:
        print(
            "ERROR: MAIL_PASSWORD is not set or still contains the placeholder in .env"
        )
        return

    msg = MIMEText(
        "This is a test email from FitDash backend to verify SMTP configuration."
    )
    msg["Subject"] = "FitDash SMTP Test"
    msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
    msg["To"] = settings.MAIL_USERNAME  # Send to self

    try:
        print(f"Connecting to {settings.MAIL_SERVER}:{settings.MAIL_PORT}...")
        server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
        if settings.MAIL_STARTTLS:
            print("Starting TLS...")
            server.starttls()

        print(f"Logging in as {settings.MAIL_USERNAME}...")
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)

        print("Sending test message...")
        server.send_message(msg)
        server.quit()
        print("SUCCESS: Email sent successfully!")
    except Exception as e:
        print(f"FAILURE: Could not send email. Error: {e}")


if __name__ == "__main__":
    test_email_connection()
