#!/bin/bash

# AI Subtitle Editor - Test Runner Script
# This script runs all tests for the application

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run backend tests
run_backend_tests() {
    print_status "Running Django backend tests..."
    
    cd userManagementBackend
    
    # Check if UV is available
    if command_exists uv; then
        uv run python manage.py test --verbosity=2
    else
        python manage.py test --verbosity=2
    fi
    
    cd ..
    
    print_success "Backend tests completed"
}

# Function to run frontend unit tests
run_frontend_tests() {
    print_status "Running frontend unit tests..."
    
    cd frontend
    
    # Check if tests are configured
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        yarn test
    else
        print_warning "No frontend test script found in package.json"
    fi
    
    cd ..
    
    print_success "Frontend tests completed"
}

# Function to run Cypress e2e tests
run_cypress_tests() {
    print_status "Running Cypress e2e tests..."
    
    cd frontend
    
    # Check if Cypress is installed
    if [ -d "node_modules/cypress" ]; then
        # Start backend server for testing
        print_status "Starting backend server for e2e tests..."
        cd ../userManagementBackend
        
        if command_exists uv; then
            uv run python manage.py runserver 8000 &
        else
            python manage.py runserver 8000 &
        fi
        
        BACKEND_PID=$!
        
        # Wait for backend to start
        sleep 5
        
        cd ../frontend
        
        # Run Cypress tests
        yarn cypress run --config baseUrl=http://localhost:8080
        
        # Stop backend server
        kill $BACKEND_PID 2>/dev/null || true
        
    else
        print_warning "Cypress not found. Install with: cd frontend && yarn add cypress"
    fi
    
    cd ..
    
    print_success "Cypress tests completed"
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    
    # Run backend tests
    run_backend_tests
    
    # Run frontend tests
    run_frontend_tests
    
    # Run Cypress tests
    run_cypress_tests
    
    print_success "All tests completed successfully!"
}

# Function to run specific test type
run_specific_tests() {
    case "$1" in
        "backend")
            run_backend_tests
            ;;
        "frontend")
            run_frontend_tests
            ;;
        "cypress"|"e2e")
            run_cypress_tests
            ;;
        *)
            print_error "Unknown test type: $1"
            print_status "Available options: backend, frontend, cypress/e2e, all"
            exit 1
            ;;
    esac
}

# Function to show help
show_help() {
    echo "AI Subtitle Editor - Test Runner"
    echo ""
    echo "Usage: $0 [TEST_TYPE]"
    echo ""
    echo "Test Types:"
    echo "  all        Run all tests (default)"
    echo "  backend    Run Django backend tests only"
    echo "  frontend   Run frontend unit tests only"
    echo "  cypress    Run Cypress e2e tests only"
    echo "  e2e        Alias for cypress"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0           # Run all tests"
    echo "  $0 backend   # Run only backend tests"
    echo "  $0 cypress   # Run only e2e tests"
}

# Main script logic
case "${1:-all}" in
    "all")
        run_all_tests
        ;;
    "backend"|"frontend"|"cypress"|"e2e")
        run_specific_tests "$1"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 