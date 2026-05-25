import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { ROUTES } from '@/lib/routes';
import HeroSection from '@/features/landing/components/HeroSection';
import TestimonialsSection from '@/features/landing/components/TestimonialsSection';
import FeaturesSection from '@/features/landing/components/FeaturesSection';

export default function LandingPage() {
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn) return <Navigate to={ROUTES.HOME} replace />;

  return (
    <main className="flex-1 flex flex-col bg-white">
      <HeroSection />
      <TestimonialsSection />
      <FeaturesSection />
    </main>
  );
}
