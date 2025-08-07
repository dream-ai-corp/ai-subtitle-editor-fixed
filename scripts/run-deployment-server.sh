#!/bin/bash

# AI Subtitle Editor - Deployment Server Runner
# This script starts the deployment backend server for managing application deployments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_PORT=8001
DEPLOYMENT_URL="http://localhost:$DEPLOYMENT_PORT"
DEPLOYMENT_DIR="deployment-backend"

# Function to print colored output
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

print_deployment() {
    echo -e "${PURPLE}[DEPLOYMENT]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is in use. Killing existing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to setup deployment backend
setup_deployment_backend() {
    print_deployment "Setting up deployment backend..."
    
    cd $DEPLOYMENT_DIR
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_warning "Virtual environment not found. Creating one..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp env.example .env
        print_warning "Please edit .env file with your API keys and settings"
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    python manage.py makemigrations
    python manage.py migrate
    
    # Create superuser if it doesn't exist
    print_status "Checking for superuser..."
    if ! python manage.py shell -c "from django.contrib.auth.models import User; print('Superuser exists' if User.objects.filter(is_superuser=True).exists() else 'No superuser')" 2>/dev/null | grep -q "Superuser exists"; then
        print_warning "No superuser found. Creating one..."
        echo "Please enter the following information for the superuser:"
        python manage.py createsuperuser
    else
        print_success "Superuser already exists"
    fi
    
    cd ..
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up deployment server..."
    
    # Kill background processes
    if [ ! -z "$DEPLOYMENT_PID" ]; then
        print_status "Stopping deployment server (PID: $DEPLOYMENT_PID)..."
        kill $DEPLOYMENT_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on our port
    kill_port $DEPLOYMENT_PORT
    
    print_success "Deployment server cleanup completed"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM EXIT

# Function to check environment configuration
check_environment() {
    print_deployment "Checking environment configuration..."
    
    if [ ! -d "$DEPLOYMENT_DIR" ]; then
        print_error "Deployment backend directory not found: $DEPLOYMENT_DIR"
        exit 1
    fi
    
    # Check if required tools are installed
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
}

# Function to display deployment information
display_deployment_info() {
    print_deployment "Deployment Server Information:"
    echo "  • URL: $DEPLOYMENT_URL"
    echo "  • Admin Panel: $DEPLOYMENT_URL/admin"
    echo "  • API Endpoints: $DEPLOYMENT_URL/api/"
    echo "  • Port: $DEPLOYMENT_PORT"
    echo ""
    print_deployment "Available API Endpoints:"
    echo "  • GET  /api/projects/ - List all projects"
    echo "  • POST /api/projects/ - Create a new project"
    echo "  • POST /api/deploy/ - Deploy a project"
    echo "  • GET  /api/deployments/{id}/status/ - Get deployment status"
    echo ""
}

# Main script
main() {
    print_deployment "Starting AI Subtitle Editor Deployment Server..."
    print_deployment "Deployment URL: $DEPLOYMENT_URL"
    
    # Check if we're in the right directory
    if [ ! -f "docker-compose.yml" ] || [ ! -d "$DEPLOYMENT_DIR" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check environment
    check_environment
    
    # Clean up any existing processes
    kill_port $DEPLOYMENT_PORT
    
    # Setup deployment backend
    setup_deployment_backend
    
    # Start deployment server
    print_deployment "Starting deployment server on port $DEPLOYMENT_PORT..."
    cd $DEPLOYMENT_DIR
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Start deployment server
    python manage.py runserver 0.0.0.0:$DEPLOYMENT_PORT &
    DEPLOYMENT_PID=$!
    
    cd ..
    
    # Wait for deployment server to be ready
    if ! wait_for_service "$DEPLOYMENT_URL/api/" "Deployment Server"; then
        print_error "Deployment server failed to start"
        exit 1
    fi
    
    # Display information
    display_deployment_info
    
    # Final status
    print_success "🎉 Deployment Server is running!"
    print_success "Deployment Server: $DEPLOYMENT_URL"
    print_deployment "Press Ctrl+C to stop the deployment server"
    
    # Keep the script running
    while true; do
        sleep 1
    done
}

# Run the main function
main "$@" 