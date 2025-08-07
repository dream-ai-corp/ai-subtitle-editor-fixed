from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.subtitle_views import (
    SubtitleProjectViewSet,
    SubtitleEntryViewSet,
    SubtitleStyleViewSet,
    SubtitleExportViewSet
)

# Create router for subtitle viewsets
router = DefaultRouter()
router.register(r'projects', SubtitleProjectViewSet, basename='subtitle-project')
router.register(r'entries', SubtitleEntryViewSet, basename='subtitle-entry')
router.register(r'styles', SubtitleStyleViewSet, basename='subtitle-style')
router.register(r'exports', SubtitleExportViewSet, basename='subtitle-export')

urlpatterns = [
    path('', include(router.urls)),
] 