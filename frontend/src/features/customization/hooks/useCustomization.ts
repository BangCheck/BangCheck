import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useEffect } from 'react';
import * as customService from '@/services/custom-checklist-service';
import { TYPE_ITEM_MAP, CHECKLIST_ITEMS } from '../constants';
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
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['customChecklistItems'],
    queryFn: customService.getCustomizedItems,
    enabled: isLoggedIn, // 로그인 상태일 때만 서버에서 데이터를 가져옴
    refetchOnWindowFocus: false, // 창 포커스 시 재로딩 방지
    staleTime: 1000 * 60 * 5, // 5분간 데이터 유지
  });

  // 2. 서버 데이터와 전역 스토어 동기화 (최초 로드 시나 서버 변경 시)
  useEffect(() => {
    if (items.length > 0) {
      const serverActiveNames = items.filter(item => item.isEnabled).map(item => item.itemName);
      setActiveItemNames(serverActiveNames);

      const serverTypes = new Set<string>();
      items.forEach(item => {
        if (item.isEnabled && item.userType) serverTypes.add(item.userType);
      });
      setSelectedTypeIds(Array.from(serverTypes));
    }
  }, [items, setActiveItemNames, setSelectedTypeIds]);

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

  const toggleItemMutation = useMutation({
    mutationFn: customService.toggleItem,
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

      // 유형 선택 시 해당 유형의 추천 항목들을 자동으로 활성화(체크)
      const recommendedIds = TYPE_ITEM_MAP[typeId] || [];
      const recommendedLabels = CHECKLIST_ITEMS
        .filter(item => recommendedIds.includes(item.id))
        .map(item => item.label);

      // 서버 상태 반영
      recommendedLabels.forEach(label => {
        const item = items.find(i => i.itemName === label);
        if (item && !item.isEnabled) {
          toggleItemMutation.mutate(item.id);
        }
      });

      // 스토어 업데이트 (추천 항목 일괄 추가)
      const nextActiveNames = Array.from(new Set([...activeItemNames, ...recommendedLabels]));
      setActiveItemNames(nextActiveNames);
    }
    toggleType(typeId);
  }, [items, selectedTypeIds, activeItemNames, selectTypeMutation, deselectTypeMutation, toggleItemMutation, toggleType, setActiveItemNames]);

  const toggleItem = useCallback((itemId: number, label: string) => {
    toggleItemMutation.mutate(itemId);
    toggleItemName(label);
  }, [toggleItemMutation, toggleItemName]);

  // 서버 ID가 없을 때의 임시 토글 (UI 반응용)
  const toggleItemLocally = useCallback((label: string) => {
    toggleItemName(label);
  }, [toggleItemName]);

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
      toggleItemMutation.isPending || 
      addCustomMutation.isPending || 
      deleteCustomMutation.isPending,
    toggleUserType,
    toggleItem,
    toggleItemLocally,
    addCustomItem,
    removeCustomItem,
    counts,
  };
};
