'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { ROUTES } from '@/lib/routes';
import type { User } from '@/types';

const DEV_TOKENS: Record<number, string> = {
  1: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcklkIjoxLCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9._9aMVxu_8RHH4RzgHctLNhiRQrrbMfLrh0xOLSmR8hs',
  2: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwidXNlcklkIjoyLCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9.r-68-OZnJVnciHUczuj3EJuj-ev9EHBTwrUjXKFiwQc',
  3: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwidXNlcklkIjozLCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9.I6wq137UVOXYr7YRR3sqw1Lm4t-zBxhp60Myb8bv0TA',
  4: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwidXNlcklkIjo0LCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9.azyl6Y32R23XWeTYowwa-q1KbiumjQnIt0aEyBzGxvU',
  5: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1IiwidXNlcklkIjo1LCJyb2xlIjoiUk9MRV9VU0VSIiwiaWF0IjoxNzc3NzA2MTIzLCJleHAiOjk5OTk5OTk5OTl9.-DlAb7t9pvo-P-dtVuf5dxJF6LHzzeJGfRxRRvMFaKk',
};

export function DevLoginSection() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  if (!import.meta.env.DEV) return null;

  const handleLogin = (userId: number) => {
    const user: User = {
      id: String(userId),
      email: `dev${userId}@bangcheck.com`,
      nickname: `개발자${userId}`,
    };
    setAuth(DEV_TOKENS[userId], user);
    router.push(ROUTES.HOME);
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
      <p className="text-xs font-bold text-yellow-700 mb-3 uppercase tracking-wide">DEV — 개발 전용 로그인</p>
      <div className="flex flex-wrap gap-2">
        {([1, 2, 3, 4, 5] as const).map((userId) => (
          <button
            key={userId}
            onClick={() => handleLogin(userId)}
            className="bg-gray-800 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            userId {userId} 로그인
          </button>
        ))}
      </div>
    </div>
  );
}
