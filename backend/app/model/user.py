from datetime import datetime
from pydantic import BaseModel, EmailStr,  field_validator
import re


def _validate_password_rules(value: str) -> str:
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", value):
        raise ValueError(
            "Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", value):
        raise ValueError(
            "Password must contain at least one lowercase letter.")
    if not re.search(r"\d", value):
        raise ValueError("Password must contain at least one digit.")
    if not re.search(r"[\W_]", value):
        raise ValueError(
            "Password must contain at least one special character.")
    return value


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserRequest(BaseModel):
    password: str
    email: EmailStr

    @field_validator('password')
    def validate_password(cls, value):
        return _validate_password_rules(value)

# Login-only schema: no password strength validators
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserCreate(UserRequest):
    username: str


class UserResponse(UserBase):
    id: str
    message: str
    isVerified: bool

class UserInDB(UserCreate):
    hashed_password: str
    isVerified: bool = False


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: str | None = None
    jti: str
    exp: datetime
    refresh: bool

class UpdateUser(BaseModel):
    username:str

class UpdatePassword(BaseModel):
    current_password: str
    new_password: str

    @field_validator('new_password')
    def validate_new_password(cls, value):
        return _validate_password_rules(value)

class EmailModel(BaseModel):
    addresses : list[str]


class PasswordChangeResponse(BaseModel):
    message: str
    user: UserResponse


class UserDetailsResponse(UserBase):
    id: str
    isVerified: bool


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator('new_password')
    def validate_new_password(cls, value):
        return _validate_password_rules(value)


class PasswordResetResponse(BaseModel):
    message: str

