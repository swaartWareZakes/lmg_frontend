
async function buildApiError(response: Response) {
  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const detail = payload?.detail ?? payload?.message ?? payload;
  const message =
    typeof detail === "object"
      ? detail.message || detail.next_step || JSON.stringify(detail)
      : detail || response.statusText || `HTTP ${response.status}`;

  const error: any = new Error(message);
  error.status = response.status;
  error.detail = detail;
  error.payload = payload;
  return error;
}

// --- ./src/lib/api.ts ---
import { supabase } from './supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function getHeaders(isFormData = false) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: any = {};
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  // Do not set Content-Type for FormData, the browser handles the boundaries automatically
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

export const api = {
  async get(endpoint: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    if (!res.ok) throw await buildApiError(res);
    return res.json();
  },
  
  async post(endpoint: string, data: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw await buildApiError(res);
    return res.json();
  },

  async postForm(endpoint: string, formData: FormData) {
    const headers = await getHeaders(true);
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData // Browser automatically sets Content-Type to multipart/form-data
    });
    if (!res.ok) throw await buildApiError(res);
    return res.json();
  },

  async patch(endpoint: string, data: any = {}) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    });
    if (!res.ok) throw await buildApiError(res);
    return res.json();
  },

  // NEW: Delete method
  async delete(endpoint: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw await buildApiError(res);
    return res.json();
  }
};