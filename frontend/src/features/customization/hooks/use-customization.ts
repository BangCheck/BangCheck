import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useEffect, useRef } from 'react';
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
  // id ASC 정렬: BE displayOrder NULL인 CUSTOM 항목들이 매 refetch마다 순서가 흔들리는 이슈 회피.
  // BE 측 근본 해소(ORDER BY displayOrder NULLS LAST, id) 머지 전까지의 FE 안전망.
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
    return Array.from(seen.values()).sort((a, b) => Number(a.id) - Number(b.id));
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
    // eslint-disable-next-line no-console
    console.log('[#182 signature sync]', {
      serverActiveCount: serverActiveNames.length,
      itemsCount: items.length,
      signature: serverActiveSignature.slice(0, 80) + (serverActiveSignature.length > 80 ? '…' : ''),
    });
    setActiveItemNames(serverActiveNames);
    lastSyncedSignatureRef.current = serverActiveSignature;
  }, [serverActiveSignature, items, setActiveItemNames]);

  // allItems: STEP3 전용 /items/all (disabled 포함) — toggleUserType의 disabledIds 계산에도 사용
  const allItems = useMemo(() => {
    const seen = new Map<string, typeof rawAllItems[0]>();
    for (const item of rawAllItems) {
      const existing = seen.get(item.itemName);
      if (!existing || item.id < existing.id) seen.set(item.itemName, item);
    }
    return Array.from(seen.values()).sort((a, b) => Number(a.id) - Number(b.id));
  }, [rawAllItems]);

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
      // X 시맨틱: 유형 = 프리셋 덮어쓰기 → 기본 15개도 항상 활성으로 복원
      const nextActiveNames = Array.from(new Set([...BASE_ITEM_LABELS, ...allCustomNames, ...recommendedLabels]));
      // #182 fix: items(활성만) → allItems(비활성 포함). 직전 유형에서 비활성된 항목까지 disabledIds에 포함되어
      // BE 상태가 새 유형 추천 셋과 정확히 정합. 안 그러면 다시 그 유형 돌아왔을 때 N개 누락 발생.
      const disabledIds = allItems
        .filter(i => i.itemType !== 'CUSTOM')
        .filter(i => !nextActiveNames.includes(i.itemName))
        .map(i => Number(i.id));
      // eslint-disable-next-line no-console
      console.log('[#182 toggleUserType]', {
        typeId,
        recommendedCount: recommendedLabels.length,
        nextActiveCount: nextActiveNames.length,
        disabledCount: disabledIds.length,
        allItemsCount: allItems.length,
        itemsCount: items.length,
      });
      await saveSettingsMutation.mutateAsync(disabledIds);
      setActiveItemNames(nextActiveNames);
    }
    // FIRST_TIMER / ESSENTIALS_ONLY: BE가 활성 항목을 결정 → P1 signature 동기화로 자동 정합
  }, [items, allItems, selectedTypeIds, activeItemNames, selectTypeMutation, deselectTypeMutation, saveSettingsMutation, setSelectedTypeIds, setActiveItemNames]);

  // Option A: 토글은 로컬 state만 갱신. BE 저장은 "맞춤 설정 완료" 버튼에서 일괄 (saveCurrentSettings).
  // 매 클릭 POST + 2회 refetch로 인한 카드 재배치/오버레이 깜빡임/트래픽 과다 회피.
  const toggleItem = useCallback((itemId: number, label: string) => {
    void itemId;
    toggleItemName(label);
  }, [toggleItemName]);

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

  // Option A: 로컬 state만 갱신
  const selectAllItems = useCallback(() => {
    const constLabels = CHECKLIST_ITEMS.map((i) => i.label);
    const customNames = items.filter((i) => i.itemType === 'CUSTOM').map((i) => i.itemName);
    const allNames = Array.from(new Set([...constLabels, ...customNames]));
    setActiveItemNames(allNames);
  }, [items, setActiveItemNames]);

  const saveCurrentSettings = useCallback(async () => {
    const activeSet = new Set(activeItemNames);
    const disabledIds = allItems
      .filter((i) => i.itemType !== 'CUSTOM' && !activeSet.has(i.itemName))
      .map((i) => Number(i.id));
    await saveSettingsMutation.mutateAsync(disabledIds);
  }, [allItems, activeItemNames, saveSettingsMutation]);

  // Option A: 로컬 batch 갱신만, BE 저장은 버튼에서 일괄
  const enableItems = useCallback((labels: string[]) => {
    const nextActiveSet = new Set([...activeItemNames, ...labels]);
    setActiveItemNames(Array.from(nextActiveSet));
  }, [activeItemNames, setActiveItemNames]);

  // UX-WEB-07: trim + dedupe + error 전파.
  // 기존 버전은 raw input 전송 + 결과 미확인 → BE reject 시 사용자에 무피드백("미작동" 체감 원인).
  const addCustomItem = useCallback(async (itemName: string) => {
    const trimmed = itemName.trim();
    if (!trimmed) {
      throw new Error('항목명을 입력해주세요');
    }
    const duplicate = items.some(i => i.itemType === 'CUSTOM' && i.itemName === trimmed);
    if (duplicate) {
      throw new Error('이미 추가된 항목이에요');
    }
    try {
      await addCustomMutation.mutateAsync(trimmed);
    } catch {
      // 네트워크/BE 에러는 친화 메시지로 일원화 (axios "Request failed..." 누출 차단)
      throw new Error('항목 추가에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
    if (!activeItemNames.includes(trimmed)) {
      toggleItemName(trimmed);
    }
  }, [addCustomMutation, toggleItemName, items, activeItemNames]);

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
