import { Paddle, Environment, EventName } from '@paddle/paddle-node-sdk';
import UserModel from '../models/UserModel.js';

// Lazily construct the client so the app doesn't crash on boot if
// PADDLE_API_KEY hasn't been set yet (e.g. before the entity/account exists).
// PADDLE_ENV controls which Paddle API this hits — 'sandbox' or 'production'.
// This MUST match where the API key was generated, or every call fails.
let paddleClient = null;
function getPaddleClient() {
  if (!process.env.PADDLE_API_KEY) return null;
  if (!paddleClient) {
    const environment =
      process.env.PADDLE_ENV === 'production' ? Environment.production : Environment.sandbox;
    paddleClient = new Paddle(process.env.PADDLE_API_KEY, { environment });
  }
  return paddleClient;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/billing/country  (no auth required)
// ─────────────────────────────────────────────────────────────────────────────
// Returns the visitor's 2-letter ISO country code read from the
// x-vercel-ip-country header that Vercel injects on every request.
// The frontend uses this to pass a country hint to Paddle.PricePreview() so
// prices are localized to the visitor's location.
//
// We deliberately return null (not a sentinel like 'OTHERS') if the header is
// absent or doesn't look like a real ISO code — the frontend must NOT pass
// anything invalid to Paddle; it should let Paddle auto-detect from the IP.
export const getCountry = (req, res) => {
  const raw = req.headers['x-vercel-ip-country'];
  // Only return a value that looks like a real 2-letter ISO 3166-1 alpha-2 code.
  const country = raw && /^[A-Z]{2}$/.test(raw) ? raw : null;
  res.status(200).json({ country });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/billing/customer  (requireAuth)
// ─────────────────────────────────────────────────────────────────────────────
// Called by the logged-in user right before opening the Paddle.js checkout
// overlay. Ensures we have a Paddle customer id linked to this user *before*
// they pay, so the webhook that arrives after payment can find them again.
export const getOrCreateCustomer = async (req, res) => {
  try {
    const paddle = getPaddleClient();
    if (!paddle) {
      return res.status(503).json({ success: false, message: 'Billing is not configured yet.' });
    }

    const user = await UserModel.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Reuse an existing Paddle customer if we already linked one.
    if (user.paddleCustomerId) {
      return res.status(200).json({ success: true, data: { paddleCustomerId: user.paddleCustomerId } });
    }

    // A Paddle customer with this email may already exist (e.g. from an
    // earlier attempt before this user's row was linked). Look it up first
    // instead of blindly creating, which Paddle rejects as a conflict.
    let customer;
    const existingCollection = paddle.customers.list({ email: [user.email] });
    const existingPage = await existingCollection.next();
    if (existingPage && existingPage.length > 0) {
      customer = existingPage[0];
    } else {
      customer = await paddle.customers.create({
        email: user.email,
        name: user.name,
        customData: { userId: user.id },
      });
    }

    await UserModel.setPaddleCustomerId(user.id, customer.id);

    res.status(200).json({ success: true, data: { paddleCustomerId: customer.id } });
  } catch (err) {
    console.error('Paddle getOrCreateCustomer error:', err.message, err.body || err);
    res.status(500).json({ success: false, message: 'Failed to prepare checkout.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/billing/subscription  (requireAuth)
// ─────────────────────────────────────────────────────────────────────────────
// Returns the signed-in user's current plan/subscription status, for the
// frontend to gate features and show billing info.
export const getMySubscription = async (req, res) => {
  try {
    const user = await UserModel.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({
      success: true,
      data: {
        plan: user.plan || 'starter',
        subscriptionStatus: user.subscriptionStatus || null,
        currentPeriodEnd: user.currentPeriodEnd || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Webhook helpers
// ─────────────────────────────────────────────────────────────────────────────

// Maps a Paddle price id (from env) to the plan name we store on the user.
// Monthly and yearly price IDs both map to the same plan name.
function planFromPriceId(priceId) {
  if (!priceId) return 'starter';

  const {
    PADDLE_PRICE_PRO_MONTH,
    PADDLE_PRICE_PRO_YEAR,
    PADDLE_PRICE_ADVANCED_MONTH,
    PADDLE_PRICE_ADVANCED_YEAR,
  } = process.env;

  if (priceId === PADDLE_PRICE_ADVANCED_MONTH || priceId === PADDLE_PRICE_ADVANCED_YEAR) {
    return 'advanced';
  }
  if (priceId === PADDLE_PRICE_PRO_MONTH || priceId === PADDLE_PRICE_PRO_YEAR) {
    return 'pro';
  }
  return 'starter';
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/billing/webhook  (raw body — no auth)
// ─────────────────────────────────────────────────────────────────────────────
// Must receive the RAW request body (see app.js, where express.raw() is
// applied to this route before express.json()) so the signature can be
// verified. Never respond 4xx on our own bugs — Paddle would retry forever.
export const handlePaddleWebhook = async (req, res) => {
  const paddle = getPaddleClient();
  if (!paddle) {
    return res.status(503).json({ success: false, message: 'Billing is not configured yet.' });
  }

  const signature = req.headers['paddle-signature'];
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  // Temporary diagnostics: confirms the secret is loaded and the body arrived
  // as a raw Buffer. Safe to remove once webhooks are confirmed working.
  console.log('Webhook debug:', {
    hasSecret: Boolean(secret),
    secretLength: secret ? secret.length : 0,
    hasSignatureHeader: Boolean(signature),
    bodyIsBuffer: Buffer.isBuffer(req.body),
    bodyType: typeof req.body,
  });

  let event;
  try {
    event = await paddle.webhooks.unmarshal(req.body.toString(), secret, signature);
  } catch (err) {
    console.error('Paddle webhook signature verification failed:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
  }

  if (!event) {
    return res.status(400).json({ success: false, message: 'Could not parse webhook.' });
  }

  try {
    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated: {
        const sub = event.data;
        const priceId = sub.items?.[0]?.price?.id;
        await UserModel.updateSubscription(sub.customerId, {
          plan: planFromPriceId(priceId),
          paddleSubscriptionId: sub.id,
          subscriptionStatus: sub.status, // active, trialing, past_due, paused, canceled
          currentPeriodEnd: sub.currentBillingPeriod?.endsAt || null,
        });
        break;
      }
      case EventName.SubscriptionCanceled: {
        const sub = event.data;
        await UserModel.updateSubscription(sub.customerId, {
          plan: 'starter',
          paddleSubscriptionId: sub.id,
          subscriptionStatus: 'canceled',
          currentPeriodEnd: null,
        });
        break;
      }
      default:
        // Other events (transaction.*, customer.*, etc.) are ignored for now.
        break;
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error processing Paddle webhook:', err.message);
    // Still 200 so Paddle doesn't hammer us with retries for a bug on our
    // side; the event is logged above for manual follow-up.
    res.status(200).json({ success: false, message: 'Webhook processed with errors.' });
  }
};
