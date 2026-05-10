import { cn } from '@/lib/utils';
import { IconChevron } from './Icons';

type Props = {
  number: number;
  title: string;
  description: string;
  onSelectAll?: () => void;
  isFolded?: boolean;
  onToggleFold?: () => void;
};

export function SectionHeader({ number, title, description, onSelectAll, isFolded, onToggleFold }: Props) {
  return (
    <div className="flex items-start justify-between mb-5 md:mb-6">
      <div className="space-y-1.5 md:space-y-2 max-w-[70%] md:max-w-none">
        <div className="flex items-center gap-2 md:gap-2.5">
          <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-text-main text-white flex items-center justify-center text-[10px] md:text-[12px] font-bold shrink-0">
            {number}
          </div>
          <h2 className="text-[16px] md:text-[18px] font-bold text-text-main truncate">{title}</h2>
        </div>
        <p className="text-[12px] md:text-[14px] font-medium text-text-mute leading-tight md:leading-normal w-full md:w-[386px]">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {onSelectAll && (
          <button
            onClick={onSelectAll}
            className="h-7 md:h-8 px-2.5 md:px-4 bg-white border border-border-light rounded-[4px] flex items-center gap-1.5 md:gap-2.5 hover:bg-gray-50 transition-all"
          >
            <div className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] border border-border-light rounded-[2px] flex items-center justify-center bg-text-main">
              <svg width="10" height="8" viewBox="0 0 12 10" fill="none" className="md:w-3 md:h-2.5">
                <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[10px] md:text-[12px] font-semibold text-text-main">전체선택</span>
          </button>
        )}
        {onToggleFold && (
          <button
            onClick={onToggleFold}
            className="h-7 md:h-8 px-2.5 md:px-4 bg-white border border-border-light rounded-[4px] flex items-center gap-1.5 md:gap-2.5 hover:bg-gray-50 transition-all"
          >
            <span className="text-[10px] md:text-[12px] font-semibold text-text-main">{isFolded ? '펼치기' : '접기'}</span>
            <IconChevron
              className={cn('w-3 h-3 md:w-[18px] md:h-[18px] transition-transform duration-200', isFolded ? 'rotate-90' : '-rotate-90')}
            />
          </button>
        )}
      </div>
    </div>
  );
}
