import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setTokenCookie, deleteTokenCookie } from '@/lib/cookie';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  setAuth: (accessToken: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      setAuth: (accessToken, user) => {
        setTokenCookie(accessToken);
        set({ accessToken, user, isLoggedIn: true });
      },
      logout: () => {
        deleteTokenCookie();
        set({ accessToken: null, user: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
