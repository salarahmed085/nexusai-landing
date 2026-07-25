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
// Access helper
// ─────────────────────────────────────────────────────────────────────────────
// Treat 'active' AND 'trialing' as access-granting. We deliberately do NOT
// look at scheduled_change here — a subscription can have a pending
// cancellation/pause scheduled for the future while still being fully
// active today, so access should only be revoked once status actually
// becomes 'canceled' (handled by the SubscriptionCanceled webhook below).
function hasAccess(user) {
  return user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
}

// Returns the signed-in user's current plan/subscription status, for the
// frontend to gate features and show billing info.
// GET /api/billing/subscription  (requireAuth)
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
        hasAccess: user.plan === 'starter' ? true : hasAccess(user),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription.', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/billing/portal  (requireAuth)
// ─────────────────────────────────────────────────────────────────────────────
// Mints a Paddle customer portal session for the signed-in user and returns
// the URL to redirect them to. The portal is Paddle-hosted — customers
// update payment method, cancel, and view invoices there directly, so we
// never need to build that UI ourselves.
//
// Security: the Paddle customer id is resolved server-side from the
// authenticated user's own row — we never trust a customer/subscription id
// supplied by the client, which would let one user open another's portal.
export const createPortalSession = async (req, res) => {
  try {
    const paddle = getPaddleClient();
    if (!paddle) {
      return res.status(503).json({ success: false, message: 'Billing is not configured yet.' });
    }

    const user = await UserModel.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (!user.paddleCustomerId) {
      return res.status(400).json({ success: false, message: 'No billing account found for this user yet.' });
    }

    const subscriptionIds = user.paddleSubscriptionId ? [user.paddleSubscriptionId] : [];
    const session = await paddle.customerPortalSessions.create(user.paddleCustomerId, subscriptionIds);

    // urls.general.overview is always present; subscription-specific deep
    // links are included when we pass subscriptionIds above.
    const url = session?.urls?.general?.overview;
    if (!url) {
      return res.status(502).json({ success: false, message: 'Paddle did not return a portal URL.' });
    }

    res.status(200).json({ success: true, data: { url } });
  } catch (err) {
    console.error('Paddle createPortalSession error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to open billing portal.', error: err.message });
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
      // Idempotency note: these are UPDATEs keyed on paddleCustomerId, not
      // inserts — running the same event twice (Paddle delivers at-least-
      // once and can retry) just writes the same values again, so handlers
      // are naturally safe to re-run.
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
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        // We already capture the Paddle customer id ourselves in
        // getOrCreateCustomer at checkout time, so there's nothing extra to
        // persist here — acknowledged so Paddle doesn't retry.
        break;
      case EventName.TransactionCompleted:
        // Subscription state (plan/status) is already handled by the
        // subscription.* events above; we don't currently need per-
        // transaction records, so this is safely acknowledged and ignored.
        break;
      default:
        // Any other event type is safely ignored.
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

// ─────────────────────────────────────────────────────────────────────────────
// Guardrails (read before touching Paddle data)
// ─────────────────────────────────────────────────────────────────────────────
// The webhook notification destination + signing secret, the Starter/Pro/
// Advanced products & prices, and any customers/subscriptions/transactions
// in Paddle or in this app's database are live infrastructure that the
// fulfillment path above depends on — never delete or offer to "clean up"
// any of them, including after testing. The only safe-to-delete things are
// throwaway artifacts YOU create purely to test (e.g. one simulated event
// fired through the webhook simulator) that nothing else depends on — and
// even then, name it and ask first.
