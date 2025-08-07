"""
URL configuration for trading_bot project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from template.subscriptions import views as subscription_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/users/', include('template.users.urls')),  # Re-enabled for OAuth functionality
    path('api/subscriptions/', include('template.subscriptions.urls')),
    path('api/subtitle/', include('custom.urls')),
    path('subscription/success/', subscription_views.subscription_success, name='subscription_success'),
    path('subscription/cancel/', subscription_views.subscription_cancel, name='subscription_cancel'),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) 