"""Authentication helpers: password hashing, OTP generation/hashing, session tokens."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from sqlalchemy.orm import Session as DBSession

from app.config import settings
from app.models import OTPRecord, Session, User


# ─── Password utilities ────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Return a bcrypt hash of *plain*."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Return True iff *plain* matches *hashed*."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ─── OTP utilities ────────────────────────────────────────────────────────────

def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP string."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    """Return a bcrypt hash of *otp*.  We never store the plaintext."""
    return bcrypt.hashpw(otp.encode(), bcrypt.gensalt()).decode()


def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    return bcrypt.checkpw(plain_otp.encode(), hashed_otp.encode())


# ─── Session token utilities ───────────────────────────────────────────────────

def generate_session_token() -> str:
    """Generate a cryptographically secure URL-safe session token (32 bytes → 43 chars)."""
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    """SHA-256 hash of *token*.  Only the hash is stored in the DB."""
    return hashlib.sha256(token.encode()).hexdigest()


# ─── Email masking ─────────────────────────────────────────────────────────────

def mask_email(email: str) -> str:
    """Return a masked email like j***@gmail.com."""
    local, domain = email.rsplit("@", 1)
    if len(local) <= 2:
        masked_local = local[0] + "***"
    else:
        masked_local = local[0] + "***" + local[-1]
    return f"{masked_local}@{domain}"


# ─── OTP record helpers ────────────────────────────────────────────────────────

def create_otp_record(db: DBSession, user: User, otp: str) -> OTPRecord:
    """Invalidate any existing OTP for *user*, then create and persist a new one."""
    # Invalidate all existing active OTP records for this user
    db.query(OTPRecord).filter(
        OTPRecord.user_id == user.id,
        OTPRecord.is_used == False,  # noqa: E712
    ).update({"is_used": True})

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    record = OTPRecord(
        user_id=user.id,
        hashed_otp=hash_otp(otp),
        attempts=0,
        is_used=False,
        created_at=now,
        expires_at=now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES),
        last_sent_at=now,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_active_otp_record(db: DBSession, user: User) -> OTPRecord | None:
    """Return the single active (not-used, not-expired) OTP record for *user*, or None."""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return (
        db.query(OTPRecord)
        .filter(
            OTPRecord.user_id == user.id,
            OTPRecord.is_used == False,  # noqa: E712
            OTPRecord.expires_at > now,
        )
        .order_by(OTPRecord.created_at.desc())
        .first()
    )


# ─── Session helpers ───────────────────────────────────────────────────────────

def create_session(db: DBSession, user: User) -> str:
    """Create a new authenticated session; return the plaintext token (not stored)."""
    token = generate_session_token()
    hashed = hash_session_token(token)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    session = Session(
        user_id=user.id,
        hashed_token=hashed,
        is_active=True,
        created_at=now,
        expires_at=now + timedelta(hours=settings.SESSION_EXPIRE_HOURS),
    )
    db.add(session)
    db.commit()
    return token


def get_session_by_token(db: DBSession, token: str) -> Session | None:
    """Look up a session by its plaintext token; return None if invalid/expired."""
    hashed = hash_session_token(token)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return (
        db.query(Session)
        .filter(
            Session.hashed_token == hashed,
            Session.is_active == True,  # noqa: E712
            Session.expires_at > now,
        )
        .first()
    )


def invalidate_session(db: DBSession, token: str) -> None:
    """Mark the session identified by *token* as inactive."""
    hashed = hash_session_token(token)
    db.query(Session).filter(Session.hashed_token == hashed).update({"is_active": False})
    db.commit()

