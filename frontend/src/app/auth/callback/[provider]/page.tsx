'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { api } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const provider = params.provider as string;
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const isProcessed = useRef(false);

  const loginMutation = useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const response = await api.get(`/api/v1/auth/oauth2/${provider}/callback`, {
        params: { code, state }
      });

      const accessToken = response.headers['authorization']?.replace('Bearer ', '');
      const result = response.data;

      if (!accessToken || !result.success) {
        throw new Error('토큰 정보가 없습니다.');
      }

      return {
        accessToken,
        user: {
          id: result.data?.id || 'unknown',
          email: result.data?.email || '',
          nickname: result.data?.nickname || result.data?.name || '',
        },
      };
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      router.replace(callbackUrl);
    },
    onError: (error) => {
      console.error('Login Error:', error);
      router.replace('/login?error=auth_failed');
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
      router.replace('/login?error=invalid_params');
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
