'use client';

import Link from 'next/link';
import { LogoWithText } from './Logo';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoutConfirmModal } from './ui/Modals';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import Image from 'next/image';

function getInitial(nickname?: string, email?: string) {
  if (nickname && nickname.length > 0) return nickname.charAt(0);
  if (email && email.length > 0) return email.charAt(0);
  return 'U';
}

export default function Header() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 하이드레이션 불일치 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    router.push(ROUTES.HOME);
  };

  if (!mounted) {
    return (
      <header className="flex items-center h-16 px-4 md:px-10 border-b border-border-light bg-white w-full sticky top-0 z-50">
        <div className="flex-1"><LogoWithText size={20} /></div>
        <div className="flex-1" />
      </header>
    );
  }

  const userInitial = getInitial(user?.nickname, user?.email);

  return (
    <>
      <header className="flex items-center h-16 px-4 md:px-10 border-b border-border-light bg-white w-full sticky top-0 z-50">
        <div className="flex-1 flex justify-start z-10">
          <Link href={ROUTES.HOME}>
            <LogoWithText size={20} textClassName="text-base md:text-lg" />
          </Link>
        </div>

        <nav aria-label="주요 네비게이션" className="hidden sm:flex gap-10 sm:absolute sm:left-1/2 sm:-translate-x-1/2 z-20">
          <Link
            href={ROUTES.ROOMS}
            className={cn(
              "text-[15px] font-bold transition-colors p-2 cursor-pointer",
              pathname === ROUTES.ROOMS ? "text-[#0A607D]" : "text-[#232527]"
            )}
          >
            방 목록
          </Link>
          <Link
            href={ROUTES.REPORT}
            className={cn(
              "text-[15px] font-bold transition-colors p-2 cursor-pointer",
              pathname === ROUTES.REPORT ? "text-[#0A607D]" : "text-[#232527]"
            )}
          >
            비교 리포트
          </Link>
          <Link
            href={ROUTES.SETTINGS}
            className={cn(
              "text-[15px] font-bold transition-colors p-2 cursor-pointer",
              pathname === ROUTES.SETTINGS ? "text-[#0A607D]" : "text-[#232527]"
            )}
          >
            설정
          </Link>
        </nav>

        <div className="flex-1 flex justify-end items-center gap-3 z-10">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#718096] flex items-center justify-center text-white text-[12px] font-bold overflow-hidden relative">
                {user?.profileImageUrl ? (
                  <Image 
                    src={user.profileImageUrl} 
                    alt={user.nickname || 'Profile'} 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>
              <button 
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 text-[12px] text-[#A0A0A0] hover:text-[#232527] transition-all cursor-pointer border border-[#E2E2E2] rounded-md px-2.5 py-1.5 bg-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href={ROUTES.LOGIN}
              className="text-[13px] font-bold text-[#0A607D] border border-[#0A607D]/30 px-4 py-1.5 rounded-md hover:bg-[#0A607D]/5 transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </header>

      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onLogout={confirmLogout}
      />
    </>
  );
}
