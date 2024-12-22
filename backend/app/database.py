from motor.motor_asyncio import AsyncIOMotorClient
from .config import get_settings
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def get_database():
    """
    Return database instance
    """
    if not db.client:
        await connect_to_mongodb()
    return db.client[settings.mongodb_database]

async def connect_to_mongodb():
    """
    Create database connection
    """
    try:
        logger.info("Connecting to MongoDB...")
        db.client = AsyncIOMotorClient(settings.mongodb_url)
        # Verify the connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise
    
async def close_mongodb_connection():
    """
    Close database connection
    """
    try:
        if db.client:
            db.client.close()
            logger.info("MongoDB connection closed")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")
