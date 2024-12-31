from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from ..services.video_service import VideoService

router = APIRouter(prefix="/api/videos", tags=["videos"])

class VideoProcess(BaseModel):
    url: str

class ChatMessage(BaseModel):
    videoId: str
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: Optional[float]
    context: Optional[str]

@router.post("/process")
async def process_video(
    video: VideoProcess,
    video_service: VideoService = Depends(VideoService)
):
    """
    Process a YouTube video URL:
    1. Extract video ID
    2. Download and process transcript
    3. Create vector embeddings for semantic search
    4. Store 5-minute context chunks
    """
    try:
        video_id = video_service.extract_video_id(video.url)
        success = await video_service.process_video(video_id, video.url)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to process video")
        
        return {"status": "success", "videoId": video_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    video_service: VideoService = Depends(VideoService)
):
    """
    Chat with the video content:
    1. Perform semantic search to find relevant segments
    2. Retrieve 5-minute context window
    3. Generate response using LLM
    4. Return response with timestamp for video navigation
    """
    try:
        response, timestamp = await video_service.query_video_content(
            message.videoId,
            message.message
        )
        return ChatResponse(
            response=response,
            timestamp=timestamp,
            context=None  # Context is handled internally for better responses
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_videos(
    video_service: VideoService = Depends(VideoService)
):
    try:
        videos = await video_service.get_all_videos()
        return videos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{video_id}")
async def get_video(
    video_id: str,
    video_service: VideoService = Depends(VideoService)
):
    try:
        video = await video_service.get_video_by_id(video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        return video
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
