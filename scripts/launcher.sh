#!/bin/bash

# AI Subtitle Editor - Launcher Script
# This script provides options to start different components of the application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  AI Subtitle Editor Launcher${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

print_menu() {
    echo -e "${CYAN}Available Options:${NC}"
    echo ""
    echo "  1) Start Full Application (Backend + Frontend + Deployment Server)"
    echo "  2) Start Main Application Only (Backend + Frontend)"
    echo "  3) Start Deployment Server Only"
    echo "  4) Start Backend Only"
    echo "  5) Start Frontend Only"
    echo "  6) Setup Deployment Server (First time setup)"
    echo "  7) Exit"
    echo ""
}

# Function to check if we're in the right directory
check_directory() {
    if [ ! -f "docker-compose.yml" ] || [ ! -d "frontend" ] || [ ! -d "userManagementBackend" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
}

# Function to start full application
start_full_app() {
    print_status "Starting full application with deployment server..."
    ./scripts/run-app-with-deployment.sh
}

# Function to start main application only
start_main_app() {
    print_status "Starting main application..."
    ./scripts/run-app.sh
}

# Function to start deployment server only
start_deployment_server() {
    print_status "Starting deployment server only..."
    ./scripts/run-deployment-server.sh
}

# Function to start backend only
start_backend_only() {
    print_status "Starting backend only..."
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
    print_status "Starting backend server on port 8000..."
    python manage.py runserver 0.0.0.0:8000
    
    cd ..
}

# Function to start frontend only
start_frontend_only() {
    print_status "Starting frontend only..."
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        yarn install
    fi
    
    # Start frontend server
    print_status "Starting frontend server on port 9001..."
    yarn dev --port 9001
    
    cd ..
}

# Function to setup deployment server
setup_deployment_server() {
    print_status "Setting up deployment server..."
    cd deployment-backend
    
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
    
    # Create superuser
    print_status "Creating superuser..."
    echo "Please enter the following information for the superuser:"
    python manage.py createsuperuser
    
    print_success "Deployment server setup completed!"
    print_status "You can now start the deployment server using option 3"
    
    cd ..
}

# Main script
main() {
    print_header
    
    # Check directory
    check_directory
    
    while true; do
        print_menu
        echo -n "Enter your choice (1-7): "
        read -r choice
        
        case $choice in
            1)
                start_full_app
                break
                ;;
            2)
                start_main_app
                break
                ;;
            3)
                start_deployment_server
                break
                ;;
            4)
                start_backend_only
                break
                ;;
            5)
                start_frontend_only
                break
                ;;
            6)
                setup_deployment_server
                echo ""
                echo -n "Press Enter to continue..."
                read -r
                ;;
            7)
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter a number between 1 and 7."
                echo ""
                ;;
        esac
    done
}

# Run the main function
main "$@" 