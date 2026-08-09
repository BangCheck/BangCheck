import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogoWithText } from '@/components/Logo';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useRoomsList } from '@/features/rooms/hooks/use-rooms-query';
import { LogoutConfirmModal, LoginRequiredModal } from '@/components/ui/Modals';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { GUEST_ROOM_LIMIT, ROOM_LIMIT } from '@/lib/constants';
import { logoutServer } from '@/services/auth-service';

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
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);

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

  const confirmLogout = async () => {
    try {
      await logoutServer();
    } finally {
      logout();
      setIsLogoutModalOpen(false);
      navigate(ROUTES.HOME, { replace: true });
    }
  };

  const userInitial = getInitial(user?.nickname, user?.email);

  return (
    <>
      <header className="flex items-center h-14 md:h-16 px-4 md:px-10 lg:px-20 border-b border-border-light bg-white w-full sticky top-0 z-50">
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
              pathname === ROUTES.HOME ? 'text-brand-primary' : 'text-text-main'
            )}
          >
            방 목록
          </Link>
          <Link
            to={ROUTES.SETTINGS}
            className={cn(
              'text-fluid-lg font-bold transition-colors p-2',
              pathname === ROUTES.SETTINGS ? 'text-brand-primary' : 'text-text-main'
            )}
          >
            커스텀
          </Link>
        </nav>

        <div className="flex-1 flex justify-end items-center gap-3 z-10">
          {/* 모바일(sm 미만)에서는 BottomNav FAB로 일원화 — Figma 캔버스 외부 가이드 의도 (E12-S03) */}
          {!hideStartButton && (startDisabled ? (
            <button
              type="button"
              disabled
              aria-label={disabledLabel}
              className="hidden sm:flex h-8 px-3 sm:px-4 py-2 rounded-[4px] bg-border-mute items-center gap-[6px] sm:gap-[10px] cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-[12px] font-semibold text-white whitespace-nowrap">체크리스트 시작하기</span>
            </button>
          ) : isLoggedIn ? (
            <Link
              to={ROUTES.CHECKLIST_NEW}
              className="hidden sm:flex h-8 px-3 sm:px-4 py-2 rounded-[4px] bg-brand-primary items-center gap-[6px] sm:gap-[10px] hover:bg-brand-primary-dark transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-[12px] font-semibold text-white whitespace-nowrap">체크리스트 시작하기</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginRequiredModalOpen(true)}
              className="hidden sm:flex h-8 px-3 sm:px-4 py-2 rounded-[4px] bg-brand-primary items-center gap-[6px] sm:gap-[10px] hover:bg-brand-primary-dark transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-[12px] font-semibold text-white whitespace-nowrap">체크리스트 시작하기</span>
            </button>
          ))}

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-bg-avatar flex items-center justify-center text-white text-[12px] font-bold overflow-hidden relative">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={user.nickname || 'Profile'} className="object-cover w-full h-full" />
                ) : (
                  userInitial
                )}
              </div>
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-2.5 text-[12px] font-semibold text-text-main hover:bg-bg-gray transition-all cursor-pointer border border-border-light rounded-[4px] px-4 py-2 bg-white whitespace-nowrap"
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
              className="text-[12px] font-semibold text-text-main border border-border-light px-4 py-2 rounded hover:bg-bg-gray transition-colors whitespace-nowrap"
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
      <LoginRequiredModal
        isOpen={isLoginRequiredModalOpen}
        onClose={() => setIsLoginRequiredModalOpen(false)}
        onContinueAsGuest={() => {
          setIsLoginRequiredModalOpen(false);
          navigate(ROUTES.CHECKLIST_NEW);
        }}
        onLogin={() => {
          setIsLoginRequiredModalOpen(false);
          navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.CHECKLIST_NEW}`);
        }}
      />
    </>
  );
}
