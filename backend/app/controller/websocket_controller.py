from fastapi import WebSocket
from typing import Dict
import json
import logging

from datetime import datetime
from ..config.database import message_collection

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
            logger.info(
                f"Remaining connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)
            logger.info(f"Sent personal message to client {client_id}")

    async def broadcast(self, message: str):
        logger.info(
            f"Broadcasting message to {len(self.active_connections)} clients")
        for connection in self.active_connections.values():
            await connection.send_text(message)


# Create a global connection manager instance
manager = ConnectionManager()


async def handle_websocket(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                logger.info(f"Message data: {message_data}")
                # Save message to DB
                message_doc = {
                    "sender_id": client_id,
                    "receiver_id": message_data.get("receiver_id"),
                    "content": message_data.get("content"),
                    "timestamp": message_data.get("timestamp"),
                    "chat_id": message_data.get("chat_id"),
                    "enc": message_data.get("enc"),
                    "enc_key": message_data.get("enc_key"),
                    "rsa_pub_key": message_data.get("rsa_pub_key"),
                    "rsa_mod": message_data.get("rsa_mod"),
                    "ct": message_data.get("ct"),
                }
                message = None
                if message_doc["enc"] == "rsa" or message_doc["enc"] == "aes-cbc":
                    logger.info(f"Saving message to DB: {message_doc}")
                    message = await message_collection.insert_one(message_doc)

                # Send to sender (echo)
                # await manager.send_personal_message(json.dumps({
                #     "id": str(message.inserted_id),
                #     "sender_id": client_id,
                #     "receiver_id": message_data.get("receiver_id"),
                #     "content": message_data.get("content"),
                #     "timestamp":  message_data.get("timestamp"),
                #     "chat_id": message_data.get("chat_id"),
                #     "enc": message_data.get("enc"),
                #     "enc_key": message_data.get("enc_key"),
                #     "rsa_pub_key": message_data.get("rsa_pub_key"),
                #     "rsa_mod": message_data.get("rsa_mod"),
                #     "ct": message_data.get("ct"),
                # }), client_id)

                # Send to recipient if connected
                to_client = message_data.get("receiver_id")
                if to_client:
                    await manager.send_personal_message(json.dumps({
                        "id": str(message.inserted_id) if message is not None else "",
                        "sender_id": client_id,
                        "receiver_id": message_data.get("receiver_id"),
                        "content": message_data.get("content"),
                        "timestamp":  message_data.get("timestamp"),
                        "chat_id": message_data.get("chat_id"),
                        "enc": message_data.get("enc"),
                        "enc_key": message_data.get("enc_key"),
                        "rsa_pub_key": message_data.get("rsa_pub_key"),
                        "rsa_mod": message_data.get("rsa_mod"),
                        "ct": message_data.get("ct"),
                    }), to_client)

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
