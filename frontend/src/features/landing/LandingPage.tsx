import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { ROUTES } from '@/lib/routes';
import { useAtlasPreview } from '@/lib/use-atlas-preview';
import HeroSection from '@/features/landing/components/HeroSection';
import TestimonialsSection from '@/features/landing/components/TestimonialsSection';
import FeaturesSection from '@/features/landing/components/FeaturesSection';

export default function LandingPage() {
  const { isLoggedIn } = useAuthStore();
  // 좌표 보고 로직은 @/lib/use-atlas-preview가 소유한다 — 페이지가 둘 이상이라 공용으로 뺐다
  const { isPreview: isAtlasPreview } = useAtlasPreview(ROUTES.LANDING);

  if (isLoggedIn && !isAtlasPreview) return <Navigate to={ROUTES.HOME} replace />;

  return (
    <main className="flex-1 flex flex-col bg-white">
      <HeroSection />
      <TestimonialsSection />
      <FeaturesSection />
    </main>
  );
}
