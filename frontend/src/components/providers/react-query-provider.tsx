"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/services/get-query-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { configureApi } from "@/lib/api";
import { useAuthStore } from "@/store/use-auth-store";

configureApi({
  getToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => {
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") window.location.href = "/login?error=expired";
  },
  onTokenRefresh: (newAccessToken) => {
    const user = useAuthStore.getState().user;
    if (user) useAuthStore.getState().setAuth(newAccessToken, user);
  },
});

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
