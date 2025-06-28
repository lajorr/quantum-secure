from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from auth import decoded_access_token
from model.user import UserResponse
from schema.schema import user_serializer
from config.database import user_collection
from bson import ObjectId

router = APIRouter(
    prefix='/users',
    tags=["User"]
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@router.get("/details", response_model=UserResponse)
async def get_current_user_details(token: str = Depends(oauth2_scheme)):
    id = decoded_access_token(token)
    if id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await user_collection.find_one({"_id": ObjectId(id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user_serializer(user)


@router.get("/friends", response_model=List[UserResponse])
async def get_friends_list(token: str = Depends(oauth2_scheme)):
    id = decoded_access_token(token)
    if id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    friends_list = await user_collection.find({"_id": {"$ne": ObjectId(id)}}).to_list()
    friends_list = [user_serializer(friend) for friend in friends_list]
    print(friends_list)
    return friends_list
