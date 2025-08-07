import os
import tempfile
import logging
from typing import List, Dict, Optional, Tuple
import whisper
import ffmpeg
from django.conf import settings
from django.core.files import File
from celery import shared_task
from ..models.subtitle_models import SubtitleProject, SubtitleEntry

logger = logging.getLogger(__name__)

class WhisperService:
    """Service for handling Whisper AI speech-to-text processing"""
    
    def __init__(self, model_name: str = "base"):
        """
        Initialize Whisper service with specified model
        
        Args:
            model_name: Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
        """
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load Whisper model"""
        try:
            logger.info(f"Loading Whisper model: {self.model_name}")
            self.model = whisper.load_model(self.model_name)
            logger.info(f"Whisper model {self.model_name} loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise
    
    def extract_audio_from_video(self, video_path: str) -> str:
        """
        Extract audio from video file using FFmpeg
        
        Args:
            video_path: Path to video file
            
        Returns:
            Path to extracted audio file
        """
        try:
            # Create temporary audio file
            audio_path = tempfile.mktemp(suffix='.wav')
            
            # Extract audio using FFmpeg
            stream = ffmpeg.input(video_path)
            stream = ffmpeg.output(stream, audio_path, acodec='pcm_s16le', ac=1, ar='16000')
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            logger.info(f"Audio extracted from {video_path} to {audio_path}")
            return audio_path
            
        except Exception as e:
            logger.error(f"Failed to extract audio from {video_path}: {e}")
            raise
    
    def transcribe_audio(self, audio_path: str, language: str = "en") -> Dict:
        """
        Transcribe audio using Whisper
        
        Args:
            audio_path: Path to audio file
            language: Language code (e.g., 'en', 'fr', 'es')
            
        Returns:
            Transcription result dictionary
        """
        try:
            logger.info(f"Starting transcription of {audio_path} in language {language}")
            
            # Transcribe with Whisper
            result = self.model.transcribe(
                audio_path,
                language=language,
                word_timestamps=True,
                verbose=True
            )
            
            logger.info(f"Transcription completed for {audio_path}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to transcribe {audio_path}: {e}")
            raise
    
    def process_segments_to_subtitles(self, segments: List[Dict]) -> List[Dict]:
        """
        Convert Whisper segments to subtitle format
        
        Args:
            segments: List of segments from Whisper
            
        Returns:
            List of subtitle dictionaries
        """
        subtitles = []
        
        for segment in segments:
            subtitle = {
                'start_time': segment['start'],
                'end_time': segment['end'],
                'text': segment['text'].strip(),
                'confidence': segment.get('avg_logprob', 0.0),
                'language': 'en'  # Default, can be enhanced
            }
            subtitles.append(subtitle)
        
        return subtitles
    
    def process_video(self, video_path: str, language: str = "en") -> List[Dict]:
        """
        Process video file to generate subtitles
        
        Args:
            video_path: Path to video file
            language: Language code
            
        Returns:
            List of subtitle dictionaries
        """
        try:
            # Extract audio
            audio_path = self.extract_audio_from_video(video_path)
            
            # Transcribe audio
            transcription = self.transcribe_audio(audio_path, language)
            
            # Convert to subtitle format
            subtitles = self.process_segments_to_subtitles(transcription['segments'])
            
            # Clean up temporary audio file
            if os.path.exists(audio_path):
                os.remove(audio_path)
            
            return subtitles
            
        except Exception as e:
            logger.error(f"Failed to process video {video_path}: {e}")
            raise

@shared_task
def process_video_async(project_id: int):
    """
    Celery task for asynchronous video processing
    
    Args:
        project_id: ID of the SubtitleProject
    """
    try:
        # Get project
        project = SubtitleProject.objects.get(id=project_id)
        
        # Update status to processing
        project.status = 'processing'
        project.save()
        
        # Initialize Whisper service
        whisper_service = WhisperService()
        
        # Process video
        video_path = project.video_file.path
        subtitles = whisper_service.process_video(video_path, project.language)
        
        # Create subtitle entries
        for subtitle_data in subtitles:
            SubtitleEntry.objects.create(
                project=project,
                start_time=subtitle_data['start_time'],
                end_time=subtitle_data['end_time'],
                text=subtitle_data['text'],
                confidence=subtitle_data['confidence'],
                language=subtitle_data['language']
            )
        
        # Update project status to completed
        project.status = 'completed'
        project.save()
        
        logger.info(f"Successfully processed video for project {project_id}")
        
    except SubtitleProject.DoesNotExist:
        logger.error(f"Project {project_id} not found")
        raise
    except Exception as e:
        # Update project status to failed
        try:
            project = SubtitleProject.objects.get(id=project_id)
            project.status = 'failed'
            project.save()
        except:
            pass
        
        logger.error(f"Failed to process video for project {project_id}: {e}")
        raise

class SubtitleFormatter:
    """Utility class for formatting subtitles in different formats"""
    
    @staticmethod
    def format_srt(subtitles: List[Dict]) -> str:
        """Format subtitles as SRT"""
        srt_content = ""
        
        for i, subtitle in enumerate(subtitles, 1):
            start_time = SubtitleFormatter._format_time_srt(subtitle['start_time'])
            end_time = SubtitleFormatter._format_time_srt(subtitle['end_time'])
            
            srt_content += f"{i}\n"
            srt_content += f"{start_time} --> {end_time}\n"
            srt_content += f"{subtitle['text']}\n\n"
        
        return srt_content
    
    @staticmethod
    def format_vtt(subtitles: List[Dict]) -> str:
        """Format subtitles as VTT"""
        vtt_content = "WEBVTT\n\n"
        
        for subtitle in subtitles:
            start_time = SubtitleFormatter._format_time_vtt(subtitle['start_time'])
            end_time = SubtitleFormatter._format_time_vtt(subtitle['end_time'])
            
            vtt_content += f"{start_time} --> {end_time}\n"
            vtt_content += f"{subtitle['text']}\n\n"
        
        return vtt_content
    
    @staticmethod
    def format_txt(subtitles: List[Dict]) -> str:
        """Format subtitles as plain text"""
        return "\n".join([subtitle['text'] for subtitle in subtitles])
    
    @staticmethod
    def _format_time_srt(seconds: float) -> str:
        """Format time for SRT format (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
    
    @staticmethod
    def _format_time_vtt(seconds: float) -> str:
        """Format time for VTT format (HH:MM:SS.mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millisecs:03d}" 