from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# load_dotenv()
# URL = os.getenv(DATABASE_URL)

client = AsyncIOMotorClient('mongodb+srv://rubinlalamatya:rubin1234@cluster0.2jhuz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client.chat_db
collection_name = db["user_collection"]