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
  onTokenRefresh: (newAccessToken) => {
    const user = useAuthStore.getState().user;
    if (user) useAuthStore.getState().setAuth(newAccessToken, user);
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
