from django.urls import path
from . import views

urlpatterns = [
    # Test endpoint
    path('test/', views.test_api, name='test_api'),
    
    # Projects
    path('projects/', views.projects_list, name='projects_list'),
    path('projects/<int:project_id>/', views.project_detail, name='project_detail'),
    path('projects/<int:project_id>/deployments/', views.deployments_list, name='deployments_list'),
    path('projects/<int:project_id>/config/', views.project_configuration, name='project_configuration'),
    
    # Deployments
    path('deploy/', views.deploy_project, name='deploy_project'),
    path('deployments/<int:deployment_id>/status/', views.deployment_status, name='deployment_status'),
    
    # GitHub
    path('github/upload/', views.github_upload, name='github_upload'),
    path('github/repository-status/', views.github_repository_status, name='github_repository_status'),
    path('github/test-connection/', views.github_test_connection, name='github_test_connection'),
] 