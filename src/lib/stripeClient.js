import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

/** Resolves to Stripe instance, or null if publishable key is not configured. */
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
