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
type EmojiCfg = { icon: string; activeBg: string; activeBorder: string; activeIcon: string };

// problem: 없음=좋음(green), 있음=나쁨(red) — 문제요소·융자 등
const PROBLEM_CFG: Record<string, EmojiCfg> = {
  '없음':   { icon: 'uiw:smile',           activeBg: 'bg-[#f8fefa]', activeBorder: 'border-[#22d455]', activeIcon: 'text-[#22d455]' },
  '있음':   { icon: 'bi:emoji-angry-fill', activeBg: 'bg-[#fffafa]', activeBorder: 'border-[#f15556]', activeIcon: 'text-[#f15556]' },
};

// feature: 있음=좋음(green), 없음=나쁨(gray) — 엘리베이터·설비 유무 등
const FEATURE_CFG: Record<string, EmojiCfg> = {
  '있음':   { icon: 'uiw:smile',           activeBg: 'bg-[#f8fefa]', activeBorder: 'border-[#22d455]', activeIcon: 'text-[#22d455]' },
  '없음':   { icon: 'bi:emoji-dizzy',      activeBg: 'bg-[#f8f8f8]', activeBorder: 'border-[#aaaaaa]', activeIcon: 'text-[#888888]' },
};

// binary: 가능=좋음(green), 불가능=나쁨(red)
const BINARY_CFG: Record<string, EmojiCfg> = {
  '가능':   { icon: 'uiw:smile',           activeBg: 'bg-[#f8fefa]', activeBorder: 'border-[#22d455]', activeIcon: 'text-[#22d455]' },
  '불가능': { icon: 'bi:emoji-angry-fill', activeBg: 'bg-[#fffafa]', activeBorder: 'border-[#f15556]', activeIcon: 'text-[#f15556]' },
};

const FALLBACK_CFG: EmojiCfg = { icon: 'uiw:smile', activeBg: 'bg-slot-b-bg', activeBorder: 'border-brand-primary', activeIcon: 'text-brand-primary' };

export function EmojiCard({
  label,
  active,
  onClick,
  variant = 'problem',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'problem' | 'feature' | 'binary';
}) {
  const cfgMap = variant === 'feature' ? FEATURE_CFG : variant === 'binary' ? BINARY_CFG : PROBLEM_CFG;
  const cfg = cfgMap[label] ?? FALLBACK_CFG;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 lg:p-5 rounded-[6px] transition-all cursor-pointer w-full shadow-[0px_6px_8px_rgba(0,0,0,0.04)]',
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
      <span className="text-fluid-base font-semibold text-text-main">
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
                'flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-[6px] transition-all cursor-pointer shadow-[0px_6px_8px_rgba(0,0,0,0.04)]',
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
              <span className="text-fluid-base font-semibold text-text-main whitespace-nowrap">
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

// ─── DynamicOptionCards (BE 옵션값 그대로 렌더링) ──────────────
const OPTION_ICON: Record<string, string> = {
  '좋음': 'uiw:smile', '보통': 'bi:emoji-neutral', '나쁨': 'bi:emoji-angry-fill',
  '없음': 'uiw:smile', '있음': 'bi:emoji-angry-fill',
  '안전': 'uiw:smile', '불안': 'bi:emoji-angry-fill',
  '가깝다': 'uiw:smile', '멀다': 'bi:emoji-angry-fill',
  '밝음': 'uiw:smile', '어두움': 'bi:emoji-angry-fill',
  '약간': 'bi:emoji-neutral', '심함': 'bi:emoji-angry-fill',
};
const OPTION_ACTIVE: Record<string, { bg: string; border: string; icon: string }> = {
  '좋음':  { bg: 'bg-[#f8fefa]', border: 'border-[#22d455]', icon: 'text-[#22d455]' },
  '보통':  { bg: 'bg-[#fffef5]', border: 'border-[#ffdf00]', icon: 'text-[#a07d00]' },
  '나쁨':  { bg: 'bg-[#fffafa]', border: 'border-[#f15556]', icon: 'text-[#f15556]' },
  '없음':  { bg: 'bg-[#f8fefa]', border: 'border-[#22d455]', icon: 'text-[#22d455]' },
  '있음':  { bg: 'bg-[#fffafa]', border: 'border-[#f15556]', icon: 'text-[#f15556]' },
  '안전':  { bg: 'bg-[#f8fefa]', border: 'border-[#22d455]', icon: 'text-[#22d455]' },
  '불안':  { bg: 'bg-[#fffafa]', border: 'border-[#f15556]', icon: 'text-[#f15556]' },
  '가깝다':{ bg: 'bg-[#f8fefa]', border: 'border-[#22d455]', icon: 'text-[#22d455]' },
  '멀다':  { bg: 'bg-[#fffafa]', border: 'border-[#f15556]', icon: 'text-[#f15556]' },
  '밝음':  { bg: 'bg-[#f8fefa]', border: 'border-[#22d455]', icon: 'text-[#22d455]' },
  '어두움':{ bg: 'bg-[#fffafa]', border: 'border-[#f15556]', icon: 'text-[#f15556]' },
  '약간':  { bg: 'bg-[#fffef5]', border: 'border-[#ffdf00]', icon: 'text-[#a07d00]' },
  '심함':  { bg: 'bg-[#fffafa]', border: 'border-[#f15556]', icon: 'text-[#f15556]' },
};
const FALLBACK_ACTIVE = { bg: 'bg-slot-b-bg', border: 'border-brand-primary', icon: 'text-brand-primary' };

const POSITIVE_ACTIVE = { bg: 'bg-[#f8fefa]', border: 'border-[#22d455]', icon: 'text-[#22d455]' };
const NEGATIVE_ACTIVE = { bg: 'bg-[#fffafa]', border: 'border-[#f15556]', icon: 'text-[#f15556]' };
const POSITIVE_ICON = 'uiw:smile';
const NEGATIVE_ICON = 'bi:emoji-angry-fill';

export function DynamicOptionCards({
  label,
  hint,
  options,
  value,
  onChange,
  positiveValue,
}: {
  label: string;
  hint?: string;
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  positiveValue?: string;
}) {
  const cols = options.length === 2 ? 'grid-cols-2' : 'grid-cols-3';
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[14px] font-semibold text-text-main">{label}</p>
        {hint && <p className="text-[12px] text-text-caption mt-0.5">{hint}</p>}
      </div>
      <div className={cn('grid gap-3', cols)}>
        {options.map((opt) => {
          const active = value === opt;
          const cfg = positiveValue != null
            ? (opt === positiveValue ? POSITIVE_ACTIVE : NEGATIVE_ACTIVE)
            : (OPTION_ACTIVE[opt] ?? FALLBACK_ACTIVE);
          const icon = positiveValue != null
            ? (opt === positiveValue ? POSITIVE_ICON : NEGATIVE_ICON)
            : (OPTION_ICON[opt] ?? 'uiw:smile');
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? null : opt)}
              className={cn(
                'flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-[6px] transition-all cursor-pointer shadow-[0px_6px_8px_rgba(0,0,0,0.04)]',
                active
                  ? `${cfg.bg} border-2 ${cfg.border}`
                  : 'bg-white border border-border-light hover:border-border-mute',
              )}
            >
              <span className="flex items-center justify-center size-9 shrink-0">
                <Icon icon={icon} className={cn('size-6', active ? cfg.icon : 'text-text-caption')} />
              </span>
              <span className="text-fluid-base font-semibold text-text-main whitespace-nowrap">{opt}</span>
            </button>
          );
        })}
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
        onKeyDown={type === 'number' ? (e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); } : undefined}
        min={type === 'number' ? 0 : undefined}
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
