'use client';

import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

/**
 * 로그인/로그아웃 버튼을 처리하는 클라이언트 컴포넌트
 */
export default function AuthButtons() {
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuthStore();

  const handleLoginClick = () => {
    router.push(ROUTES.LOGIN);
  };

  const handleLogoutClick = () => {
    logout();
    router.refresh();
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center">
        <p className="text-text-main mb-6">로그인이 필요합니다.</p>
        <button 
          onClick={handleLoginClick}
          className="w-full bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <p className="text-text-caption text-sm mb-1">로그인 상태</p>
        <p className="text-xl font-bold text-text-main">{user?.email}</p>
        <p className="text-brand-primary font-medium mt-1">인증 완료 ✅</p>
      </div>
      <button 
        onClick={handleLogoutClick}
        className="w-full border border-border-light text-text-caption px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all cursor-pointer active:scale-[0.98]"
      >
        로그아웃
      </button>
    </div>
  );
}
