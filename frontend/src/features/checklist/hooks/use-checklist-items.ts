import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getCustomizedItems } from '@/services/custom-checklist-service';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { ChecklistItemResponse, ChecklistCategory } from '@/types';

export const CHECKLIST_FORM_CATEGORIES: ChecklistCategory[] = [
  'OPTION',
  'INTERNAL_STATE',
  'PROBLEM',
  'SAFETY',
  'CONVENIENCE',
  'ENVIRONMENT',
];

export const CATEGORY_LABEL: Record<ChecklistCategory, string> = {
  BASIC_INFO: '기본 정보',
  BUILDING_INFO: '건물 정보',
  OPTION: '옵션',
  INTERNAL_STATE: '내부 상태',
  PROBLEM: '문제 요소',
  SAFETY: '안전 / 보안',
  CONVENIENCE: '생활 편의',
  ENVIRONMENT: '주변 환경',
  CUSTOM: '나만의 항목',
};

export function useChecklistItems() {
  const { isLoggedIn } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.checklist.items,
    queryFn: getCustomizedItems,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
    select: (items) =>
      items.filter(
        (i) =>
          (CHECKLIST_FORM_CATEGORIES.includes(i.category) || i.itemType === 'CUSTOM') &&
          i.isEnabled,
      ),
  });
}

export type { ChecklistItemResponse };
