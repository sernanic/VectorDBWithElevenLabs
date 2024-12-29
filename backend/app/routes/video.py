from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from ..services.video_service import VideoService

router = APIRouter(prefix="/videos", tags=["videos"])

class VideoProcess(BaseModel):
    url: str

class ChatMessage(BaseModel):
    videoId: str
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: Optional[float]

@router.post("/process")
async def process_video(
    video: VideoProcess,
    video_service: VideoService = Depends(VideoService)
):
    try:
        video_id = video_service.extract_video_id(video.url)
        success = await video_service.process_video(video_id)
        
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
    response, timestamp = await video_service.query_video_content(
        message.videoId,
        message.message
    )
    return ChatResponse(response=response, timestamp=timestamp)
