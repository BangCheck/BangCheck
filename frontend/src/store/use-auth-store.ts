import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setTokenCookie, deleteTokenCookie } from '@/lib/cookie';
import { useGuestRoomStore } from './use-guest-room-store';
import { useCustomizationStore } from './use-customization-store';

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
        // 로그인 성공 시 비로그인 잔여 데이터 비움 — 로그인 사용자 데이터는 BE가 SSoT
        useGuestRoomStore.getState().clearGuestRooms();
        useCustomizationStore.getState().reset();
        set({ accessToken, user, isLoggedIn: true });
      },
      logout: () => {
        deleteTokenCookie();
        // 로그아웃 시에도 동일 cleanup (NFR 보안 — 다른 사용자 로그인 대비)
        useGuestRoomStore.getState().clearGuestRooms();
        useCustomizationStore.getState().reset();
        set({ accessToken: null, user: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
