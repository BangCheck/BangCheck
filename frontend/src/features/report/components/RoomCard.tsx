import { Icon } from '@iconify/react';
import { RoomChip, type RoomSlot } from '@/components/ui/RoomChip';
import type { Room } from '@/types/room';

type Props = {
  room: Room;
  slot: RoomSlot;
  selected: boolean;
  disabled?: boolean;
  onToggle: (id: string) => void;
};

const SLOT_DOT: Record<RoomSlot, string> = {
  A: 'bg-[var(--color-slot-a-text)]',
  B: 'bg-[var(--color-slot-b-text)]',
  C: 'bg-brand-primary',
};

export function RoomCard({ room, slot, selected, disabled = false, onToggle }: Props) {
  const chips = [room.buildingType, room.floor, room.direction, room.price].filter(
    (v): v is string => Boolean(v),
  );

  return (
    <button
      type="button"
      onClick={() => !disabled && onToggle(room.id)}
      disabled={disabled}
      className={`w-full max-w-[378px] rounded-[6px] border bg-white p-3 text-left transition-all
        ${selected ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-border-light'}
        ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-border-mute'}
      `}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <span className={`size-2 shrink-0 rounded-full ${SLOT_DOT[slot]}`} aria-hidden />
            <p className="truncate text-sm font-semibold leading-[1.3] text-text-main">{room.name}</p>
          </div>
          <div className="flex items-center gap-1 pl-[18px]">
            <Icon icon="si:pin-fill" width={16} height={16} className="shrink-0 text-text-mute" />
            <p className="truncate text-xs leading-[1.3] text-text-mute">{room.address}</p>
          </div>
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pl-[18px]">
              {chips.map((label, i) => (
                <RoomChip key={`${label}-${i}`} slot={slot}>
                  {label}
                </RoomChip>
              ))}
            </div>
          )}
        </div>
        <span
          className={`flex size-[18px] shrink-0 items-center justify-center rounded-[3px] border-2 transition-colors
            ${selected ? 'border-brand-primary bg-brand-primary' : 'border-border-light bg-white'}
          `}
          aria-hidden
        >
          {selected && <Icon icon="boxicons:check" width={14} height={14} className="text-white" />}
        </span>
      </div>
    </button>
  );
}
