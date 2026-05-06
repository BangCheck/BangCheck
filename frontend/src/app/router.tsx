import { Routes, Route, Outlet } from 'react-router-dom';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/login/LoginPage';
import AuthCallbackPage from '@/features/auth/AuthCallbackPage';
import LoginErrorPage from '@/features/auth/LoginErrorPage';
import ChecklistNewPage from '@/features/checklist/ChecklistNewPage';
import RoomsPage from '@/features/rooms/pages/RoomsPage';
import Header from '@/components/Header';

const Placeholder = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 p-8">
    <h1 className="text-[#232527] text-2xl font-bold">[{name}]</h1>
    <p className="text-[#A0A0A0] text-sm">E09 placeholder — 페이지는 후속 스토리에서 마이그레이션됩니다.</p>
  </div>
);

// 글로벌 헤더가 있는 레이아웃
const AppLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <div className="flex-1 flex flex-col">
      <Outlet />
    </div>
  </div>
);

export const Router = () => (
  <Routes>
    {/* 헤더 없는 페이지 */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login-error" element={<LoginErrorPage />} />
    <Route path="/auth/callback/:provider" element={<AuthCallbackPage />} />
    <Route path="/checklist/new" element={<ChecklistNewPage />} />

    {/* 헤더 있는 페이지 */}
    <Route element={<AppLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/rooms" element={<RoomsPage />} />
      <Route path="/checklist/:id" element={<Placeholder name="ChecklistDetail" />} />
      <Route path="/report" element={<Placeholder name="ReportPage" />} />
      <Route path="/settings" element={<Placeholder name="SettingsPage" />} />
      <Route path="*" element={<Placeholder name="404" />} />
    </Route>
  </Routes>
);
