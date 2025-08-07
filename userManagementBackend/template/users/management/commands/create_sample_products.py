"""
Management command to create sample products for testing.
"""
from django.core.management.base import BaseCommand
from template.users.models import Product


class Command(BaseCommand):
    help = 'Create sample products for testing'

    def handle(self, *args, **options):
        products_data = [
            {
                'name': 'AI-Subtitle-Editor',
                'plan': 'basic',
                'price': 9.99,
                'currency': 'USD',
                'stripe_price_id': 'price_basic_test',
                'stripe_product_id': 'prod_basic_test',
                'description': 'Basic subtitle editing with AI assistance',
                'features': ['AI subtitle generation', 'Basic editing tools', 'Export to SRT', '5 videos per month'],
                'is_active': True
            },
            {
                'name': 'AI-Subtitle-Editor',
                'plan': 'professional',
                'price': 29.99,
                'currency': 'USD',
                'stripe_price_id': 'price_professional_test',
                'stripe_product_id': 'prod_professional_test',
                'description': 'Professional subtitle editing with advanced AI features',
                'features': ['AI subtitle generation', 'Advanced editing tools', 'Export to multiple formats', 'Unlimited videos', 'Priority support', 'Custom branding'],
                'is_active': True
            },
            {
                'name': 'AI-Subtitle-Editor',
                'plan': 'enterprise',
                'price': 99.99,
                'currency': 'USD',
                'stripe_price_id': 'price_enterprise_test',
                'stripe_product_id': 'prod_enterprise_test',
                'description': 'Enterprise subtitle editing with team collaboration',
                'features': ['AI subtitle generation', 'Advanced editing tools', 'Export to multiple formats', 'Unlimited videos', 'Priority support', 'Custom branding', 'Team collaboration', 'API access', 'White-label solution'],
                'is_active': True
            }
        ]

        created_count = 0
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                plan=product_data['plan'],
                defaults=product_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created product: {product.name} - {product.plan}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Product already exists: {product.name} - {product.plan}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new products')
        ) 