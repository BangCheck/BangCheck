import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  nickname?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  setAuth: (accessToken: string, user: User) => void;
  logout: () => void;
}

// 쿠키 관리를 위한 간단한 헬퍼
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      setAuth: (accessToken, user) => {
        setAuthCookie(accessToken);
        set({ accessToken, user, isLoggedIn: true });
      },
      logout: () => {
        deleteCookie('accessToken');
        set({ accessToken: null, user: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// 클라이언트 사이드에서만 쿠키 설정 (Zustand persist와 동기화)
const setAuthCookie = (token: string) => {
  if (typeof window !== 'undefined') {
    setCookie('accessToken', token, 7);
  }
};
