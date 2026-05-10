import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

export type Rating = '좋음' | '보통' | '나쁨' | null;
export type YesNo = '있음' | '없음' | null;

// ─── SelectCard ───────────────────────────────────────────
export function SelectCard({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center py-4 px-3 rounded-[6px] text-[15px] font-semibold transition-all cursor-pointer',
        active
          ? 'bg-slot-b-bg border-2 border-brand-primary text-brand-primary'
          : 'bg-white border border-border-light text-text-main shadow-sm hover:border-border-mute',
        className,
      )}
    >
      {label}
    </button>
  );
}

// ─── EmojiCard ────────────────────────────────────────────
const EMOJI_CARD_CONFIG: Record<string, { icon: string; activeBg: string; activeBorder: string; activeIcon: string }> = {
  '없음': { icon: 'uiw:smile',          activeBg: 'bg-[#f8fefa]', activeBorder: 'border-[#22d455]', activeIcon: 'text-[#22d455]' },
  '있음': { icon: 'bi:emoji-angry-fill', activeBg: 'bg-[#fffafa]', activeBorder: 'border-[#f15556]', activeIcon: 'text-[#f15556]' },
};

export function EmojiCard({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const cfg = EMOJI_CARD_CONFIG[label] ?? { icon: 'uiw:smile', activeBg: 'bg-slot-b-bg', activeBorder: 'border-brand-primary', activeIcon: 'text-brand-primary' };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-6 rounded-[6px] transition-all cursor-pointer w-full shadow-[0px_6px_8px_rgba(0,0,0,0.04)]',
        active
          ? `${cfg.activeBg} border-2 ${cfg.activeBorder}`
          : 'bg-white border border-border-light hover:border-border-mute',
      )}
    >
      <span className="flex items-center justify-center size-9 shrink-0">
        <Icon
          icon={cfg.icon}
          className={cn('size-6', active ? cfg.activeIcon : 'text-text-caption')}
        />
      </span>
      <span className="text-[18px] font-semibold text-text-main">
        {label}
      </span>
    </button>
  );
}

// ─── RatingCards (좋음 / 보통 / 나쁨) ────────────────────────
const RATING_CONFIG: Record<NonNullable<Rating>, { icon: string; activeBg: string; activeBorder: string; activeIcon: string }> = {
  '좋음': { icon: 'uiw:smile',          activeBg: 'bg-[#f8fefa]', activeBorder: 'border-[#22d455]', activeIcon: 'text-[#22d455]' },
  '보통': { icon: 'bi:emoji-neutral',   activeBg: 'bg-[#fffef5]', activeBorder: 'border-[#ffdf00]', activeIcon: 'text-[#a07d00]' },
  '나쁨': { icon: 'bi:emoji-angry-fill', activeBg: 'bg-[#fffafa]', activeBorder: 'border-[#f15556]', activeIcon: 'text-[#f15556]' },
};

export function RatingCards({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: Rating;
  onChange: (v: Rating) => void;
}) {
  const opts = (Object.keys(RATING_CONFIG) as NonNullable<Rating>[]);
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[14px] font-semibold text-text-main">{label}</p>
        {hint && <p className="text-[12px] text-text-caption mt-0.5">{hint}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {opts.map((val) => {
          const cfg = RATING_CONFIG[val];
          const active = value === val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(active ? null : val)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-[6px] transition-all cursor-pointer shadow-[0px_6px_8px_rgba(0,0,0,0.04)]',
                active
                  ? `${cfg.activeBg} border-2 ${cfg.activeBorder}`
                  : 'bg-white border border-border-light hover:border-border-mute',
              )}
            >
              <span className="flex items-center justify-center size-9 shrink-0">
                <Icon
                  icon={cfg.icon}
                  className={cn('size-6', active ? cfg.activeIcon : 'text-text-caption')}
                />
              </span>
              <span className="text-[15px] font-semibold text-text-main whitespace-nowrap">
                {val}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── YesNoCards ───────────────────────────────────────────
export function YesNoCards({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: YesNo;
  onChange: (v: YesNo) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[14px] font-semibold text-text-main">{label}</p>
        {hint && <p className="text-[12px] text-text-caption mt-0.5">{hint}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(['없음', '있음'] as const).map((v) => (
          <EmojiCard
            key={v}
            label={v}
            active={value === v}
            onClick={() => onChange(value === v ? null : v)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────
export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border-light mb-5">
      <div className="w-1.5 h-5 rounded-full bg-brand-primary shrink-0" />
      <h2 className="text-[16px] font-bold text-text-main">{title}</h2>
    </div>
  );
}

// ─── FieldLabel ───────────────────────────────────────────
export function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <p className="text-[14px] font-medium text-text-main mb-2">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </p>
  );
}

// ─── TextInput ────────────────────────────────────────────
export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  suffix,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative flex items-center">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full h-[36px] px-3 rounded-[6px] border text-[14px] text-text-main placeholder:text-text-caption outline-none transition-colors',
          disabled
            ? 'bg-bg-gray border-border-light text-text-caption'
            : 'bg-white border-border-mute focus:border-brand-primary',
          suffix && 'pr-12',
        )}
      />
      {suffix && (
        <span className="absolute right-3 text-[14px] font-medium text-text-main pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
