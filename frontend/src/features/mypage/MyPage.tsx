import { useNavigate, Navigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuthStore } from '@/store/use-auth-store';
import { ROUTES } from '@/lib/routes';
import { useAtlasPreview } from '@/lib/use-atlas-preview';
import { logoutServer } from '@/services/auth-service';

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
  const { user, logout, isLoggedIn } = useAuthStore();

  // Atlas 상세 캔버스가 이 페이지를 띄우면 [data-atlas-node] 좌표를 부모로 보고한다.
  // early return 앞에 두어야 한다 — 뒤에 두면 로그인 상태가 바뀌는 렌더에서
  // Hook 순서가 달라진다(2026-08-04 교차 검토가 잡은 회귀).
  useAtlasPreview(ROUTES.MY);

  // 마이페이지는 로그인 사용자 전용(유일 액션이 로그아웃). 게스트 진입 시 로그인으로 유도.
  if (!isLoggedIn) {
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${ROUTES.MY}`} replace />;
  }

  // 아바타 이니셜: nickname 우선, 없으면 email 첫 글자, 그래도 없으면 '?' 폴백.
  // Figma의 "김"은 placeholder — User 타입에는 nickname/email만 존재(name 필드 없음).
  const displayName = user?.nickname?.trim() || user?.email?.trim() || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  const handleLogout = async () => {
    // BC-AUTH-02: 서버 세션(refresh_tokens 행 + HttpOnly 쿠키) 종료를 먼저 시도한다.
    // 실패해도 로컬 정리는 반드시 진행한다 — 사용자 입장에서 "로그아웃이 안 됨"보다
    // "서버 세션이 약간 늦게 죽음"이 낫다.
    try {
      await logoutServer();
    } catch {
      // 네트워크 오류·서버 오류 모두 무시하고 클라이언트 로그아웃은 계속한다.
    } finally {
      logout();
      navigate(ROUTES.HOME);
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      {/* PageTitle — px-16 py-24, border-b */}
      <div
        data-atlas-node="my-header"
        data-atlas-label="페이지 제목"
        className="px-4 py-6 border-b border-border-light"
      >
        <h1 className="text-[20px] font-semibold text-text-main">마이페이지</h1>
      </div>

      {/* Content Block — 아바타 + 로그아웃 버튼 (모바일 중앙정렬, 데스크탑도 동일 중앙정렬) */}
      <div
        data-atlas-node="my-account"
        data-atlas-label="프로필 · 로그아웃"
        className="flex-1 flex flex-col items-center px-4 pt-[60px]"
      >
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
