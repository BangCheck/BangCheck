import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Room, RoomIssues, RoomType, GuestRoomRaw } from '@/types/room';
import { GUEST_ROOM_LIMIT } from '@/lib/constants';
import { formatRoomPrice } from '@/lib/utils';

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
  const type = raw.basic.transactionType ?? '월세';
  const deposit = parseMoney(raw.basic.deposit);
  const rent = parseMoney(raw.basic.monthlyRent);
  const mgmt = raw.basic.isMgmtUnknown ? undefined : parseMoney(raw.basic.managementFee);
  return formatRoomPrice(type, deposit, rent, mgmt);
};

const buildTags = (raw: GuestRoomRaw): string[] => {
  const tags: string[] = [];
  if (raw.building.buildingType) tags.push(raw.building.buildingType);
  if (raw.building.floorLevel) tags.push(`${raw.building.floorLevel}층`);
  if (raw.building.direction) tags.push(raw.building.direction);
  return tags;
};

// 비로그인 점수 산출: 평가(좋음=3/보통=2/나쁨=1) + 문제(없음=2/있음=0) 기반 0~100
// 로그인 모드에서는 BE가 score 제공 — 본 함수는 비로그인 전용
const ratingToPoint = (v: '좋음' | '보통' | '나쁨' | null): number | null =>
  v === '좋음' ? 3 : v === '보통' ? 2 : v === '나쁨' ? 1 : null;
const yesNoToPoint = (v: '있음' | '없음' | null): number | null =>
  v === '없음' ? 2 : v === '있음' ? 0 : null;

export const computeRoomScore = (raw: GuestRoomRaw): number => {
  const ratings = [
    raw.interior.lighting, raw.interior.ventilation, raw.interior.floorNoise,
    raw.interior.waterPressure, raw.interior.soundProof, raw.interior.heating,
    raw.safety.doorLock, raw.safety.windowLock, raw.safety.cctv,
    raw.safety.fireSafety, raw.safety.hallLight, raw.safety.securityState,
    raw.safety.windowScreen, raw.safety.laundry, raw.safety.trash,
    raw.safety.surroundNoise, raw.safety.amenity, raw.safety.transit, raw.safety.nightSafety,
  ].map(ratingToPoint).filter((p): p is number => p !== null);

  const problems = [
    raw.interior.mold, raw.interior.pest, raw.interior.leak,
    raw.interior.wallpaper, raw.interior.drainSmell,
    raw.safety.bikeParking, raw.safety.internet,
  ].map(yesNoToPoint).filter((p): p is number => p !== null);

  const earned = ratings.reduce((a, b) => a + b, 0) + problems.reduce((a, b) => a + b, 0);
  const max = ratings.length * 3 + problems.length * 2;
  if (max === 0) return 0;
  return Math.round((earned / max) * 100);
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
  score: computeRoomScore(raw),
  issues: {
    mold: raw.interior.mold === '있음' ? 'PRESENT' : 'UNCHECKED',
    leak: raw.interior.leak === '있음' ? 'PRESENT' : 'UNCHECKED',
    bug: raw.interior.pest === '있음' ? 'PRESENT' : 'UNCHECKED',
    condensation: raw.interior.humidity === '있음' ? 'PRESENT' : 'UNCHECKED',
    drainSmell: raw.interior.drainSmell === '있음' ? 'PRESENT' : 'UNCHECKED',
  } satisfies RoomIssues,
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
        if (current.length >= GUEST_ROOM_LIMIT) return false;

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
      // localStorage 사용 — 탭/창을 닫아도 비로그인 데이터 유지.
      // 로그인 성공 시 clearGuestRooms() 명시적 호출 (E09-S10에서 통합).
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
