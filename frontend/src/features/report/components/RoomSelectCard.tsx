'use client';

import { cn } from '@/lib/utils';
import type { RoomDetail as Room } from '@/types';

interface Props {
  room: Room;
  selected: boolean;
  onToggle: (id: string) => void;
  canAdd: boolean;
}

export function RoomSelectCard({ room, selected, onToggle, canAdd }: Props) {
  const disabled = !selected && !canAdd;

  return (
    <div
      onClick={() => !disabled && onToggle(room.id)}
      className={cn(
        'relative p-5 rounded-xl border-2 transition-all',
        selected ? 'border-[#0A607D] bg-[#0A607D]/5' : 'border-[#E2E2E2]',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-[#BFBFBF]'
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-bold text-[#232527]">{room.name}</h3>
          <p className="text-xs text-[#A0A0A0] truncate max-w-[200px]">{room.address}</p>
          <p className="text-sm font-semibold text-[#0A607D] mt-2">
            {room.transactionType === 'JEONSE' ? '전세' : '월세'} {room.deposit.toLocaleString()}만
            {room.rent ? ` / ${room.rent.toLocaleString()}만` : ''}
          </p>
          <p className="text-xs text-[#A0A0A0]">총점 {room.score}점</p>
        </div>
        <div className={cn(
          'w-6 h-6 rounded-full border flex items-center justify-center shrink-0',
          selected ? 'bg-[#0A607D] border-[#0A607D]' : 'border-[#E2E2E2]'
        )}>
          {selected && <span className="text-white text-xs font-bold">✓</span>}
        </div>
      </div>
    </div>
  );
}
