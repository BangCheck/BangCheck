import HeroSection from '@/features/landing/components/HeroSection';
import TestimonialsSection from '@/features/landing/components/TestimonialsSection';
import FeaturesSection from '@/features/landing/components/FeaturesSection';

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col bg-white">
      <HeroSection />
      <TestimonialsSection />
      <FeaturesSection />
    </main>
  );
}
