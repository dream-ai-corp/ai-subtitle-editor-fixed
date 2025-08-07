#!/bin/bash

# GitHub Repository Cleanup Script
# Removes all test repositories created during development

echo "🧹 GitHub Repository Cleanup"
echo "================================"

# Check if Python script exists
if [ ! -f "cleanup_github_repos.py" ]; then
    echo "❌ Error: cleanup_github_repos.py not found"
    exit 1
fi

# Check if PyGithub is installed
if ! python3 -c "import github" 2>/dev/null; then
    echo "📦 Installing PyGithub..."
    pip3 install PyGithub
fi

# Run the cleanup script using deployment backend's virtual environment
echo "🚀 Running cleanup script..."
cd deployment-backend && source venv/bin/activate && cd .. && python cleanup_github_repos.py

echo ""
echo "✅ Cleanup script completed!" 