import { Routes, Route } from 'react-router-dom';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/login/LoginPage';
import AuthCallbackPage from '@/features/auth/AuthCallbackPage';
import LoginErrorPage from '@/features/auth/LoginErrorPage';
import ChecklistNewPage from '@/features/checklist/ChecklistNewPage';

interface PlaceholderProps {
  name: string;
}

const Placeholder = ({ name }: PlaceholderProps) => (
  <div className="container-center min-h-screen flex-col gap-2 p-8">
    <h1 className="text-text-main text-2xl font-bold">[{name}]</h1>
    <p className="text-text-caption text-sm">E09 placeholder — 페이지는 후속 스토리에서 마이그레이션됩니다.</p>
  </div>
);

export const Router = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/login-error" element={<LoginErrorPage />} />
    <Route path="/auth/callback/:provider" element={<AuthCallbackPage />} />
    <Route path="/rooms" element={<Placeholder name="RoomsPage" />} />
    <Route path="/checklist/new" element={<ChecklistNewPage />} />
    <Route path="/checklist/:id" element={<Placeholder name="ChecklistDetail" />} />
    <Route path="/report" element={<Placeholder name="ReportPage" />} />
    <Route path="/settings" element={<Placeholder name="SettingsPage" />} />
    <Route path="*" element={<Placeholder name="404" />} />
  </Routes>
);
