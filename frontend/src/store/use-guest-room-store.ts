import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Room, ChecklistInput } from '@/types';

interface GuestRoomState {
  guestRooms: Room[];
  addGuestRoom: (roomData: ChecklistInput) => boolean; // Returns false if limit reached
  deleteGuestRoom: (id: string) => void;
  clearGuestRooms: () => void;
}

export const useGuestRoomStore = create<GuestRoomState>()(
  persist(
    (set, get) => ({
      guestRooms: [],
      addGuestRoom: (roomData: ChecklistInput) => {
        const currentRooms = get().guestRooms;
        if (currentRooms.length >= 2) {
          return false;
        }

        const deposit = parseInt(roomData.deposit?.replace(/[^0-9]/g, '') || '0') || 0;
        const rent = parseInt(roomData.rent?.replace(/[^0-9]/g, '') || '0') || 0;
        const managementFee = parseInt(roomData.managementFee?.replace(/[^0-9]/g, '') || '0') || 0;

        const newRoom: Room = {
          id: typeof window !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
          name: roomData.name || '이름 없음',
          address: roomData.address || '',
          type: roomData.type || '월세',
          deposit,
          rent,
          managementFee,
          price: `${roomData.type} ${roomData.deposit || 0}/${roomData.rent || 0}${roomData.managementFee ? `/${roomData.managementFee}` : ''}`,
          buildingType: roomData.buildingType || '원룸',
          floor: roomData.floor ? `${roomData.floor}층` : '중층',
          direction: roomData.direction ? `${roomData.direction}향` : '남향',
          tags: [
            roomData.buildingType || '원룸',
            roomData.floor ? `${roomData.floor}층` : '중층',
            roomData.direction ? `${roomData.direction}향` : '남향',
          ],
          score: 100, // Default score for now
          issues: {
            mold: roomData.problems?.['곰팡이'] === '있음',
            leak: roomData.problems?.['누수'] === '있음',
            bug: roomData.problems?.['벌레'] === '있음',
            condensation: roomData.problems?.['결로'] === '있음',
            drainSmell: roomData.problems?.['배수구 냄새'] === '있음',
          },
          memo: roomData.memo,
          createdAt: new Date().toISOString(),
        };

        set({ guestRooms: [newRoom, ...currentRooms] });
        return true;
      },
      deleteGuestRoom: (id) => {
        set({ guestRooms: get().guestRooms.filter((room) => room.id !== id) });
      },
      clearGuestRooms: () => {
        set({ guestRooms: [] });
      },
    }),
    {
      name: 'guest-room-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
