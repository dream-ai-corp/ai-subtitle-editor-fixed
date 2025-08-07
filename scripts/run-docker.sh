#!/bin/bash

# AI Subtitle Editor - Docker Development Script
# This script runs the application using Docker

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

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

# Function to build and start services
start_services() {
    print_status "Building and starting services with Docker Compose..."
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Services started!"
    print_status "Backend: http://localhost:8000"
    print_status "Frontend: http://localhost:8080"
    print_status "Admin: http://localhost:8000/admin (admin/admin123)"
}

# Function to stop services
stop_services() {
    print_status "Stopping Docker services..."
    docker-compose down
    print_success "Services stopped"
}

# Function to show logs
show_logs() {
    print_status "Showing logs..."
    docker-compose logs -f
}

# Function to show status
show_status() {
    print_status "Checking Docker service status..."
    docker-compose ps
}

# Function to show help
show_help() {
    echo "AI Subtitle Editor - Docker Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services (default)"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs from all services"
    echo "  status      Show status of services"
    echo "  build       Build services without starting"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0           # Start all services"
    echo "  $0 stop      # Stop all services"
    echo "  $0 logs      # Show logs"
}

# Check Docker installation
check_docker

# Main script logic
case "${1:-start}" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        start_services
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "build")
        print_status "Building Docker images..."
        docker-compose build
        print_success "Build complete"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 