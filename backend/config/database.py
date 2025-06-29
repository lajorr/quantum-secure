from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
URL = os.getenv("DATABASE_URL")

client = AsyncIOMotorClient(URL)
db = client.chat_db
user_collection = db["user_collection"]
message_collection = db["message_collection"]
