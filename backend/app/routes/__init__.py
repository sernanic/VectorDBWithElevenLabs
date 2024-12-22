from fastapi import APIRouter
from .content import router as content_router
from .chatbot import router as chatbot_router

api_router = APIRouter()
api_router.include_router(content_router)
api_router.include_router(chatbot_router)
