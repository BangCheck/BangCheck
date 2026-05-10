import { Icon } from '@iconify/react';
import { RoomCard } from './RoomCard';
import { SelectAllToggle } from './SelectAllToggle';
import { SectionChip } from './SectionChip';
import { getRoomSlot } from '@/components/ui/RoomChip';
import { REPORT_SECTIONS, ALL_REPORT_SECTION_IDS, type ReportSectionId } from '@/features/report/lib/sections';
import type { Room } from '@/types/room';

type Props = {
  rooms: Room[];
  selectedRoomIds: string[];
  onToggleRoom: (id: string) => void;
  canSelectMore: boolean;
  isLockedSelection: boolean;

  activeSections: ReportSectionId[];
  onToggleSection: (id: ReportSectionId) => void;

  onComplete: () => void;
  onReset: () => void;
};

export function ConfigCard({
  rooms,
  selectedRoomIds,
  onToggleRoom,
  canSelectMore,
  isLockedSelection,
  activeSections,
  onToggleSection,
  onComplete,
  onReset,
}: Props) {
  const allRoomsSelected = rooms.length > 0 && rooms.every((r) => selectedRoomIds.includes(r.id));
  const allSectionsSelected = ALL_REPORT_SECTION_IDS.every((id) => activeSections.includes(id));

  const toggleAllRooms = () => {
    if (allRoomsSelected) {
      // 최소 2개는 유지 — 앞에서 2개만 남기기
      const keep = rooms.slice(0, 2).map((r) => r.id);
      keep.forEach((id) => {
        if (!selectedRoomIds.includes(id)) onToggleRoom(id);
      });
      selectedRoomIds.forEach((id) => {
        if (!keep.includes(id)) onToggleRoom(id);
      });
    } else {
      rooms.forEach((r) => {
        if (!selectedRoomIds.includes(r.id)) onToggleRoom(r.id);
      });
    }
  };

  const toggleAllSections = () => {
    if (allSectionsSelected) {
      // 최소 1개 유지 — 첫 섹션만 남기기
      ALL_REPORT_SECTION_IDS.slice(1).forEach((id) => {
        if (activeSections.includes(id)) onToggleSection(id);
      });
    } else {
      ALL_REPORT_SECTION_IDS.forEach((id) => {
        if (!activeSections.includes(id)) onToggleSection(id);
      });
    }
  };

  return (
    <div className="rounded-[6px] border border-border-light bg-bg-primary-soft p-6">
      {/* 섹션 1: 비교할 방 선택 */}
      <section className="border-b border-border-light pb-6">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold leading-[1.3] text-text-main">비교할 방 선택</h3>
            <p className="text-sm leading-[1.3] text-text-sub">
              최소 2개는 선택되어야 해요. 선택 해제 시 해당 방은 비교 대상에서 제외됩니다.
            </p>
          </div>
          <SelectAllToggle checked={allRoomsSelected} onChange={toggleAllRooms} />
        </header>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-2">
          {rooms.map((room, idx) => {
            const isSelected = selectedRoomIds.includes(room.id);
            const disabled = isLockedSelection || (!isSelected && !canSelectMore);
            return (
              <RoomCard
                key={room.id}
                room={room}
                slot={getRoomSlot(idx)}
                selected={isSelected}
                disabled={disabled}
                onToggle={onToggleRoom}
              />
            );
          })}
        </div>
      </section>

      {/* 섹션 2: 표시할 섹션 */}
      <section className="border-b border-border-light py-6">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold leading-[1.3] text-text-main">표시할 섹션</h3>
            <p className="text-sm leading-[1.3] text-text-sub">
              선택되지 않은 섹션은 화면과 PDF에 모두 표시되지 않아요. (최소 1개)
            </p>
          </div>
          <SelectAllToggle checked={allSectionsSelected} onChange={toggleAllSections} />
        </header>
        <div className="flex flex-wrap gap-2">
          {REPORT_SECTIONS.map((s) => (
            <SectionChip
              key={s.id}
              section={s.id}
              label={s.label}
              selected={activeSections.includes(s.id)}
              disabled={activeSections.length === 1 && activeSections.includes(s.id)}
              onToggle={onToggleSection}
            />
          ))}
        </div>
      </section>

      {/* 섹션 3: 액션 */}
      <footer className="flex items-center justify-end gap-6 pt-6">
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex h-8 items-center justify-center rounded-[4px] bg-brand-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-primary-dark"
        >
          완료
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-semibold text-text-mute transition-colors hover:text-text-main"
        >
          <Icon icon="carbon:reset" width={16} height={16} />
          <span>초기화</span>
        </button>
      </footer>
    </div>
  );
}
