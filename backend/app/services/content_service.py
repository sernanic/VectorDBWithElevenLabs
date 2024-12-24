from motor.motor_asyncio import AsyncIOMotorDatabase
from ..core.database import mongodb
from ..schemas.content import PageContentCreate, PageContentInDB
import logging
from typing import Optional
import requests
import json
from astrapy.db import AstraDB

logger = logging.getLogger(__name__)


class ContentService:
    def __init__(self):
        self._db: Optional[AsyncIOMotorDatabase] = None
        self._astra_db = AstraDB(
            token=ASTRA_DB_TOKEN,
            api_endpoint=ASTRA_DB_ENDPOINT
        )

    def _run_langflow(self, message: str, tweaks: Optional[dict] = None) -> dict:
        """
        Run the Langflow with given message and tweaks
        """
        api_url = f"{BASE_API_URL}/lf/{LANGFLOW_ID}/api/v1/run/{FLOW_ID}"
        
        payload = {
            "input_value": message,
            "output_type": "chat",
            "input_type": "chat",
        }
        if tweaks:
            payload["tweaks"] = tweaks
            
        headers = {
            "Authorization": f"Bearer {APPLICATION_TOKEN}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(api_url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error running Langflow: {str(e)}", exc_info=True)
            raise

    @property
    async def db(self) -> AsyncIOMotorDatabase:
        """Get database instance."""
        if self._db is None:
            await mongodb.connect_to_mongodb()
            self._db = mongodb.db
        return self._db

    async def save_content(
        self, 
        language: str, 
        content_id: str, 
        content: PageContentCreate
    ) -> PageContentInDB:
        """
        Save content to MongoDB and Astra DB via Langflow
        """
        try:
            logger.info(f"Saving content for {language}/{content_id}")
            
            # Save to MongoDB
            db = await self.db
            mongo_collection = db[language]
            
            document = content.dict()
            document["_id"] = content_id
            
            await mongo_collection.update_one(
                {"_id": content_id},
                {"$set": document},
                upsert=True
            )
            
        except Exception as e:
            logger.error(f"Error saving content: {str(e)}", exc_info=True)
            raise

    async def get_content(self, language: str, content_id: str) -> Optional[PageContentInDB]:
        """
        Get content from MongoDB
        """
        try:
            db = await self.db
            mongo_collection = db[language]
            
            document = await mongo_collection.find_one({"_id": content_id})
            if document:
                return PageContentInDB(**document)
            return None
            
        except Exception as e:
            logger.error(f"Error fetching content: {str(e)}", exc_info=True)
            raise

content_service = ContentService()
