import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
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
        // 로그인 성공 시 비로그인 잔여 데이터 비움 — 로그인 사용자 데이터는 BE가 SSoT
        useGuestRoomStore.getState().clearGuestRooms();
        useCustomizationStore.getState().reset();
        set({ accessToken, user, isLoggedIn: true });
      },
      logout: () => {
        // 로그아웃 시에도 동일 cleanup (NFR 보안 — 다른 사용자 로그인 대비)
        useGuestRoomStore.getState().clearGuestRooms();
        useCustomizationStore.getState().reset();
        set({ accessToken: null, user: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
      // accessToken은 영속화하지 않는다 — 메모리가 유일 소스다.
      // 새로고침 후에는 토큰이 없는 채로 요청이 나가 401이 되고,
      // api.ts의 인터셉터가 HttpOnly refresh 쿠키로 재발급받아 재시도한다.
      // user·isLoggedIn만 남겨 재발급 성공 시 setAuth가 복구할 수 있게 한다.
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
);
