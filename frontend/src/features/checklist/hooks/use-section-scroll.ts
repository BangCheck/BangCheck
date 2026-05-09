import { useState, useRef, useEffect, useCallback } from 'react';
import { SECTION_TABS } from '../checklist-constants';
import type { SectionId } from '../checklist-constants';

const HEADER_OFFSET = 112; // 헤더(56px) + 탭바(56px) + 여백(16px)

export function useSectionScroll() {
  const [activeSection, setActiveSection] = useState<SectionId>('basic');

  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    basic: null, building: null, options: null, interior: null, problems: null,
    safety: null, living: null, surround: null, custom: null, memo: null,
  });
  const tabNavRef = useRef<HTMLDivElement>(null);

  // 단일 IntersectionObserver로 가시성이 가장 높은 섹션을 activeSection으로 설정
  useEffect(() => {
    const visibilityMap: Record<string, number> = {};

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sid = entry.target.getAttribute('data-section-id');
          if (sid) visibilityMap[sid] = entry.intersectionRatio;
        });
        const best = Object.entries(visibilityMap).reduce<[string, number]>(
          (acc, [k, v]) => (v > acc[1] ? [k, v] : acc),
          ['', 0],
        );
        if (best[1] > 0) setActiveSection(best[0] as SectionId);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-80px 0px -20% 0px' },
    );

    SECTION_TABS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return;
      el.setAttribute('data-section-id', id);
      obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  // 활성 탭이 바뀌면 탭 버튼을 스크롤로 보이게
  useEffect(() => {
    const nav = tabNavRef.current;
    if (!nav) return;
    const activeBtn = nav.querySelector(`[data-tab="${activeSection}"]`) as HTMLElement | null;
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeSection]);

  const scrollToSection = useCallback((id: SectionId) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return { activeSection, sectionRefs, tabNavRef, scrollToSection };
}
