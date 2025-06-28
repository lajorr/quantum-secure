from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from config.database import user_collection
from model.user import UserCreate, Token, UserBase
from auth import hashed_password, verify_password, create_access_token
from schema.schema import user_serializer

router = APIRouter(tags=['Auth'])


# Register Route
@router.post("/register", response_model=UserBase)
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
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_collection.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    token = create_access_token(
        {"sub": user["username"], "id": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}
