from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from bson import ObjectId
from config.database import collection_name
from model.user import UserCreate, UserInDB, Token, UserBase, UserResponse
from auth import hashed_password, verify_password, create_access_token, decoded_access_token
from schema.schema import user_serializer
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
router = APIRouter()


    
# Register Route
@router.post("/register", response_model=UserBase)
async def register(user: UserCreate):
    if await collection_name.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hashed_password(user.password)
    user_data = {"username": user.username, "email": user.email, "hashed_password": hashed_pw}
    result = await collection_name.insert_one(user_data)
    new_user = await collection_name.find_one({"_id": result.inserted_id})
    return user_serializer(new_user)

# Login Route
@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await collection_name.find_one({"username": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    token = create_access_token({"sub": user["username"]})
    return {"access_token": token, "token_type": "bearer"}

# Protected Route
@router.get("/me", response_model=UserResponse)
async def read_users_me(token: str = Depends(oauth2_scheme)):
    username = decoded_access_token(token)
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = await collection_name.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_serializer(user)

