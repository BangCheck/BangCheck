import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/services/get-query-client';

// TODO(E09-S03): configureApi({ getToken, onUnauthorized, onTokenRefresh }) 통합.
// 현 베이스라인은 placeholder 라우트만 동작하므로 API 호출 없음.
// LoginPage 마이그레이션 시점에 auth-store 연결 + Axios 인터셉터 hook 부착.

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
