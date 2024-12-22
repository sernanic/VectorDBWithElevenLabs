from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import get_settings
import logging
from typing import Optional

logger = logging.getLogger(__name__)
settings = get_settings()

class MongoDBManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self._initialized = False

    async def connect_to_mongodb(self):
        """
        Create database connection
        """
        if self._initialized:
            logger.info("Already connected to MongoDB")
            return

        try:
            logger.info("Connecting to MongoDB...")
            logger.debug(f"MongoDB URL: {settings.MONGODB_URL}")
            logger.debug(f"Database name: {settings.MONGODB_DATABASE}")
            
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            self.db = self.client[settings.MONGODB_DATABASE]
            
            # Verify the connection
            await self.client.admin.command('ping')
            self._initialized = True
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {str(e)}", exc_info=True)
            self.client = None
            self.db = None
            self._initialized = False
            raise

    async def close_mongodb_connection(self):
        """
        Close database connection
        """
        try:
            if self.client is not None:
                self.client.close()
                self.client = None
                self.db = None
                self._initialized = False
                logger.info("MongoDB connection closed")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {str(e)}", exc_info=True)
            raise

    def get_db(self) -> AsyncIOMotorDatabase:
        """
        Get database instance
        """
        if not self._initialized or self.db is None:
            logger.error("Database not initialized")
            raise RuntimeError("Database not initialized. Call connect_to_mongodb() first.")
        return self.db

mongodb = MongoDBManager()
