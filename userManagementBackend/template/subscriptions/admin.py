"""
Admin configuration for subscription models.
"""
from django.contrib import admin
from .models import Subscription, Payment, FeatureAccess, WebhookEvent


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """
    Admin for Subscription model.
    """
    list_display = (
        'user', 'plan_name', 'status', 'current_period_start',
        'current_period_end', 'created_at'
    )
    list_filter = ('status', 'plan_name', 'created_at')
    search_fields = ('user__email', 'stripe_subscription_id')
    readonly_fields = ('stripe_subscription_id', 'stripe_price_id', 'created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Admin for Payment model.
    """
    list_display = (
        'user', 'subscription', 'amount', 'currency', 'status',
        'created_at'
    )
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('user__email', 'stripe_payment_intent_id', 'stripe_invoice_id')
    readonly_fields = ('stripe_payment_intent_id', 'stripe_invoice_id', 'created_at')
    ordering = ('-created_at',)


@admin.register(FeatureAccess)
class FeatureAccessAdmin(admin.ModelAdmin):
    """
    Admin for FeatureAccess model.
    """
    list_display = ('user', 'feature_name', 'is_active', 'granted_at', 'expires_at')
    list_filter = ('is_active', 'feature_name', 'granted_at')
    search_fields = ('user__email', 'feature_name')
    readonly_fields = ('granted_at',)
    ordering = ('-granted_at',)


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    """
    Admin for WebhookEvent model.
    """
    list_display = ('stripe_event_id', 'event_type', 'processed', 'created_at')
    list_filter = ('event_type', 'processed', 'created_at')
    search_fields = ('stripe_event_id', 'event_type')
    readonly_fields = ('stripe_event_id', 'event_type', 'data', 'created_at')
    ordering = ('-created_at',) 