import os
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Optional Firebase import
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    firebase_admin = None
    firestore = None

logger = logging.getLogger(__name__)

class FirebaseClientFallback:
    """Fallback in-memory logger when Firebase is missing."""
    def __init__(self):
        self.local_memory = []
        self.is_active = False
        print("🔴 [DEMO MODE] Firebase credentials missing. Using in-memory fallback.")

    def log_scan_event(self, event_data: dict) -> None:
        self.local_memory.append(event_data)
        
    def log_unknown_pattern(self, pattern_data: dict) -> None:
        self.local_memory.append(pattern_data)

class FirebaseClientTrue:
    """Production Firebase integration."""
    def __init__(self, db):
        self.db = db
        self.is_active = True
        print("🟢 [PROD MODE] Firebase Admin initialized via Firestore.")

    def log_scan_event(self, event_data: dict) -> None:
        try:
            self.db.collection('logs').add(event_data)
        except Exception as e:
            logger.error(f"Firebase logging failed: {e}")

    def log_unknown_pattern(self, pattern_data: dict) -> None:
        try:
            self.db.collection('unknown_patterns').add(pattern_data)
        except Exception as e:
            logger.error(f"Firebase unknown pattern logging failed: {e}")

def get_firebase_client():
    if not firebase_admin:
        return FirebaseClientFallback()
        
    # Priority 1: Inline JSON (Vercel standard)
    cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
    # Priority 2: File Path
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "backend/firebase-admin-sdk.json")
    
    try:
        if cred_json:
            # Parse the inline JSON
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
        elif os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            return FirebaseClientFallback()
            
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        return FirebaseClientTrue(db)
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return FirebaseClientFallback()

# Singleton instance
firebase_client = get_firebase_client()
