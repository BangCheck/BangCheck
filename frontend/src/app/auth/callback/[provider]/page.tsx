'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { exchangeOAuthCode } from '@/services/auth-service';
import type { OAuthProvider } from '@/types';
import { ROUTES, loginRedirect } from '@/lib/routes';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const provider = params.provider as OAuthProvider;
  const setAuth = useAuthStore((state) => state.setAuth);

  const isProcessed = useRef(false);

  const loginMutation = useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      return exchangeOAuthCode(provider, code, state);
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      const callbackUrl = searchParams.get('callbackUrl') || ROUTES.HOME;
      router.replace(callbackUrl);
    },
    onError: (error) => {
      console.error('Login Error:', error);
      router.replace(loginRedirect('auth_failed'));
    },
  });

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (isProcessed.current) return;

    if (code && state && provider) {
      isProcessed.current = true;
      loginMutation.mutate({ code, state });
    } else {
      router.replace(loginRedirect('invalid_params'));
    }
  }, [provider, searchParams, loginMutation, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-main font-medium">로그인 처리 중입니다...</p>
        <p className="text-text-caption text-sm">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
