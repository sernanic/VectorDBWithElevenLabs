from motor.motor_asyncio import AsyncIOMotorDatabase
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any
import logging
from dotenv import load_dotenv
from ..dependencies.pinecone import get_pinecone_client, get_assistant, Message
from ..core.database import mongodb
from ..schemas.content import (
    PageContentCreate, 
    PageContentInDB, 
    AddSectionRequest, 
    AddSubsectionRequest,
    AddSubSubsectionRequest,
    DocumentStructure,
    Section,
    Subsection,
    TableOfContentData,
    TableOfContentHeader
)
import os
import requests

# Load environment variables at module level
load_dotenv()

logger = logging.getLogger(__name__)

class ContentService:
    def __init__(self):
        self._db: Optional[AsyncIOMotorDatabase] = None
        self._elevenlabs_api_key = os.getenv("XI_API_KEY")
        self._elevenlabs_agent_id = os.getenv("NEXT_PUBLIC_ELEVENLABS_AGENT_ID")
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

    async def save_to_elevenlabs(self, file_path: str) -> None:
        """Save content to ElevenLabs agent knowledge base."""
        if not self._elevenlabs_api_key or not self._elevenlabs_agent_id:
            logger.warning("ElevenLabs API key or agent ID not configured, skipping ElevenLabs upload")
            return

        try:
            url = f"https://api.elevenlabs.io/v1/convai/agents/{self._elevenlabs_agent_id}/add-to-knowledge-base"
            headers = {
                'xi-api-key': self._elevenlabs_api_key
            }

            with open(file_path, 'rb') as f:
                files = [
                    ('file', (Path(file_path).name, f, 'text/plain'))
                ]
                response = requests.post(url, headers=headers, files=files)
                
                if not response.ok:
                    logger.error(f"ElevenLabs API Error - Status Code: {response.status_code}")
                    logger.error(f"Response Content: {response.text}")
                
                response.raise_for_status()
                
            logger.info("Successfully uploaded content to ElevenLabs agent knowledge base")
            
        except Exception as e:
            logger.error(f"Error saving to ElevenLabs: {str(e)}", exc_info=True)
            # Don't raise to allow other operations to continue

    async def save_content(
        self, 
        language: str, 
        content_id: str, 
        content: PageContentCreate
    ) -> PageContentInDB:
        """Save content to MongoDB, Pinecone, and ElevenLabs."""
        try:
            logger.info(f"Saving content for {language}/{content_id}")
            
            # Process content for table of contents
            toc = self.process_content_for_table_of_contents(content.pageContent)
            
            # Create or update the content
            content_data = {
                "_id": content_id,
                "pageContent": content.pageContent,
                "pageURL": content.pageURL,
                "tableOfContent": toc.dict() if toc else {},
                "headers": self.extract_headers(content.pageContent),
                "structure": toc.dict().get("structure", {}) if toc else {}
            }
            
            # Save to database
            db = await self.db
            collection = db[language]
            await collection.update_one(
                {"_id": content_id},
                {"$set": content_data},
                upsert=True
            )
            
            # Save to Pinecone and ElevenLabs
            try:
                # Create temporary directory if it doesn't exist
                temp_dir = Path("temp_uploads")
                temp_dir.mkdir(exist_ok=True)
                
                # Sanitize content_id for filename (replace slashes with underscores)
                safe_content_id = content_id.replace('/', '_')
                
                # Create temporary file
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                temp_file_path = temp_dir / f"{timestamp}_{safe_content_id}.txt"
                
                try:
                    # Format content for text file
                    content_text = f"""Title: {content_id}

Page Content:
{content.pageContent}

Table of Contents:
{str(toc.dict() if toc else {})}
"""
                    
                    # Save content to temporary file
                    with open(temp_file_path, 'w', encoding='utf-8') as f:
                        f.write(content_text)
                    
                    # Save to Pinecone
                    try:
                        # Get Pinecone assistant
                        assistant = self._pinecone.assistant.Assistant(
                            assistant_name="customer-support"
                        )
                        
                        # Upload to Pinecone with metadata
                        response = assistant.upload_file(
                            file_path=str(temp_file_path),
                            metadata={
                                "language": language,
                                "content_id": content_id,
                                "document_type": "documentation",
                                "page_url": content.pageURL,
                                "has_toc": bool(toc)
                            }
                        )
                        
                        logger.info(f"Successfully uploaded to Pinecone: {response}")
                        
                    except Exception as pinecone_error:
                        logger.error(f"Error saving to Pinecone: {str(pinecone_error)}", exc_info=True)
                    
                    # Save to ElevenLabs
                    await self.save_to_elevenlabs(str(temp_file_path))
                    
                finally:
                    # Clean up temporary file
                    if temp_file_path.exists():
                        temp_file_path.unlink()
                    try:
                        temp_dir.rmdir()
                    except OSError:
                        pass  # Directory not empty or already deleted
                        
            except Exception as e:
                logger.error(f"Error saving to external services: {str(e)}", exc_info=True)
                # Don't raise here to allow MongoDB save to succeed even if external services fail
                
            return PageContentInDB(**content_data)
        except Exception as e:
            logger.error(f"Error saving content: {str(e)}")
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
                # Ensure document has all required fields
                document_data = {
                    "pageContent": document.get("pageContent", ""),
                    "pageURL": document.get("pageURL", content_id),
                    "tableOfContent": document.get("tableOfContent", {}),
                    "headers": document.get("headers", []),
                    "structure": document.get("structure", {})
                }
                return PageContentInDB(**document_data)
            return None
            
        except Exception as e:
            logger.error(f"Error fetching content: {str(e)}", exc_info=True)
            raise

    async def get_document_structure(self, language: str = "en") -> Optional[DocumentStructure]:
        """Get the entire document structure."""
        try:
            db = await self.db
            collection = db[language]
            
            # Get the document structure
            document = await collection.find_one({"_id": "document_structure"})
            
            if document:
                return DocumentStructure(**document)
            
            # Create empty structure if none exists
            empty_structure = DocumentStructure(sections={})
            await collection.update_one(
                {"_id": "document_structure"},
                {"$set": empty_structure.dict()},
                upsert=True
            )
            
            return empty_structure
        except Exception as e:
            logger.error(f"Error fetching document structure: {str(e)}")
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
            
            # Add new section with title and empty subsections
            structure.sections[request.section_id] = Section(
                title=request.title,
                subsections={}
            )
            
            # Update document structure in database
            await collection.update_one(
                {"_id": "document_structure"},
                {"$set": structure.dict()},
                upsert=True
            )
            
            return structure
        except Exception as e:
            logger.error(f"Error adding section: {str(e)}", exc_info=True)
            raise

    def process_content_for_table_of_contents(self, content: str) -> TableOfContentData:
        """Process content to generate table of contents with nested structure."""
        headers = self.extract_headers(content)
        structure = {}
        headers_by_id = {}
        
        # First pass: Create all headers and store them by ID
        for header in headers:
            header_id = f"header_{len(headers_by_id)}"
            header_obj = TableOfContentHeader(
                id=header_id,
                title=header['title'],
                level=header['level'],
                children=[]
            )
            headers_by_id[header_id] = header_obj
            
        # Second pass: Build hierarchy
        stack = []
        for header_id, header in headers_by_id.items():
            while stack and headers_by_id[stack[-1]].level >= header.level:
                stack.pop()
                
            if stack:
                parent = headers_by_id[stack[-1]]
                parent.children.append(header_id)
            else:
                structure[header_id] = header
                
            stack.append(header_id)
            
        return TableOfContentData(
            headers=list(headers_by_id.values()),
            structure=structure
        )

    def extract_headers(self, content: str) -> List[Dict[str, Any]]:
        """Extract headers from the content using regex."""
        import re
        
        # Match markdown headers (e.g., # Header, ## Subheader)
        header_pattern = r'^(#{1,6})\s+(.+)$'
        headers = []
        
        for line in content.split('\n'):
            match = re.match(header_pattern, line.strip())
            if match:
                level = len(match.group(1))  # Number of # symbols
                title = match.group(2).strip()
                headers.append({
                    'title': title,
                    'level': level
                })
                
        return headers

    def create_structure_from_content(self, content: str) -> Dict[str, Any]:
        """Create a hierarchical structure from the content."""
        # This is now handled by process_content_for_table_of_contents
        return self.process_content_for_table_of_contents(content).structure

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
            
            # Add new subsection with only title to structure
            structure.sections[request.section_id].subsections[request.subsection_id] = Subsection(
                title=request.title,
                content="",  # Empty content in structure
                subsubsections={}
            )
            
            # Update structure in database
            await collection.update_one(
                {"_id": "document_structure"},
                {"$set": structure.dict()},
                upsert=True
            )
            
            # Process table of contents
            toc = self.process_content_for_table_of_contents(request.content) if request.content else None
            toc_dict = toc.dict() if toc else None
            
            # Create separate content document for subsection
            content_document = {
                "_id": f"{request.section_id}/{request.subsection_id}",  # Changed to use path-like ID
                "pageContent": request.content or "",
                "pageURL": f"{request.section_id}/{request.subsection_id}",
                "tableOfContent": toc_dict,
                "headers": self.extract_headers(request.content) if request.content else [],
                "structure": toc_dict["structure"] if toc_dict else {}
            }
            
            # Save the content document
            await collection.update_one(
                {"_id": content_document["_id"]},  # Use the _id from content_document
                {"$set": content_document},
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