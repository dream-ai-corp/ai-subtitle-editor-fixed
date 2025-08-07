"""
URL configuration for users app.
"""
from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('subscription/', views.UserSubscriptionView.as_view(), name='subscription'),
    path('features/', views.UserFeaturesView.as_view(), name='features'),
    path('oauth-login/', views.oauth_login, name='oauth_login'),
    
    # Product and Purchase Tracking URLs
    path('products/', views.ProductListView.as_view(), name='product_list'),
    path('products/<int:product_id>/', views.ProductDetailView.as_view(), name='product_detail'),
    path('user-products/', views.UserProductListView.as_view(), name='user_product_list'),
    path('product-views/', views.ProductViewCreateView.as_view(), name='product_view_create'),
    path('user-product-views/', views.UserProductViewsView.as_view(), name='user_product_views'),
    path('stripe-info/', views.StripeInformationView.as_view(), name='stripe_info'),
] 