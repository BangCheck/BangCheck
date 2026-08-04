import type { AtlasPageCards } from '@/types/atlas-card';
import { LANDING_PAGE_CARDS } from './landing-cards';
import { CUSTOM_PAGE_CARDS } from './custom-cards';
import { REPORT_PAGE_CARDS } from './report-cards';
import { MAP_PAGE_CARDS } from './map-cards';
import { LOGIN_PAGE_CARDS } from './login-cards';
import { ROOMS_PAGE_CARDS } from './rooms-cards';
import { MY_PAGE_CARDS } from './my-cards';
import { CHECKLIST_NEW_PAGE_CARDS } from './checklist-new-cards';
import { CHECKLIST_DETAIL_PAGE_CARDS } from './checklist-detail-cards';

/**
 * 상세 캔버스가 있는 페이지. 여기 없는 pageId는 "아직 등재 안 됨"으로 표시한다.
 * 없는 것을 있는 척하지 않는다.
 */
export const ATLAS_PAGES: readonly AtlasPageCards[] = [
  LANDING_PAGE_CARDS,
  CUSTOM_PAGE_CARDS,
  REPORT_PAGE_CARDS,
  MAP_PAGE_CARDS,
  LOGIN_PAGE_CARDS,
  ROOMS_PAGE_CARDS,
  MY_PAGE_CARDS,
  CHECKLIST_NEW_PAGE_CARDS,
  CHECKLIST_DETAIL_PAGE_CARDS,
];

export function findAtlasPage(pageId: string): AtlasPageCards | null {
  return ATLAS_PAGES.find((page) => page.pageId === pageId) ?? null;
}
