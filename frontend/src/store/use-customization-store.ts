import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomizationState {
  selectedTypeIds: string[];
  activeItemNames: string[];
  setSelectedTypeIds: (ids: string[]) => void;
  setActiveItemNames: (names: string[]) => void;
  toggleType: (typeId: string) => void;
  toggleItemName: (name: string) => void;
  reset: () => void;
}

export const useCustomizationStore = create<CustomizationState>()(
  persist(
    (set) => ({
      selectedTypeIds: [],
      activeItemNames: [],
      setSelectedTypeIds: (ids) => set({ selectedTypeIds: ids }),
      setActiveItemNames: (names) => set({ activeItemNames: names }),
      toggleType: (typeId) => set((state) => ({
        selectedTypeIds: state.selectedTypeIds.includes(typeId)
          ? state.selectedTypeIds.filter(id => id !== typeId)
          : [...state.selectedTypeIds, typeId]
      })),
      toggleItemName: (name) => set((state) => ({
        activeItemNames: state.activeItemNames.includes(name)
          ? state.activeItemNames.filter(n => n !== name)
          : [...state.activeItemNames, name]
      })),
      reset: () => set({ selectedTypeIds: [], activeItemNames: [] }),
    }),
    {
      name: 'customization-storage',
    }
  )
);
