from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.content import (
    PageContentCreate, 
    PageContentResponse, 
    AddSectionRequest, 
    AddSubsectionRequest,
    AddSubSubsectionRequest,
    DocumentStructure
)
from ..services.content_service import content_service
import logging
from pinecone import Pinecone
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Now you can access the environment variables
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ASSISTANT_NAME = os.getenv("PINECONE_ASSISTANT_NAME")

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Pinecone client function
def get_pinecone_client():
    try:
        if not PINECONE_API_KEY:
            logger.error("PINECONE_API_KEY is not set.")
            raise HTTPException(status_code=500, detail="PINECONE_API_KEY is not set.")
        return Pinecone(api_key=PINECONE_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Pinecone client: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initialize Pinecone client")

# Get Pinecone Assistant function
def get_assistant(pc: Pinecone = Depends(get_pinecone_client)):
    try:
        if not PINECONE_ASSISTANT_NAME:
            logger.error("PINECONE_ASSISTANT_NAME is not set.")
            raise HTTPException(status_code=500, detail="PINECONE_ASSISTANT_NAME is not set.")
        return pc.assistant.Assistant(assistant_name=PINECONE_ASSISTANT_NAME)
    except Exception as e:
        logger.error(f"Failed to get Pinecone assistant: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Pinecone assistant")

router = APIRouter(
    prefix="/content",
    tags=["content"]
)

# Structure routes
@router.get("/structure/{language}", response_model=DocumentStructure)
async def get_document_structure(language: str):
    """
    Get the entire document structure for a specific language
    """
    try:
        logger.info(f"GET request for document structure: {language}")
        structure = await content_service.get_document_structure(language)
        logger.info(f"Successfully retrieved document structure for language: {language}")
        return structure
    except Exception as e:
        logger.error(f"Error in get_document_structure: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/structure/{language}/section", response_model=DocumentStructure)
async def add_section(language: str, request: AddSectionRequest):
    """
    Add a new section to the document structure
    """
    try:
        logger.info(f"POST request to add section: {language}/{request.section_id}")
        structure = await content_service.add_section(language, request)
        logger.info(f"Successfully added section: {language}/{request.section_id}")
        return structure
    except Exception as e:
        logger.error(f"Error in add_section: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/structure/{language}/subsection", response_model=DocumentStructure)
async def add_subsection(language: str, request: AddSubsectionRequest):
    """
    Add a new subsection to a section
    """
    try:
        logger.info(f"POST request to add subsection: {language}/{request.section_id}/{request.subsection_id}")
        structure = await content_service.add_subsection(language, request)
        logger.info(f"Successfully added subsection: {language}/{request.section_id}/{request.subsection_id}")
        return structure
    except Exception as e:
        logger.error(f"Error in add_subsection: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Content routes
@router.get("/{language}/{content_id:path}", response_model=PageContentResponse)
async def get_page_content(language: str, content_id: str):
    """
    Retrieve page content for a specific language and content ID
    """
    try:
        logger.info(f"GET request for page content: {language}/{content_id}")
        content = await content_service.get_content(language, content_id)
        
        if not content:
            logger.warning(f"Content not found: {language}/{content_id}")
            return PageContentResponse(
                pageContent="",
                tableOfContent={},
                _id=content_id,
                pageURL=content_id,
                headers=[],
                structure={}
            )
        
        # Convert TableOfContentData to dict if needed
        table_of_content = (
            content.tableOfContent.dict() 
            if hasattr(content.tableOfContent, 'dict') 
            else content.tableOfContent or {}
        )
        
        logger.info(f"Successfully retrieved content: {content}")
        return PageContentResponse(
            pageContent=content.pageContent,
            tableOfContent=table_of_content,  # Use the converted dict
            _id=content_id,
            pageURL=content.pageURL,
            headers=content.headers if hasattr(content, 'headers') else [],
            structure=content.structure if hasattr(content, 'structure') else {}
        )
    except Exception as e:
        logger.error(f"Error in get_page_content: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{language}/{content_id:path}", response_model=PageContentResponse)
async def save_page_content(
    language: str,
    content_id: str,
    content: PageContentCreate
):
    """
    Save page content for a specific language and content ID
    """
    try:
        logger.info(f"POST request to save page content: {language}/{content_id}")
        logger.debug(f"Content data: {content}")
        
        saved_content = await content_service.save_content(language, content_id, content)
        
        logger.info(f"Successfully saved page content: {language}/{content_id}")
        return PageContentResponse(
            pageContent=saved_content.pageContent,
            tableOfContent=saved_content.tableOfContent or {},
            _id=content_id,
            pageURL=saved_content.pageURL,
            headers=saved_content.headers if hasattr(saved_content, 'headers') else [],
            structure=saved_content.structure if hasattr(saved_content, 'structure') else {}
        )
    except Exception as e:
        logger.error(f"Error in save_page_content: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/health")
async def health_check():
    return {"status": "ok"}