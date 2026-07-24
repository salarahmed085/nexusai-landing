import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { initializePaddle } from '@paddle/paddle-js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { billingApi } from '../services/billingApi.js';
import { Logo } from '../components/Icons.jsx';
import { PADDLE_CLIENT_TOKEN, PADDLE_ENV, API_BASE_URL } from '../config.js';
import { TIERS, ALL_PRICE_IDS } from '../tiers.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch the visitor's country from the backend (reads x-vercel-ip-country).
 *  Returns a 2-letter ISO code or null — null means "let Paddle auto-detect". */
async function fetchCountry() {
  try {
    const res = await fetch(`${API_BASE_URL}/billing/country`);
    if (!res.ok) return null;
    const { country } = await res.json();
    // Guard: never pass a sentinel/empty/unknown value to Paddle
    return country && country.length === 2 ? country : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons (inline so no extra file needed)
// ─────────────────────────────────────────────────────────────────────────────
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.3" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PricingCard
// ─────────────────────────────────────────────────────────────────────────────
function PricingCard({ tier, billing, formattedPrice, loadingPlan, onSubscribe, currentPlan, configError }) {
  const isFree     = !tier.priceId.month && !tier.priceId.year;
  const isCurrent  = currentPlan === tier.name.toLowerCase();
  const isLoading  = loadingPlan === tier.name;
  const activePriceId = billing === 'year' ? tier.priceId.year : tier.priceId.month;

  // Price display: show Paddle's formatted total, or $0 for free, or "…" while loading
  let priceDisplay = '…';
  if (isFree) {
    priceDisplay = '$0';
  } else if (formattedPrice) {
    priceDisplay = formattedPrice;
  }

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-7 transition-all duration-200 ${
        tier.popular
          ? 'bg-gradient-to-b from-brand-500/15 to-dark-900/60 border-2 border-brand-500/40 shadow-xl shadow-brand-500/10'
          : 'bg-dark-900/50 border border-dark-800/50 hover:border-dark-700/70'
      }`}
    >
      {/* Most Popular badge */}
      {tier.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-semibold tracking-wide shadow-lg">
          Most Popular
        </div>
      )}

      {/* Name + description */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-white mb-1.5">{tier.name}</h3>
        <p className="text-sm text-dark-400 leading-relaxed">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold text-white">{priceDisplay}</span>
          {!isFree && <span className="text-dark-500 text-sm">/ {billing === 'year' ? 'yr' : 'mo'}</span>}
        </div>
        {isFree && <p className="text-xs text-dark-500 mt-1">Free forever</p>}
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-8 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-dark-300">
            <span className="mt-0.5 text-brand-400 flex-shrink-0">
              <CheckCircleIcon />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrent ? (
        <div className="w-full py-2.5 text-center rounded-xl bg-dark-800 text-dark-400 text-sm font-medium">
          Current plan
        </div>
      ) : isFree ? (
        <div className="w-full py-2.5 text-center rounded-xl bg-dark-800/50 text-dark-500 text-sm">
          No subscription needed
        </div>
      ) : (
        <button
          onClick={() => onSubscribe(tier, activePriceId)}
          disabled={isLoading || Boolean(configError) || !activePriceId}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            tier.popular
              ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-500 shadow-lg shadow-brand-500/20'
              : 'bg-dark-800 text-white hover:bg-dark-700 border border-dark-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Opening checkout…
            </span>
          ) : (
            `Subscribe to ${tier.name}`
          )}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BillingPage (main export)
// ─────────────────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();

  const [paddle, setPaddle]           = useState(null);
  const [configError, setConfigError] = useState(null);
  const [billing, setBilling]         = useState('month'); // 'month' | 'year'
  const [subscription, setSubscription] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null); // tier.name being opened
  // Maps priceId -> Paddle's own formatted total string (e.g. "$29.00").
  // We NEVER format or compute prices ourselves — only display what Paddle returns.
  const [formattedPrices, setFormattedPrices] = useState({});

  // ── 1. Initialize Paddle ──────────────────────────────────────────────────
  // Fail loudly if env vars are missing — a silent fallback risks pointing at
  // the wrong Paddle environment/account.
  useEffect(() => {
    if (!PADDLE_ENV) {
      setConfigError(
        'VITE_PADDLE_ENV is not set (expected "sandbox" or "production"). Refusing to load checkout.'
      );
      return;
    }
    if (!PADDLE_CLIENT_TOKEN) {
      setConfigError('VITE_PADDLE_CLIENT_TOKEN is not set.');
      return;
    }
    initializePaddle({ environment: PADDLE_ENV, token: PADDLE_CLIENT_TOKEN })
      .then((instance) => setPaddle(instance))
      .catch((err) => setConfigError(`Paddle init failed: ${err.message}`));
  }, []);

  // ── 2. Fetch localized prices from Paddle once it's ready ─────────────────
  // We batch all price IDs into a single PricePreview call and store
  // Paddle's formattedTotals.total keyed by priceId. No client-side math.
  useEffect(() => {
    if (!paddle || ALL_PRICE_IDS.length === 0) return;

    (async () => {
      // Detect country from backend (reads x-vercel-ip-country header).
      // If absent, pass nothing — Paddle auto-detects from visitor IP.
      const country = await fetchCountry();

      const previewArgs = {
        items: ALL_PRICE_IDS.map((id) => ({ priceId: id, quantity: 1 })),
      };
      if (country) previewArgs.customerIpAddress = country; // pass country code only

      try {
        const result = await paddle.PricePreview(previewArgs);
        const lineItems = result?.data?.details?.lineItems || [];
        const next = {};
        lineItems.forEach((item) => {
          next[item.price.id] = item.formattedTotals.total;
        });
        setFormattedPrices(next);
      } catch (err) {
        console.error('Paddle PricePreview failed:', err.message);
      }
    })();
  }, [paddle]);

  // ── 3. Load subscription status ───────────────────────────────────────────
  const loadSubscription = useCallback(async () => {
    if (!token) return;
    try {
      const res = await billingApi.getSubscription(token);
      setSubscription(res.data);
    } catch {
      // Non-fatal — page still works, just won't highlight the active plan.
    }
  }, [token]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // ── 4. Open Paddle checkout overlay ──────────────────────────────────────
  const handleSubscribe = async (tier, activePriceId) => {
    if (!activePriceId) return;
    if (configError) {
      addToast(configError, 'error');
      return;
    }
    if (!paddle) {
      addToast('Checkout is still loading, please try again in a moment.', 'error');
      return;
    }

    setLoadingPlan(tier.name);
    try {
      // Ensure a Paddle customer record is linked to this user before checkout,
      // so the post-payment webhook can identify them.
      const { data } = await billingApi.getOrCreateCustomer(token);

      paddle.Checkout.open({
        items: [{ priceId: activePriceId, quantity: 1 }],
        customer: {
          id: data.paddleCustomerId,
          email: user?.email || undefined, // prefill if signed in
        },
        settings: {
          displayMode: 'overlay',
          variant: 'one-page',
          theme: 'dark',
          successUrl: `${window.location.origin}/welcome`,
        },
      });
    } catch (err) {
      addToast(err.message || 'Could not start checkout.', 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = subscription?.plan || user?.plan || 'starter';

  return (
    <div className="min-h-screen bg-dark-950">
      {/* ── Header ── */}
      <header className="border-b border-dark-800/50 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Logo />
          <span className="font-bold text-white">NexusAI</span>
        </Link>
        <Link to="/dashboard" className="text-sm text-dark-400 hover:text-white transition-colors">
          ← Back to dashboard
        </Link>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
            Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Choose your plan</h1>
          <p className="text-dark-400 max-w-md mx-auto">
            Upgrade anytime. Cancel anytime. All billing handled securely by Paddle.
          </p>

          {/* Config error banner */}
          {configError && (
            <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 inline-block">
              ⚠ {configError}
            </p>
          )}
        </div>

        {/* Monthly / Yearly toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium transition-colors ${billing === 'month' ? 'text-white' : 'text-dark-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBilling(billing === 'month' ? 'year' : 'month')}
            aria-label="Toggle billing period"
            className="relative w-14 h-7 rounded-full bg-dark-800 border border-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors"
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-brand-500 shadow transition-transform duration-200 ${
                billing === 'year' ? 'translate-x-7' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${billing === 'year' ? 'text-white' : 'text-dark-500'}`}>
            Yearly
          </span>
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-semibold">
            Save 20%
          </span>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TIERS.map((tier) => {
            const activePriceId = billing === 'year' ? tier.priceId.year : tier.priceId.month;
            return (
              <PricingCard
                key={tier.name}
                tier={tier}
                billing={billing}
                formattedPrice={activePriceId ? formattedPrices[activePriceId] : null}
                loadingPlan={loadingPlan}
                onSubscribe={handleSubscribe}
                currentPlan={currentPlan}
                configError={configError}
              />
            );
          })}
        </div>

        {/* Trust footer */}
        <p className="text-center text-xs text-dark-600 mt-12">
          Payments processed securely by{' '}
          <a
            href="https://www.paddle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark-500 hover:text-dark-300 transition-colors underline underline-offset-2"
          >
            Paddle
          </a>
          . Prices shown include applicable taxes.
        </p>
      </main>
    </div>
  );
}
