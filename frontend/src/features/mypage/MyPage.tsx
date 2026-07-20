import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/store/use-auth-store';
import { ROUTES } from '@/lib/routes';

/**
 * SCR-MYPAGE — 마이페이지 (canonical 모바일 노드 645:45715)
 *
 * AppLayout이 Header/Footer/BottomNavigation을 제공하므로 본 컴포넌트는 콘텐츠만 렌더한다.
 * 구성: PageTitle("마이페이지") + ProfileAvatar(이니셜) + ButtonLogout — actionable은 로그아웃 1개.
 *
 * 디자인 미확보(데스크탑 1440 변형 미존재) — 모바일 콘텐츠를 중앙정렬로 데스크탑에도 무난히 표시.
 * 출처: _woo/projects/08_BangCheck/04_docs/pages/mypage/components.md
 */
export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // 아바타 이니셜: nickname 우선, 없으면 email 첫 글자, 그래도 없으면 '?' 폴백.
  // Figma의 "김"은 placeholder — User 타입에는 nickname/email만 존재(name 필드 없음).
  const displayName = user?.nickname?.trim() || user?.email?.trim() || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    // TODO(api-spec A-4): 서버 세션 종료 POST /api/v1/auth/logout 미연동.
    // components.md §449 갭 — 현재는 로컬 store 정리만 수행(refresh_token 만료 쿠키 처리 후속).
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      {/* PageTitle — px-16 py-24, border-b */}
      <div className="px-4 py-6 border-b border-border-light">
        <h1 className="text-[20px] font-semibold text-text-main">마이페이지</h1>
      </div>

      {/* Content Block — 아바타 + 로그아웃 버튼 (모바일 중앙정렬, 데스크탑도 동일 중앙정렬) */}
      <div className="flex-1 flex flex-col items-center px-4 pt-[60px]">
        <div className="w-full max-w-[320px] flex flex-col items-center gap-[34px]">
          {/* ProfileAvatar — 64×64 원형, bg #78919C(bg-bg-avatar), 이니셜 28px white */}
          <div
            className="w-16 h-16 rounded-full bg-bg-avatar flex items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[28px] font-semibold text-white leading-none select-none">
                {initial}
              </span>
            )}
          </div>

          {/* ButtonLogout — w-full × 48, outline border #E7E7E7(button/outline), rounded-6 */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-12 flex items-center justify-center gap-4 px-4 py-3.5 rounded-[6px] border border-border-light bg-white text-[14px] font-semibold text-text-main active:scale-[0.98] transition-transform"
          >
            <Icon icon="mdi:logout" width={20} height={20} />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
}
