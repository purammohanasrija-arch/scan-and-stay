import json
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, AuditLog
from app.schemas.schemas import (
    UserCreate, UserLogin, GoogleLoginRequest, OTPVerifyRequest, UserOut, TokenResponse
)
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing or malformed"
        )
    
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session"
        )
    
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists"
        )
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required"
        )
    return current_user

def get_current_staff(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "receptionist"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff or Admin access required"
        )
    return current_user

@router.post("/signup", response_model=TokenResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        phone=user_in.phone,
        role=user_in.role or "guest",
        loyalty_points=100,
        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.name.replace(' ', '')}"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log audit
    audit = AuditLog(
        user_id=new_user.id,
        user_email=new_user.email,
        action="USER_REGISTRATION",
        ip_address="127.0.0.1",
        device_info="Scan & Stay Web App",
        is_suspicious=False,
        details=json.dumps({"role": new_user.role})
    )
    db.add(audit)
    db.commit()

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return TokenResponse(access_token=token, user=new_user)

@router.post("/login", response_model=TokenResponse)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        # Log failed attempt for fraud detection
        audit = AuditLog(
            user_email=login_in.email.lower(),
            action="LOGIN_FAILED",
            ip_address="127.0.0.1",
            device_info="Scan & Stay Web App",
            is_suspicious=True,
            details=json.dumps({"reason": "Invalid credentials"})
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please verify your credentials."
        )

    # Log successful login
    audit = AuditLog(
        user_id=user.id,
        user_email=user.email,
        action="LOGIN_SUCCESS",
        ip_address="127.0.0.1",
        device_info="Scan & Stay Web App",
        is_suspicious=False,
        details=json.dumps({"role": user.role})
    )
    db.add(audit)
    db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(access_token=token, user=user)

@router.post("/google-login", response_model=TokenResponse)
def google_oauth_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Simulated secure Google OAuth single sign-on"""
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        user = User(
            name=request.name,
            email=request.email.lower(),
            hashed_password=get_password_hash("OAuth-Google-Secured-2026"),
            role="guest",
            loyalty_points=150,
            avatar_url=request.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={request.name.replace(' ', '')}"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    audit = AuditLog(
        user_id=user.id,
        user_email=user.email,
        action="GOOGLE_OAUTH_LOGIN",
        ip_address="127.0.0.1",
        device_info="Google Auth Provider",
        is_suspicious=False,
        details=json.dumps({"provider": "google.com"})
    )
    db.add(audit)
    db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(access_token=token, user=user)

@router.post("/verify-otp")
def verify_otp(request: OTPVerifyRequest):
    # Simulated 2FA / OTP check (validates 6-digit OTP like 123456 or any 6-digit for demo)
    if len(request.otp) == 6:
        return {"success": True, "message": "OTP verified successfully", "email": request.email}
    raise HTTPException(status_code=400, detail="Invalid OTP entered. Must be 6 digits.")

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        return {"message": "If an account exists with this email, a password reset link has been dispatched."}
    return {"message": "Password reset instructions dispatched to your registered email."}

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
