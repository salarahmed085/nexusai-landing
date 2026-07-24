// Centralized runtime config. Set VITE_API_URL in your environment (.env for
// local dev, Vercel project settings for production) to point at your
// deployed backend, e.g. https://your-app.up.railway.app
const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_BASE_URL = `${API_ORIGIN}/api`;
export { API_ORIGIN };

// Paddle billing config. The client-side token is safe to expose (it's
// public by design, unlike PADDLE_API_KEY which stays server-side only).
// Get it from Paddle > Developer Tools > Authentication > Client-side tokens.
export const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '';

// Deliberately NOT defaulted to 'sandbox'. Silently defaulting risks running
// against the wrong Paddle account if the env var is ever missing in a
// deploy — better to fail loudly (see BillingPage.jsx) than send a real
// customer through a misconfigured checkout.
export const PADDLE_ENV = import.meta.env.VITE_PADDLE_ENV || ''; // 'sandbox' | 'production'

// ── Price IDs (Paddle > Catalog > Prices) ────────────────────────────────────
// Starter tier is free — no price IDs needed.
// Pro tier
export const PADDLE_PRICE_PRO_MONTH   = import.meta.env.VITE_PADDLE_PRICE_PRO_MONTH   || '';
export const PADDLE_PRICE_PRO_YEAR    = import.meta.env.VITE_PADDLE_PRICE_PRO_YEAR    || PADDLE_PRICE_PRO_MONTH;
// Advanced tier
export const PADDLE_PRICE_ADVANCED_MONTH = import.meta.env.VITE_PADDLE_PRICE_ADVANCED_MONTH || '';
export const PADDLE_PRICE_ADVANCED_YEAR  = import.meta.env.VITE_PADDLE_PRICE_ADVANCED_YEAR  || PADDLE_PRICE_ADVANCED_MONTH;
