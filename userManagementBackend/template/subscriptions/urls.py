"""
URL configuration for subscriptions app.
"""
from django.urls import path
from . import views

app_name = 'subscriptions'

urlpatterns = [
    path('create-checkout-session/', views.create_checkout_session, name='create_checkout_session'),
    path('subscription-status/', views.subscription_status, name='subscription_status'),
    path('cancel-subscription/', views.cancel_subscription, name='cancel_subscription'),
    path('available-plans/', views.available_plans, name='available_plans'),
    path('feature-access/', views.feature_access, name='feature_access'),
    path('webhook/', views.stripe_webhook, name='stripe_webhook'),
    path('success/', views.subscription_success, name='subscription_success'),
    path('cancel/', views.subscription_cancel, name='subscription_cancel'),
    path('create-subscription/', views.create_subscription_from_frontend, name='create_subscription_from_frontend'),
] 