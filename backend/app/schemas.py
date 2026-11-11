"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, EmailStr, Field, field_validator


# ─── Registration ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may only contain letters, digits, hyphens, and underscores.")
        return v.strip()

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match.")
        return v


class RegisterResponse(BaseModel):
    message: str


# ─── Login ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=128)


class LoginResponse(BaseModel):
    message: str
    # Masked email shown to the user on the OTP screen; e.g. "j***@gmail.com"
    masked_email: str


# ─── OTP ───────────────────────────────────────────────────────────────────────

class OTPVerifyRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    otp: str = Field(..., min_length=6, max_length=6)

    @field_validator("otp")
    @classmethod
    def otp_digits_only(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("OTP must contain exactly 6 digits.")
        return v


class OTPVerifyResponse(BaseModel):
    message: str
    session_token: str


class ResendOTPRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)


class ResendOTPResponse(BaseModel):
    message: str
    masked_email: str


# ─── Dashboard ─────────────────────────────────────────────────────────────────

class DashboardResponse(BaseModel):
    message: str
    username: str
    email: str


# ─── Logout ────────────────────────────────────────────────────────────────────

class LogoutResponse(BaseModel):
    message: str


# ─── Error ─────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    detail: str

