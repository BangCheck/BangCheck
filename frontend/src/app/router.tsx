import { Routes, Route } from 'react-router-dom';

interface PlaceholderProps {
  name: string;
}

const Placeholder = ({ name }: PlaceholderProps) => (
  <div className="container-center min-h-screen flex-col gap-2 p-8">
    <h1 className="text-text-main text-2xl font-bold">[{name}]</h1>
    <p className="text-text-caption text-sm">E09-S01 placeholder — 페이지는 후속 스토리에서 마이그레이션됩니다.</p>
  </div>
);

export const Router = () => (
  <Routes>
    <Route path="/" element={<Placeholder name="LandingPage" />} />
    <Route path="/login" element={<Placeholder name="LoginPage" />} />
    <Route path="/auth/callback/:provider" element={<Placeholder name="AuthCallback" />} />
    <Route path="/rooms" element={<Placeholder name="RoomsPage" />} />
    <Route path="/checklist/new" element={<Placeholder name="ChecklistNew" />} />
    <Route path="/checklist/:id" element={<Placeholder name="ChecklistDetail" />} />
    <Route path="/report" element={<Placeholder name="ReportPage" />} />
    <Route path="/settings" element={<Placeholder name="SettingsPage" />} />
    <Route path="*" element={<Placeholder name="404" />} />
  </Routes>
);
