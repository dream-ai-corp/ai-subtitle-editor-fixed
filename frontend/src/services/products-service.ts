import productsConfig from "../config/products.json";

export interface Product {
  id: string;
  name: string;
  price: string;
  currency: string;
  interval: string;
  description: string;
  featured: boolean;
  features: string[];
  stripe: {
    product_id: string;
    price_id: string;
  };
  limits: {
    videos_per_month: number | string;
    max_video_duration: string;
    languages: string[];
  };
  metadata: {
    category: string;
    popular: boolean;
    recommended_for: string[];
  };
}

export interface ProductsConfig {
  products: Product[];
  config: {
    currency_symbol: string;
    default_interval: string;
    featured_plan_id: string;
    categories: {
      [key: string]: {
        name: string;
        color: string;
        icon: string;
      };
    };
  };
}

class ProductsService {
  private config: ProductsConfig;

  constructor() {
    this.config = productsConfig as ProductsConfig;
  }

  /**
   * Get all products
   */
  getAllProducts(): Product[] {
    return this.config.products;
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Product | undefined {
    return this.config.products.find((product) => product.id === id);
  }

  /**
   * Get featured product
   */
  getFeaturedProduct(): Product | undefined {
    return this.config.products.find((product) => product.featured);
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: string): Product[] {
    return this.config.products.filter(
      (product) => product.metadata.category === category
    );
  }

  /**
   * Get popular products
   */
  getPopularProducts(): Product[] {
    return this.config.products.filter((product) => product.metadata.popular);
  }

  /**
   * Get products recommended for specific use case
   */
  getProductsForUseCase(useCase: string): Product[] {
    return this.config.products.filter((product) =>
      product.metadata.recommended_for.includes(useCase)
    );
  }

  /**
   * Get configuration
   */
  getConfig() {
    return this.config.config;
  }

  /**
   * Get category configuration
   */
  getCategoryConfig(category: string) {
    return this.config.config.categories[category];
  }

  /**
   * Get all categories
   */
  getAllCategories() {
    return Object.keys(this.config.config.categories);
  }

  /**
   * Format price with currency
   */
  formatPrice(product: Product): string {
    const currencySymbol = this.config.config.currency_symbol;
    return `${currencySymbol}${product.price}/${product.interval}`;
  }

  /**
   * Get products sorted by price (low to high)
   */
  getProductsSortedByPrice(): Product[] {
    return [...this.config.products].sort(
      (a, b) => parseFloat(a.price) - parseFloat(b.price)
    );
  }

  /**
   * Get products sorted by popularity
   */
  getProductsSortedByPopularity(): Product[] {
    return [...this.config.products].sort((a, b) => {
      if (a.metadata.popular && !b.metadata.popular) return -1;
      if (!a.metadata.popular && b.metadata.popular) return 1;
      return 0;
    });
  }

  /**
   * Check if product has specific feature
   */
  hasFeature(product: Product, feature: string): boolean {
    return product.features.some((f) =>
      f.toLowerCase().includes(feature.toLowerCase())
    );
  }

  /**
   * Get products with specific feature
   */
  getProductsWithFeature(feature: string): Product[] {
    return this.config.products.filter((product) =>
      this.hasFeature(product, feature)
    );
  }

  /**
   * Get products within price range
   */
  getProductsInPriceRange(minPrice: number, maxPrice: number): Product[] {
    return this.config.products.filter((product) => {
      const price = parseFloat(product.price);
      return price >= minPrice && price <= maxPrice;
    });
  }

  /**
   * Get recommended product for user type
   */
  getRecommendedProduct(userType: string): Product | undefined {
    const recommendedProducts = this.getProductsForUseCase(userType);
    return (
      recommendedProducts.find((product) => product.featured) ||
      recommendedProducts[0]
    );
  }

  /**
   * Get product comparison data
   */
  getProductComparison(): {
    features: string[];
    products: { [key: string]: { [key: string]: boolean | string } };
  } {
    const allFeatures = new Set<string>();
    this.config.products.forEach((product) => {
      product.features.forEach((feature) => allFeatures.add(feature));
    });

    const features = Array.from(allFeatures);
    const products: { [key: string]: { [key: string]: boolean | string } } = {};

    this.config.products.forEach((product) => {
      products[product.id] = {};
      features.forEach((feature) => {
        products[product.id][feature] = this.hasFeature(product, feature);
      });
      // Add price and limits
      products[product.id]["price"] = this.formatPrice(product);
      products[product.id]["videos_per_month"] =
        product.limits.videos_per_month;
      products[product.id]["max_video_duration"] =
        product.limits.max_video_duration;
    });

    return { features, products };
  }
}

// Export singleton instance
export const productsService = new ProductsService();

// Export types
export type { Product, ProductsConfig };
