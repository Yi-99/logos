import axios from 'axios';
import { getAccessToken } from '@/lib/cognito';

/**
 * Axios instance with automatic Cognito access token injection.
 * Use this instead of importing axios directly in services.
 */
const api = axios.create();

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

/**
 * Helper to get the current auth headers for non-axios requests (e.g. fetch).
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}
