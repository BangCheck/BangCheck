import { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { ROUTES } from '@/lib/routes';
import HeroSection from '@/features/landing/components/HeroSection';
import TestimonialsSection from '@/features/landing/components/TestimonialsSection';
import FeaturesSection from '@/features/landing/components/FeaturesSection';

export default function LandingPage() {
  const { isLoggedIn } = useAuthStore();
  const [searchParams] = useSearchParams();
  const isAtlasPreview = import.meta.env.DEV && searchParams.get('atlasPreview') === '1';

  useEffect(() => {
    if (!isAtlasPreview || window.parent === window) return undefined;

    const reportRects = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-atlas-node]'))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            id: element.dataset.atlasNode,
            label: element.dataset.atlasLabel ?? element.textContent?.trim() ?? '',
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            },
          };
        });

      window.parent.postMessage({
        source: 'bangcheck-atlas-preview',
        type: 'ATLAS_NODE_RECTS',
        route: ROUTES.LANDING,
        nodes,
      }, window.location.origin);
    };

    const observer = new ResizeObserver(reportRects);
    observer.observe(document.documentElement);
    window.addEventListener('resize', reportRects);
    window.addEventListener('scroll', reportRects, true);
    const initialReport = window.requestAnimationFrame(reportRects);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(initialReport);
      window.removeEventListener('resize', reportRects);
      window.removeEventListener('scroll', reportRects, true);
    };
  }, [isAtlasPreview]);

  if (isLoggedIn && !isAtlasPreview) return <Navigate to={ROUTES.HOME} replace />;

  return (
    <main className="flex-1 flex flex-col bg-white">
      <HeroSection />
      <TestimonialsSection />
      <FeaturesSection />
    </main>
  );
}
