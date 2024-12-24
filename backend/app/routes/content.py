from fastapi import APIRouter, HTTPException, status, Depends
from ..schemas.content import PageContentCreate, PageContentResponse
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

@router.get("/{language}/{section_id}-{subsection_id}", response_model=PageContentResponse)
async def get_page_content(language: str, section_id: str, subsection_id: str):
    """
    Retrieve page content for a specific language and section
    """
    try:
        logger.info(f"GET request for page content: {language}/{section_id}-{subsection_id}")
        content_id = f"{section_id}-{subsection_id}"
        content = await content_service.get_content(language, content_id)
        
        if not content:
            logger.warning(f"Content not found: {language}/{section_id}-{subsection_id}")
            return PageContentResponse(
                pageContent="",
                tableOfContent=None
            )
        
        logger.info(f"Successfully retrieved page content: {language}/{section_id}-{subsection_id}")
        return PageContentResponse(
            pageContent=content.pageContent,
            tableOfContent=content.tableOfContent
        )
    except Exception as e:
        logger.error(f"Error in get_page_content: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/{language}/{section_id}-{subsection_id}", response_model=PageContentResponse)
async def save_page_content(
    language: str,
    section_id: str,
    subsection_id: str,
    content: PageContentCreate
):
    """
    Save page content for a specific language and section
    """
    try:
        logger.info(f"POST request to save page content: {language}/{section_id}-{subsection_id}")
        logger.debug(f"Content data: {content}")
        content_id = f"{section_id}-{subsection_id}"
        
        # Save content using the content service (which handles MongoDB, Astra DB, and Pinecone)
        saved_content = await content_service.save_content(language, content_id, content)
        
        logger.info(f"Successfully saved page content: {language}/{section_id}-{subsection_id}")
        return PageContentResponse(
            pageContent=saved_content.pageContent,
            tableOfContent=saved_content.tableOfContent
        )
    except Exception as e:
        logger.error(f"Error in save_page_content: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )