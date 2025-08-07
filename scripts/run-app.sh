#!/bin/bash

# AI Subtitle Editor - Full Stack Application Runner
# This script starts both the Django backend and Quasar frontend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=8000
FRONTEND_PORT=9001
BACKEND_URL="http://localhost:$BACKEND_PORT"
FRONTEND_URL="http://localhost:$FRONTEND_PORT"

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

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on our ports
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    print_success "Cleanup completed"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM EXIT

# Main script
main() {
    print_status "Starting AI Subtitle Editor..."
    print_status "Backend URL: $BACKEND_URL"
    print_status "Frontend URL: $FRONTEND_URL"
    
    # Check if we're in the right directory
    if [ ! -f "docker-compose.yml" ] || [ ! -d "frontend" ] || [ ! -d "userManagementBackend" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check if required tools are installed
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v yarn &> /dev/null; then
        print_error "Yarn is required but not installed"
        exit 1
    fi
    
    # Clean up any existing processes
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    # Start backend
    print_status "Starting Django backend..."
    cd userManagementBackend
    
    # Check if virtual environment exists
    if [ ! -d ".venv" ]; then
        print_warning "Virtual environment not found. Creating one..."
        python3 -m venv .venv
    fi
    
    # Activate virtual environment
    source .venv/bin/activate
    
    # Install dependencies if needed
    if [ ! -f "uv.lock" ]; then
        print_status "Installing Python dependencies..."
        uv sync
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    python manage.py migrate
    
    # Start backend server
    print_status "Starting backend server on port $BACKEND_PORT..."
    python manage.py runserver 0.0.0.0:$BACKEND_PORT &
    BACKEND_PID=$!
    
    cd ..
    
    # Wait for backend to be ready
    if ! wait_for_service "$BACKEND_URL/api/" "Backend"; then
        print_error "Backend failed to start"
        exit 1
    fi
    
    # Start frontend
    print_status "Starting Quasar frontend..."
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        yarn install
    fi
    
    # Start frontend server
    print_status "Starting frontend server on port $FRONTEND_PORT..."
    yarn dev --port $FRONTEND_PORT &
    FRONTEND_PID=$!
    
    cd ..
    
    # Wait for frontend to be ready
    if ! wait_for_service "$FRONTEND_URL" "Frontend"; then
        print_error "Frontend failed to start"
        exit 1
    fi
    
    # Final status
    print_success "🎉 AI Subtitle Editor is running!"
    print_success "Frontend: $FRONTEND_URL"
    print_success "Backend API: $BACKEND_URL/api/"
    print_status "Press Ctrl+C to stop all services"
    
    # Keep the script running
    while true; do
        sleep 1
    done
}

# Run the main function
main "$@" 