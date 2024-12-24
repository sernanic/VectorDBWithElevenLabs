from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import logging
from pinecone import Pinecone
from pinecone_plugins.assistant.models.chat import Message
from dotenv import load_dotenv

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
    prefix="/chatbot",
    tags=["chatbot"]
)

class ChatRequest(BaseModel):
    messages: List[dict]
    stream: bool = False
    filter: Optional[dict] = None

class FileInfo(BaseModel):
    status: str
    id: str
    name: str
    size: float
    metadata: Optional[Dict[str, Any]] = None
    updated_on: str
    created_on: str
    percent_done: float
    signed_url: str
    error_message: Optional[str] = None

class Reference(BaseModel):
    file: FileInfo
    pages: List[int]

class Citation(BaseModel):
    position: int
    references: List[Reference]

class ChatResponse(BaseModel):
    content: str
    role: str
    citations: Optional[List[Dict[str, Any]]] = None

def convert_citations(response_citations):
    """Convert Pinecone citations to dictionary format."""
    if not response_citations:
        return None
    
    citations_list = []
    for citation in response_citations:
        citation_dict = {
            "position": citation.position,
            "references": []
        }
        
        for ref in citation.references:
            reference_dict = {
                "file": {
                    "status": ref.file.status,
                    "id": ref.file.id,
                    "name": ref.file.name,
                    "size": ref.file.size,
                    "metadata": ref.file.metadata,
                    "updated_on": ref.file.updated_on,
                    "created_on": ref.file.created_on,
                    "percent_done": ref.file.percent_done,
                    "signed_url": ref.file.signed_url,
                    "error_message": ref.file.error_message
                },
                "pages": ref.pages
            }
            citation_dict["references"].append(reference_dict)
            
        citations_list.append(citation_dict)
    
    return citations_list

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    assistant = Depends(get_assistant)
):
    """
    Endpoint to chat with Pinecone assistant.
    
    Args:
        request: ChatRequest containing messages and optional parameters
        
    Returns:
        ChatResponse containing assistant's response
    """
    try:
        # Convert dict messages to Message objects
        formatted_messages = [Message(**msg) for msg in request.messages]
        
        # Get response from assistant
        response = assistant.chat(
            messages=formatted_messages,
            stream=request.stream,
            filter=request.filter
        )
        
        # Convert citations to dictionary format
        citations = convert_citations(response.citations) if hasattr(response, 'citations') else None
        
        # Log the converted citations for debugging
        logger.debug(f"Converted citations: {citations}")
        
        return ChatResponse(
            content=response.message.content,
            role="assistant",
            citations=citations
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")