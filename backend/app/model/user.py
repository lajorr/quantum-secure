from datetime import datetime
from pydantic import BaseModel, EmailStr,  field_validator
import re


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserRequest(BaseModel):
    password: str
    email: EmailStr

    @field_validator('password')
    def validate_password(cls, value):
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


class UserCreate(UserRequest):
    username: str


class UserResponse(UserBase):
    id: str


class UserInDB(UserCreate):
    hashed_pass: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: str | None = None
    jti: str
    exp: datetime
    refresh: bool
