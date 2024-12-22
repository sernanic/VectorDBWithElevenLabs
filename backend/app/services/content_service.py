from motor.motor_asyncio import AsyncIOMotorDatabase
from ..core.database import mongodb
from ..schemas.content import PageContentCreate, PageContentInDB
import logging
from typing import Optional
import requests
import json
from astrapy.db import AstraDB

logger = logging.getLogger(__name__)

# Langflow API Configuration
BASE_API_URL = "https://api.langflow.astra.datastax.com"
LANGFLOW_ID = "ba9567b8-0520-4840-80b1-36acf8e6a958"
FLOW_ID = "b1d30539-ce8d-47a4-9fad-6d391e377bef"
APPLICATION_TOKEN = "AstraCS:ZYZulAHKiHqnwExHNGbCxTdx:322aa211a275a8cbe750d37f23d2695785cec3d460f64553bb5231a3ce2cf909"

# Initialize Astra DB client
ASTRA_DB_TOKEN = "AstraCS:pRgwuCzHHjhqjgUUWUxQtRNl:f25dc9f83e911e50e561e1cccfde8b13d1363b081416a7cd63125f14d9fa3e84"
ASTRA_DB_ENDPOINT = "https://65ff5f65-bab1-4c1e-b26e-3ca31a953d6e-us-east-2.apps.astra.datastax.com"

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
            
            # Check if document exists in Astra DB
            try:
                astra_collection = self._astra_db.collection(language)
                existing_doc = astra_collection.find_one({"_id": content_id})
                
                # Prepare document for Langflow
                langflow_doc = {
                    "_id": content_id,
                    "language": language,
                    "content": content.dict()
                }
                
                # Convert document to string for Langflow input
                doc_string = json.dumps(langflow_doc)
                
                # If document exists, include deletion flag in tweaks
                tweaks = {
                    "File-XsVWC": {},
                    "SplitText-7KDva": {},
                    "AstraDB-qKL8G": {
                        "delete_existing": True if existing_doc else False
                    }
                }
                
                # Send to Langflow
                response = self._run_langflow(doc_string, tweaks=tweaks)
                logger.info(f"Langflow response: {response}")
                
            except Exception as astra_error:
                logger.error(f"Error with Astra DB operation: {str(astra_error)}", exc_info=True)
                raise
            
            return PageContentInDB(**document)
            
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
