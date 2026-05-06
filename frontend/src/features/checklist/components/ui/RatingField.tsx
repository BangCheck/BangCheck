import { cn } from '@/lib/utils';

interface RatingFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  max?: number;
}

const EMOJI = ['😢', '😕', '😐', '🙂', '😊'];

export default function RatingField({ label, value, onChange, max = 5 }: RatingFieldProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <span className="text-[14px] font-medium text-[#232527]">{label}</span>
      <div className="flex gap-2">
        {Array.from({ length: max }, (_, i) => {
          const score = i + 1;
          const isSelected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 rounded-[6px] border transition-all cursor-pointer',
                isSelected
                  ? 'bg-[#F4F7FF] border-[#0A607D]'
                  : 'bg-white border-[#E2E2E2] hover:border-[#BFBFBF]'
              )}
            >
              <span className="text-[20px]">{EMOJI[i]}</span>
              <span
                className={cn(
                  'text-[12px] font-semibold',
                  isSelected ? 'text-[#0A607D]' : 'text-[#A0A0A0]'
                )}
              >
                {score}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
