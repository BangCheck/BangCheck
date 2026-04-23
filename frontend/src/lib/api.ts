import axios from 'axios';
import { useAuthStore } from '@/store/use-auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 전송을 위해 필수 (refresh_token)
});

// 요청 인터셉터: 헤더에 Access Token 주입
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 에러 처리 및 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 401: 토큰 만료 처리
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/jwt/refresh`, {}, { withCredentials: true });
        const newAccessToken = response.headers['authorization']?.replace('Bearer ', '');
        if (newAccessToken) {
          useAuthStore.getState().setAuth(newAccessToken, useAuthStore.getState().user!);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login?error=expired';
        return Promise.reject(refreshError);
      }
    }

    // 403: 권한 부족
    if (status === 403) {
      console.error('[API Error] Forbidden: Access denied.');
    }

    // 500 이상: 서버 오류
    if (status >= 500) {
      console.error('[API Error] Server Internal Error.');
    }

    return Promise.reject(error);
  }
);
