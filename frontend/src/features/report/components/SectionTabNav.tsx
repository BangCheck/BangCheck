import { useEffect, useState } from 'react';
import { SectionIcon } from '@/components/ui/SectionIcon';
import { REPORT_SECTIONS, type ReportSectionId } from '@/features/report/lib/sections';

type Props = {
  activeSections: ReportSectionId[];
};

export function SectionTabNav({ activeSections }: Props) {
  const [activeTab, setActiveTab] = useState<ReportSectionId>(activeSections[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id.replace('section-', '') as ReportSectionId);
          }
        }
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    for (const id of activeSections) {
      const el = document.getElementById(`section-${id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [activeSections]);

  const scrollTo = (id: ReportSectionId) => {
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    // sticky 헤더(56px 모바일/64px 데스크톱) + 서브헤더(52px 모바일/56px 데스크톱) + 섹션탭(45px) + 여백(8px)
    const isMd = window.innerWidth >= 768;
    const OFFSET = (isMd ? 64 + 56 : 56 + 52) + 45 + 8;
    const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveTab(id);
  };

  const visible = REPORT_SECTIONS.filter((s) => activeSections.includes(s.id));

  return (
    <nav className="bg-white border-b border-border-light sticky top-[108px] md:top-[120px] z-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 overflow-x-auto scrollbar-none max-w-full">
        <div className="flex flex-wrap gap-y-1 md:flex-nowrap md:min-w-max">
          {visible.map((s) => {
            const isActive = activeTab === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`flex items-center gap-2.5 px-4 h-[45px] text-base font-bold border-b-2 transition-colors whitespace-nowrap
                  ${isActive ? 'border-text-main text-text-main' : 'border-transparent text-text-caption hover:text-text-mute'}`}
              >
                <SectionIcon section={s.id} size={20} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
