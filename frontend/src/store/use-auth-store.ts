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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoggedIn: false,
      setAuth: (accessToken, user) => set({ accessToken, user, isLoggedIn: true }),
      logout: () => set({ accessToken: null, user: null, isLoggedIn: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
