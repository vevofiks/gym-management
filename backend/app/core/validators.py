import re
from typing import Any


def validate_email(email: str) -> str:
    """
    Validate email format.

    Args:
        email: Email address to validate

    Returns:
        Validated email in lowercase

    Raises:
        ValueError: If email format is invalid
    """
    email = email.lower().strip()
    email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if not re.match(email_regex, email):
        raise ValueError("Invalid email format")

    return email


def validate_phone_number(phone: str) -> str:
    """
    Validate phone number format (International E.164 format).
    Normalizes to +[country_code][number]

    Args:
        phone: Phone number to validate

    Returns:
        Validated and normalized phone number

    Raises:
        ValueError: If phone format is invalid
    """
    # Remove all non-digit characters except '+'
    normalized = "".join(c for c in phone if c.isdigit() or c == "+")

    if not normalized:
        raise ValueError("Phone number cannot be empty")

    # If it doesn't start with +, assume international code might be missing
    # but for wppconnect it's better to be explicit.
    # We will enforce starting with + or at least 10 digits
    if normalized.startswith("+"):
        if len(normalized) < 8 or len(normalized) > 16:
            raise ValueError("Invalid international phone number length")
    else:
        # Fallback for 10-digit local numbers (defaulting to +91 for India if not specified)
        # However, the user wants to be CAREFUL, so let's require + for clarity or handle 10 digits
        if len(normalized) == 10:
            normalized = f"+91{normalized}"
        elif len(normalized) > 10 and len(normalized) <= 15:
            normalized = f"+{normalized}"
        else:
            raise ValueError("Phone number must include country code (e.g., +91...)")

    # Final check for digits after +
    if not re.match(r"^\+\d{7,15}$", normalized):
        raise ValueError(
            "Invalid phone number format. Use E.164 format (e.g., +919876543210)"
        )

    return normalized


def validate_password_strength(password: str) -> str:
    """
    Validate password strength.
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character

    Args:
        password: Password to validate

    Returns:
        Validated password

    Raises:
        ValueError: If password doesn't meet requirements
    """
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")

    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")

    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")

    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit")

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValueError("Password must contain at least one special character")

    return password


def validate_username(username: str) -> str:
    """
    Validate username format.
    Requirements:
    - 3-30 characters
    - Only alphanumeric, underscore, and hyphen
    - Must start with a letter

    Args:
        username: Username to validate

    Returns:
        Validated username in lowercase

    Raises:
        ValueError: If username format is invalid
    """
    username = username.lower().strip()

    if len(username) < 3 or len(username) > 30:
        raise ValueError("Username must be between 3 and 30 characters")

    if not re.match(r"^[a-z][a-z0-9_-]*$", username):
        raise ValueError(
            "Username must start with a letter and contain only letters, numbers, underscore, or hyphen"
        )

    return username


def validate_upi_id(upi_id: str) -> str:
    """
    Validate UPI ID format.
    Format: username@bankname

    Args:
        upi_id: UPI ID to validate

    Returns:
        Validated UPI ID

    Raises:
        ValueError: If UPI ID format is invalid
    """
    upi_id = upi_id.strip()

    if not re.match(r"^[\w.-]+@[\w.-]+$", upi_id):
        raise ValueError("Invalid UPI ID format. Expected format: username@bank")

    return upi_id


def validate_url(url: str) -> str:
    """
    Validate URL format.

    Args:
        url: URL to validate

    Returns:
        Validated URL

    Raises:
        ValueError: If URL format is invalid
    """
    url = url.strip()
    url_regex = r"^https?://[\w\-]+(\.[\w\-]+)+[/#?]?.*$"

    if not re.match(url_regex, url):
        raise ValueError("Invalid URL format")

    return url
