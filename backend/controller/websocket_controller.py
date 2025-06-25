from fastapi import WebSocket
from typing import List, Dict
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store active connections
        self.active_connections: Dict[str, WebSocket] = {}
        logger.info("ConnectionManager initialized")

    async def connect(self, websocket: WebSocket, client_id: str):
        logger.info(f"Attempting to connect client: {client_id}")
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected successfully")
        logger.info(f"Active connections: {len(self.active_connections)}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected")
            logger.info(f"Remaining connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)
            logger.info(f"Sent personal message to client {client_id}")

    async def broadcast(self, message: str):
        logger.info(f"Broadcasting message to {len(self.active_connections)} clients")
        for connection in self.active_connections.values():
            await connection.send_text(message)

# Create a global connection manager instance
manager = ConnectionManager()

async def handle_websocket(websocket: WebSocket, client_id: str):
    logger.info(f"New WebSocket connection request from client: {client_id}")
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received message from client {client_id}: {data}")
            try:
                message_data = json.loads(data)
                await manager.broadcast(json.dumps({
                    "client_id": client_id,
                    "message": message_data
                }))
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON from client {client_id}: {data}")
                await manager.send_personal_message(
                    json.dumps({"error": "Invalid message format"}),
                    client_id
                )
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {str(e)}")
    finally:
        manager.disconnect(client_id) 