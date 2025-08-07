"""
App configuration for subscriptions app.
"""
from django.apps import AppConfig


class SubscriptionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'template.subscriptions'
    verbose_name = 'Subscriptions' 