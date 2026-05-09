import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogoWithText } from './Logo';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useRoomsList } from '@/features/rooms/hooks/useRoomsQuery';
import { LogoutConfirmModal } from './ui/Modals';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { GUEST_ROOM_LIMIT, ROOM_LIMIT } from '@/lib/constants';

function getInitial(nickname?: string, email?: string) {
  if (nickname && nickname.length > 0) return nickname.charAt(0);
  if (email && email.length > 0) return email.charAt(0);
  return 'U';
}

export default function Header() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const { guestRooms } = useGuestRoomStore();
  const { data: rooms } = useRoomsList();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isLanding = pathname === ROUTES.LANDING;
  const isRoomsPage = pathname === ROUTES.HOME;
  const loggedInRoomCount = rooms?.length ?? 0;
  const totalRoomCount = isLoggedIn ? loggedInRoomCount : guestRooms.length;
  // /rooms empty state에서는 본문 CTA가 노출되므로 헤더 버튼 숨김
  const hideStartButton = isLanding || (isRoomsPage && totalRoomCount === 0);
  const startDisabled = isLoggedIn
    ? loggedInRoomCount >= ROOM_LIMIT
    : guestRooms.length >= GUEST_ROOM_LIMIT;
  const disabledLabel = isLoggedIn
    ? `방은 최대 ${ROOM_LIMIT}개까지 추가할 수 있어요`
    : `비로그인 한도(${GUEST_ROOM_LIMIT}개)에 도달했어요`;

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate(ROUTES.LANDING, { replace: true });
  };

  const userInitial = getInitial(user?.nickname, user?.email);

  return (
    <>
      <header className="flex items-center h-16 px-4 md:px-10 lg:px-20 border-b border-[#E2E2E2] bg-white w-full sticky top-0 z-50">
        <div className="flex-1 flex justify-start z-10">
          <Link to={ROUTES.HOME}>
            <LogoWithText size={20} textClassName="text-base md:text-lg" />
          </Link>
        </div>

        <nav aria-label="주요 네비게이션" className="hidden sm:flex gap-10 sm:absolute sm:left-1/2 sm:-translate-x-1/2 z-20">
          <Link
            to={ROUTES.HOME}
            className={cn(
              'text-fluid-lg font-bold transition-colors p-2',
              pathname === ROUTES.HOME ? 'text-[#0A607D]' : 'text-[#232527]'
            )}
          >
            방 목록
          </Link>
          <Link
            to={ROUTES.SETTINGS}
            className={cn(
              'text-fluid-lg font-bold transition-colors p-2',
              pathname === ROUTES.SETTINGS ? 'text-[#0A607D]' : 'text-[#232527]'
            )}
          >
            커스텀
          </Link>
        </nav>

        <div className="flex-1 flex justify-end items-center gap-3 z-10">
          {/* 체크리스트 시작하기 — Figma 373:19998(활성) / 373:20132(비활성). 랜딩 + /rooms empty state에서는 숨김. */}
          {!hideStartButton && (startDisabled ? (
            <button
              type="button"
              disabled
              aria-label={disabledLabel}
              className="flex h-8 px-3 sm:px-4 py-2 rounded-[4px] bg-[#BFBFBF] items-center gap-[6px] sm:gap-[10px] cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-[12px] font-semibold text-white whitespace-nowrap">체크리스트 시작하기</span>
            </button>
          ) : (
            <Link
              to={ROUTES.CHECKLIST_NEW}
              className="flex h-8 px-3 sm:px-4 py-2 rounded-[4px] bg-[#0A607D] items-center gap-[6px] sm:gap-[10px] hover:bg-[#084e6d] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-[12px] font-semibold text-white whitespace-nowrap">체크리스트 시작하기</span>
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#718096] flex items-center justify-center text-white text-[12px] font-bold overflow-hidden relative">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={user.nickname || 'Profile'} className="object-cover w-full h-full" />
                ) : (
                  userInitial
                )}
              </div>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-1.5 text-[12px] text-[#A0A0A0] hover:text-[#232527] transition-all cursor-pointer border border-[#E2E2E2] rounded-md px-2.5 py-1.5 bg-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="text-[12px] font-semibold text-text-main border border-border-light px-4 py-2 rounded hover:bg-bg-gray transition-colors"
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
