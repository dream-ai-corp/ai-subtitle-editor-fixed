#!/bin/bash

# User Management System Setup Script
# This script automates the initial setup of the Django user management system

set -e

echo "🚀 Setting up User Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if uv is installed
check_uv() {
    if ! command -v uv &> /dev/null; then
        print_error "uv is not installed. Please install it first:"
        echo "pip install uv"
        exit 1
    fi
    print_success "uv is installed"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Docker setup will be skipped."
        DOCKER_AVAILABLE=false
    else
        print_success "Docker is installed"
        DOCKER_AVAILABLE=true
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp env.example .env
        print_success "Environment file created. Please edit .env with your configuration."
    else
        print_warning ".env file already exists. Skipping..."
    fi
}

# Install dependencies
install_deps() {
    print_status "Installing dependencies with uv..."
    uv sync
    print_success "Dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if command -v pg_isready &> /dev/null; then
        if pg_isready -h localhost -p 5432 &> /dev/null; then
            print_success "PostgreSQL is running"
        else
            print_warning "PostgreSQL is not running. Please start it manually."
        fi
    else
        print_warning "PostgreSQL client not found. Please ensure PostgreSQL is installed and running."
    fi
    
    # Run migrations
    print_status "Running database migrations..."
    uv run python manage.py migrate
    print_success "Database migrations completed"
}

# Create superuser
create_superuser() {
    print_status "Creating superuser..."
    read -p "Do you want to create a superuser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        uv run python manage.py createsuperuser
        print_success "Superuser created"
    else
        print_warning "Skipping superuser creation"
    fi
}

# Setup Docker (if available)
setup_docker() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Setting up Docker environment..."
        
        read -p "Do you want to build and start Docker services? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Building Docker images..."
            docker-compose build
            
            print_status "Starting Docker services..."
            docker-compose up -d
            
            print_status "Waiting for services to be ready..."
            sleep 10
            
            print_status "Running migrations in Docker..."
            docker-compose exec web uv run python manage.py migrate
            
            print_success "Docker setup completed"
        else
            print_warning "Skipping Docker setup"
        fi
    fi
}

# Collect static files
collect_static() {
    print_status "Collecting static files..."
    uv run python manage.py collectstatic --noinput
    print_success "Static files collected"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    uv run pytest --tb=short
    print_success "Tests completed"
}

# Setup development server
start_dev_server() {
    print_status "Starting development server..."
    print_success "Setup completed! You can now run:"
    echo "  uv run python manage.py runserver"
    echo ""
    echo "Or with Docker:"
    echo "  docker-compose up"
}

# Main setup function
main() {
    echo "=================================="
    echo "  User Management System Setup"
    echo "=================================="
    echo ""
    
    check_uv
    check_docker
    setup_env
    install_deps
    setup_database
    create_superuser
    collect_static
    run_tests
    setup_docker
    start_dev_server
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Set up Stripe API keys for payments"
    echo "3. Configure social authentication providers"
    echo "4. Start the development server"
    echo ""
    echo "For more information, see README.md"
}

# Run main function
main "$@" 