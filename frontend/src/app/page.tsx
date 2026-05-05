'use client';

import HeroSection from '@/features/landing/components/HeroSection';
import FeaturesSection from '@/features/landing/components/FeaturesSection';
import TestimonialsSection from '@/features/landing/components/TestimonialsSection';
import { DevLoginSection } from '@/features/dev/DevLoginSection';

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col bg-white">
      <DevLoginSection />
      <HeroSection />
      <TestimonialsSection />
      <FeaturesSection />
    </main>
  );
}
