from motor.motor_asyncio import AsyncIOMotorDatabase
from pathlib import Path
from datetime import datetime
from typing import Optional
import logging
import requests
import json
import os
from dotenv import load_dotenv
from pinecone import Pinecone

from ..core.database import mongodb
from ..schemas.content import PageContentCreate, PageContentInDB

# Load environment variables at module level
load_dotenv()

logger = logging.getLogger(__name__)

class ContentService:
    def __init__(self):
        self._db: Optional[AsyncIOMotorDatabase] = None
        
        # Get Pinecone configuration
        self._pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self._assistant_name = os.getenv("PINECONE_ASSISTANT_NAME")
        
        if not self._pinecone_api_key:
            logger.error("PINECONE_API_KEY is not set in environment variables")
            raise ValueError("PINECONE_API_KEY environment variable is required")
            
        if not self._assistant_name:
            logger.error("PINECONE_ASSISTANT_NAME is not set in environment variables")
            raise ValueError("PINECONE_ASSISTANT_NAME environment variable is required")
        
        # Initialize Pinecone
        try:
            self._pinecone = Pinecone(api_key=self._pinecone_api_key)
            self._assistant = self._pinecone.assistant.Assistant(
                assistant_name=self._assistant_name
            )
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone: {str(e)}")
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
        Save content to MongoDB and Pinecone.
        
        Args:
            language: Language of the content
            content_id: Unique identifier for the content
            content: Content to be saved
            
        Returns:
            PageContentInDB: Saved content object
            
        Raises:
            Exception: If there's an error saving to MongoDB or Pinecone
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
            
            # Save to Pinecone
            try:
                # Create temporary directory if it doesn't exist
                temp_dir = Path("temp_uploads")
                temp_dir.mkdir(exist_ok=True)
                
                # Create temporary file
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                temp_file_path = temp_dir / f"{timestamp}_{content_id}.txt"
                
                try:
                    # Format content for text file
                    content_text = f"""Title: {content_id}

Page Content:
{content.pageContent}

"""
                    
                    # Save content to temporary file
                    with open(temp_file_path, 'w', encoding='utf-8') as f:
                        f.write(content_text)
                    
                    # Upload to Pinecone with metadata
                    metadata = {
                        "language": language,
                        "content_id": content_id,
                        "document_type": "documentation"
                    }
                    
                    response = self._assistant.upload_file(
                        file_path=str(temp_file_path),
                        metadata=metadata
                    )
                    
                    logger.info(f"Successfully uploaded to Pinecone: {response}")
                    
                finally:
                    # Clean up temporary file
                    if temp_file_path.exists():
                        temp_file_path.unlink()
                    try:
                        temp_dir.rmdir()
                    except OSError:
                        pass  # Directory not empty or already deleted
                        
            except Exception as pinecone_error:
                logger.error(f"Error saving to Pinecone: {str(pinecone_error)}", exc_info=True)
                raise
                
            return PageContentInDB(**document)
                
        except Exception as e:
            logger.error(f"Error saving content: {str(e)}", exc_info=True)
            raise

    async def get_content(self, language: str, content_id: str) -> Optional[PageContentInDB]:
        """
        Get content from MongoDB.
        
        Args:
            language: Language of the content
            content_id: Unique identifier for the content
            
        Returns:
            Optional[PageContentInDB]: Retrieved content object or None if not found
            
        Raises:
            Exception: If there's an error fetching from MongoDB
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

try:
    content_service = ContentService()
except Exception as e:
    logger.error(f"Failed to initialize ContentService: {str(e)}")
    raise