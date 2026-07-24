// ============================================================
// TIERS — single source of truth for all pricing tiers.
// Edit names, descriptions, features, and price IDs here;
// BillingPage and the landing-page Pricing section both read
// from this file so they stay in sync automatically.
//
// priceId.month / priceId.year must be Paddle Price IDs
// (format: pri_...) from Paddle > Catalog > Prices.
// Set them in .env and reference via config.js.
// A null priceId means the tier is free (no checkout opened).
// ============================================================

import {
  PADDLE_PRICE_PRO_MONTH,
  PADDLE_PRICE_PRO_YEAR,
  PADDLE_PRICE_ADVANCED_MONTH,
  PADDLE_PRICE_ADVANCED_YEAR,
} from './config.js';

/** @typedef {{ month: string|null; year: string|null }} TierPriceId */

/**
 * @typedef {Object} Tier
 * @property {'Starter'|'Pro'|'Advanced'} name
 * @property {string} description
 * @property {string[]} features
 * @property {boolean} popular
 * @property {TierPriceId} priceId
 */

/** @type {Tier[]} */
export const TIERS = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started with AI analytics.',
    popular: false,
    priceId: { month: null, year: null }, // free tier — no checkout
    features: [
      'Up to 3 team members',
      '5 data sources',
      '7-day data history',
      'Basic dashboards',
      'Community support',
      '1 active project',
    ],
  },
  {
    name: 'Pro',
    description: 'For growing teams that need advanced analytics and AI-powered insights.',
    popular: true,
    priceId: {
      month: PADDLE_PRICE_PRO_MONTH,
      year: PADDLE_PRICE_PRO_YEAR,
    },
    features: [
      'Up to 25 team members',
      'Unlimited data sources',
      '90-day data history',
      'AI-powered insights',
      'Custom dashboards',
      'Priority email support',
      'SSO integration',
      'API access',
    ],
  },
  {
    name: 'Advanced',
    description: 'Enterprise-grade power for large organizations with complex data needs.',
    popular: false,
    priceId: {
      month: PADDLE_PRICE_ADVANCED_MONTH,
      year: PADDLE_PRICE_ADVANCED_YEAR,
    },
    features: [
      'Unlimited team members',
      'Unlimited data sources',
      'Unlimited data history',
      'Dedicated AI models',
      'White-label options',
      '24/7 phone & chat support',
      'Custom integrations',
      'SLA guarantee',
      'Dedicated success manager',
    ],
  },
];

// Flat list of all non-free price IDs, used to batch PricePreview calls.
export const ALL_PRICE_IDS = TIERS.flatMap((t) =>
  [t.priceId.month, t.priceId.year].filter(Boolean)
);
