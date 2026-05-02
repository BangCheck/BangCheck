import HeroSection from '@/features/landing/components/HeroSection';
import FeaturesSection from '@/features/landing/components/FeaturesSection';
import TestimonialsSection from '@/features/landing/components/TestimonialsSection';

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col bg-white">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
    </main>
  );
}
