from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from ..services.video_service import VideoService
from ..dependencies.auth import get_current_user

router = APIRouter(prefix="/api/videos", tags=["videos"])

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
    video_service: VideoService = Depends(VideoService),
    current_user: dict = Depends(get_current_user)
):
    try:
        video_id = video_service.extract_video_id(video.url)
        success = await video_service.process_video(video_id, video.url)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to process video")
            
        return {"status": "success", "videoId": video_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: ChatMessage,
    video_service: VideoService = Depends(VideoService),
    current_user: dict = Depends(get_current_user)
):
    try:
        response, timestamp = await video_service.query_video_content(
            message.videoId, 
            message.message
        )
        
        return ChatResponse(
            response=response,
            timestamp=timestamp
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def get_videos(
    video_service: VideoService = Depends(VideoService),
    current_user: dict = Depends(get_current_user)
):
    try:
        videos = await video_service.get_all_videos()
        return videos
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{video_id}")
async def get_video(
    video_id: str,
    video_service: VideoService = Depends(VideoService),
    current_user: dict = Depends(get_current_user)
):
    try:
        video = await video_service.get_video_by_id(video_id)
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        return video
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
