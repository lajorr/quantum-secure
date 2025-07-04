from fastapi import APIRouter, WebSocket
from controller import websocket_controller

router = APIRouter()


@router.websocket('/ws/{client_id}')
async def websocket(websocket: WebSocket, client_id: str):
    await websocket_controller.handle_websocket(websocket, client_id)