'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import type { User } from '@/types';

// ⚠️ 무한 만료 토큰 — BE에서 새 토큰 발급 시 교체 (2026-05-02)
// userId 1 ~ 5 선택 가능
const DEV_TOKENS: Record<number, string> = {
  1: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcklkIjoxLCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9._9aMVxu_8RHH4RzgHctLNhiRQrrbMfLrh0xOLSmR8hs',
  2: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwidXNlcklkIjoyLCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9.r-68-OZnJVnciHUczuj3EJuj-ev9EHBTwrUjXKFiwQc',
  3: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwidXNlcklkIjozLCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9.I6wq137UVOXYr7YRR3sqw1Lm4t-zBxhp60Myb8bv0TA',
  4: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwidXNlcklkIjo0LCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9.azyl6Y32R23XWeTYowwa-q1KbiumjQnIt0aEyBzGxvU',
  5: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1IiwidXNlcklkIjo1LCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9.-DlAb7t9pvo-P-dtVuf5dxJF6LHzzeJGfRxRRvMFaKk',
};

const ACTIVE_USER_ID = 1;

const DEV_USER: User = {
  id: String(ACTIVE_USER_ID),
  email: `dev${ACTIVE_USER_ID}@bangcheck.com`,
  nickname: `개발자${ACTIVE_USER_ID}`,
};

export function DevLoginButton() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  if (process.env.NODE_ENV !== 'development') return null;

  const token = DEV_TOKENS[ACTIVE_USER_ID];

  const handleDevLogin = () => {
    setAuth(token, DEV_USER);
    router.push('/');
  };

  return (
    <button
      onClick={handleDevLogin}
      className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-4 py-2 rounded-lg z-50 hover:bg-gray-700"
    >
      [DEV] userId:{ACTIVE_USER_ID} 로그인
    </button>
  );
}
