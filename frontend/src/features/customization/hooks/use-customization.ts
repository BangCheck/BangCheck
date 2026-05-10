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
  const { data: rawItems = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.customization.settings,
    queryFn: customService.getCustomizedItems,
    enabled: isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  // STEP3 전용: /items/all — disabled 포함 전체 항목 + isEnabled 플래그
  const { data: rawAllItems = [] } = useQuery({
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
    const renamed: { from: string; to: string }[] = [];
    for (const raw of rawItems) {
      const normalized = normalizeLabel(raw.itemName);
      if (normalized !== raw.itemName) renamed.push({ from: raw.itemName, to: normalized });
      const item = { ...raw, itemName: normalized };
      const existing = seen.get(item.itemName);
      if (!existing || item.id < existing.id) {
        seen.set(item.itemName, item);
      }
    }
    const result = Array.from(seen.values());
    if (rawItems.length > 0) {
      console.groupCollapsed(`[useCustomization] items 정규화 (raw ${rawItems.length} → 중복제거 ${result.length})`);
      if (renamed.length > 0) console.log('정규화된 라벨:', renamed);
      console.log('items (정규화 후):', result.map((i) => ({ id: i.id, itemName: i.itemName, isEnabled: i.isEnabled, itemType: i.itemType })));
      console.groupEnd();
    }
    return result;
  }, [rawItems]);

  // 2. 서버 activeItemNames 동기화 (selectedTypeIds는 Zustand persist가 관리)
  const hasSynced = useRef(false);
  useEffect(() => {
    if (hasSynced.current || items.length === 0) return;
    hasSynced.current = true;
    const serverActiveNames = items.filter(item => item.isEnabled).map(item => item.itemName);
    console.groupCollapsed(`[useCustomization] BE 응답 → store 동기화 (${serverActiveNames.length}건 활성)`);
    console.log('serverActiveNames:', serverActiveNames);
    console.groupEnd();
    setActiveItemNames(serverActiveNames);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

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

  const selectTypeMutation = useMutation({
    mutationFn: customService.selectUserType,
    onSuccess: invalidate,
  });

  const deselectTypeMutation = useMutation({
    mutationFn: customService.deselectUserType,
    onSuccess: invalidate,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: customService.saveSettings,
    onSuccess: invalidate,
  });

  const addCustomMutation = useMutation({
    mutationFn: customService.addCustomItem,
    onSuccess: invalidateAll,
  });

  const deleteCustomMutation = useMutation({
    mutationFn: customService.deleteCustomItem,
    onSuccess: invalidateAll,
  });

  // 4. 이벤트 핸들러 (단일 선택 — 다른 유형은 자동 해제)
  const toggleUserType = useCallback((typeId: string) => {
    const isSelected = selectedTypeIds.includes(typeId);
    const prevTypeId = selectedTypeIds[0];

    if (isSelected) {
      // 이미 선택된 유형 클릭 → 해제
      deselectTypeMutation.mutate(typeId);
      setSelectedTypeIds([]);
      const customNames = items.filter(i => i.itemType === 'CUSTOM').map(i => i.itemName);
      setActiveItemNames(customNames);
    } else {
      // 새 유형 선택 → 기존 유형 해제 후 새 유형 선택
      if (prevTypeId) {
        deselectTypeMutation.mutate(prevTypeId);
      }
      selectTypeMutation.mutate(typeId);
      setSelectedTypeIds([typeId]);

      const mappedIds = TYPE_ITEM_MAP[typeId] || [];
      if (mappedIds.length > 0) {
        // 프론트 상수로 항목 계산 가능한 유형
        const recommendedLabels = CHECKLIST_ITEMS
          .filter(item => mappedIds.includes(item.id))
          .map(item => item.label);
        const customNames = items.filter(i => i.itemType === 'CUSTOM').map(i => i.itemName);
        const nextActiveNames = Array.from(new Set([...customNames, ...recommendedLabels]));
        const disabledIds = items
          .filter(i => i.itemType !== 'CUSTOM')
          .filter(i => !nextActiveNames.includes(i.itemName))
          .map(i => Number(i.id));
        saveSettingsMutation.mutate(disabledIds);
        setActiveItemNames(nextActiveNames);
      } else {
        // FIRST_TIMER / ESSENTIALS_ONLY: BE가 항목을 결정 → refetch 후 재동기화
        hasSynced.current = false;
      }
    }
  }, [items, selectedTypeIds, selectTypeMutation, deselectTypeMutation, saveSettingsMutation, setSelectedTypeIds, setActiveItemNames]);

  const toggleItem = useCallback((itemId: number, label: string) => {
    const willBeEnabled = !items.find(i => i.id === itemId)?.isEnabled;
    const disabledIds = items
      .filter(i => i.itemType !== 'CUSTOM')
      .filter(i => (i.id === itemId ? !willBeEnabled : !i.isEnabled))
      .map(i => Number(i.id));
    saveSettingsMutation.mutate(disabledIds);
    toggleItemName(label);
  }, [items, saveSettingsMutation, toggleItemName]);

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

  // 여러 항목을 한 번의 API 호출로 활성화 (카테고리 전체 선택용)
  const enableItems = useCallback((labels: string[]) => {
    const nextActiveSet = new Set([...activeItemNames, ...labels]);
    const disabledIds = allItems
      .filter((i) => i.itemType !== 'CUSTOM' && !nextActiveSet.has(i.itemName))
      .map((i) => Number(i.id));
    saveSettingsMutation.mutate(disabledIds);
    labels.forEach((label) => {
      if (!activeItemNames.includes(label)) toggleItemName(label);
    });
  }, [allItems, activeItemNames, saveSettingsMutation, toggleItemName]);

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
