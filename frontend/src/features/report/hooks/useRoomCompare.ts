'use client';

import { useState, useEffect } from 'react';
import type { Room } from '@/types';

const MAX_SELECT = 6;
const MIN_SELECT = 2;

export function useRoomCompare(rooms: Room[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (rooms.length > 0 && selectedIds.length === 0) {
      setSelectedIds(rooms.slice(0, MIN_SELECT).map(r => r.id));
    }
  }, [rooms]);

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.length > MIN_SELECT ? prev.filter(v => v !== id) : prev;
      }
      return prev.length < MAX_SELECT ? [...prev, id] : prev;
    });
  };

  const selectedRooms = rooms.filter(r => selectedIds.includes(r.id));

  return { selectedIds, selectedRooms, toggle, canAdd: selectedIds.length < MAX_SELECT };
}
