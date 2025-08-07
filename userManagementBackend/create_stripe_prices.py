#!/usr/bin/env python3
import os
import sys
import django
import stripe
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trading_bot.settings')
django.setup()

# Import after Django setup
from template.subscriptions.products_service import products_service

def check_and_create_stripe_prices():
    """Check existing Stripe prices and create missing ones"""
    
    print("=== Checking Stripe Prices ===")
    
    # Get all products from config
    products = products_service.get_all_products()
    
    for product in products:
        product_id = product['id']
        product_name = product['name']
        price_id = product['stripe']['price_id']
        price_amount = int(float(product['price']) * 100)  # Convert to cents
        
        print(f"\nChecking product: {product_name}")
        print(f"  Product ID: {product_id}")
        print(f"  Expected Price ID: {price_id}")
        print(f"  Price Amount: ${product['price']} ({price_amount} cents)")
        
        try:
            # Check if price exists
            existing_price = stripe.Price.retrieve(price_id)
            print(f"  ✅ Price exists: {existing_price.id}")
            print(f"     Amount: {existing_price.unit_amount} cents")
            print(f"     Currency: {existing_price.currency}")
            print(f"     Recurring: {existing_price.recurring}")
            
        except stripe.error.InvalidRequestError as e:
            if "No such price" in str(e):
                print(f"  ❌ Price does not exist, creating...")
                
                try:
                    # Create the price
                    new_price = stripe.Price.create(
                        product=product_id,
                        unit_amount=price_amount,
                        currency=product['currency'],
                        recurring={'interval': product['interval']}
                    )
                    print(f"  ✅ Created new price: {new_price.id}")
                    
                    # Update the config file
                    update_price_id_in_config(product_id, new_price.id)
                    
                except stripe.error.StripeError as create_error:
                    print(f"  ❌ Failed to create price: {create_error}")
            else:
                print(f"  ❌ Error checking price: {e}")
                
        except Exception as e:
            print(f"  ❌ Unexpected error: {e}")

def update_price_id_in_config(product_id, new_price_id):
    """Update the price ID in the config file"""
    import json
    
    config_path = os.path.join(settings.BASE_DIR, 'config', 'products.json')
    
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        # Find and update the product
        for product in config['products']:
            if product['id'] == product_id:
                product['stripe']['price_id'] = new_price_id
                break
        
        # Write back to file
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=4)
        
        print(f"  📝 Updated config file with new price ID: {new_price_id}")
        
    except Exception as e:
        print(f"  ❌ Failed to update config file: {e}")

def list_existing_prices():
    """List all existing prices in Stripe"""
    print("\n=== Existing Stripe Prices ===")
    
    try:
        prices = stripe.Price.list(limit=100)
        
        for price in prices.data:
            print(f"  Price ID: {price.id}")
            print(f"    Product: {price.product}")
            print(f"    Amount: {price.unit_amount} {price.currency}")
            print(f"    Recurring: {price.recurring}")
            print()
            
    except Exception as e:
        print(f"Error listing prices: {e}")

if __name__ == "__main__":
    print("Stripe Price Management Script")
    print("=" * 40)
    
    # List existing prices first
    list_existing_prices()
    
    # Check and create missing prices
    check_and_create_stripe_prices()
    
    print("\nDone!") 