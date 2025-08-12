import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment functionality will be disabled.');
  console.warn('Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
export const isStripeConfigured = !!stripePublishableKey;

export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  currency: 'cad',
  country: 'CA',
} as const;