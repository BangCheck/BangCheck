export type ReportSectionId =
  | 'basic'
  | 'building'
  | 'option'
  | 'condition'
  | 'problem'
  | 'safety'
  | 'environment';

export type ReportSection = {
  id: ReportSectionId;
  label: string;
  icon: string;
};

export const REPORT_MAX_SELECT = 6;
export const REPORT_MIN_SELECT = 2;

export const ALL_REPORT_SECTION_IDS: readonly ReportSectionId[] = [
  'basic', 'building', 'option', 'condition', 'problem', 'safety', 'environment',
];

export const REPORT_SECTIONS: readonly ReportSection[] = [
  { id: 'basic', label: '기본 정보', icon: 'tdesign:money-filled' },
  { id: 'building', label: '건물 정보', icon: 'gravity-ui:house-fill' },
  { id: 'option', label: '옵션', icon: 'mdi:sofa' },
  { id: 'condition', label: '내부 상태', icon: 'mdi:graph-line' },
  { id: 'problem', label: '문제 요소', icon: 'material-symbols:warning-rounded' },
  { id: 'safety', label: '안전/생활', icon: 'material-symbols:lock' },
  { id: 'environment', label: '주변 환경', icon: 'material-symbols:train' },
] as const;
