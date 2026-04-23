'use client';

import Link from 'next/link';
import { LogoWithText } from './Logo';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { isLoggedIn, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="flex items-center h-16 px-4 md:px-10 border-b border-border-light bg-white w-full sticky top-0 z-50">
      <div className="flex-1 flex justify-start z-10">
        <Link href="/">
          <LogoWithText size={20} textClassName="text-base md:text-lg" />
        </Link>
      </div>

      <nav aria-label="주요 네비게이션" className="hidden sm:flex gap-4 md:gap-7 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
        <Link href="/" className="nav-link whitespace-nowrap p-2">방 목록</Link>
        <Link href="/settings" className="nav-link whitespace-nowrap p-2">설정</Link>
      </nav>

      <div className="flex-1 flex justify-end items-center gap-4 z-10">
        {isLoggedIn ? (
          <button 
            onClick={handleLogout}
            className="text-sm text-text-caption hover:text-text-main transition-colors"
          >
            로그아웃
          </button>
        ) : (
          <Link 
            href="/login"
            className="text-sm font-semibold text-brand-primary border border-brand-primary/30 px-3 py-1.5 rounded-md hover:bg-brand-primary/5 transition-colors"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
