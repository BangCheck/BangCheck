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
export function EmojiCard({
  emoji,
  label,
  active,
  onClick,
}: {
  emoji: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 py-5 px-6 rounded-[6px] transition-all cursor-pointer w-full',
        active
          ? 'bg-slot-b-bg border-2 border-brand-primary'
          : 'bg-white border border-border-light shadow-sm hover:border-border-mute',
      )}
    >
      <span className="text-[26px] leading-none">{emoji}</span>
      <span className={cn('text-[15px] font-semibold', active ? 'text-brand-primary' : 'text-text-main')}>
        {label}
      </span>
    </button>
  );
}

// ─── RatingCards (😊 😐 😞) ───────────────────────────────
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
  const opts: { emoji: string; val: NonNullable<Rating> }[] = [
    { emoji: '😊', val: '좋음' },
    { emoji: '😐', val: '보통' },
    { emoji: '😞', val: '나쁨' },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[14px] font-semibold text-text-main">{label}</p>
        {hint && <p className="text-[12px] text-text-caption mt-0.5">{hint}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {opts.map(({ emoji, val }) => (
          <button
            key={val}
            type="button"
            onClick={() => onChange(value === val ? null : val)}
            className={cn(
              'flex flex-col items-center justify-center py-4 rounded-[6px] gap-1 transition-all cursor-pointer',
              value === val
                ? 'bg-slot-b-bg border-2 border-brand-primary'
                : 'bg-white border border-border-light shadow-sm hover:border-border-mute',
            )}
          >
            <span className="text-[22px]">{emoji}</span>
            <span className={cn('text-[12px] font-medium', value === val ? 'text-brand-primary' : 'text-text-mute')}>
              {val}
            </span>
          </button>
        ))}
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
            emoji={v === '없음' ? '😊' : '😞'}
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
