import axios from 'axios';
import { loginRedirect } from '@/lib/routes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

interface ApiHooks {
  getToken: () => string | null;
  onUnauthorized: () => void;
  onTokenRefresh: (newAccessToken: string) => void;
}

let hooks: ApiHooks = {
  getToken: () => null,
  onUnauthorized: () => {
    if (typeof window !== 'undefined') window.location.href = loginRedirect('expired');
  },
  onTokenRefresh: () => {},
};

export const configureApi = (next: Partial<ApiHooks>) => {
  hooks = { ...hooks, ...next };
};

api.interceptors.request.use((config) => {
  const token = hooks.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/auth/jwt/refresh`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = refreshResponse.headers['authorization']?.replace('Bearer ', '');
        if (newAccessToken) {
          hooks.onTokenRefresh(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        hooks.onUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    if (status === 403) {
      console.error('[API Error] Forbidden: Access denied.');
    }

    if (status >= 500) {
      console.error('[API Error] Server Internal Error.');
    }

    return Promise.reject(error);
  }
);
