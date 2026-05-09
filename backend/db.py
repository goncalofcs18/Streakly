from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "streakly")

client: Optional[AsyncIOMotorClient] = None


def get_db():
    return client[DB_NAME]


async def connect_db():
    global client
    client = AsyncIOMotorClient(MONGO_URL)
    print(f"✅ Connected to MongoDB: {DB_NAME}")


async def close_db():
    global client
    if client:
        client.close()
        print("🔒 MongoDB connection closed")
