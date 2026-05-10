import { Icon } from '@iconify/react';
import type { ReportSectionId } from '@/features/report/lib/sections';
import { REPORT_SECTIONS } from '@/features/report/lib/sections';

const ICON_MAP: Record<ReportSectionId, string> = REPORT_SECTIONS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.icon }),
  {} as Record<ReportSectionId, string>,
);

type Props = {
  section: ReportSectionId;
  size?: number;
  className?: string;
};

export function SectionIcon({ section, size = 20, className }: Props) {
  return <Icon icon={ICON_MAP[section]} width={size} height={size} className={className} />;
}
