"""
Subscription models for the trading bot application.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Subscription(models.Model):
    """
    Model to track user subscriptions.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    stripe_subscription_id = models.CharField(max_length=100, unique=True)
    stripe_price_id = models.CharField(max_length=100)
    plan_name = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('canceled', 'Canceled'),
            ('past_due', 'Past Due'),
            ('trialing', 'Trialing'),
            ('incomplete', 'Incomplete'),
            ('incomplete_expired', 'Incomplete Expired'),
            ('unpaid', 'Unpaid'),
        ]
    )
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscriptions'
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
    
    def __str__(self):
        return f"{self.user.email} - {self.plan_name} ({self.status})"


class Payment(models.Model):
    """
    Model to track subscription payments.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='payments')
    stripe_payment_intent_id = models.CharField(max_length=100, unique=True)
    stripe_invoice_id = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(
        max_length=20,
        choices=[
            ('succeeded', 'Succeeded'),
            ('failed', 'Failed'),
            ('pending', 'Pending'),
            ('canceled', 'Canceled'),
        ]
    )
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
    
    def __str__(self):
        return f"{self.user.email} - {self.amount} {self.currency} ({self.status})"


class FeatureAccess(models.Model):
    """
    Model to track user feature access.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feature_access')
    feature_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'feature_access'
        verbose_name = 'Feature Access'
        verbose_name_plural = 'Feature Access'
        unique_together = ['user', 'feature_name']
    
    def __str__(self):
        return f"{self.user.email} - {self.feature_name} ({'Active' if self.is_active else 'Inactive'})"
    
    @property
    def is_expired(self):
        """Check if feature access has expired."""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class WebhookEvent(models.Model):
    """
    Model to track Stripe webhook events.
    """
    stripe_event_id = models.CharField(max_length=100, unique=True)
    event_type = models.CharField(max_length=100)
    data = models.JSONField()
    processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'webhook_events'
        verbose_name = 'Webhook Event'
        verbose_name_plural = 'Webhook Events'
    
    def __str__(self):
        return f"{self.event_type} - {self.stripe_event_id}"


class StripeCustomerInfo(models.Model):
    """
    Model to store comprehensive Stripe customer information.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stripe_customer_info')
    stripe_customer_id = models.CharField(max_length=100, unique=True)
    email = models.EmailField()
    name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.JSONField(default=dict, blank=True)
    shipping = models.JSONField(default=dict, blank=True)
    tax_exempt = models.CharField(max_length=20, default='none')
    tax_ids = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stripe_customer_info'
        verbose_name = 'Stripe Customer Info'
        verbose_name_plural = 'Stripe Customer Info'
    
    def __str__(self):
        return f"{self.user.email} - {self.stripe_customer_id}" 