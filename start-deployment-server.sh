#!/bin/bash

# Start Deployment Server Script
# This script starts the deployment server for the AI Subtitle Editor

set -e

echo "🚀 Starting AI Subtitle Editor Deployment Server..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if deployment backend exists
if [ ! -d "deployment-backend" ]; then
    echo "❌ Deployment backend directory not found"
    exit 1
fi

# Navigate to deployment backend
cd deployment-backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found"
    exit 1
fi

echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser if it doesn't exist
echo "👤 Checking for superuser..."
if ! python manage.py shell -c "from django.contrib.auth.models import User; print('Superuser exists' if User.objects.filter(is_superuser=True).exists() else 'No superuser')" 2>/dev/null | grep -q "Superuser exists"; then
    echo "⚠️ No superuser found. Creating one..."
    echo "Please enter the following information for the superuser:"
    python manage.py createsuperuser
else
    echo "✅ Superuser already exists"
fi

# Start the server
echo "🌐 Starting deployment server on port 8001..."
echo "   Server URL: http://localhost:8001"
echo "   API URL: http://localhost:8001/api/"
echo "   Admin URL: http://localhost:8001/admin/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python manage.py runserver 0.0.0.0:8001 