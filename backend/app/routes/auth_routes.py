from fastapi import APIRouter, HTTPException,  Request, Response, status
from ..config.database import add_jti_to_blocklist, user_collection
from ..model.user import Token,  UserCreate,  UserResponse, UserRequest
from ..utils.auth import get_refresh_token_details, hashed_password, verify_password, create_token
from ..schema.schema import user_serializer
from datetime import timedelta, datetime, timezone
router = APIRouter(
    prefix='/auth',
    tags=['Auth'])


# Register Route
@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    if await user_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hashed_password(user.password)
    user_data = {"username": user.username,
                 "email": user.email, "hashed_password": hashed_pw}
    result = await user_collection.insert_one(user_data)
    new_user = await user_collection.find_one({"_id": result.inserted_id})
    return user_serializer(new_user)

# Login Route


@router.post("/login", response_model=Token)
async def login(response: Response, form_data: UserRequest):
   
    user = await user_collection.find_one({"email": form_data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_token(
        {"user_id": str(user["_id"])})
    refresh_token = create_token(
        {"user_id": str(user["_id"])}, refresh=True, expiry=timedelta(days=2))

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        expires=2 * 24 * 60 * 60,  # 2 days
        path="/"
        
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh_token", response_model=Token)
async def refreshToken(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    print("Refresh Token:", refresh_token)
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")
    valid_refresh_token = await get_refresh_token_details(refresh_token)
    if valid_refresh_token.exp > datetime.now(timezone.utc):
        new_access_token = create_token(
            {
                "user_id": valid_refresh_token.user_id
            }
        )
        return {"access_token": new_access_token, "token_type": "bearer"}
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                        detail="Invalid or expired token")


@router.post('/logout')
async def revoke_token(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")
    valid_refresh_token = await get_refresh_token_details(refresh_token)
    jti = valid_refresh_token.jti
    await add_jti_to_blocklist(jti)

#     return {
#         "message": "Logged out successfully"
#     }
