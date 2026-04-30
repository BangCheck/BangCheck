'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import type { User } from '@/types';

// ⚠️ 만료 1시간 — 만료 시 BE에서 새 토큰 발급 후 교체
// userId 1 ~ 5 선택 가능
const DEV_TOKENS: Record<number, string> = {
  1: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcklkIjoxLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3NzU1MzQ4NywiZXhwIjoxNzc3NTU3MDg3fQ.eD5ax5EqjBX00PbchDoQEpa0SHWVKqBR-49CCMgiGCY',
  2: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwidXNlcklkIjoyLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3NzU1MzQ4NywiZXhwIjoxNzc3NTU3MDg3fQ.UOldVpY27xvZ04bHL6rifejeMMTKbsDVw17SBz55Yq0',
  3: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwidXNlcklkIjozLCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3NzU1MzQ4NywiZXhwIjoxNzc3NTU3MDg3fQ.MZfaSgqt9l_VEUOUgMCNWBET5ujcUnEj_YdphrEN5Uw',
  4: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwidXNlcklkIjo0LCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3Nzc1NTM0ODcsImV4cCI6MTc3NzU1NzA4N30.yKD0rDA2W4pNZDMMsTJWDIrTtnYEFBU79jlUFfMJtOQ',
  5: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1IiwidXNlcklkIjo1LCJyb2xlIjoiVVNFUiIsImlhdCI6MTc3NzU1MzQ4NywiZXhwIjoxNzc3NTU3MDg3fQ.PA-GRobBTv5D0JM5qybH2mxArpqnByAbthhyR23mVL8',
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
