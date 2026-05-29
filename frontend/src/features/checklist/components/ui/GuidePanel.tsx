import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { ChecklistGuide } from '../../checklist-guides';

// Figma node 587:45164 (Component 157) — "확인 가이드 보기" 토글 버튼
export function GuideToggleButton({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-[6px] border border-[#bfbfbf] cursor-pointer hover:bg-bg-gray-soft transition-colors shrink-0"
    >
      <Icon icon="ix:user-manual" className="size-[14px] text-text-main" />
      <span className="hidden sm:inline text-[12px] font-medium text-text-main leading-[1.3] whitespace-nowrap">
        확인 가이드 보기
      </span>
    </button>
  );
}

// Figma 645:41056 / 645:45734 등 — 항목 바로 아래 인라인 패널 (mobile bottom-sheet 지원)
export function InlineGuidePanel({ guide, onClose }: { guide: ChecklistGuide; onClose?: () => void }) {
  const textSize = guide.variant === 'with-photos' ? 'text-[14px]' : 'text-[13px]';
  return (
    <div
      role="region"
      aria-label={guide.guideTitle}
      className="flex flex-col gap-3 p-4 sm:p-6 rounded-t-[16px] sm:rounded-[6px] bg-white border border-[#e2e2e2] shadow-[0px_6px_8px_rgba(0,0,0,0.08)]"
    >
      <p className="text-[16px] font-semibold sm:font-medium text-[#232527] leading-[1.3] text-center sm:text-left pb-3 sm:pb-0 border-b sm:border-b-0 border-[#e2e2e2]">{guide.guideTitle}</p>
      <div className="flex flex-col gap-[15px]">
        {guide.guideItems.map((item, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <Icon icon="lets-icons:check-fill" className="size-[18px] text-[#232527] shrink-0 mt-0.5" />
            <p className={cn('font-medium text-[#777] leading-[1.4]', textSize)}>{item}</p>
          </div>
        ))}
      </div>
      {guide.variant === 'with-photos' && guide.mainPhoto && (
        <div className="w-full mt-1 rounded-[6px] overflow-hidden">
          <img src={guide.mainPhoto} alt="가이드 사진" className="w-full h-auto object-cover" />
        </div>
      )}
      {guide.variant === 'with-photos' && guide.examplesPhoto && guide.singleExample && (
        <div className="relative w-full mt-1 aspect-[800/268] rounded-[6px] overflow-hidden bg-[#d9d9d9]">
          <img src={guide.examplesPhoto} alt="예시 사진" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          <p className="absolute inset-0 flex items-center justify-center text-[14px] sm:text-[18px] font-medium text-white leading-[1.3] drop-shadow-sm">예시 사진</p>
        </div>
      )}
      {guide.variant === 'with-photos' && guide.examplesPhoto && !guide.singleExample && (
        <div className="flex flex-row gap-2.5 mt-1">
          {(['left center', 'right center'] as const).map((pos, idx) => (
            <div
              key={idx}
              className="relative flex items-center justify-center flex-1 aspect-[400/268] bg-[#d9d9d9] rounded-[6px] overflow-hidden"
            >
              <img
                src={guide.examplesPhoto}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: pos }}
              />
              <div className="absolute inset-0 bg-black/20" />
              <p className="relative text-[14px] sm:text-[18px] font-medium text-white leading-[1.3] drop-shadow-sm">예시 사진</p>
            </div>
          ))}
        </div>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="sm:hidden mt-2 w-full bg-[#0a607d] hover:bg-[#084e66] text-white font-semibold text-[16px] py-3 rounded-[6px] transition-colors cursor-pointer"
        >
          확인
        </button>
      )}
    </div>
  );
}

// Figma 587:43553 등 — 모달 다이얼로그로 표시 (legacy)
export function GuidePanel({ guide, onClose }: { guide: ChecklistGuide; onClose: () => void }) {
  const textSize = guide.variant === 'with-photos' ? 'text-[14px]' : 'text-[13px]';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={guide.guideTitle}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(0,0,0,0.5)]"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col gap-3 max-h-[90vh] w-full max-w-[1024px] overflow-y-auto p-6 rounded-[8px] bg-white shadow-[0px_10px_24px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 flex items-center justify-center size-9 rounded-full hover:bg-bg-gray-soft transition-colors cursor-pointer"
        >
          <Icon icon="ic:round-close" className="size-6 text-text-main" />
        </button>

        {/* Title */}
        <p className="text-[18px] font-semibold text-[#232527] leading-[1.3] pr-10">
          {guide.guideTitle}
        </p>

        {/* Items */}
        <div className="flex flex-col gap-[15px] mt-2">
          {guide.guideItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Icon icon="lets-icons:check-fill" className="size-[18px] text-[#232527] shrink-0 mt-0.5" />
              <p className={cn('font-medium text-[#777] leading-[1.4]', textSize)}>{item}</p>
            </div>
          ))}
        </div>

        {/* Main guide photo (annotated composite) */}
        {guide.variant === 'with-photos' && guide.mainPhoto && (
          <div className="w-full mt-4 rounded-[6px] overflow-hidden">
            <img src={guide.mainPhoto} alt="가이드 사진" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Example photos — examplesPhoto가 있을 때만 표시 */}
        {guide.variant === 'with-photos' && guide.examplesPhoto && (
          <div className="flex flex-col sm:flex-row gap-2.5 mt-3">
            {(['left center', 'right center'] as const).map((pos, idx) => (
              <div
                key={idx}
                className="relative flex items-center justify-center h-[180px] sm:h-[200px] flex-1 bg-[#d9d9d9] rounded-[6px] overflow-hidden"
              >
                <img
                  src={guide.examplesPhoto}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: pos }}
                />
                <div className="absolute inset-0 bg-black/20" />
                <p className="relative text-[18px] font-medium text-white leading-[1.3] drop-shadow-sm">예시 사진</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
