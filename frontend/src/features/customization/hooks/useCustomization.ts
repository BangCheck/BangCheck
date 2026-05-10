import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useEffect } from 'react';
import * as customService from '@/services/custom-checklist-service';
import { TYPE_ITEM_MAP, CHECKLIST_ITEMS, USER_TYPES } from '../constants';
import { useCustomizationStore } from '@/store/use-customization-store';
import { useAuthStore } from '@/store/use-auth-store';

export const useCustomization = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuthStore();
  const { 
    selectedTypeIds, 
    activeItemNames, 
    setSelectedTypeIds, 
    setActiveItemNames,
    toggleType,
    toggleItemName 
  } = useCustomizationStore();

  // 1. 서버 데이터 조회
  const { data: rawItems = [], isLoading } = useQuery({
    queryKey: ['customChecklistItems'],
    queryFn: customService.getCustomizedItems,
    enabled: isLoggedIn,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // itemName 기준 중복 제거 (낮은 ID 우선)
  const items = useMemo(() => {
    const seen = new Map<string, typeof rawItems[0]>();
    for (const item of rawItems) {
      const existing = seen.get(item.itemName);
      if (!existing || item.id < existing.id) {
        seen.set(item.itemName, item);
      }
    }
    return Array.from(seen.values());
  }, [rawItems]);

  // 2. 서버 데이터와 전역 스토어 동기화 (최초 로드 시나 서버 변경 시)
  useEffect(() => {
    if (items.length > 0) {
      const serverActiveNames = items.filter(item => item.isEnabled).map(item => item.itemName);
      setActiveItemNames(serverActiveNames);

      const serverTypes = new Set<string>();
      items.forEach(item => {
        if (item.isEnabled && item.userType) serverTypes.add(item.userType);
      });
      const typeArray = Array.from(serverTypes);
      setSelectedTypeIds(typeArray);

      // 처음 진입 시 (서버에 선택된 유형이 없으면) FIRST_TIMER 자동 선택
      if (typeArray.length === 0 && isLoggedIn) {
        selectTypeMutation.mutate('FIRST_TIMER');
        setSelectedTypeIds(['FIRST_TIMER']);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // 3. Mutation 정의
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['customChecklistItems'] });

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
    onSuccess: invalidate,
  });

  const deleteCustomMutation = useMutation({
    mutationFn: customService.deleteCustomItem,
    onSuccess: invalidate,
  });

  // 4. 이벤트 핸들러 (스토어를 먼저 업데이트하여 즉각 반응 제공)
  const toggleUserType = useCallback((typeId: string) => {
    const isSelected = selectedTypeIds.includes(typeId);

    if (isSelected) {
      deselectTypeMutation.mutate(typeId);
    } else {
      selectTypeMutation.mutate(typeId);

      const recommendedIds = TYPE_ITEM_MAP[typeId] || [];
      const recommendedLabels = CHECKLIST_ITEMS
        .filter(item => recommendedIds.includes(item.id))
        .map(item => item.label);

      const nextActiveNames = Array.from(new Set([...activeItemNames, ...recommendedLabels]));
      const disabledIds = items
        .filter(i => i.itemType !== 'CUSTOM')
        .filter(i => !nextActiveNames.includes(i.itemName))
        .map(i => Number(i.id));
      saveSettingsMutation.mutate(disabledIds);

      setActiveItemNames(nextActiveNames);
    }
    toggleType(typeId);
  }, [items, selectedTypeIds, activeItemNames, selectTypeMutation, deselectTypeMutation, saveSettingsMutation, toggleType, setActiveItemNames]);

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

  const selectAllItems = useCallback(() => {
    saveSettingsMutation.mutate([]);
    const allNames = items.filter((i) => i.itemType !== 'CUSTOM').map((i) => i.itemName);
    setActiveItemNames(allNames);
  }, [items, saveSettingsMutation, setActiveItemNames]);

  const saveCurrentSettings = useCallback(async () => {
    const activeSet = new Set(activeItemNames);
    const disabledIds = items
      .filter((i) => i.itemType !== 'CUSTOM' && !activeSet.has(i.itemName))
      .map((i) => Number(i.id));
    await saveSettingsMutation.mutateAsync(disabledIds);
  }, [items, activeItemNames, saveSettingsMutation]);

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
    // 실시간 피드백을 위해 전역 스토어의 activeItemNames를 기준으로 계산합니다.
    const normalLabels = CHECKLIST_ITEMS.map(i => i.label);
    const normalActiveCount = activeItemNames.filter(name => normalLabels.includes(name)).length;
    const customActiveCount = activeItemNames.length - normalActiveCount;
    
    return {
      normalActiveCount,
      customActiveCount,
    };
  }, [activeItemNames]);

  return {
    items,
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
    toggleItem,
    selectAllItems,
    saveCurrentSettings,
    toggleItemLocally,
    addCustomItem,
    removeCustomItem,
    counts,
  };
};
