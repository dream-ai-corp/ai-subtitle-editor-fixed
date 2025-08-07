from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.http import FileResponse
from django.conf import settings
import os
import tempfile
from ..models.subtitle_models import SubtitleProject, SubtitleEntry, SubtitleStyle, SubtitleExport
from ..serializers.subtitle_serializers import (
    SubtitleProjectSerializer, SubtitleEntrySerializer, 
    SubtitleStyleSerializer, SubtitleExportSerializer,
    VideoUploadSerializer, SubtitleExportRequestSerializer, SubtitleSplitRequestSerializer
)
from ..services.video_service import VideoService

User = get_user_model()

class SubtitleProjectViewSet(viewsets.ModelViewSet):
    queryset = SubtitleProject.objects.all()
    serializer_class = SubtitleProjectSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return SubtitleProject.objects.filter(user=self.request.user)
        else:
            # Return all projects for development
            return SubtitleProject.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            # Create or get a default user for development
            dev_user, created = User.objects.get_or_create(
                username='dev_user',
                defaults={'email': 'dev@example.com'}
            )
            serializer.save(user=dev_user)
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Get project processing status"""
        project = self.get_object()
        return Response({
            'id': project.id,
            'status': project.status,
            'is_processing': project.is_processing,
            'is_completed': project.is_completed,
            'subtitle_count': project.subtitle_count
        })
    
    @action(detail=True, methods=['get'])
    def subtitles(self, request, pk=None):
        """Get all subtitles for a project"""
        project = self.get_object()
        subtitles = SubtitleEntry.objects.filter(project=project)
        serializer = SubtitleEntrySerializer(subtitles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def export(self, request, pk=None):
        """Export subtitles in various formats"""
        project = self.get_object()
        serializer = SubtitleExportRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            format_type = serializer.validated_data['format']
            style_id = serializer.validated_data.get('style_id')
            
            # Get subtitles
            subtitles = SubtitleEntry.objects.filter(project=project)
            subtitle_data = [{
                'start_time': sub.start_time,
                'end_time': sub.end_time,
                'text': sub.text,
                'language': sub.language
            } for sub in subtitles]
            
            # Export subtitles
            from ..services.whisper_service import SubtitleFormatter
            exported_content = SubtitleFormatter.export_subtitles(subtitle_data, format_type)
            
            # Create export record
            export = SubtitleExport.objects.create(
                project=project,
                format=format_type,
                file=f"exports/{project.id}_{format_type}.{format_type}",
                style_id=style_id
            )
            
            # Save exported file
            export_dir = os.path.join(settings.MEDIA_ROOT, 'exports')
            os.makedirs(export_dir, exist_ok=True)
            export_path = os.path.join(export_dir, f"{project.id}_{format_type}.{format_type}")
            
            with open(export_path, 'w', encoding='utf-8') as f:
                f.write(exported_content)
            
            return Response({
                'export_id': export.id,
                'download_url': f"/api/subtitle/exports/{export.id}/download/"
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def embed_subtitles(self, request, pk=None):
        """Embed subtitles directly into video"""
        project = self.get_object()
        
        # Get embedding parameters
        style = request.data.get('style', 'default')
        font_size = request.data.get('font_size', 24)
        font_color = request.data.get('font_color', 'white')
        outline_color = request.data.get('outline_color', 'black')
        
        # Get subtitles
        subtitles = SubtitleEntry.objects.filter(project=project)
        subtitle_data = [{
            'start_time': sub.start_time,
            'end_time': sub.end_time,
            'text': sub.text,
            'language': sub.language
        } for sub in subtitles]
        
        # Get video path
        video_path = project.video_file.path
        
        # Create output path
        output_filename = f"{project.name}_with_subtitles.mp4"
        output_dir = os.path.join(settings.MEDIA_ROOT, 'embedded_videos')
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, output_filename)
        
        # Embed subtitles
        success = VideoService.embed_subtitles(
            video_path=video_path,
            subtitles=subtitle_data,
            output_path=output_path,
            style=style,
            font_size=font_size,
            font_color=font_color,
            outline_color=outline_color
        )
        
        if success:
            # Create export record
            export = SubtitleExport.objects.create(
                project=project,
                format='embedded_video',
                file=f"embedded_videos/{output_filename}",
                style_id=None
            )
            
            return Response({
                'success': True,
                'export_id': export.id,
                'download_url': f"/api/subtitle/exports/{export.id}/download/",
                'message': 'Subtitles embedded successfully'
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to embed subtitles'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SubtitleEntryViewSet(viewsets.ModelViewSet):
    queryset = SubtitleEntry.objects.all()
    serializer_class = SubtitleEntrySerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return SubtitleEntry.objects.filter(project__user=self.request.user)
        else:
            # Return all entries for development
            return SubtitleEntry.objects.all()
    
    @action(detail=True, methods=['post'])
    def split(self, request, pk=None):
        """Split a subtitle entry at a specific time"""
        subtitle = self.get_object()
        serializer = SubtitleSplitRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            split_time = serializer.validated_data['split_time']
            
            # Validate split time
            if split_time <= subtitle.start_time or split_time >= subtitle.end_time:
                return Response({
                    'error': 'Split time must be between start and end time'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new subtitle entry
            new_subtitle = SubtitleEntry.objects.create(
                project=subtitle.project,
                start_time=split_time,
                end_time=subtitle.end_time,
                text=subtitle.text,
                language=subtitle.language,
                confidence=subtitle.confidence,
                is_edited=True
            )
            
            # Update original subtitle
            subtitle.end_time = split_time
            subtitle.is_edited = True
            subtitle.save()
            
            return Response({
                'original_subtitle': SubtitleEntrySerializer(subtitle).data,
                'new_subtitle': SubtitleEntrySerializer(new_subtitle).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def merge(self, request, pk=None):
        """Merge with next subtitle entry"""
        subtitle = self.get_object()
        
        # Find next subtitle
        next_subtitle = SubtitleEntry.objects.filter(
            project=subtitle.project,
            start_time__gt=subtitle.start_time
        ).order_by('start_time').first()
        
        if not next_subtitle:
            return Response({
                'error': 'No next subtitle to merge with'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Merge text
        merged_text = f"{subtitle.text} {next_subtitle.text}"
        
        # Update original subtitle
        subtitle.end_time = next_subtitle.end_time
        subtitle.text = merged_text
        subtitle.is_edited = True
        subtitle.save()
        
        # Delete next subtitle
        next_subtitle.delete()
        
        return Response(SubtitleEntrySerializer(subtitle).data)

class SubtitleStyleViewSet(viewsets.ModelViewSet):
    queryset = SubtitleStyle.objects.all()
    serializer_class = SubtitleStyleSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    
    def get_queryset(self):
        return SubtitleStyle.objects.filter(is_active=True)

class SubtitleExportViewSet(viewsets.ModelViewSet):
    queryset = SubtitleExport.objects.all()
    serializer_class = SubtitleExportSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return SubtitleExport.objects.filter(project__user=self.request.user)
        else:
            # Return all exports for development
            return SubtitleExport.objects.all()
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download exported file"""
        export = self.get_object()
        file_path = export.file.path
        
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
        else:
            return Response({
                'error': 'File not found'
            }, status=status.HTTP_404_NOT_FOUND) 