from typing import List
from fastapi import APIRouter, Depends, HTTPException
from ..utils.auth import get_access_token_details
from ..model.user import TokenData, UserResponse
from ..schema.schema import user_serializer
from ..config.database import user_collection
from bson import ObjectId

router = APIRouter(
    prefix='/users',
    tags=["User"]
)


@router.get("/details", response_model=UserResponse)
async def get_current_user_details(token: TokenData = Depends(get_access_token_details)):

    user = await user_collection.find_one({"_id": ObjectId(token.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user_serializer(user)


@router.get("/friends", response_model=List[UserResponse])
async def get_friends_list(token: TokenData = Depends(get_access_token_details)):
    friends_list = await user_collection.find({"_id": {"$ne": ObjectId(token.user_id)}}).to_list()
    friends_list = [user_serializer(friend) for friend in friends_list]
    print(friends_list)
    return friends_list
