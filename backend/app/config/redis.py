from redis.asyncio import Redis
import os

from dotenv import load_dotenv


load_dotenv()
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

JTI_EXPIRY = 3600  # 1 hr

token_blocklist = Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=0
)


async def add_jti_to_blocklist(jti: str):
    await token_blocklist.set(
        name=jti,
        value="",
        ex=JTI_EXPIRY
    )


async def token_in_blacklist(jti: str) -> bool:
    _jti = await token_blocklist.get(jti)
    return _jti is not None
