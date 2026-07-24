import { API_BASE_URL as API_BASE } from '../config.js';

async function handleResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (body.errors && body.errors[0]) || body.message || `HTTP ${response.status}`;
    const error = new Error(message);
    error.errors = body.errors;
    throw error;
  }
  return body;
}

export const authApi = {
  signup: (name, email, password) =>
    fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }).then(handleResponse),

  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  me: (token) =>
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(handleResponse),

  uploadAvatar: (token, file, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/auth/avatar`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(xhr.responseText);
          }
        } else {
          try {
            const errBody = JSON.parse(xhr.responseText);
            reject(new Error(errBody.message || errBody.errors?.avatar || 'Upload failed'));
          } catch {
            reject(new Error(`HTTP error ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      const formData = new FormData();
      formData.append('avatar', file);
      xhr.send(formData);
    });
  },
};
