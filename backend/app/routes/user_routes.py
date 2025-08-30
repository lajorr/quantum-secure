from typing import List
from fastapi import APIRouter, Depends, HTTPException
from ..utils.auth import get_access_token_details
from ..model.user import FriendResponse, TokenData, UserResponse, UpdateUser, UpdatePassword, PasswordChangeResponse, UserDetailsResponse
from ..schema.schema import user_serializer
from ..config.database import user_collection
from ..utils.auth import hashed_password, verify_password
from bson import ObjectId

router = APIRouter(
    prefix='/users',
    tags=["User"]
)


@router.get("/details", response_model=UserDetailsResponse)
async def get_current_user_details(token: TokenData = Depends(get_access_token_details)):
    print(f"Token Data:{token}")
    user = await user_collection.find_one({"_id": ObjectId(token.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user_serializer(user)


@router.get("/friends", response_model=List[FriendResponse])
async def get_friends_list(token: TokenData = Depends(get_access_token_details)):
    friends_list = await user_collection.find({"_id": {"$ne": ObjectId(token.user_id)}}).to_list()
    friends_list = [user_serializer(friend) for friend in friends_list]
    return friends_list

@router.patch("/changeUsername", response_model=UserDetailsResponse)
async def update_username(data: UpdateUser, token: TokenData = Depends(get_access_token_details)):
    obj_id = ObjectId(token.user_id)

    result = await user_collection.update_one(
        {"_id": obj_id},
        {"$set": {"username": data.username}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await user_collection.find_one({"_id": obj_id})
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_serializer(updated_user)

@router.patch("/changePassword" ,status_code=200)
async def update_password(data: UpdatePassword, token: TokenData = Depends(get_access_token_details)):
    user = await user_collection.find_one({"_id": ObjectId(token.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(data.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    new_hashed_password = hashed_password(data.new_password)
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"hashed_password": new_hashed_password}}
    )
    return {"message": "Password updated successfully"}

