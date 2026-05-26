export const QUERY_KEYS = {
  rooms: {
    all: ['rooms'] as const,
    list: (rentType?: string, sort?: string) => ['rooms', 'list', rentType, sort] as const,
    detail: (roomId: string | undefined) => ['rooms', 'detail', roomId] as const,
  },
  checklist: {
    items: ['checklist', 'items'] as const,
    all: ['checklists'] as const,
    detail: (id: string) => ['checklists', id] as const,
  },
  customization: {
    settings: ['customization', 'settings'] as const,
    allItems: ['customization', 'allItems'] as const,
    types: ['customization', 'types'] as const,
  },
  directions: {
    walking: (startLat: number, startLng: number, goalLat: number, goalLng: number) =>
      ['directions', 'walking', startLat, startLng, goalLat, goalLng] as const,
  },
} as const;
