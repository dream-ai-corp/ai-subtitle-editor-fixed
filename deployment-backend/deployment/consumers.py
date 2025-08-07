import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

class UploadProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection"""
        await self.accept()
        
        # Join the upload progress group
        await self.channel_layer.group_add(
            "upload_progress",
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to upload progress channel'
        }))

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave the upload progress group
        await self.channel_layer.group_discard(
            "upload_progress",
            self.channel_name
        )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', '')
            
            if message_type == 'subscribe_upload':
                # Subscribe to upload progress for a specific project
                project_id = text_data_json.get('project_id')
                if project_id:
                    await self.channel_layer.group_add(
                        f"upload_progress_{project_id}",
                        self.channel_name
                    )
                    await self.send(text_data=json.dumps({
                        'type': 'subscribed',
                        'project_id': project_id
                    }))
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))

    async def upload_progress(self, event):
        """Handle upload progress updates"""
        await self.send(text_data=json.dumps({
            'type': 'upload_progress',
            'progress': event['progress'],
            'processed': event['processed'],
            'total': event['total'],
            'current_file': event['current_file'],
            'project_id': event['project_id']
        })) 