/**
 * 캔버스 테마와 화면에 쓰는 이름표.
 *
 * localStorage 키를 ResearchPage(페이지 맵)와 공유한다 — 맵에서 고른 테마가
 * 캔버스로 들어와도 그대로 이어져야 해서다. 키를 바꾸면 두 화면이 갈라진다.
 */
import type { CardRelation, CardStep } from '@/types/atlas-card';

export type AtlasTheme =
  | 'vscode-light'
  | 'vscode-dark'
  | 'circuit'
  | 'blueprint'
  | 'terminal'
  | 'amber';

export const THEME_STORAGE_KEY = 'bangcheck-project-map-theme';

export const THEMES: ReadonlyArray<{
  id: AtlasTheme;
  label: string;
  description: string;
  accent: string;
  background: string;
}> = [
  { id: 'vscode-light', label: 'LIGHT', description: 'VS Code Light+', accent: '#005fb8', background: '#ffffff' },
  { id: 'vscode-dark', label: 'DARK', description: 'VS Code Dark+', accent: '#3794ff', background: '#1e1e1e' },
  { id: 'circuit', label: 'CIRCUIT', description: 'Tokyo Night', accent: '#58c3ad', background: '#071012' },
  { id: 'blueprint', label: 'BLUEPRINT', description: 'Nord', accent: '#48bfff', background: '#061426' },
  { id: 'terminal', label: 'TERMINAL', description: 'Dracula', accent: '#63f58b', background: '#050906' },
  { id: 'amber', label: 'AMBER', description: 'Solarized', accent: '#ffad4a', background: '#120d07' },
];

export function getInitialTheme(): AtlasTheme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.some((theme) => theme.id === savedTheme)
    ? savedTheme as AtlasTheme
    : 'vscode-light';
}

export const RELATION_LABEL: Record<CardRelation, string> = {
  USES: '이 기능이 부른다',
  USED_BY: '이 기능을 부른다',
  SHARES_CODE: '같은 코드를 쓴다',
  SAME_DEFECT: '같은 결함을 공유한다',
  INCONSISTENT_WITH: '동작이 어긋난다',
};

export const ACTOR_LABEL: Record<CardStep['actor'], string> = {
  USER: '사용자',
  FRONT: '화면',
  BACK: '서버',
};

export function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}
