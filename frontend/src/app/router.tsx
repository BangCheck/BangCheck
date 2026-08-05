import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/login/LoginPage';
import AuthCallbackPage from '@/features/auth/AuthCallbackPage';
import LoginErrorPage from '@/features/auth/LoginErrorPage';
import ChecklistNewPage from '@/features/checklist/ChecklistNewPage';
import ChecklistDetailPage from '@/features/checklist/ChecklistDetailPage';
import RoomsPage from '@/features/rooms/pages/RoomsPage';
import ReportPage from '@/features/report/ReportPage';
import SettingsPage from '@/features/customization/SettingsPage';
import MapPage from '@/features/map/MapPage';
import MyPage from '@/features/mypage/MyPage';
import Header from '@/app/layout/Header';
import Footer from '@/app/layout/Footer';
import BottomNavigation from '@/app/layout/BottomNavigation';
import { DevLoginButton } from '@/features/dev/DevLoginButton';

// Atlas는 프로덕션에도 나간다. lazy를 유지해 별도 청크로 떨어뜨린다 —
// 이 페이지를 열지 않는 사용자는 코드를 받지 않는다.
const ProjectMapPage = lazy(() => import('@/features/research/ResearchPage'));
const ProjectAtlasPage = lazy(() => import('@/features/project-atlas/ProjectAtlasPage'));

const AtlasLoading = () => (
  <div className="min-h-screen bg-white text-[#616161] grid place-items-center font-mono text-xs tracking-[0.2em]">
    PROJECT ATLAS / LOADING
  </div>
);

// 글로벌 헤더가 있는 레이아웃
const AppLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <div className="flex-1 flex flex-col pb-[80px] md:pb-0">
      <Outlet />
    </div>
    <Footer />
    <BottomNavigation />
  </div>
);

export const Router = () => (
  <>
    <Routes>
      {/* 헤더 없는 페이지 */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login-error" element={<LoginErrorPage />} />
      <Route path="/auth/callback/:provider" element={<AuthCallbackPage />} />
      <Route
        path={ROUTES.PROJECT_MAP}
        element={<Suspense fallback={<AtlasLoading />}><ProjectMapPage /></Suspense>}
      />
      <Route
        path={ROUTES.PROJECT_PAGE_PATTERN}
        element={<Suspense fallback={<AtlasLoading />}><ProjectAtlasPage /></Suspense>}
      />


      {/* 헤더 있는 페이지 */}
      <Route element={<AppLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checklist/new" element={<ChecklistNewPage />} />
        <Route path="/checklist/:id" element={<ChecklistDetailPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/custom" element={<SettingsPage />} />
        <Route path="/settings" element={<Navigate to="/custom" replace />} />
        <Route path={ROUTES.MY} element={<MyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    {/* DEV 모드 한정 — import.meta.env.DEV에서만 렌더 */}
    <DevLoginButton />
  </>
);
