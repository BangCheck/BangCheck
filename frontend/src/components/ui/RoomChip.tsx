import type { ReactNode } from 'react';

export type RoomSlot = 'A' | 'B' | 'C';

const SLOT_CLASS: Record<RoomSlot, string> = {
  A: 'bg-[var(--color-slot-a-bg)] text-[var(--color-slot-a-text)]',
  B: 'bg-[var(--color-slot-b-bg)] text-[var(--color-slot-b-text)]',
  C: 'bg-brand-primary/10 text-brand-primary',
};

type Props = {
  slot: RoomSlot;
  children: ReactNode;
  className?: string;
};

export function RoomChip({ slot, children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[2px] px-1 py-[2px] text-xs font-semibold leading-[1.3] whitespace-nowrap ${SLOT_CLASS[slot]} ${className}`}
    >
      {children}
    </span>
  );
}

export function getRoomSlot(index: number): RoomSlot {
  const slots: RoomSlot[] = ['A', 'B', 'C'];
  return slots[index % slots.length];
}
