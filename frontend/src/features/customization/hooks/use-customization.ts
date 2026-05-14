import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import * as customService from '@/services/custom-checklist-service';
import { TYPE_ITEM_MAP, CHECKLIST_ITEMS, USER_TYPES, BASE_ITEM_LABELS } from '../constants';
import { useCustomizationStore } from '@/store/use-customization-store';
import { useAuthStore } from '@/store/use-auth-store';
import { QUERY_KEYS } from '@/lib/query-keys';

// BE 시드(예: '창문 / 망충망')와 FE 상수(예: '창문/방충망') 라벨 정합. 매칭 실패로 인한 활성/저장 누락 방지.
const normalizeLabel = (label: string): string =>
  label.replace(/\s*\/\s*/g, '/').replace(/망충망/g, '방충망');

export const useCustomization = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuthStore();
  const {
    selectedTypeIds,
    activeItemNames,
    setSelectedTypeIds,
    setActiveItemNames,
    toggleItemName,
  } = useCustomizationStore();

  // ── 서버 조회 ─────────────────────────────────────────
  const { data: rawItems = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.customization.settings,
    queryFn: customService.getCustomizedItems,
    enabled: isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const { data: rawAllItems = [], refetch: refetchAllItems } = useQuery({
    queryKey: QUERY_KEYS.customization.allItems,
    queryFn: customService.getAllItemsForSettings,
    enabled: isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

  const { data: serverSelectedTypes = [], refetch: refetchTypes } = useQuery({
    queryKey: QUERY_KEYS.customization.types,
    queryFn: customService.getSelectedUserTypes,
    enabled: isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  // ── 정규화/중복 제거 ───────────────────────────────────
  const items = useMemo(() => {
    const seen = new Map<string, typeof rawItems[0]>();
    for (const raw of rawItems) {
      const normalized = normalizeLabel(raw.itemName);
      const item = { ...raw, itemName: normalized };
      const existing = seen.get(item.itemName);
      if (!existing || item.id < existing.id) seen.set(item.itemName, item);
    }
    return Array.from(seen.values()).sort((a, b) => Number(a.id) - Number(b.id));
  }, [rawItems]);

  const allItems = useMemo(() => {
    const seen = new Map<string, typeof rawAllItems[0]>();
    for (const raw of rawAllItems) {
      const normalized = normalizeLabel(raw.itemName);
      const item = { ...raw, itemName: normalized };
      const existing = seen.get(item.itemName);
      if (!existing || item.id < existing.id) seen.set(item.itemName, item);
    }
    return Array.from(seen.values()).sort((a, b) => Number(a.id) - Number(b.id));
  }, [rawAllItems]);

  // ── 로컬 pending state (BE 미반영) ──────────────────
  const [pendingCustomAdds, setPendingCustomAdds] = useState<{ tempId: number; name: string }[]>([]);
  const [pendingCustomDeleteIds, setPendingCustomDeleteIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ── 베이스라인 동기화: 서버 응답이 바뀔 때만 store 재설정 ──
  // pending state는 saveCurrentSettings 성공 시점에만 비우고, baseline 변화로는 비우지 않는다
  // (사용자가 입력 중인 pending 항목이 refetch에 의해 사라지는 사태 회피).
  const serverActiveSignature = useMemo(
    () => items.filter((i) => i.isEnabled).map((i) => i.itemName).sort().join('|'),
    [items],
  );
  const serverTypeSignature = useMemo(() => [...serverSelectedTypes].sort().join('|'), [serverSelectedTypes]);
  const lastSyncedActiveRef = useRef<string | null>(null);
  const lastSyncedTypeRef = useRef<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    if (lastSyncedActiveRef.current === serverActiveSignature) return;
    const serverActiveNames = items.filter((i) => i.isEnabled).map((i) => i.itemName);
    setActiveItemNames(serverActiveNames);
    lastSyncedActiveRef.current = serverActiveSignature;
  }, [serverActiveSignature, items, setActiveItemNames]);

  useEffect(() => {
    if (lastSyncedTypeRef.current === serverTypeSignature) return;
    setSelectedTypeIds(serverSelectedTypes);
    lastSyncedTypeRef.current = serverTypeSignature;
  }, [serverTypeSignature, serverSelectedTypes, setSelectedTypeIds]);

  // ── customItems 합성: BE custom (- deleted) + pending adds ──
  const customItems = useMemo(() => {
    const beCustoms = items
      .filter((i) => i.itemType === 'CUSTOM')
      .filter((i) => !pendingCustomDeleteIds.includes(Number(i.id)))
      .map((i) => ({ id: Number(i.id), itemName: i.itemName }));
    const localCustoms = pendingCustomAdds.map((p) => ({ id: p.tempId, itemName: p.name }));
    return [...beCustoms, ...localCustoms];
  }, [items, pendingCustomAdds, pendingCustomDeleteIds]);

  // ── 추천 라벨 계산 ─────────────────────────────────────
  const computeRecommendedLabels = useCallback((typeId: string): string[] => {
    if (typeId === 'FIRST_TIMER') return CHECKLIST_ITEMS.map((c) => c.label);
    if (typeId === 'ESSENTIALS_ONLY') return BASE_ITEM_LABELS.slice();
    const mappedIds = TYPE_ITEM_MAP[typeId] ?? [];
    return CHECKLIST_ITEMS.filter((item) => mappedIds.includes(item.id)).map((i) => i.label);
  }, []);

  // ── 핸들러: 모두 로컬 store만 갱신 (BE 호출 없음) ──
  const toggleUserType = useCallback((typeId: string) => {
    const isSelected = selectedTypeIds.includes(typeId);
    const customNames = customItems.map((c) => c.itemName);
    if (isSelected) {
      setSelectedTypeIds([]);
      setActiveItemNames(activeItemNames.filter((n) => customNames.includes(n)));
      return;
    }
    setSelectedTypeIds([typeId]);
    const recommendedLabels = computeRecommendedLabels(typeId);
    setActiveItemNames(Array.from(new Set([...customNames, ...recommendedLabels])));
  }, [selectedTypeIds, activeItemNames, customItems, computeRecommendedLabels, setSelectedTypeIds, setActiveItemNames]);

  const selectAllTypes = useCallback(() => {
    setSelectedTypeIds(USER_TYPES.map((t) => t.id));
  }, [setSelectedTypeIds]);

  const deselectAllTypes = useCallback(() => {
    const customNames = customItems.map((c) => c.itemName);
    setSelectedTypeIds([]);
    setActiveItemNames(activeItemNames.filter((n) => customNames.includes(n)));
  }, [customItems, activeItemNames, setSelectedTypeIds, setActiveItemNames]);

  const toggleItem = useCallback((_itemId: number, label: string) => {
    toggleItemName(label);
  }, [toggleItemName]);

  const toggleItemLocally = useCallback((label: string) => {
    toggleItemName(label);
  }, [toggleItemName]);

  const selectAllItems = useCallback(() => {
    const constLabels = CHECKLIST_ITEMS.map((i) => i.label);
    const customNames = customItems.map((c) => c.itemName);
    setActiveItemNames(Array.from(new Set([...constLabels, ...customNames])));
  }, [customItems, setActiveItemNames]);

  const enableItems = useCallback((labels: string[]) => {
    setActiveItemNames(Array.from(new Set([...activeItemNames, ...labels])));
  }, [activeItemNames, setActiveItemNames]);

  const addCustomItem = useCallback((itemName: string) => {
    const trimmed = itemName.trim();
    if (!trimmed) return;
    const tempId = -(Date.now() * 1000 + Math.floor(Math.random() * 1000));
    setPendingCustomAdds((prev) => [...prev, { tempId, name: trimmed }]);
    if (!activeItemNames.includes(trimmed)) {
      setActiveItemNames([...activeItemNames, trimmed]);
    }
  }, [activeItemNames, setActiveItemNames]);

  const removeCustomItem = useCallback((customItemId: number, label: string) => {
    if (customItemId < 0) {
      setPendingCustomAdds((prev) => prev.filter((p) => p.tempId !== customItemId));
    } else {
      setPendingCustomDeleteIds((prev) => (prev.includes(customItemId) ? prev : [...prev, customItemId]));
    }
    if (activeItemNames.includes(label)) {
      setActiveItemNames(activeItemNames.filter((n) => n !== label));
    }
  }, [activeItemNames, setActiveItemNames]);

  // ── "맞춤 설정 완료" — 모든 diff 일괄 적용 ──
  const saveCurrentSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      // 1) Type diff
      const baselineTypeSet = new Set(serverSelectedTypes);
      const currentTypeSet = new Set(selectedTypeIds);
      const toDeselect = serverSelectedTypes.filter((t) => !currentTypeSet.has(t));
      const toSelect = selectedTypeIds.filter((t) => !baselineTypeSet.has(t));

      // BE race 회피: deselect → select 순차
      for (const t of toDeselect) await customService.deselectUserType(t);
      for (const t of toSelect) await customService.selectUserType(t);

      // 2) Custom delete (BE-id)
      for (const id of pendingCustomDeleteIds) await customService.deleteCustomItem(id);

      // 3) Custom add (temp-id → BE)
      const addedNames = new Set<string>();
      for (const c of pendingCustomAdds) {
        await customService.addCustomItem(c.name);
        addedNames.add(c.name);
      }

      // 4) disabledIds 계산 — type/custom 변경 후 allItems 베이스로
      // 새로 추가된 custom들은 아직 allItems에 없으므로 disabled 계산에서 자연히 빠짐 (problem 없음)
      const activeSet = new Set(activeItemNames);
      const disabledIds = allItems
        .filter((i) => i.itemType !== 'CUSTOM' && !activeSet.has(i.itemName))
        .map((i) => Number(i.id));
      await customService.saveSettings(disabledIds);

      // 5) Reset pending + refetch all
      setPendingCustomAdds([]);
      setPendingCustomDeleteIds([]);
      // baseline sync ref 무효화 → 다음 useEffect에서 서버값 재반영
      lastSyncedActiveRef.current = null;
      lastSyncedTypeRef.current = null;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customization.settings }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customization.allItems }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customization.types }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklist.items }),
      ]);
    } finally {
      setIsSaving(false);
    }
  }, [serverSelectedTypes, selectedTypeIds, activeItemNames, allItems, pendingCustomAdds, pendingCustomDeleteIds, queryClient]);

  // ── isDirty 판정 ──────────────────────────────────────
  const isDirty = useMemo(() => {
    if (pendingCustomAdds.length > 0) return true;
    if (pendingCustomDeleteIds.length > 0) return true;
    if (serverTypeSignature !== [...selectedTypeIds].sort().join('|')) return true;
    const currentActive = [...activeItemNames].sort().join('|');
    if (serverActiveSignature !== currentActive) return true;
    return false;
  }, [pendingCustomAdds, pendingCustomDeleteIds, serverTypeSignature, selectedTypeIds, serverActiveSignature, activeItemNames]);

  const counts = useMemo(() => {
    const normalLabels = CHECKLIST_ITEMS.map((i) => i.label);
    const normalActiveCount = activeItemNames.filter((name) => normalLabels.includes(name)).length;
    const customActiveCount = activeItemNames.length - normalActiveCount;
    return { normalActiveCount, customActiveCount };
  }, [activeItemNames]);

  return {
    items,
    allItems,
    selectedTypeIds,
    activeItemNames,
    customItems,
    isLoading,
    isError,
    error,
    refetch: () => { refetch(); refetchAllItems(); refetchTypes(); },
    isPending: isSaving,
    isDirty,
    toggleUserType,
    selectAllTypes,
    deselectAllTypes,
    toggleItem,
    selectAllItems,
    saveCurrentSettings,
    enableItems,
    toggleItemLocally,
    addCustomItem,
    removeCustomItem,
    counts,
  };
};
