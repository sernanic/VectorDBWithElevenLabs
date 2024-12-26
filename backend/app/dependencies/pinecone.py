from fastapi import Depends
from pinecone import Pinecone
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()
logger = logging.getLogger(__name__)

def get_pinecone_client() -> Pinecone:
    """
    Creates and returns a Pinecone client instance.
    """
    try:
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            logger.error("PINECONE_API_KEY is not set in environment variables")
            raise ValueError("PINECONE_API_KEY environment variable is required")
        
        return Pinecone(api_key=api_key)
    except Exception as e:
        logger.error(f"Error initializing Pinecone client: {str(e)}")
        raise

def get_assistant(pc: Pinecone = Depends(get_pinecone_client)):
    """
    Creates and returns a Pinecone Assistant instance.
    """
    try:
        assistant_name = os.getenv("PINECONE_ASSISTANT_NAME")
        if not assistant_name:
            logger.error("PINECONE_ASSISTANT_NAME is not set in environment variables")
            raise ValueError("PINECONE_ASSISTANT_NAME environment variable is required")
        
        return pc.assistant.Assistant(assistant_name=assistant_name)
    except Exception as e:
        logger.error(f"Error initializing Pinecone assistant: {str(e)}")
        raise

__all__ = ['get_pinecone_client', 'get_assistant'] 