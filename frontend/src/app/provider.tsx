import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/services/get-query-client';
import { configureApi } from '@/lib/api';
import { loginRedirect } from '@/lib/routes';
import { useAuthStore } from '@/store/use-auth-store';

configureApi({
  getToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') window.location.href = loginRedirect('expired');
  },
  // 재발급은 세션 유지다 — setAuth를 쓰면 로그인 cleanup이 돌아
  // 새로고침마다 게스트 방·커스터마이징이 지워진다.
  // user 유무와 무관하게 토큰을 넣어야 재시도가 같은 요청에서 끝난다.
  onTokenRefresh: (newAccessToken) => {
    useAuthStore.getState().refreshToken(newAccessToken);
  },
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const queryClient = getQueryClient();
  const isAtlasSurface = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/project-')
    || new URLSearchParams(window.location.search).get('atlasPreview') === '1'
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && !isAtlasSurface && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
