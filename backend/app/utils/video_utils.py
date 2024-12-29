import yt_dlp
import os
from youtube_transcript_api import YouTubeTranscriptApi

def download_video(url: str, output_dir: str) -> str:
    """
    Download a YouTube video using yt-dlp.
    
    Args:
        url: YouTube video URL
        output_dir: Directory to save the video
        
    Returns:
        str: Path to the downloaded video file
    """
    os.makedirs(output_dir, exist_ok=True)
    
    ydl_opts = {
        'format': 'mp4',
        'outtmpl': os.path.join(output_dir, '%(id)s.%(ext)s'),
        'quiet': True
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=True)
            video_path = os.path.join(output_dir, f"{info['id']}.mp4")
            return video_path
        except Exception as e:
            raise Exception(f"Failed to download video: {str(e)}")

def get_transcript_vtt(url: str, output_dir: str) -> str:
    """
    Get video transcript in VTT format.
    
    Args:
        url: YouTube video URL
        output_dir: Directory to save the transcript
        
    Returns:
        str: Path to the transcript file
    """
    try:
        video_id = url.split("watch?v=")[-1]
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Convert to VTT format
        vtt_content = "WEBVTT\n\n"
        for entry in transcript:
            start = format_timestamp(entry['start'])
            end = format_timestamp(entry['start'] + entry['duration'])
            text = entry['text']
            vtt_content += f"{start} --> {end}\n{text}\n\n"
        
        # Save to file
        output_path = os.path.join(output_dir, f"{video_id}.vtt")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(vtt_content)
            
        return output_path
    except Exception as e:
        raise Exception(f"Failed to get transcript: {str(e)}")

def format_timestamp(seconds: float) -> str:
    """Convert seconds to VTT timestamp format."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{seconds:06.3f}" 