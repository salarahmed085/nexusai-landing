import { API_BASE_URL as API_BASE } from '../config.js';

async function handleResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `HTTP ${response.status}`);
  }
  return body;
}

export const billingApi = {
  getOrCreateCustomer: (token) =>
    fetch(`${API_BASE}/billing/customer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).then(handleResponse),

  getSubscription: (token) =>
    fetch(`${API_BASE}/billing/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handleResponse),
};
