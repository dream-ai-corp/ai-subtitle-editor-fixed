# AI Subtitle Editor

A full-stack application for generating and editing subtitles using AI technology.

## 🚀 Quick Start

### Option 1: Interactive Launcher (Recommended)
```bash
./scripts/launcher.sh
```
This provides a menu to choose from different startup options including the deployment server.

### Option 2: Quick Start (Basic)
```bash
./scripts/quick-start.sh
```

### Option 3: Full Setup with Monitoring
```bash
./scripts/run-app.sh
```

### Option 4: Full Setup with Deployment Server
```bash
./scripts/run-app-with-deployment.sh
```

### Option 5: Deployment Server Only
```bash
./scripts/run-deployment-server.sh
```

### Option 6: Manual Setup
1. **Backend Setup:**
   ```bash
   cd userManagementBackend
   uv sync
   uv run python manage.py migrate
   uv run python manage.py runserver
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   yarn install
   yarn dev
   ```

3. **Deployment Server Setup:**
   ```bash
   cd deployment-backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8001
   ```

## 📱 Access the Application

Once running, access the application at:
- **Frontend**: http://localhost:9001
- **Backend API**: http://localhost:8000
- **Deployment Server**: http://localhost:8001
- **Admin Panel**: http://localhost:8000/admin/
- **Deployment Admin**: http://localhost:8001/admin/

### Key Features
- **AI Subtitle Generator**: http://localhost:9000/subtitle-upload
- **Subtitle Editor**: http://localhost:9000/subtitle-editor/{project_id}

## 🛠️ Scripts Overview

### `scripts/quick-start.sh`
- Simple one-command startup
- Minimal setup and monitoring
- Perfect for development

### `scripts/run-app.sh`
- Comprehensive setup with error handling
- Health monitoring and automatic recovery
- Detailed logging and status reporting
- Perfect for production-like environments

### `scripts/integrate-custom-code.sh`
- Integrates custom code with template submodules
- Creates necessary symlinks
- Required for custom features to work

### `scripts/launcher.sh`
- Interactive menu for choosing startup options
- Supports all application components including deployment server
- First-time setup assistance

### `scripts/run-app-with-deployment.sh`
- Starts all services including deployment server
- Comprehensive error handling and monitoring
- Perfect for full-stack development with deployment capabilities

### `scripts/run-deployment-server.sh`
- Starts only the deployment server
- Manages deployments to Netlify, Render, Railway
- Includes automatic setup and configuration

## 📋 Prerequisites

- **uv**: Python package manager - [Install](https://docs.astral.sh/uv/getting-started/installation/)
- **yarn**: Node.js package manager - [Install](https://yarnpkg.com/getting-started/install)
- **curl**: For health checks (usually pre-installed)

## 🔧 Troubleshooting

### Port Already in Use
The scripts automatically handle port conflicts by killing existing processes.

### Dependencies Issues
```bash
# Backend dependencies
cd userManagementBackend
uv sync

# Frontend dependencies
cd frontend
yarn install
```

### Custom Code Integration
If custom features aren't working:
```bash
./scripts/integrate-custom-code.sh
```

## 📊 Logs

- **Backend logs**: `tail -f backend.log`
- **Frontend logs**: `tail -f frontend.log`
- **Deployment server logs**: Check the deployment server console output

## 🚀 Deployment Server

The deployment server provides centralized management for deploying your AI Subtitle Editor application to various hosting platforms.

### Features
- **Multi-platform Support**: Deploy to Netlify, Render, Railway, and more
- **Project Management**: Create and manage deployment projects
- **Deployment Tracking**: Monitor deployment status and history
- **Configuration Management**: Store and manage deployment configurations
- **GitHub Integration**: Automatic repository creation and management

### Quick Start
```bash
# Start deployment server only
./scripts/run-deployment-server.sh

# Or use the interactive launcher
./scripts/launcher.sh
```

For detailed information, see [DEPLOYMENT_SERVER_GUIDE.md](DEPLOYMENT_SERVER_GUIDE.md).

## 🎯 Features

- **AI-Powered Subtitle Generation**: Using OpenAI Whisper for accurate speech-to-text conversion
- **Video Subtitle Embedding**: Permanently embed subtitles directly into video files with customizable styles
- **Customizable Subtitle Styles**: Choose from Default, Modern, Bold, and Minimal styles with custom colors and sizes
- **Video Upload & Processing**: Support for multiple formats (MP4, AVI, MOV, MKV, WEBM)
- **Deployment Management**: Centralized deployment server for managing application deployments to multiple platforms
- **Multi-Platform Deployment**: Support for Netlify, Render, Railway, and other hosting platforms
- **Automated Deployment Workflows**: Streamlined deployment processes with status tracking and monitoring
- **Real-time Subtitle Editing**: Timeline-based editor with split/merge functionality
- **Multiple Export Formats**: SRT, VTT, ASS, TXT for external subtitle files
- **User Management**: Authentication and authorization
- **Subscription System**: Stripe integration

## 🏗️ Architecture

This project follows a custom code strategy with template submodules:
- **Template Code**: Reusable base functionality
- **Custom Code**: Project-specific features
- **Symlinks**: Integration between template and custom code

For more details, see [CUSTOM_CODE_STRATEGY.md](CUSTOM_CODE_STRATEGY.md).
