from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
import uuid
import logging

from ..config.database import token_in_blacklist

from ..model.user import TokenData

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def hashed_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_token(data: dict, expiry: timedelta | None = None, refresh: bool = False):
    encode = data.copy()
    expire = datetime.now(timezone.utc) + \
        (expiry if expiry is not None else timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    encode.update({
        "exp": expire,
        "jti": str(uuid.uuid4()),
        "refresh": refresh
    })
    encoded_jwt = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decoded_access_token(token: str) -> TokenData | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenData(
            exp=payload['exp'],
            jti=payload['jti'],
            refresh=payload['refresh'],
            user_id=payload['user_id']
        )
    except JWTError as e:
        logging.exception(e)
        return None


async def verify_refresh_token(token: str, credentials_exception):
    try:
        payload = decoded_access_token(token)
        if not payload:
            raise credentials_exception
        id = payload.user_id
        expiry_timestamp = payload.exp
        refresh = payload.refresh
        if not id:
            raise credentials_exception
        if id and not refresh:
            raise credentials_exception

        if await token_in_blacklist(payload.jti):
            raise credentials_exception
        token_data = TokenData(
            user_id=id, exp=expiry_timestamp, refresh=refresh, jti=payload.jti)
    except JWTError:
        raise credentials_exception
    return token_data


async def verify_access_token(token: str, credentials_exception):
    try:
        payload = decoded_access_token(token)
        if not payload:
            raise credentials_exception

        id = payload.user_id
        expiry_timestamp = payload.exp
        refresh = payload.refresh
        if not id:
            raise credentials_exception
        if id and refresh:
            raise credentials_exception

        # Check if token is in blocklist
        if await token_in_blacklist(payload.jti):
            raise credentials_exception

        token_data = TokenData(
            user_id=id, exp=expiry_timestamp, refresh=refresh, jti=payload.jti)
    except JWTError:
        raise credentials_exception
    return token_data


async def get_refresh_token_details(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="provide a refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = await verify_refresh_token(token, credentials_exception)
    except JWTError:
        raise credentials_exception

    return payload


async def get_access_token_details(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="provide a access token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = await verify_access_token(token, credentials_exception)
    except JWTError:
        raise credentials_exception

    return payload
