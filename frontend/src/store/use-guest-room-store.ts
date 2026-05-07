import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Room, RoomType, GuestRoomRaw } from '@/types/room';

interface GuestRoomState {
  guestRooms: Room[];
  addGuestRoom: (raw: GuestRoomRaw) => boolean; // false if limit reached
  updateGuestRoom: (id: string, raw: GuestRoomRaw) => boolean;
  deleteGuestRoom: (id: string) => void;
  getGuestRoom: (id: string) => Room | undefined;
  clearGuestRooms: () => void;
}

const parseMoney = (val: string | undefined): number => {
  if (!val) return 0;
  const n = parseInt(val.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

const formatPrice = (raw: GuestRoomRaw): string => {
  const t = raw.basic.transactionType ?? '월세';
  const dep = raw.basic.deposit || '0';
  const rent = raw.basic.monthlyRent || '0';
  const mgmt = raw.basic.isMgmtUnknown ? '' : raw.basic.managementFee;
  return `${t} ${dep}/${rent}${mgmt ? `/${mgmt}` : ''}`;
};

const buildTags = (raw: GuestRoomRaw): string[] => {
  const tags: string[] = [];
  if (raw.building.buildingType) tags.push(raw.building.buildingType);
  if (raw.building.floorLevel) tags.push(`${raw.building.floorLevel}층`);
  if (raw.building.direction) tags.push(`${raw.building.direction}향`);
  return tags;
};

const rawToRoomFields = (raw: GuestRoomRaw) => ({
  name: raw.basic.name || '이름 없음',
  address: raw.basic.address || '',
  type: (raw.basic.transactionType ?? '월세') as RoomType,
  deposit: parseMoney(raw.basic.deposit),
  rent: parseMoney(raw.basic.monthlyRent),
  managementFee: raw.basic.isMgmtUnknown ? undefined : parseMoney(raw.basic.managementFee),
  price: formatPrice(raw),
  tags: buildTags(raw),
  score: 100,
  issues: {
    mold: raw.interior.mold === '있음',
    leak: raw.interior.leak === '있음',
    bug: raw.interior.pest === '있음',
    condensation: raw.interior.leak === '있음',
    drainSmell: raw.interior.drainSmell === '있음',
  },
  memo: raw.custom.memo,
  buildingType: raw.building.buildingType ?? undefined,
  floor: raw.building.floorLevel ?? undefined,
  direction: raw.building.direction ?? undefined,
  raw,
});

const newId = () =>
  typeof window !== 'undefined' && 'crypto' in window
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11);

export const useGuestRoomStore = create<GuestRoomState>()(
  persist(
    (set, get) => ({
      guestRooms: [],

      addGuestRoom: (raw) => {
        const current = get().guestRooms;
        if (current.length >= 2) return false;

        const room: Room = {
          id: newId(),
          createdAt: new Date().toISOString(),
          ...rawToRoomFields(raw),
        };
        set({ guestRooms: [room, ...current] });
        return true;
      },

      updateGuestRoom: (id, raw) => {
        const current = get().guestRooms;
        const idx = current.findIndex((r) => r.id === id);
        if (idx < 0) return false;

        const next = [...current];
        next[idx] = {
          ...next[idx],
          ...rawToRoomFields(raw),
        };
        set({ guestRooms: next });
        return true;
      },

      deleteGuestRoom: (id) => {
        set({ guestRooms: get().guestRooms.filter((r) => r.id !== id) });
      },

      getGuestRoom: (id) => get().guestRooms.find((r) => r.id === id),

      clearGuestRooms: () => set({ guestRooms: [] }),
    }),
    {
      name: 'guest-room-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
