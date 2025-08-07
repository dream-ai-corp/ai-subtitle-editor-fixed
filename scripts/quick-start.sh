#!/bin/bash

# AI Subtitle Editor - Quick Start Script
# Simple script to start the application quickly

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting AI Subtitle Editor...${NC}"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Run the main script
./scripts/run-app.sh 