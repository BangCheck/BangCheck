import { SectionIcon } from './SectionIcon';
import type { ReportSectionId } from '@/features/report/lib/sections';

type Props = {
  section: ReportSectionId;
  label: string;
  selected: boolean;
  disabled?: boolean;
  onToggle: (id: ReportSectionId) => void;
};

export function SectionChip({ section, label, selected, disabled = false, onToggle }: Props) {
  const tone =
    disabled && selected
      ? 'border-brand-primary text-brand-primary bg-white opacity-60 cursor-not-allowed'
      : disabled
        ? 'border-border-light text-text-caption bg-bg-gray cursor-not-allowed'
        : selected
          ? 'border-brand-primary text-brand-primary bg-white cursor-pointer'
          : 'border-border-mute text-text-mute bg-white cursor-pointer hover:border-text-mute';

  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(section)}
      disabled={disabled}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2.5 rounded-[4px] border px-4 py-1.5 text-sm font-semibold transition-colors whitespace-nowrap ${tone}`}
    >
      <SectionIcon section={section} size={16} />
      <span>{label}</span>
    </button>
  );
}
