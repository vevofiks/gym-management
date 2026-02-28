import os
import uuid
from fastapi import UploadFile, HTTPException
from app.core.config import settings
import shutil

# Configure upload directory
UPLOAD_DIR = "/home/amraz/My Works/vevofiks/gym-management/backend/uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def save_upload_file(upload_file: UploadFile) -> str:
    """
    Save an uploaded file to the local directory and return the unique filename.
    """
    # Create directory if it doesn't exist
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Validate file extension
    file_ext = os.path.splitext(upload_file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save the file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    return unique_filename


def get_image_url(filename: str) -> str:
    """
    Return the public URL for the image.
    Note: Assuming static files are served at /uploads
    """
    if not filename:
        return ""
    # In production, this might be a CDN or full URL
    return f"/uploads/{filename}"
