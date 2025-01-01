from fastapi import APIRouter, HTTPException, status
from bs4 import BeautifulSoup
import requests
from openai import OpenAI
import os
from dotenv import load_dotenv
from ..services.content_service import content_service
from ..schemas.content import AddSubsectionRequest
import logging
from pydantic import BaseModel

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

router = APIRouter(
    prefix="/webContent",
    tags=["web_content"]
)

class WebContentRequest(BaseModel):
    url: str
    section_id: str
    title: str

def clean_html_content(html_content: str) -> str:
    """Clean HTML content by removing scripts, styles, and extracting text"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove unwanted tags
    for tag in soup(['script', 'style', 'img', 'svg', 'iframe']):
        tag.decompose()
    
    # Get text content
    text = soup.get_text(separator='\n', strip=True)
    logger.info(f"Cleaned content: {text}")
    return text

@router.post("/add")
async def add_web_content(request: WebContentRequest):
    """
    Extract content from a web URL, process it with OpenAI, and add it as a subsection
    """
    try:
        # Fetch webpage content
        response = requests.get(request.url)
        response.raise_for_status()
        
        # Clean HTML content
        cleaned_content = clean_html_content(response.text)
        
        # Initialize OpenAI client
        client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Convert to markdown using OpenAI
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are a technical documentation specialist. Convert HTML content to markdown while:
                1. Preserving original documentation text and structure
                2. Excluding any table of contents sections
                3. Ignoring navigation menus and non-documentation content
                4. Maintaining code blocks, lists, headings, and technical formatting
                5. Excluding images and their captions"""},
                
                {"role": "user", "content": f"Convert this HTML to markdown, preserving only documentation content:\n\n{cleaned_content}"}
            ]
        )
        
        markdown_content = completion.choices[0].message.content
        
        # Use the provided title and create a URL-friendly subsection ID
        subsection_id = request.title.lower().replace(' ', '-').replace('/', '-')
        
        # Create proper AddSubsectionRequest
        subsection_request = AddSubsectionRequest(
            section_id=request.section_id,
            subsection_id=subsection_id,
            title=f"## {request.title}",
            content=markdown_content
        )
        
        # Add subsection using the request object
        structure = await content_service.add_subsection('en', subsection_request)
        
        return {"status": "success", "structure": structure}
        
    except requests.RequestException as e:
        logger.error(f"Error fetching URL {request.url}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error fetching URL: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing web content: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing web content: {str(e)}"
        ) 