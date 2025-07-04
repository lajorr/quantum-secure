from pydantic import BaseModel


class MessageModel(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    content: str
    timestamp: str
    chat_id: str
