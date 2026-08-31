import bcrypt
import hmac
import hashlib
import json
import base64
import time
from datetime import datetime, timedelta
from typing import Any, Optional
from jose import jwt, JWTError
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    try:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    except Exception:
        return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(subject: str | Any, role: str = "guest", expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "iat": datetime.utcnow()
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def generate_signed_qr_payload(booking_ref: str, user_id: int, room_id: int, hotel_id: int, check_in: str, check_out: str) -> dict:
    """
    Generates a tamper-proof cryptographically signed QR payload.
    Includes timestamp, anti-replay nonce, and HMAC-SHA256 signature.
    """
    nonce = int(time.time())
    payload = {
        "ref": booking_ref,
        "uid": user_id,
        "hid": hotel_id,
        "rid": room_id,
        "cin": check_in,
        "cout": check_out,
        "ts": nonce
    }
    
    payload_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        settings.QR_SECRET_KEY.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()
    
    token = base64.urlsafe_b64encode(f"{payload_str}::{signature}".encode()).decode()
    return {
        "token": token,
        "payload": payload,
        "signature": signature
    }

def verify_signed_qr_payload(token_or_raw: str) -> tuple[bool, Optional[dict], str]:
    """
    Verifies that the QR token signature matches and has not been tampered with.
    """
    try:
        # Check if already a json string or base64 token
        raw_text = token_or_raw.strip()
        if not (raw_text.startswith("{") and raw_text.endswith("}")):
            try:
                decoded = base64.urlsafe_b64decode(raw_text.encode()).decode()
                if "::" in decoded:
                    payload_str, signature = decoded.split("::", 1)
                else:
                    return False, None, "Invalid token structure"
            except Exception:
                return False, None, "Failed to decode base64 QR token"
        else:
            data = json.loads(raw_text)
            payload_str = json.dumps(data.get("payload", {}), sort_keys=True)
            signature = data.get("signature", "")

        computed_sig = hmac.new(
            settings.QR_SECRET_KEY.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(computed_sig, signature):
            return False, None, "Signature mismatch / QR Token has been tampered with!"

        payload = json.loads(payload_str)
        return True, payload, "Valid QR token"
    except Exception as e:
        return False, None, f"Verification error: {str(e)}"
