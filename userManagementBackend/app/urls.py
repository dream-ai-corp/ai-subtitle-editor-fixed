"""
App-specific URL patterns that extend the template URLs.
This file allows you to add your own URL patterns without modifying the template.
"""

from django.urls import path, include
from django.contrib import admin

# Import template URLs
from trading_bot.urls import urlpatterns as template_urlpatterns

# App-specific URL patterns
app_urlpatterns = [
    # Example: Add your own app URLs
    # path('your-app/', include('your_app.urls')),
    
    # Example: Add custom admin URLs
    # path('custom-admin/', admin.site.urls),
    
    # Example: Add API endpoints
    # path('api/v1/your-endpoint/', your_view, name='your-endpoint'),
]

# Combine template and app URLs (app URLs take priority)
urlpatterns = app_urlpatterns + template_urlpatterns 