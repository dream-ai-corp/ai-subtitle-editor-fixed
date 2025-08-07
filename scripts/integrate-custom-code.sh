#!/bin/bash

# AI Subtitle Editor - Custom Code Integration Script
# This script integrates custom code into the template structure using symlinks

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

# Function to create symlink
create_symlink() {
    local source="$1"
    local target="$2"
    
    if [ -L "$target" ]; then
        rm "$target"
        print_status "Removed existing symlink: $target"
    fi
    
    if [ -d "$target" ] || [ -f "$target" ]; then
        rm -rf "$target"
        print_status "Removed existing file/directory: $target"
    fi
    
    ln -sf "$source" "$target"
    print_success "Created symlink: $target -> $source"
}

# Function to create directory if it doesn't exist
ensure_directory() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    fi
}

# Main integration process
print_status "Starting custom code integration..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CUSTOM_DIR="$PROJECT_ROOT/custom"

print_status "Project root: $PROJECT_ROOT"
print_status "Custom directory: $CUSTOM_DIR"

# Frontend integration
print_status "Integrating frontend custom code..."

FRONTEND_CUSTOM_DIR="$PROJECT_ROOT/frontend/src/custom"
ensure_directory "$FRONTEND_CUSTOM_DIR"

# Create symlinks for frontend custom code
if [ -d "$CUSTOM_DIR/frontend" ]; then
    for item in "$CUSTOM_DIR/frontend"/*; do
        if [ -e "$item" ]; then
            item_name=$(basename "$item")
            create_symlink "$item" "$FRONTEND_CUSTOM_DIR/$item_name"
        fi
    done
else
    print_warning "Frontend custom directory not found: $CUSTOM_DIR/frontend"
fi

# Backend integration
print_status "Integrating backend custom code..."

BACKEND_CUSTOM_DIR="$PROJECT_ROOT/userManagementBackend/custom"
ensure_directory "$BACKEND_CUSTOM_DIR"

# Create symlinks for backend custom code
if [ -d "$CUSTOM_DIR/backend" ]; then
    for item in "$CUSTOM_DIR/backend"/*; do
        if [ -e "$item" ]; then
            item_name=$(basename "$item")
            create_symlink "$item" "$BACKEND_CUSTOM_DIR/$item_name"
        fi
    done
else
    print_warning "Backend custom directory not found: $CUSTOM_DIR/backend"
fi

print_success "Custom code integration completed!"
print_status "Custom code is now available in:"
print_status "  Frontend: $FRONTEND_CUSTOM_DIR"
print_status "  Backend: $BACKEND_CUSTOM_DIR"


