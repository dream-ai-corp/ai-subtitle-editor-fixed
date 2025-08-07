import os
import ffmpeg
import tempfile
from typing import List, Dict, Any
from django.conf import settings
from .whisper_service import SubtitleFormatter

class VideoService:
    """Service for video processing operations"""
    
    @staticmethod
    def validate_video(file_path: str) -> Dict[str, Any]:
        """Validate video file and return metadata"""
        try:
            probe = ffmpeg.probe(file_path)
            video_info = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)
            audio_info = next((stream for stream in probe['streams'] if stream['codec_type'] == 'audio'), None)
            
            if not video_info:
                raise ValueError("No video stream found")
            
            duration = float(probe['format']['duration'])
            size = int(probe['format']['size'])
            
            return {
                'valid': True,
                'duration': duration,
                'size': size,
                'width': int(video_info['width']),
                'height': int(video_info['height']),
                'fps': eval(video_info['r_frame_rate']),
                'has_audio': audio_info is not None,
                'format': probe['format']['format_name']
            }
        except Exception as e:
            return {
                'valid': False,
                'error': str(e)
            }
    
    @staticmethod
    def extract_audio(video_path: str, output_path: str) -> bool:
        """Extract audio from video file"""
        try:
            ffmpeg.input(video_path).output(output_path, acodec='pcm_s16le').run(quiet=True)
            return True
        except Exception as e:
            print(f"Error extracting audio: {e}")
            return False
    
    @staticmethod
    def compress_video(input_path: str, output_path: str, target_size_mb: int = 100) -> bool:
        """Compress video to target size"""
        try:
            # Get video info
            probe = ffmpeg.probe(input_path)
            duration = float(probe['format']['duration'])
            
            # Calculate target bitrate (bits per second)
            target_size_bits = target_size_mb * 8 * 1024 * 1024
            target_bitrate = int(target_size_bits / duration)
            
            ffmpeg.input(input_path).output(
                output_path,
                video_bitrate=target_bitrate,
                acodec='aac',
                vcodec='libx264',
                preset='medium'
            ).run(quiet=True)
            
            return True
        except Exception as e:
            print(f"Error compressing video: {e}")
            return False
    
    @staticmethod
    def generate_thumbnail(video_path: str, output_path: str, time: str = "00:00:05") -> bool:
        """Generate thumbnail from video"""
        try:
            ffmpeg.input(video_path, ss=time).output(
                output_path,
                vframes=1,
                vf='scale=320:240'
            ).run(quiet=True)
            return True
        except Exception as e:
            print(f"Error generating thumbnail: {e}")
            return False
    
    @staticmethod
    def embed_subtitles(video_path: str, subtitles: List[Dict], output_path: str, 
                       style: str = "default", font_size: int = 24, 
                       font_color: str = "white", outline_color: str = "black") -> bool:
        """
        Embed subtitles directly into video file
        
        Args:
            video_path: Path to input video
            subtitles: List of subtitle dictionaries with start_time, end_time, text
            output_path: Path for output video with embedded subtitles
            style: Subtitle style (default, modern, bold, minimal)
            font_size: Font size in pixels
            font_color: Font color (white, yellow, etc.)
            outline_color: Outline color for better visibility
        """
        try:
            # Create temporary SRT file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.srt', delete=False) as temp_srt:
                srt_content = SubtitleFormatter.format_srt(subtitles)
                temp_srt.write(srt_content)
                temp_srt_path = temp_srt.name
            
            # Define subtitle filter based on style
            subtitle_filter = VideoService._get_subtitle_filter(
                temp_srt_path, style, font_size, font_color, outline_color
            )
            
            # Process video with embedded subtitles
            ffmpeg.input(video_path).output(
                output_path,
                vf=subtitle_filter,
                acodec='copy',  # Copy audio without re-encoding
                vcodec='libx264',
                preset='medium'
            ).run(quiet=True)
            
            # Clean up temporary file
            os.unlink(temp_srt_path)
            
            return True
            
        except Exception as e:
            print(f"Error embedding subtitles: {e}")
            # Clean up temporary file if it exists
            if 'temp_srt_path' in locals():
                try:
                    os.unlink(temp_srt_path)
                except:
                    pass
            return False
    
    @staticmethod
    def _get_subtitle_filter(srt_path: str, style: str, font_size: int, 
                           font_color: str, outline_color: str) -> str:
        """Generate FFmpeg subtitle filter based on style"""
        
        # Base subtitle filter
        base_filter = f"subtitles={srt_path}"
        
        # Style-specific configurations
        style_configs = {
            'default': {
                'fontsize': font_size,
                'fontcolor': font_color,
                'outline': 2,
                'outlinecolor': outline_color,
                'shadow': 1,
                'shadowcolor': 'black',
                'shadowoffset': 2
            },
            'modern': {
                'fontsize': font_size,
                'fontcolor': font_color,
                'outline': 1,
                'outlinecolor': outline_color,
                'shadow': 2,
                'shadowcolor': 'rgba(0,0,0,0.5)',
                'shadowoffset': 3,
                'box': 1,
                'boxcolor': 'rgba(0,0,0,0.3)',
                'boxborderw': 5
            },
            'bold': {
                'fontsize': font_size + 4,
                'fontcolor': font_color,
                'outline': 3,
                'outlinecolor': outline_color,
                'shadow': 1,
                'shadowcolor': 'black',
                'shadowoffset': 1
            },
            'minimal': {
                'fontsize': font_size - 2,
                'fontcolor': font_color,
                'outline': 1,
                'outlinecolor': outline_color,
                'shadow': 0
            }
        }
        
        config = style_configs.get(style, style_configs['default'])
        
        # Build filter string
        filter_parts = [base_filter]
        
        if config.get('outline'):
            filter_parts.append(f":outline={config['outline']}")
        if config.get('outlinecolor'):
            filter_parts.append(f":outlinecolor={config['outlinecolor']}")
        if config.get('shadow'):
            filter_parts.append(f":shadow={config['shadow']}")
        if config.get('shadowcolor'):
            filter_parts.append(f":shadowcolor={config['shadowcolor']}")
        if config.get('shadowoffset'):
            filter_parts.append(f":shadowoffset={config['shadowoffset']}")
        if config.get('box'):
            filter_parts.append(f":box={config['box']}")
        if config.get('boxcolor'):
            filter_parts.append(f":boxcolor={config['boxcolor']}")
        if config.get('boxborderw'):
            filter_parts.append(f":boxborderw={config['boxborderw']}")
        
        return ''.join(filter_parts)

class VideoUploadService:
    """Service for handling video uploads and project creation"""
    
    @staticmethod
    def process_uploaded_video(video_file, project_name: str, description: str, 
                             language: str, user) -> Dict[str, Any]:
        """Process uploaded video and create subtitle project"""
        try:
            # Create project directory
            project_dir = os.path.join(settings.MEDIA_ROOT, 'videos', str(user.id))
            os.makedirs(project_dir, exist_ok=True)
            
            # Save video file
            video_filename = f"{project_name}_{video_file.name}"
            video_path = os.path.join(project_dir, video_filename)
            
            with open(video_path, 'wb+') as destination:
                for chunk in video_file.chunks():
                    destination.write(chunk)
            
            # Validate video
            video_info = VideoService.validate_video(video_path)
            if not video_info['valid']:
                raise ValueError(f"Invalid video file: {video_info['error']}")
            
            # Extract audio for processing
            audio_path = os.path.join(project_dir, f"{project_name}_audio.wav")
            if not VideoService.extract_audio(video_path, audio_path):
                raise ValueError("Failed to extract audio from video")
            
            # Process video with Whisper
            from .whisper_service import WhisperService
            subtitles = WhisperService.process_video(audio_path, language)
            
            # Create project in database
            from ..models.subtitle_models import SubtitleProject, SubtitleEntry
            
            project = SubtitleProject.objects.create(
                user=user,
                name=project_name,
                description=description,
                video_file=f"videos/{user.id}/{video_filename}",
                video_duration=video_info['duration'],
                video_size=video_info['size'],
                language=language,
                status='completed',
                is_processing=False,
                is_completed=True
            )
            
            # Create subtitle entries
            for i, subtitle in enumerate(subtitles):
                SubtitleEntry.objects.create(
                    project=project,
                    start_time=subtitle['start_time'],
                    end_time=subtitle['end_time'],
                    text=subtitle['text'],
                    language=language,
                    confidence=subtitle.get('confidence', 0.0),
                    is_edited=False
                )
            
            # Clean up temporary audio file
            if os.path.exists(audio_path):
                os.remove(audio_path)
            
            return {
                'success': True,
                'project_id': project.id,
                'subtitle_count': len(subtitles)
            }
            
        except Exception as e:
            # Clean up on error
            if 'video_path' in locals() and os.path.exists(video_path):
                os.remove(video_path)
            if 'audio_path' in locals() and os.path.exists(audio_path):
                os.remove(audio_path)
            
            raise e 