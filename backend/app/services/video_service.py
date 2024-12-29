import logging
from typing import Optional, Tuple
from youtube_transcript_api import YouTubeTranscriptApi
from langchain.text_splitter import RecursiveCharacterTextSplitter
from transformers import BridgeTowerModel, BridgeTowerProcessor
import lancedb
import re
import os
import cv2
from ..core.config import get_settings
from PIL import Image
from ..utils.video_utils import download_video, get_transcript_vtt
import torch
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

class VideoService:
    def __init__(self):
        try:
            # Create necessary directories if they don't exist
            self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            self.data_dir = os.path.join(self.base_dir, "data")
            self.frames_dir = os.path.join(self.data_dir, "frames")
            os.makedirs(self.data_dir, exist_ok=True)
            os.makedirs(self.frames_dir, exist_ok=True)
            
            logger.info(f"Initialized directories: {self.data_dir}, {self.frames_dir}")
            
            self.db = lancedb.connect(self.data_dir)
            
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=100
            )
            
            self.frames_per_second = 0.2  # Extract 1 frame every 5 seconds
            self.frame_height = 350
            
            logger.info("VideoService initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing VideoService: {str(e)}")
            raise

    def extract_video_id(self, url: str) -> str:
        """Extract YouTube video ID from URL."""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]*)',
            r'youtube\.com\/embed\/([^&\n?]*)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        raise ValueError("Invalid YouTube URL")

    def maintain_aspect_ratio_resize(self, image, height=350):
        """Resize image maintaining aspect ratio."""
        aspect_ratio = image.shape[1] / image.shape[0]
        width = int(height * aspect_ratio)
        return cv2.resize(image, (width, height))

    def extract_frames(self, video_id: str) -> list:
        """Extract frames from video at specified FPS rate."""
        try:
            # Download video using the utility function
            video_dir = os.path.join(self.data_dir, video_id)
            os.makedirs(video_dir, exist_ok=True)
            
            video_url = f'https://www.youtube.com/watch?v={video_id}'
            video_path = download_video(video_url, video_dir)
            transcript_path = get_transcript_vtt(video_url, video_dir)

            if not os.path.exists(video_path):
                raise Exception("Video file not found after download")

            # Extract frames
            frames_info = []
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise Exception("Failed to open video file")
                
            fps = cap.get(cv2.CAP_PROP_FPS)
            hop = round(fps / self.frames_per_second)  # Frames to skip
            frame_count = 0
            idx = 0
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                    
                if frame_count % hop == 0:
                    # Resize frame maintaining aspect ratio
                    resized_frame = self.maintain_aspect_ratio_resize(
                        frame, 
                        height=self.frame_height
                    )
                    
                    frame_path = os.path.join(
                        self.frames_dir, 
                        f"{video_id}_frame_{idx}.jpg"
                    )
                    cv2.imwrite(frame_path, resized_frame)
                    
                    timestamp_ms = (frame_count / fps) * 1000
                    frames_info.append({
                        "frame_path": frame_path,
                        "timestamp_ms": timestamp_ms,
                        "frame_id": idx
                    })
                    idx += 1
                
                frame_count += 1
            
            cap.release()
            
            # Clean up downloaded video
            try:
                os.remove(video_path)
            except Exception as cleanup_error:
                print(f"Warning: Failed to clean up video file: {str(cleanup_error)}")
                
            if not frames_info:
                raise Exception("No frames were extracted from the video")
                
            return frames_info
            
        except Exception as e:
            print(f"Error extracting frames: {str(e)}")
            # Clean up any partially downloaded files
            try:
                if 'video_path' in locals() and os.path.exists(video_path):
                    os.remove(video_path)
            except:
                pass
            return []

    async def process_video(self, video_id: str) -> bool:
        """Process a YouTube video captions."""
        try:
            logger.info(f"Starting video processing for video_id: {video_id}")
            
            # Drop existing table if it exists
            table_name = f"video_{video_id}"
            try:
                if table_name in self.db.table_names():
                    self.db.drop_table(table_name)
            except Exception as e:
                logger.warning(f"Error dropping existing table: {str(e)}")
            
            # Get video captions
            logger.info("Fetching video transcript...")
            captions = YouTubeTranscriptApi.get_transcript(video_id)
            
            # Process captions
            data = []
            for caption in captions:
                data.append({
                    "text": caption["text"],
                    "metadata": {
                        "video_id": video_id,
                        "timestamp_ms": caption["start"] * 1000,
                        "duration": caption["duration"]
                    }
                })
            
            # Create new table
            if data:
                logger.info(f"Creating table for video_{video_id}")
                table = self.db.create_table(
                    table_name,
                    data=data,
                    mode="create"
                )
                
                try:
                    # Create full-text search index
                    logger.info("Creating full-text search index")
                    table.create_fts_index(["text"])
                    logger.info("Successfully created full-text search index")
                except Exception as e:
                    logger.warning(f"Warning while creating FTS index: {str(e)}")
                    pass
                
                logger.info("Video processing completed successfully")
                return True
                
            logger.warning("No captions were found for the video")
            return False

        except Exception as e:
            logger.error(f"Error processing video: {str(e)}", exc_info=True)
            raise Exception(f"Failed to process video: {str(e)}")

    async def query_video_content(self, video_id: str, query: str) -> Tuple[str, Optional[float]]:
        """Query video content and return response with timestamp."""
        try:
            logger.info(f"Querying video content for video_id: {video_id} with query: {query}")
            
            table = self.db.open_table(f"video_{video_id}")
            
            # First find the exact match
            exact_results = (
                table.search(query)
                .limit(1)
                .select(["text", "metadata"])
                .to_list()
            )
            
            if exact_results:
                match_timestamp = exact_results[0]['metadata']['timestamp_ms']
                
                # Get exactly one minute before and after (60000 ms = 1 minute)
                window_results = (
                    table.search("*")
                    .where(f"metadata.timestamp_ms >= {match_timestamp - 60000} AND metadata.timestamp_ms <= {match_timestamp + 60000}")
                    .select(["text", "metadata"])
                    .to_list()
                )
                
                # Sort by timestamp
                window_results.sort(key=lambda x: x['metadata']['timestamp_ms'])
                
                # Build context with clear minute:second timestamps
                context_parts = []
                for result in window_results:
                    timestamp = result['metadata']['timestamp_ms'] / 1000  # Convert to seconds
                    minutes = int(timestamp // 60)
                    seconds = int(timestamp % 60)
                    context_parts.append(f"[{minutes}:{seconds:02d}] {result['text']}")
                
                # Join with newlines for better readability
                context = "\n".join(context_parts)

                print("context", context)
                
                logger.info("Generating response using OpenAI")
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                
                prompt = f"""
                Here is a 2-minute segment from the video transcript (one minute before and after the relevant part):

                {context}

                Based ONLY on this transcript segment, explain what is being discussed or described.
                Be specific and accurate to the transcript content.
                Include any features, comparisons, or technical details mentioned.
                Do not add any external information not present in this transcript.
                """
                
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system", 
                            "content": """You are an assistant that summarizes video transcript segments.
                            Your responses must:
                            1. Only use information explicitly stated in the transcript
                            2. Be specific about what's being discussed
                            3. Include relevant details and comparisons mentioned
                            4. Never add external information or assumptions
                            5. If features or technical details are mentioned, include them"""
                        },
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=250
                )
                
                answer = response.choices[0].message.content
                first_timestamp = exact_results[0]['metadata']['timestamp_ms'] / 1000
                
                logger.info(f"Successfully generated response with timestamp: {first_timestamp}")
                return answer, first_timestamp
                
            else:
                logger.warning("No relevant content found in the video")
                return "I couldn't find any discussion about that topic in the video.", None

        except Exception as e:
            logger.error(f"Error querying video content: {str(e)}", exc_info=True)
            raise Exception(f"Failed to query video content: {str(e)}")
