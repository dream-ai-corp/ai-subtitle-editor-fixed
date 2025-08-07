#!/bin/bash

# AI Subtitle Editor - Demo Script
# This script demonstrates the subtitle functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🎬 AI Subtitle Editor - Demo"
echo "=============================="
echo ""

print_status "Starting the application..."
echo ""

# Check if application is running
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    print_success "Frontend is running at: http://localhost:8080"
else
    print_warning "Frontend not running. Please start with: ./scripts/quick-start.sh"
fi

if curl -s http://localhost:8000 > /dev/null 2>&1; then
    print_success "Backend is running at: http://localhost:8000"
else
    print_warning "Backend not running. Please start with: ./scripts/quick-start.sh"
fi

echo ""
echo "🚀 Demo Features:"
echo "=================="
echo ""
echo "1. 📤 Video Upload"
echo "   - Visit: http://localhost:8080/subtitle-upload"
echo "   - Drag & drop video files (MP4, AVI, MOV, MKV, WEBM)"
echo "   - File size limit: 500MB"
echo "   - Supported languages: English, French, Spanish, German, etc."
echo ""
echo "2. 🎯 AI Processing"
echo "   - OpenAI Whisper speech-to-text"
echo "   - Automatic subtitle generation"
echo "   - Confidence scores for accuracy"
echo ""
echo "3. ✏️ Subtitle Editor"
echo "   - Timeline-based editing"
echo "   - Real-time video playback"
echo "   - Split/merge subtitles"
echo "   - Text and timing adjustments"
echo ""
echo "4. 📤 Export Options"
echo "   - SRT format (SubRip)"
echo "   - VTT format (WebVTT)"
echo "   - TXT format (Plain text)"
echo "   - Multiple subtitle styles"
echo ""
echo "🎯 Demo Workflow:"
echo "=================="
echo ""
echo "1. Open http://localhost:8080/subtitle-upload"
echo "2. Upload a video file"
echo "3. Fill in project details"
echo "4. Wait for AI processing"
echo "5. Edit subtitles in the timeline editor"
echo "6. Export in your preferred format"
echo ""
echo "🧪 Testing:"
echo "==========="
echo ""
echo "Run Cypress tests:"
echo "  ./scripts/run-tests.sh cypress"
echo ""
echo "Run all tests:"
echo "  ./scripts/run-tests.sh"
echo ""
echo "📊 Features Implemented:"
echo "========================"
echo ""
echo "✅ Backend Models & API"
echo "  - SubtitleProject, SubtitleEntry, SubtitleStyle, SubtitleExport"
echo "  - REST API with CRUD operations"
echo "  - File upload and processing"
echo ""
echo "✅ AI Integration"
echo "  - OpenAI Whisper speech recognition"
echo "  - FFmpeg video processing"
echo "  - Asynchronous processing with Celery"
echo ""
echo "✅ Frontend Components"
echo "  - VideoUpload with drag & drop"
echo "  - SubtitleEditor with timeline"
echo "  - Pinia state management"
echo "  - TypeScript interfaces"
echo ""
echo "✅ Testing"
echo "  - Cypress E2E tests"
echo "  - API endpoint testing"
echo "  - Component testing"
echo ""
echo "✅ Development Tools"
echo "  - Custom code integration script"
echo "  - Development scripts"
echo "  - Docker support"
echo ""
print_success "Demo ready! Open http://localhost:8080/subtitle-upload to start"
echo ""
echo "💡 Tips:"
echo "========"
echo "- Use short video clips for faster processing"
echo "- Ensure videos have clear audio for better accuracy"
echo "- Check the confidence scores to identify low-quality subtitles"
echo "- Use the timeline editor to fine-tune timing"
echo "" 