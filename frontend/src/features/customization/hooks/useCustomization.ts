import { useState, useCallback, useMemo } from 'react';
import { USER_TYPES, CHECKLIST_ITEMS, ChecklistItem, TYPE_ITEM_MAP } from '../constants';

export const useCustomization = () => {
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [activeItemIds, setActiveItemIds] = useState<string[]>(
    CHECKLIST_ITEMS.filter(item => item.isDefault).map(item => item.id)
  );
  const [customItems, setCustomItems] = useState<string[]>([]);

  const toggleUserType = useCallback((id: string) => {
    setSelectedTypeIds(prev => {
      const isSelected = prev.includes(id);
      const next = isSelected ? prev.filter(t => t !== id) : [...prev, id];
      
      // 유형 선택 시 관련 항목 자동 활성화
      if (!isSelected && TYPE_ITEM_MAP[id]) {
        setActiveItemIds(current => {
          const toAdd = TYPE_ITEM_MAP[id].filter(itemId => !current.includes(itemId));
          return [...current, ...toAdd];
        });
      }
      
      return next;
    });
  }, []);

  const selectAllTypes = useCallback(() => {
    setSelectedTypeIds(prev => {
      if (prev.length === USER_TYPES.length) return [];
      
      // 모든 항목 매핑 적용
      const allItems = new Set(activeItemIds);
      USER_TYPES.forEach(t => {
        TYPE_ITEM_MAP[t.id]?.forEach(itemId => allItems.add(itemId));
      });
      setActiveItemIds(Array.from(allItems));
      
      return USER_TYPES.map(t => t.id);
    });
  }, [activeItemIds]);

  const toggleItem = useCallback((id: string) => {
    setActiveItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAllItems = useCallback(() => {
    setActiveItemIds(prev => 
      prev.length === CHECKLIST_ITEMS.length ? [] : CHECKLIST_ITEMS.map(i => i.id)
    );
  }, []);

  const addCustomItem = useCallback((label: string) => {
    if (!label.trim()) return;
    setCustomItems(prev => [...prev, label.trim()]);
  }, []);

  const removeCustomItem = useCallback((index: number) => {
    setCustomItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    selectedTypeIds,
    activeItemIds,
    customItems,
    toggleUserType,
    selectAllTypes,
    toggleItem,
    selectAllItems,
    addCustomItem,
    removeCustomItem,
  };
};
