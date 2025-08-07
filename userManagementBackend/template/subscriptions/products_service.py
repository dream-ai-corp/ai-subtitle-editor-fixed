import json
import os
from typing import Dict, List, Optional, Any
from django.conf import settings

class ProductsService:
    def __init__(self):
        self.config_path = os.path.join(settings.BASE_DIR, 'config', 'products.json')
        self._load_config()
    
    def _load_config(self):
        """Load products configuration from JSON file"""
        try:
            with open(self.config_path, 'r') as f:
                self.config = json.load(f)
        except FileNotFoundError:
            print(f"Products config file not found at {self.config_path}")
            self.config = {"products": [], "config": {}}
        except json.JSONDecodeError as e:
            print(f"Error parsing products config: {e}")
            self.config = {"products": [], "config": {}}
    
    def reload_config(self):
        """Reload configuration from file"""
        self._load_config()
    
    def get_all_products(self) -> List[Dict[str, Any]]:
        """Get all products"""
        return self.config.get('products', [])
    
    def get_product_by_id(self, product_id: str) -> Optional[Dict[str, Any]]:
        """Get product by ID"""
        products = self.get_all_products()
        for product in products:
            if product.get('id') == product_id:
                return product
        return None
    
    def get_featured_product(self) -> Optional[Dict[str, Any]]:
        """Get featured product"""
        products = self.get_all_products()
        for product in products:
            if product.get('metadata', {}).get('popular', False):
                return product
        return None
    
    def get_products_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get products by category"""
        products = self.get_all_products()
        return [p for p in products if p.get('metadata', {}).get('category') == category]
    
    def get_popular_products(self) -> List[Dict[str, Any]]:
        """Get popular products"""
        products = self.get_all_products()
        return [p for p in products if p.get('metadata', {}).get('popular', False)]
    
    def get_products_for_use_case(self, use_case: str) -> List[Dict[str, Any]]:
        """Get products recommended for specific use case"""
        products = self.get_all_products()
        return [p for p in products if use_case in p.get('metadata', {}).get('recommended_for', [])]
    
    def get_config(self) -> Dict[str, Any]:
        """Get configuration"""
        return self.config.get('config', {})
    
    def get_category_config(self, category: str) -> Optional[Dict[str, Any]]:
        """Get category configuration"""
        categories = self.get_config().get('categories', {})
        return categories.get(category)
    
    def get_all_categories(self) -> List[str]:
        """Get all categories"""
        categories = self.get_config().get('categories', {})
        return list(categories.keys())
    
    def format_price(self, product: Dict[str, Any]) -> str:
        """Format price with currency"""
        currency_symbol = self.get_config().get('currency_symbol', '$')
        price = product.get('price', 0)
        interval = product.get('interval', 'month')
        return f"{currency_symbol}{price}/{interval}"
    
    def get_products_sorted_by_price(self) -> List[Dict[str, Any]]:
        """Get products sorted by price (low to high)"""
        products = self.get_all_products()
        return sorted(products, key=lambda x: float(x.get('price', 0)))
    
    def get_products_sorted_by_popularity(self) -> List[Dict[str, Any]]:
        """Get products sorted by popularity"""
        products = self.get_all_products()
        return sorted(products, key=lambda x: x.get('metadata', {}).get('popular', False), reverse=True)
    
    def has_feature(self, product: Dict[str, Any], feature: str) -> bool:
        """Check if product has specific feature"""
        features = product.get('features', [])
        return any(f.lower().find(feature.lower()) != -1 for f in features)
    
    def get_products_with_feature(self, feature: str) -> List[Dict[str, Any]]:
        """Get products with specific feature"""
        products = self.get_all_products()
        return [p for p in products if self.has_feature(p, feature)]
    
    def get_products_in_price_range(self, min_price: float, max_price: float) -> List[Dict[str, Any]]:
        """Get products within price range"""
        products = self.get_all_products()
        return [p for p in products if min_price <= float(p.get('price', 0)) <= max_price]
    
    def get_recommended_product(self, user_type: str) -> Optional[Dict[str, Any]]:
        """Get recommended product for user type"""
        recommended_products = self.get_products_for_use_case(user_type)
        # Return featured product if available, otherwise first product
        featured = next((p for p in recommended_products if p.get('metadata', {}).get('popular', False)), None)
        return featured or (recommended_products[0] if recommended_products else None)
    
    def get_product_comparison(self) -> Dict[str, Any]:
        """Get product comparison data"""
        products = self.get_all_products()
        
        # Get all unique features
        all_features = set()
        for product in products:
            all_features.update(product.get('features', []))
        
        features = list(all_features)
        comparison = {'features': features, 'products': {}}
        
        for product in products:
            product_id = product.get('id')
            comparison['products'][product_id] = {}
            
            # Add feature availability
            for feature in features:
                comparison['products'][product_id][feature] = self.has_feature(product, feature)
            
            # Add price and limits
            comparison['products'][product_id]['price'] = self.format_price(product)
            comparison['products'][product_id]['videos_per_month'] = product.get('limits', {}).get('videos_per_month')
            comparison['products'][product_id]['max_video_duration'] = product.get('limits', {}).get('max_video_duration')
        
        return comparison
    
    def validate_product_id(self, product_id: str) -> bool:
        """Validate if product ID exists"""
        return self.get_product_by_id(product_id) is not None
    
    def get_stripe_product_id(self, product_id: str) -> Optional[str]:
        """Get Stripe product ID for given product ID"""
        product = self.get_product_by_id(product_id)
        if product:
            return product.get('stripe', {}).get('product_id')
        return None
    
    def get_stripe_price_id(self, product_id: str) -> Optional[str]:
        """Get Stripe price ID for given product ID"""
        product = self.get_product_by_id(product_id)
        if product:
            return product.get('stripe', {}).get('price_id')
        return None

# Singleton instance
products_service = ProductsService() 