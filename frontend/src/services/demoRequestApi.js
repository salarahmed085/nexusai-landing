import { API_BASE_URL as API_BASE } from '../config.js';

async function handleResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || 'Request failed');
    error.errors = body.errors;
    throw error;
  }
  return body;
}

export const demoRequestApi = {
  submit: (formData) =>
    fetch(`${API_BASE}/demo-requests`, {
      method: 'POST',
      body: formData, // FormData sets its own multipart Content-Type header
    }).then(handleResponse),
};
