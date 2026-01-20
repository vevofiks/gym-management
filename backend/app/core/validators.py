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
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_regex, email):
        raise ValueError("Invalid email format")
    
    return email


def validate_phone_number(phone: str) -> str:
    """
    Validate phone number format (Indian format).
    Accepts: +91XXXXXXXXXX, 91XXXXXXXXXX, or XXXXXXXXXX
    
    Args:
        phone: Phone number to validate
        
    Returns:
        Validated phone number
        
    Raises:
        ValueError: If phone format is invalid
    """
    phone = phone.strip().replace(" ", "").replace("-", "")
    
    # Remove +91 or 91 prefix if present
    if phone.startswith("+91"):
        phone = phone[3:]
    elif phone.startswith("91") and len(phone) == 12:
        phone = phone[2:]
    
    # Validate 10 digit number
    if not re.match(r'^[6-9]\d{9}$', phone):
        raise ValueError("Invalid phone number. Must be 10 digits starting with 6-9")
    
    return phone


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
    
    if not re.search(r'[A-Z]', password):
        raise ValueError("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        raise ValueError("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
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
    
    if not re.match(r'^[a-z][a-z0-9_-]*$', username):
        raise ValueError("Username must start with a letter and contain only letters, numbers, underscore, or hyphen")
    
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
    
    if not re.match(r'^[\w.-]+@[\w.-]+$', upi_id):
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
    url_regex = r'^https?://[\w\-]+(\.[\w\-]+)+[/#?]?.*$'
    
    if not re.match(url_regex, url):
        raise ValueError("Invalid URL format")
    
    return url
