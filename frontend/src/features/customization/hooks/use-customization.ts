import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useEffect, useRef } from 'react';
import * as customService from '@/services/custom-checklist-service';
import { TYPE_ITEM_MAP, CHECKLIST_ITEMS, USER_TYPES } from '../constants';
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
    toggleItemName
  } = useCustomizationStore();

  // 1. 서버 데이터 조회
  const { data: rawItems = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.customization.settings,
    queryFn: customService.getCustomizedItems,
    enabled: isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  // STEP3 전용: /items/all — disabled 포함 전체 항목 + isEnabled 플래그
  const { data: rawAllItems = [], refetch: refetchAllItems } = useQuery({
    queryKey: QUERY_KEYS.customization.allItems,
    queryFn: customService.getAllItemsForSettings,
    enabled: isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30,
    placeholderData: (prev) => prev,
  });

  // itemName 기준 중복 제거 (낮은 ID 우선) + BE 라벨을 FE 라벨로 정규화
  const items = useMemo(() => {
    const seen = new Map<string, typeof rawItems[0]>();
    for (const raw of rawItems) {
      const normalized = normalizeLabel(raw.itemName);
      const item = { ...raw, itemName: normalized };
      const existing = seen.get(item.itemName);
      if (!existing || item.id < existing.id) {
        seen.set(item.itemName, item);
      }
    }
    return Array.from(seen.values());
  }, [rawItems]);

  // P1: server 활성 항목 시그니처가 바뀔 때마다 store 재동기화 (영구 latch 제거).
  // 같은 시그니처에 대해선 setActiveItemNames 미호출 → 무한 루프/optimistic 덮어쓰기 회피.
  const serverActiveSignature = useMemo(
    () => items.filter(i => i.isEnabled).map(i => i.itemName).sort().join('|'),
    [items],
  );
  const lastSyncedSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    if (items.length === 0) return;
    if (lastSyncedSignatureRef.current === serverActiveSignature) return;
    const serverActiveNames = items.filter(item => item.isEnabled).map(item => item.itemName);
    setActiveItemNames(serverActiveNames);
    lastSyncedSignatureRef.current = serverActiveSignature;
  }, [serverActiveSignature, items, setActiveItemNames]);

  // 3. Mutation 정의
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customization.settings });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklist.items });
  };
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customization.settings });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customization.allItems });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklist.items });
  };

  // P4: onError에서도 invalidate → 서버 상태 강제 재페치로 optimistic 롤백.
  // P1 시그니처 동기화가 활성 항목을 다시 정합 상태로 끌어옴.
  const selectTypeMutation = useMutation({
    mutationFn: customService.selectUserType,
    onSuccess: invalidate,
    onError: invalidate,
  });

  const deselectTypeMutation = useMutation({
    mutationFn: customService.deselectUserType,
    onSuccess: invalidate,
    onError: invalidate,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: customService.saveSettings,
    onSuccess: invalidate,
    onError: invalidate,
  });

  const addCustomMutation = useMutation({
    mutationFn: customService.addCustomItem,
    onSuccess: invalidateAll,
    onError: invalidateAll,
  });

  const deleteCustomMutation = useMutation({
    mutationFn: customService.deleteCustomItem,
    onSuccess: invalidateAll,
    onError: invalidateAll,
  });

  // 4. 이벤트 핸들러 (단일 선택 — 다른 유형은 자동 해제)
  // P2: deselect → select → save를 await 체이닝으로 순서 보장 (BE race 회피).
  // P9: 유형 토글 시 BE에 아직 등록되지 않은 세션-신규 custom 라벨도 보존.
  const toggleUserType = useCallback(async (typeId: string) => {
    const isSelected = selectedTypeIds.includes(typeId);
    const prevTypeId = selectedTypeIds[0];

    const persistedCustomNames = items.filter(i => i.itemType === 'CUSTOM').map(i => i.itemName);
    const knownConstLabels = new Set(CHECKLIST_ITEMS.map(c => c.label));
    const knownPersistedSet = new Set(persistedCustomNames);
    const sessionCustomNames = activeItemNames.filter(
      n => !knownConstLabels.has(n) && !knownPersistedSet.has(n),
    );
    const allCustomNames = Array.from(new Set([...persistedCustomNames, ...sessionCustomNames]));

    if (isSelected) {
      await deselectTypeMutation.mutateAsync(typeId);
      setSelectedTypeIds([]);
      setActiveItemNames(allCustomNames);
      return;
    }

    if (prevTypeId) {
      await deselectTypeMutation.mutateAsync(prevTypeId);
    }
    await selectTypeMutation.mutateAsync(typeId);
    setSelectedTypeIds([typeId]);

    const mappedIds = TYPE_ITEM_MAP[typeId] || [];
    if (mappedIds.length > 0) {
      const recommendedLabels = CHECKLIST_ITEMS
        .filter(item => mappedIds.includes(item.id))
        .map(item => item.label);
      const nextActiveNames = Array.from(new Set([...allCustomNames, ...recommendedLabels]));
      const disabledIds = items
        .filter(i => i.itemType !== 'CUSTOM')
        .filter(i => !nextActiveNames.includes(i.itemName))
        .map(i => Number(i.id));
      await saveSettingsMutation.mutateAsync(disabledIds);
      setActiveItemNames(nextActiveNames);
    }
    // FIRST_TIMER / ESSENTIALS_ONLY: BE가 활성 항목을 결정 → P1 signature 동기화로 자동 정합
  }, [items, selectedTypeIds, activeItemNames, selectTypeMutation, deselectTypeMutation, saveSettingsMutation, setSelectedTypeIds, setActiveItemNames]);

  // P3: source-of-truth = activeItemNames (optimistic 로컬 상태). 서버 isEnabled 의존 제거.
  const toggleItem = useCallback((itemId: number, label: string) => {
    void itemId;
    const isCurrentlyActive = activeItemNames.includes(label);
    const nextActiveSet = new Set(activeItemNames);
    if (isCurrentlyActive) nextActiveSet.delete(label);
    else nextActiveSet.add(label);
    const disabledIds = items
      .filter(i => i.itemType !== 'CUSTOM' && !nextActiveSet.has(i.itemName))
      .map(i => Number(i.id));
    saveSettingsMutation.mutate(disabledIds);
    toggleItemName(label);
  }, [items, activeItemNames, saveSettingsMutation, toggleItemName]);

  // 서버 ID가 없을 때의 임시 토글 (UI 반응용)
  const toggleItemLocally = useCallback((label: string) => {
    toggleItemName(label);
  }, [toggleItemName]);

  const selectAllTypes = useCallback(() => {
    USER_TYPES.forEach((t) => {
      if (!selectedTypeIds.includes(t.id)) {
        selectTypeMutation.mutate(t.id);
      }
    });
    setSelectedTypeIds(USER_TYPES.map((t) => t.id));
  }, [selectedTypeIds, selectTypeMutation, setSelectedTypeIds]);

  const deselectAllTypes = useCallback(() => {
    USER_TYPES.forEach((t) => {
      if (selectedTypeIds.includes(t.id)) {
        deselectTypeMutation.mutate(t.id);
      }
    });
    setSelectedTypeIds([]);
    // Also clear active items (keep only custom ones)
    const customNames = items.filter(i => i.itemType === 'CUSTOM').map(i => i.itemName);
    setActiveItemNames(customNames);
  }, [selectedTypeIds, deselectTypeMutation, setSelectedTypeIds, items, setActiveItemNames]);

  const selectAllItems = useCallback(() => {
    saveSettingsMutation.mutate([]);
    const constLabels = CHECKLIST_ITEMS.map((i) => i.label);
    const customNames = items.filter((i) => i.itemType === 'CUSTOM').map((i) => i.itemName);
    const allNames = Array.from(new Set([...constLabels, ...customNames]));
    setActiveItemNames(allNames);
  }, [items, saveSettingsMutation, setActiveItemNames]);

  const allItems = useMemo(() => {
    const seen = new Map<string, typeof rawAllItems[0]>();
    for (const item of rawAllItems) {
      const existing = seen.get(item.itemName);
      if (!existing || item.id < existing.id) seen.set(item.itemName, item);
    }
    return Array.from(seen.values());
  }, [rawAllItems]);

  const saveCurrentSettings = useCallback(async () => {
    const activeSet = new Set(activeItemNames);
    const disabledIds = allItems
      .filter((i) => i.itemType !== 'CUSTOM' && !activeSet.has(i.itemName))
      .map((i) => Number(i.id));
    await saveSettingsMutation.mutateAsync(disabledIds);
  }, [allItems, activeItemNames, saveSettingsMutation]);

  // P10: 라벨별 toggleItemName 루프(stale snapshot) 대신 setActiveItemNames로 batch.
  const enableItems = useCallback((labels: string[]) => {
    const nextActiveSet = new Set([...activeItemNames, ...labels]);
    const nextActiveNames = Array.from(nextActiveSet);
    const disabledIds = allItems
      .filter((i) => i.itemType !== 'CUSTOM' && !nextActiveSet.has(i.itemName))
      .map((i) => Number(i.id));
    saveSettingsMutation.mutate(disabledIds);
    setActiveItemNames(nextActiveNames);
  }, [allItems, activeItemNames, saveSettingsMutation, setActiveItemNames]);

  const addCustomItem = useCallback((itemName: string) => {
    addCustomMutation.mutate(itemName);
    toggleItemName(itemName);
  }, [addCustomMutation, toggleItemName]);

  const removeCustomItem = useCallback((customItemId: number, label: string) => {
    deleteCustomMutation.mutate(customItemId);
    if (activeItemNames.includes(label)) {
      toggleItemName(label);
    }
  }, [deleteCustomMutation, activeItemNames, toggleItemName]);

  const counts = useMemo(() => {
    const normalLabels = CHECKLIST_ITEMS.map(i => i.label);
    const normalActiveCount = activeItemNames.filter(name => normalLabels.includes(name)).length;
    const customActiveCount = activeItemNames.length - normalActiveCount;
    return { normalActiveCount, customActiveCount };
  }, [activeItemNames]);

  return {
    items,
    allItems,
    selectedTypeIds,
    activeItemNames,
    customItems: items.filter(item => item.itemType === 'CUSTOM'),
    isLoading,
    isError,
    error,
    refetch: () => { refetch(); refetchAllItems(); },
    isPending:
      selectTypeMutation.isPending ||
      deselectTypeMutation.isPending ||
      saveSettingsMutation.isPending ||
      addCustomMutation.isPending ||
      deleteCustomMutation.isPending,
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
