from fastapi import APIRouter, HTTPException, status
from ..schemas.content import PageContentCreate, PageContentResponse, PageContentInDB
from ..services.content_service import content_service
import logging

logger = logging.getLogger(__name__)

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
