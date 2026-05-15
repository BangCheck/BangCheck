import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
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
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNavigation from '@/components/BottomNavigation';
import { DevLoginButton } from '@/features/dev/DevLoginButton';

const Placeholder = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 p-8">
    <h1 className="text-text-main text-2xl font-bold">[{name}]</h1>
    <p className="text-text-caption text-sm">E09 placeholder — 페이지는 후속 스토리에서 마이그레이션됩니다.</p>
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
        <Route path="*" element={<Placeholder name="404" />} />
      </Route>
    </Routes>
    {/* DEV 모드 한정 — import.meta.env.DEV에서만 렌더 */}
    <DevLoginButton />
  </>
);
