import { boot } from "quasar/wrappers";

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.STRIPE_PUBLISHABLE_KEY;

export default boot(async ({ app }) => {
  // Load Stripe.js
  if (typeof window !== "undefined" && STRIPE_PUBLISHABLE_KEY) {
    try {
      // Load Stripe.js script
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => {
        // Initialize Stripe
        if (window.Stripe) {
          window.stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
          console.log("Stripe initialized successfully");
        }
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error("Failed to load Stripe:", error);
    }
  }
});

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Stripe: any;
    stripe: any;
  }
}
