"""FastAPI application entry point with all route handlers."""

from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session as DBSession

from app import auth, email_service
from app.config import settings
from app.database import Base, engine, get_db
from app.models import OTPRecord, User
from app.schemas import (
    DashboardResponse,
    ErrorResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    OTPVerifyRequest,
    OTPVerifyResponse,
    RegisterRequest,
    RegisterResponse,
    ResendOTPRequest,
    ResendOTPResponse,
)
from app.experiments.experiment8.http_service import router as exp8_router
from app.experiments.experiment10.router import router as exp10_router

# ─── Database initialisation ───────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ─── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title=settings.APP_NAME, version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Experiment 8 & 10 Routers ────────────────────────────────────────────────
app.include_router(exp8_router)
app.include_router(exp10_router)


# ─── Helper ────────────────────────────────────────────────────────────────────

def _get_user_or_404(db: DBSession, username: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


def _require_session(request: Request, db: DBSession = Depends(get_db)):
    """Dependency: extract Bearer token and return the associated User."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header.",
        )
    token = auth_header[len("Bearer "):]
    session = auth.get_session_by_token(db, token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please log in again.",
        )
    return session, token, db


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
@limiter.limit("10/minute")
async def register(request: Request, body: RegisterRequest, db: DBSession = Depends(get_db)):
    """Register a new user account."""
    # Check uniqueness
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=409, detail="Username is already taken.")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Email address is already registered.")

    user = User(
        username=body.username,
        email=body.email,
        hashed_password=auth.hash_password(body.password),
    )
    db.add(user)
    db.commit()
    return RegisterResponse(message="Account created successfully. You may now log in.")


@app.post(
    "/login",
    response_model=LoginResponse,
    responses={401: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, db: DBSession = Depends(get_db)):
    """Verify username/password; generate and email an OTP if credentials are valid."""
    # Generic error to prevent username enumeration
    _INVALID = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid username or password.",
    )
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not auth.verify_password(body.password, user.hashed_password):
        raise _INVALID

    # Generate OTP and store its hash
    otp = auth.generate_otp()
    auth.create_otp_record(db, user, otp)

    # Send OTP via Gmail SMTP (raises RuntimeError / SMTPException on failure)
    try:
        email_service.send_otp_email(user.email, user.username, otp)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to send OTP email. Please try again later. ({type(exc).__name__})",
        )

    return LoginResponse(
        message="Credentials verified. An OTP has been sent to your registered email.",
        masked_email=auth.mask_email(user.email),
    )


@app.post(
    "/verify-otp",
    response_model=OTPVerifyResponse,
    responses={400: {"model": ErrorResponse}, 401: {"model": ErrorResponse}},
)
@limiter.limit("20/minute")
async def verify_otp(request: Request, body: OTPVerifyRequest, db: DBSession = Depends(get_db)):
    """Verify the submitted OTP and, on success, return a session token."""
    user = _get_user_or_404(db, body.username)
    record = auth.get_active_otp_record(db, user)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid OTP found. Please log in again to request a new code.",
        )

    # Increment attempt counter first (prevents race-condition exploitation)
    record.attempts += 1
    db.commit()

    if record.attempts > settings.OTP_MAX_ATTEMPTS:
        record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Too many incorrect attempts. OTP invalidated. Please log in again.",
        )

    if not auth.verify_otp_hash(body.otp, record.hashed_otp):
        remaining = settings.OTP_MAX_ATTEMPTS - record.attempts
        if remaining <= 0:
            record.is_used = True
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect OTP. Maximum attempts reached. OTP invalidated.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect OTP. {remaining} attempt(s) remaining.",
        )

    # OTP is correct – invalidate it immediately (one-time use)
    record.is_used = True
    db.commit()

    # Create a server-side session
    token = auth.create_session(db, user)

    return OTPVerifyResponse(
        message="OTP verified successfully. Welcome!",
        session_token=token,
    )


@app.post(
    "/resend-otp",
    response_model=ResendOTPResponse,
    responses={400: {"model": ErrorResponse}, 429: {"model": ErrorResponse}},
)
@limiter.limit("5/minute")
async def resend_otp(request: Request, body: ResendOTPRequest, db: DBSession = Depends(get_db)):
    """Resend a fresh OTP, subject to a 30-second cooldown."""
    user = _get_user_or_404(db, body.username)

    # Cooldown check: look at last OTP record regardless of expiry
    last_record: OTPRecord | None = (
        db.query(OTPRecord)
        .filter(OTPRecord.user_id == user.id)
        .order_by(OTPRecord.created_at.desc())
        .first()
    )
    if last_record:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        elapsed = (now - last_record.last_sent_at).total_seconds()
        if elapsed < settings.OTP_RESEND_COOLDOWN_SECONDS:
            wait = int(settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {wait} second(s) before requesting a new code.",
            )

    otp = auth.generate_otp()
    auth.create_otp_record(db, user, otp)

    try:
        email_service.send_otp_email(user.email, user.username, otp)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to send OTP email. ({type(exc).__name__})",
        )

    return ResendOTPResponse(
        message="A new OTP has been sent to your registered email.",
        masked_email=auth.mask_email(user.email),
    )


@app.get(
    "/dashboard",
    response_model=DashboardResponse,
    responses={401: {"model": ErrorResponse}},
)
async def dashboard(session_info=Depends(_require_session)):
    """Protected endpoint – returns user info for the authenticated dashboard."""
    session, _token, db = session_info
    user: User = session.user
    return DashboardResponse(
        message="Two-factor authentication successful. Welcome to your secure dashboard.",
        username=user.username,
        email=auth.mask_email(user.email),
    )


@app.post(
    "/logout",
    response_model=LogoutResponse,
    responses={401: {"model": ErrorResponse}},
)
async def logout(session_info=Depends(_require_session)):
    """Invalidate the current server-side session."""
    session, token, db = session_info
    auth.invalidate_session(db, token)
    return LogoutResponse(message="Logged out successfully.")

