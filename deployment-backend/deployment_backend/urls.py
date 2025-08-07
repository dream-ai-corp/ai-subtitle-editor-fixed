"""
URL configuration for deployment_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def root_view(request):
    """Root view for the deployment server"""
    return JsonResponse({
        'message': 'AI Subtitle Editor Deployment Server',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'api': '/api/',
            'admin': '/admin/',
            'test': '/api/test/',
            'projects': '/api/projects/',
            'github': '/api/github/'
        }
    })

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include('deployment.urls')),
] 