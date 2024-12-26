from motor.motor_asyncio import AsyncIOMotorDatabase
from pathlib import Path
from datetime import datetime
from typing import Optional
import logging
from dotenv import load_dotenv
from ..dependencies.pinecone import get_pinecone_client, get_assistant
from ..core.database import mongodb
from ..schemas.content import (
    PageContentCreate, 
    PageContentInDB, 
    AddSectionRequest, 
    AddSubsectionRequest,
    AddSubSubsectionRequest,
    DocumentStructure,
    Section,
    Subsection
)

# Load environment variables at module level
load_dotenv()

logger = logging.getLogger(__name__)

class ContentService:
    def __init__(self):
        self._db: Optional[AsyncIOMotorDatabase] = None
        try:
            self._pinecone = get_pinecone_client()
            self._assistant = get_assistant(self._pinecone)
        except Exception as e:
            logger.error(f"Error initializing ContentService: {str(e)}")
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

    async def get_document_structure(self, language: str = "en") -> Optional[DocumentStructure]:
        """Get the entire document structure."""
        try:
            db = await self.db
            logger.info(f"Connected to database: {db.name}")
            
            collection = db[language]
            logger.info(f"Using collection: {collection.name}")
            
            logger.info(f"Fetching document structure from {language} collection")
            document = await collection.find_one({"_id": "document_structure"})
            logger.info(f"Found document structure: {document}")
            
            if document:
                logger.info("Converting document to DocumentStructure")
                structure = DocumentStructure(**document)
                logger.info(f"Document structure sections: {structure.sections}")
                return structure
            
            logger.info("No document structure found, creating empty structure")
            empty_structure = DocumentStructure(sections={})
            
            # Create initial document structure
            await collection.update_one(
                {"_id": "document_structure"},
                {"$set": empty_structure.dict()},
                upsert=True
            )
            logger.info("Created empty document structure in database")
            
            return empty_structure
        except Exception as e:
            logger.error(f"Error fetching document structure: {str(e)}", exc_info=True)
            raise

    async def add_section(self, language: str, request: AddSectionRequest) -> DocumentStructure:
        """Add a new section to the document structure."""
        try:
            db = await self.db
            collection = db[language]
            
            # Get current structure
            structure = await self.get_document_structure(language)
            if not structure:
                structure = DocumentStructure(sections={})
            
            # Add new section
            structure.sections[request.section_id] = Section(
                title=request.title,
                subsections={}
            )
            
            # Update in database
            await collection.update_one(
                {"_id": "document_structure"},
                {"$set": structure.dict()},
                upsert=True
            )
            
            return structure
        except Exception as e:
            logger.error(f"Error adding section: {str(e)}", exc_info=True)
            raise

    async def add_subsection(self, language: str, request: AddSubsectionRequest) -> DocumentStructure:
        """Add a new subsection to a section."""
        try:
            db = await self.db
            collection = db[language]
            
            # Get current structure
            structure = await self.get_document_structure(language)
            
            # Verify section exists
            if request.section_id not in structure.sections:
                raise ValueError(f"Section {request.section_id} does not exist")
            
            # Add new subsection
            structure.sections[request.section_id].subsections[request.subsection_id] = Subsection(
                title=request.title,
                content=request.content,
                subsubsections={}
            )
            
            # Update in database
            await collection.update_one(
                {"_id": "document_structure"},
                {"$set": structure.dict()},
                upsert=True
            )
            
            return structure
        except Exception as e:
            logger.error(f"Error adding subsection: {str(e)}", exc_info=True)
            raise

    async def add_subsubsection(self, language: str, request: AddSubSubsectionRequest) -> DocumentStructure:
        """Add a new subsubsection to a subsection."""
        try:
            db = await self.db
            collection = db[language]
            
            # Get current structure
            structure = await self.get_document_structure(language)
            
            # Verify section and subsection exist
            if request.section_id not in structure.sections:
                raise ValueError(f"Section {request.section_id} does not exist")
            if request.subsection_id not in structure.sections[request.section_id].subsections:
                raise ValueError(f"Subsection {request.subsection_id} does not exist")
            
            # Initialize subsubsections if None
            if structure.sections[request.section_id].subsections[request.subsection_id].subsubsections is None:
                structure.sections[request.section_id].subsections[request.subsection_id].subsubsections = {}
            
            # Add new subsubsection
            structure.sections[request.section_id].subsections[request.subsection_id].subsubsections[request.subsubsection_id] = {
                "title": request.title,
                "content": request.content
            }
            
            # Update in database
            await collection.update_one(
                {"_id": "document_structure"},
                {"$set": structure.dict()},
                upsert=True
            )
            
            return structure
        except Exception as e:
            logger.error(f"Error adding subsubsection: {str(e)}", exc_info=True)
            raise

# Create a singleton instance
try:
    content_service = ContentService()
except Exception as e:
    logger.error(f"Failed to initialize ContentService: {str(e)}")
    raise