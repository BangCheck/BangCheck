import type { AtlasPageCards } from '@/types/atlas-card';
import { LANDING_PAGE_CARDS } from './landing-cards';
import { CUSTOM_PAGE_CARDS } from './custom-cards';

/**
 * 상세 캔버스가 있는 페이지. 여기 없는 pageId는 "아직 등재 안 됨"으로 표시한다.
 * 없는 것을 있는 척하지 않는다.
 */
export const ATLAS_PAGES: readonly AtlasPageCards[] = [
  LANDING_PAGE_CARDS,
  CUSTOM_PAGE_CARDS,
];

export function findAtlasPage(pageId: string): AtlasPageCards | null {
  return ATLAS_PAGES.find((page) => page.pageId === pageId) ?? null;
}
