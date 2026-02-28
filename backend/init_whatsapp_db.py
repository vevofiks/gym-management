import sys
import os

# Add the current directory to sys.path to allow importing from 'app'
sys.path.append(os.getcwd())

from app.core.database import engine, Base
from app.models.whatsapp_settings import WhatsAppSettings

print("Creating original table if it doesn't exist...")
try:
    Base.metadata.create_all(bind=engine)
    print("WhatsAppSettings table ensured successfully.")
except Exception as e:
    print(f"Error creating table: {e}")
