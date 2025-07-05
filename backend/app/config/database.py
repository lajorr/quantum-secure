from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
URL = os.getenv("DATABASE_URL")

client = AsyncIOMotorClient(URL)
db = client.chat_db
user_collection = db["user_collection"]
message_collection = db["message_collection"]
blocklist_collection = db["blocklist_collection"]


async def add_jti_to_blocklist(jti: str):
    try:
        # result = await token_blocklist.set(
        #     name=jti,
        #     value="blocked",
        #     ex=JTI_EXPIRY
        # )
        result = await blocklist_collection.insert_one({"jti": jti})
        return result
    except Exception as e:
        print(f"Error adding JTI to blocklist: {e}")
        raise e


async def token_in_blacklist(jti: str) -> bool:
    try:
        _jti = await blocklist_collection.find_one({"jti": jti})
        return _jti is not None
    except Exception as e:
        print(f"Error checking JTI in blocklist: {e}")
        return False
