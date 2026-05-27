"""Authentication routes — register / login / phone OTP / social / refresh."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import get_settings
from app.core.rate_limit import check_rate
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import (
    RegisterIn,
    LoginIn,
    TokenOut,
    RefreshIn,
    PhoneOTPRequestIn,
    PhoneOTPVerifyIn,
    SocialLoginIn,
    UserOut,
)
from app.services import otp_service
from app.services.geo import get_country_code

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _issue_tokens(user: User, response: Response | None = None) -> TokenOut:
    access = create_access_token(subject=str(user.id), role=user.role)
    refresh = create_refresh_token(subject=str(user.id))
    if response is not None:
        # HTTP-only, secure cookie for refresh token
        response.set_cookie(
            key="refresh_token",
            value=refresh,
            max_age=settings.REFRESH_TOKEN_DAYS * 86400,
            httponly=True,
            secure=True,
            samesite="lax",
            path="/",
        )
    return TokenOut(
        access_token=access,
        refresh_token=refresh,
        user=UserOut.model_validate(user),
    )


def _rate_limit_auth(request: Request, key_prefix: str = "auth"):
    ip = request.client.host if request.client else "unknown"
    ok = check_rate(f"{key_prefix}:{ip}", settings.AUTH_RATE_LIMIT_PER_MIN, 60)
    if not ok:
        raise HTTPException(status_code=429, detail="Too many requests, please slow down.")


@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn, request: Request, response: Response, db: Session = Depends(get_db)):
    _rate_limit_auth(request, "register")
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
        country_code=(payload.country_code or get_country_code(request)).upper(),
        role="user",
        provider="local",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _issue_tokens(user, response)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    _rate_limit_auth(request, "login")
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return _issue_tokens(user, response)


@router.post("/otp/request")
def otp_request(payload: PhoneOTPRequestIn, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    if not check_rate(f"otp:{ip}:{payload.phone}", settings.OTP_RATE_LIMIT_PER_HOUR, 3600):
        raise HTTPException(status_code=429, detail="OTP rate limit exceeded. Try again later.")
    code = otp_service.generate_otp(db, payload.phone, payload.purpose)
    # MOCKED: in production we wouldn't return the code.
    return {"sent": True, "mocked_code": code, "expires_in_seconds": 300}


@router.post("/otp/verify", response_model=TokenOut)
def otp_verify(payload: PhoneOTPVerifyIn, request: Request, response: Response, db: Session = Depends(get_db)):
    _rate_limit_auth(request, "otp_verify")
    ok = otp_service.verify_otp(db, payload.phone, payload.code, purpose="login")
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        # Auto-provision phone-only user
        user = User(
            phone=payload.phone,
            name=f"User {payload.phone[-4:]}",
            role="user",
            provider="phone",
            country_code=get_country_code(request),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return _issue_tokens(user, response)


@router.post("/social", response_model=TokenOut)
def social_login(payload: SocialLoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    """MOCKED Google / Apple login.

    We accept any non-empty provider_token and either look up or create the
    matching user.  In production this endpoint would validate the token with
    Google / Apple key sets.
    """
    if payload.provider not in {"google", "apple"}:
        raise HTTPException(status_code=400, detail="Unsupported social provider")
    if not payload.provider_token:
        raise HTTPException(status_code=400, detail="Missing provider_token")

    user = None
    if payload.email:
        user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        synthesized_email = payload.email or f"{payload.provider}_{payload.provider_token[:16]}@social.local"
        user = User(
            email=synthesized_email,
            name=payload.name or payload.provider.title() + " User",
            role="user",
            provider=payload.provider,
            country_code=(payload.country_code or get_country_code(request)).upper(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return _issue_tokens(user, response)


@router.post("/refresh", response_model=TokenOut)
def refresh(payload: RefreshIn | None, request: Request, response: Response, db: Session = Depends(get_db)):
    token_value = None
    if payload and payload.refresh_token:
        token_value = payload.refresh_token
    if not token_value:
        token_value = request.cookies.get("refresh_token")
    if not token_value:
        raise HTTPException(status_code=401, detail="Missing refresh token")
    try:
        data = decode_token(token_value)
        if data.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = int(data["sub"])
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return _issue_tokens(user, response)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
