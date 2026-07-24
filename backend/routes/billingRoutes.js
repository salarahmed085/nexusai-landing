import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  getCountry,
  getOrCreateCustomer,
  getMySubscription,
  handlePaddleWebhook,
} from '../controllers/billingController.js';

const router = express.Router();

// Public — lets the SPA read the visitor's country for Paddle PricePreview
// localization without exposing any sensitive data.
router.get('/country', getCountry);

// Authenticated endpoints (used by the logged-in app).
router.post('/customer', requireAuth, getOrCreateCustomer);
router.get('/subscription', requireAuth, getMySubscription);

// Note: app.js applies express.raw() to /api/billing/webhook specifically,
// BEFORE the global express.json() middleware, so the handler below gets
// the exact raw bytes it needs for Paddle's signature verification.
router.post('/webhook', handlePaddleWebhook);

export default router;
