from fastapi import Depends
from pinecone import Pinecone, ServerlessSpec
from dataclasses import dataclass
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()
logger = logging.getLogger(__name__)

@dataclass
class Message:
    content: str
    role: str = "user"

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
    Creates and returns a Pinecone index for the assistant.
    """
    try:
        assistant_name = os.getenv("PINECONE_ASSISTANT_NAME")
        if not assistant_name:
            logger.error("PINECONE_ASSISTANT_NAME is not set in environment variables")
            raise ValueError("PINECONE_ASSISTANT_NAME environment variable is required")
        
        # Try to get existing index or create a new one
        index_name = f"assistant-{assistant_name}"
        if index_name not in pc.list_indexes().names():
            pc.create_index(
                name=index_name,
                dimension=1536,  # OpenAI embeddings dimension
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                ) 

            )
        
        return pc.Index(index_name)
    except Exception as e:
        logger.error(f"Error initializing Pinecone index: {str(e)}")
        raise

__all__ = ['get_pinecone_client', 'get_assistant', 'Message'] 