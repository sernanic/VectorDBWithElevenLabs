import logging
from typing import Optional, Tuple, List, Dict
from youtube_transcript_api import YouTubeTranscriptApi
from langchain.text_splitter import RecursiveCharacterTextSplitter
import lancedb
import re
import os
from ..core.config import get_settings
import openai
import numpy as np
from sentence_transformers import SentenceTransformer
import pyarrow as pa
from ..core.database import mongodb
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()
openai.api_key = settings.OPENAI_API_KEY

class VideoService:
    def __init__(self):
        try:
            # Create necessary directories
            self.base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            self.data_dir = os.path.join(self.base_dir, "data")
            os.makedirs(self.data_dir, exist_ok=True)
            
            logger.info(f"Initialized directory: {self.data_dir}")
            
            # Initialize LanceDB for vector storage
            self.db = lancedb.connect(self.data_dir)
            
            # Initialize sentence transformer for embeddings
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Text splitter for segmenting transcripts
            self.text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=300,  # Smaller chunks for better context
                chunk_overlap=50,
                separators=["\n", ".", "!", "?", ",", " ", ""]
            )
            
            # Initialize MongoDB connection
            self._db: Optional[AsyncIOMotorDatabase] = None
            
            logger.info("VideoService initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing VideoService: {str(e)}")
            raise

    @property
    async def mongodb(self) -> AsyncIOMotorDatabase:
        """Get MongoDB database instance."""
        if self._db is None:
            await mongodb.connect_to_mongodb()
            self._db = mongodb.db
        return self._db

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

    def _create_five_minute_chunks(self, captions: List[Dict]) -> List[Dict]:
        """Create 5-minute chunks from captions for broader context."""
        chunks = []
        current_chunk = {
            'text': '',
            'start': 0,
            'duration': 0
        }
        
        for caption in captions:
            if current_chunk['duration'] >= 300:  # 5 minutes = 300 seconds
                chunks.append(current_chunk)
                current_chunk = {
                    'text': caption['text'] + ' ',
                    'start': caption['start'],
                    'duration': caption['duration']
                }
            else:
                current_chunk['text'] += caption['text'] + ' '
                if not current_chunk['text']:
                    current_chunk['start'] = caption['start']
                current_chunk['duration'] += caption['duration']
        
        if current_chunk['text']:
            chunks.append(current_chunk)
        
        return chunks

    async def _store_chunks_in_mongodb(self, video_id: str, chunks: List[Dict]):
        """Store 5-minute chunks in MongoDB."""
        try:
            db = await self.mongodb
            collection = db['video_chunks']
            
            # Create documents for bulk insert
            documents = []
            for i, chunk in enumerate(chunks):
                documents.append({
                    'video_id': video_id,
                    'chunk_index': i,
                    'text': chunk['text'],
                    'start_time': chunk['start'],
                    'duration': chunk['duration']
                })
            
            # Delete existing chunks for this video
            await collection.delete_many({'video_id': video_id})
            
            # Insert new chunks
            if documents:
                await collection.insert_many(documents)
                logger.info(f"Stored {len(documents)} chunks for video {video_id}")
            
        except Exception as e:
            logger.error(f"Error storing chunks in MongoDB: {str(e)}")
            raise

    async def _get_context_from_mongodb(self, video_id: str, timestamp: float) -> Optional[str]:
        """Retrieve relevant context from MongoDB based on timestamp."""
        try:
            db = await self.mongodb
            collection = db['video_chunks']
            
            # Find the chunk containing the timestamp
            chunk = await collection.find_one({
                'video_id': video_id,
                'start_time': {'$lte': timestamp},
                '$expr': {
                    '$lte': [timestamp, {'$add': ['$start_time', '$duration']}]
                }
            })
            
            if chunk:
                # Get the previous and next chunks for more context
                prev_chunk = await collection.find_one({
                    'video_id': video_id,
                    'chunk_index': chunk['chunk_index'] - 1
                })
                
                next_chunk = await collection.find_one({
                    'video_id': video_id,
                    'chunk_index': chunk['chunk_index'] + 1
                })
                
                # Combine chunks for context
                context_parts = []
                if prev_chunk:
                    context_parts.append(prev_chunk['text'])
                context_parts.append(chunk['text'])
                if next_chunk:
                    context_parts.append(next_chunk['text'])
                
                return ' '.join(context_parts)
            
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving context from MongoDB: {str(e)}")
            raise

    async def _store_video_details(self, video_id: str, url: str):
        """Store video details in MongoDB."""
        try:
            db = await self.mongodb
            collection = db['videos']
            
            # Get video title from YouTube
            async with aiohttp.ClientSession() as session:
                async with session.get(f'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json') as response:
                    if response.status == 200:
                        video_data = await response.json()
                        title = video_data.get('title', 'Untitled Video')
                    else:
                        title = 'Untitled Video'
            
            # Create video document
            video_doc = {
                'video_id': video_id,
                'url': url,
                'title': title,
                'created_at': datetime.utcnow(),
                'status': 'processed'
            }
            
            # Upsert the video document
            await collection.update_one(
                {'video_id': video_id},
                {'$set': video_doc},
                upsert=True
            )
            
            logger.info(f"Stored video details for video_id: {video_id}")
            
        except Exception as e:
            logger.error(f"Error storing video details: {str(e)}")
            raise

    async def process_video(self, video_id: str, url: str) -> bool:
        """Process a YouTube video transcript with vector storage and document chunks."""
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
            
            if not captions:
                logger.warning("No captions found for the video")
                return False
            
            # Create and store 5-minute chunks
            chunks = self._create_five_minute_chunks(captions)
            await self._store_chunks_in_mongodb(video_id, chunks)
            
            # Process captions for vector search
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
                
                # Store video details in MongoDB
                await self._store_video_details(video_id, url)
                
                logger.info("Video processing completed successfully")
                return True
            
            logger.warning("No captions were found for the video")
            return False
            
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}", exc_info=True)
            raise Exception(f"Failed to process video: {str(e)}")

    def _convert_mongo_doc(self, doc):
        """Convert MongoDB document to a serializable dictionary."""
        if doc is None:
            return None
        
        # Convert ObjectId to string
        if '_id' in doc:
            doc['_id'] = str(doc['_id'])
        
        return doc

    async def get_all_videos(self):
        """Get all processed videos."""
        try:
            db = await self.mongodb
            collection = db['videos']
            videos = await collection.find().sort('created_at', -1).to_list(length=None)
            # Convert each document to a serializable format
            return [self._convert_mongo_doc(video) for video in videos]
        except Exception as e:
            logger.error(f"Error fetching videos: {str(e)}")
            raise

    async def get_video_by_id(self, video_id: str):
        """Get video details by ID."""
        try:
            db = await self.mongodb
            collection = db['videos']
            video = await collection.find_one({'video_id': video_id})
            return self._convert_mongo_doc(video)
        except Exception as e:
            logger.error(f"Error fetching video: {str(e)}")
            raise

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
                match_timestamp = exact_results[0]['metadata']['timestamp_ms'] / 1000
                
                # Get broader context from MongoDB
                context = await self._get_context_from_mongodb(video_id, match_timestamp)
                
                if not context:
                    # Fallback to vector search context if MongoDB fails
                    window_results = (
                        table.search("*")
                        .where(f"metadata.timestamp_ms >= {match_timestamp * 1000 - 60000} AND metadata.timestamp_ms <= {match_timestamp * 1000 + 60000}")
                        .select(["text", "metadata"])
                        .to_list()
                    )
                    
                    # Sort by timestamp
                    window_results.sort(key=lambda x: x['metadata']['timestamp_ms'])
                    
                    # Build context with clear minute:second timestamps
                    context_parts = []
                    for result in window_results:
                        timestamp = result['metadata']['timestamp_ms'] / 1000
                        minutes = int(timestamp // 60)
                        seconds = int(timestamp % 60)
                        context_parts.append(f"[{minutes}:{seconds:02d}] {result['text']}")
                    
                    context = "\n".join(context_parts)
                
                logger.info("Generating response using OpenAI")
                
                prompt = f"""
                Here is a segment from the video transcript:

                {context}

                Based ONLY on this transcript segment, answer to the best of your ability the query: {query}
                Be specific and accurate to the transcript content.
                Do not add any external information not present in this transcript.
                """
                
                response = openai.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system", 
                            "content": """You are an assistant that answers questions based on video transcript segments.
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
