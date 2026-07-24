import { API_BASE_URL as API_BASE } from '../config.js';

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const taskApi = {
  getAll: ({ projectId } = {}) => {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return fetch(`${API_BASE}/tasks${qs}`).then(handleResponse);
  },
  getById: (id) => fetch(`${API_BASE}/tasks/${id}`).then(handleResponse),
  create: (task) => fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  }).then(handleResponse),
  update: (id, task) => fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  uploadAttachment: (id, file, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/tasks/${id}/attachment`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) resolve(body);
          else reject(new Error(body.message || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP error ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  },

  deleteAttachment: (id) => fetch(`${API_BASE}/tasks/${id}/attachment`, {
    method: 'DELETE'
  }).then(handleResponse),

  getStats: ({ priority, days } = {}) => {
    const params = new URLSearchParams();
    if (priority && priority !== 'All') params.set('priority', priority);
    if (days) params.set('days', days);
    const qs = params.toString();
    return fetch(`${API_BASE}/tasks/stats${qs ? `?${qs}` : ''}`).then(handleResponse);
  },
};

export const projectApi = {
  getAll: () => fetch(`${API_BASE}/projects`).then(handleResponse),
  getById: (id) => fetch(`${API_BASE}/projects/${id}`).then(handleResponse),
  create: (project) => fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
};

export const aiApi = {
  getInsights: (projectId) => {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return fetch(`${API_BASE}/ai/insights${qs}`).then(handleResponse);
  },
};
