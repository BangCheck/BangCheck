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

// 응답 인터셉터: 401 에러 시 토큰 갱신 로직
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러 발생 시 (토큰 만료)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 토큰 갱신 API 호출
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/jwt/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.headers['authorization']?.replace('Bearer ', '');
        
        if (newAccessToken) {
          // 스토어 업데이트
          useAuthStore.getState().setAuth(newAccessToken, useAuthStore.getState().user!);
          
          // 기존 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // 갱신 실패 시 로그아웃 처리
        useAuthStore.getState().logout();
        window.location.href = '/login?error=expired';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
