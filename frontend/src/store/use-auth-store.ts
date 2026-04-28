import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  setAuth: (accessToken: string, user: User) => void;
  logout: () => void;
}

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const setAuthCookie = (token: string) => {
  if (typeof window !== 'undefined') {
    setCookie('accessToken', token, 7);
  }
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
