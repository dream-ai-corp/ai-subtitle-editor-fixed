"""
App configuration for users app.
"""
from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'template.users'
    verbose_name = 'Users'
    
    def ready(self):
        """Import signals when app is ready."""
        import template.users.signals 