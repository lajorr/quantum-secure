from typing import List
from fastapi import APIRouter, Depends, WebSocket, HTTPException

from ..utils.auth import get_access_token_details

from ..model.user import TokenData

from ..model.message import MessageModel
from ..controller import websocket_controller
from ..config.database import message_collection
router = APIRouter()


@router.websocket('/ws/{client_id}')
async def websocket(websocket: WebSocket, client_id: str):
    await websocket_controller.handle_websocket(websocket, client_id)


@router.get("/messages/{chat_id}", response_model=List[MessageModel])
async def get_messages(chat_id: str, token: TokenData = Depends(get_access_token_details)):
    user_ids = chat_id.split("-")
    if token.user_id not in user_ids:
        raise HTTPException(
            status_code=401, detail="You are not the owner of this chat")
    try:
        messages_cursor = message_collection.find(
            {"chat_id": chat_id}).sort("timestamp", 1)
        messages = []
        async for msg in messages_cursor:
            msg["id"] = str(msg["_id"])
            messages.append(msg)
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
