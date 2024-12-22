from fastapi import APIRouter, HTTPException, status
import httpx
import os
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
import logging
from typing import Optional
import asyncio

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(env_path)

class ChatMessage(BaseModel):
    message: str

router = APIRouter(
    prefix="/chatbot",
    tags=["chatbot"]
)

# Get environment variables
BASE_API_URL = os.environ.get("BASE_API_URL")
LANGFLOW_ID = os.environ.get("LANGFLOW_ID")
APPLICATION_TOKEN = os.environ.get("APPLICATION_TOKEN")
ENDPOINT = os.environ.get("ENDPOINT")

if not all([BASE_API_URL, LANGFLOW_ID, APPLICATION_TOKEN, ENDPOINT]):
    missing_vars = [var for var, val in {
        "BASE_API_URL": BASE_API_URL,
        "LANGFLOW_ID": LANGFLOW_ID,
        "APPLICATION_TOKEN": APPLICATION_TOKEN,
        "ENDPOINT": ENDPOINT
    }.items() if not val]
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

async def make_request_with_retry(client: httpx.AsyncClient, url: str, payload: dict, headers: dict, max_retries: int = 3) -> Optional[dict]:
    """Make a request with retry logic"""
    for attempt in range(max_retries):
        try:
            response = await client.post(
                url, 
                json=payload, 
                headers=headers,
                timeout=30.0  # 30 seconds timeout
            )
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException as e:
            logger.warning(f"Timeout on attempt {attempt + 1} of {max_retries}")
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="Request to Langflow API timed out"
                )
            await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred: {str(e)}")
            logger.error(f"Response content: {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Error from Langflow API: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error on attempt {attempt + 1}: {str(e)}")
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=str(e)
                )
            await asyncio.sleep(1 * (attempt + 1))

@router.post("/message")
async def send_message(chat_message: ChatMessage):
    """
    Send a message to the Langflow API and return the response.
    """
    try:
        api_url = f"{BASE_API_URL}/lf/{LANGFLOW_ID}/api/v1/run/{ENDPOINT}"
        logger.info(f"Sending request to: {api_url}")
        
        payload = {
            "input_value": chat_message.message,
            "output_type": "chat",
            "input_type": "chat",
        }
        headers = {
            "Authorization": f"Bearer {APPLICATION_TOKEN}",
            "Content-Type": "application/json"
        }
        
        logger.info(f"Request payload: {payload}")
        
        async with httpx.AsyncClient() as client:
            result = await make_request_with_retry(client, api_url, payload, headers)
            
            if result and "outputs" in result and len(result["outputs"]) > 0:
                logger.info(f"API Response: {result}")
                return result["outputs"][0]["outputs"][0]["results"]["message"]["text"]
            else:
                logger.error(f"Unexpected response format: {result}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Unexpected response format from Langflow API"
                )
                
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )