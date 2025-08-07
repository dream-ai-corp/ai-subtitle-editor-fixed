from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator

User = get_user_model()

class SubtitleProject(models.Model):
    """Model for managing subtitle projects"""
    
    STATUS_CHOICES = [
        ('uploading', 'Uploading'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subtitle_projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_file = models.FileField(
        upload_to='videos/',
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'avi', 'mov', 'mkv', 'webm'])]
    )
    video_duration = models.FloatField(null=True, blank=True)
    video_size = models.BigIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploading')
    language = models.CharField(max_length=10, default='en')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Subtitle Project'
        verbose_name_plural = 'Subtitle Projects'
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
    @property
    def subtitle_count(self):
        return self.subtitle_entries.count()
    
    @property
    def is_processing(self):
        return self.status in ['uploading', 'processing']
    
    @property
    def is_completed(self):
        return self.status == 'completed'

class SubtitleEntry(models.Model):
    """Model for individual subtitle entries"""
    
    project = models.ForeignKey(SubtitleProject, on_delete=models.CASCADE, related_name='subtitle_entries')
    start_time = models.FloatField(help_text='Start time in seconds')
    end_time = models.FloatField(help_text='End time in seconds')
    text = models.TextField()
    language = models.CharField(max_length=10, default='en')
    confidence = models.FloatField(null=True, blank=True, help_text='AI confidence score (0-1)')
    is_edited = models.BooleanField(default=False, help_text='Whether this subtitle has been manually edited')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_time']
        verbose_name = 'Subtitle Entry'
        verbose_name_plural = 'Subtitle Entries'
    
    def __str__(self):
        return f"{self.project.name} - {self.start_time}s to {self.end_time}s"
    
    @property
    def duration(self):
        return self.end_time - self.start_time
    
    @property
    def formatted_start_time(self):
        return self._format_time(self.start_time)
    
    @property
    def formatted_end_time(self):
        return self._format_time(self.end_time)
    
    def _format_time(self, seconds):
        """Convert seconds to HH:MM:SS format"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"

class SubtitleStyle(models.Model):
    """Model for subtitle styling options"""
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    css_class = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Subtitle Style'
        verbose_name_plural = 'Subtitle Styles'
    
    def __str__(self):
        return self.name

class SubtitleExport(models.Model):
    """Model for tracking subtitle exports"""
    
    FORMAT_CHOICES = [
        ('srt', 'SRT'),
        ('vtt', 'VTT'),
        ('ass', 'ASS'),
        ('txt', 'TXT'),
    ]
    
    project = models.ForeignKey(SubtitleProject, on_delete=models.CASCADE, related_name='exports')
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    file = models.FileField(upload_to='exports/')
    style = models.ForeignKey(SubtitleStyle, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Subtitle Export'
        verbose_name_plural = 'Subtitle Exports'
    
    def __str__(self):
        return f"{self.project.name} - {self.format.upper()} export" 