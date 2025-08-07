from rest_framework import serializers
from ..models.subtitle_models import SubtitleProject, SubtitleEntry, SubtitleStyle, SubtitleExport

class SubtitleProjectSerializer(serializers.ModelSerializer):
    """Serializer for SubtitleProject model"""
    
    subtitle_count = serializers.ReadOnlyField()
    is_processing = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    user = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = SubtitleProject
        fields = [
            'id', 'name', 'description', 'video_file', 'video_duration', 
            'video_size', 'status', 'language', 'subtitle_count', 
            'is_processing', 'is_completed', 'user', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'video_duration', 'video_size', 'status', 
            'subtitle_count', 'is_processing', 'is_completed', 
            'user', 'created_at', 'updated_at'
        ]
    
    def validate_name(self, value):
        """Validate project name"""
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Project name cannot be empty")
        return value.strip()
    
    def validate_video_file(self, value):
        """Validate video file"""
        if not value:
            raise serializers.ValidationError("Video file is required")
        
        # Check file size (500MB limit)
        if value.size > 500 * 1024 * 1024:
            raise serializers.ValidationError("File size must be less than 500MB")
        
        # Check file extension
        allowed_extensions = ['mp4', 'avi', 'mov', 'mkv', 'webm']
        file_extension = value.name.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file format. Supported formats: {', '.join(allowed_extensions)}"
            )
        
        return value

class SubtitleEntrySerializer(serializers.ModelSerializer):
    """Serializer for SubtitleEntry model"""
    
    formatted_start_time = serializers.ReadOnlyField()
    formatted_end_time = serializers.ReadOnlyField()
    duration = serializers.ReadOnlyField()
    project_name = serializers.ReadOnlyField(source='project.name')
    
    class Meta:
        model = SubtitleEntry
        fields = [
            'id', 'project', 'project_name', 'start_time', 'end_time', 
            'text', 'language', 'confidence', 'is_edited', 
            'formatted_start_time', 'formatted_end_time', 'duration',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'project_name', 'confidence', 'is_edited',
            'formatted_start_time', 'formatted_end_time', 'duration',
            'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validate subtitle entry data"""
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        text = data.get('text')
        
        # Validate time range
        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError("Start time must be before end time")
            
            if start_time < 0 or end_time < 0:
                raise serializers.ValidationError("Times cannot be negative")
        
        # Validate text
        if text and len(text.strip()) == 0:
            raise serializers.ValidationError("Subtitle text cannot be empty")
        
        return data
    
    def validate_text(self, value):
        """Validate subtitle text"""
        if value and len(value.strip()) == 0:
            raise serializers.ValidationError("Subtitle text cannot be empty")
        return value.strip() if value else value

class SubtitleStyleSerializer(serializers.ModelSerializer):
    """Serializer for SubtitleStyle model"""
    
    class Meta:
        model = SubtitleStyle
        fields = ['id', 'name', 'description', 'css_class', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class SubtitleExportSerializer(serializers.ModelSerializer):
    """Serializer for SubtitleExport model"""
    
    project_name = serializers.ReadOnlyField(source='project.name')
    style_name = serializers.ReadOnlyField(source='style.name')
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SubtitleExport
        fields = [
            'id', 'project', 'project_name', 'format', 'file', 'file_url',
            'style', 'style_name', 'created_at'
        ]
        read_only_fields = [
            'id', 'project_name', 'file_url', 'style_name', 'created_at'
        ]
    
    def get_file_url(self, obj):
        """Get file download URL"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

class SubtitleProjectListSerializer(serializers.ModelSerializer):
    """Simplified serializer for project lists"""
    
    subtitle_count = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()
    
    class Meta:
        model = SubtitleProject
        fields = [
            'id', 'name', 'description', 'status', 'subtitle_count',
            'language', 'created_at'
        ]

class SubtitleEntryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for subtitle entry lists"""
    
    formatted_start_time = serializers.ReadOnlyField()
    formatted_end_time = serializers.ReadOnlyField()
    
    class Meta:
        model = SubtitleEntry
        fields = [
            'id', 'start_time', 'end_time', 'text', 'formatted_start_time',
            'formatted_end_time', 'is_edited', 'confidence'
        ]

class VideoUploadSerializer(serializers.Serializer):
    """Serializer for video upload requests"""
    
    video_file = serializers.FileField()
    name = serializers.CharField(max_length=255, required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    language = serializers.CharField(max_length=10, default='en')
    
    def validate_name(self, value):
        """Validate project name"""
        if value and len(value.strip()) == 0:
            raise serializers.ValidationError("Project name cannot be empty")
        return value.strip() if value else value

class SubtitleExportRequestSerializer(serializers.Serializer):
    """Serializer for subtitle export requests"""
    
    format = serializers.ChoiceField(choices=['srt', 'vtt', 'txt'], default='srt')
    style_id = serializers.IntegerField(required=False, allow_null=True)
    
    def validate_style_id(self, value):
        """Validate style ID if provided"""
        if value is not None:
            try:
                SubtitleStyle.objects.get(id=value, is_active=True)
            except SubtitleStyle.DoesNotExist:
                raise serializers.ValidationError("Invalid style ID")
        return value

class SubtitleSplitRequestSerializer(serializers.Serializer):
    """Serializer for subtitle split requests"""
    
    split_time = serializers.FloatField()
    
    def validate_split_time(self, value):
        """Validate split time"""
        if value <= 0:
            raise serializers.ValidationError("Split time must be positive")
        return value 