'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getRooms } from '@/services/room-service';
import type { Room } from '@/types';
import { cn } from '@/lib/utils';
import { RoomCard } from '@/features/checklist/components/RoomCard';
import { SelectAllButton } from '@/features/checklist/components/SelectAllButton';
import { FilterToggle } from '@/features/checklist/components/FilterToggle';
import { ChecklistTab, type ChecklistTabId } from '@/features/checklist/components/ChecklistTab';
import { StatusTag } from '@/components/ui/StatusTag';

const ALL_SECTIONS: ChecklistTabId[] = [
  '기본정보', '건물정보', '옵션', '내부상태', '문제요소', '안전생활', '주변환경',
];

const SECTION_LABELS: Record<ChecklistTabId, string> = {
  기본정보: '기본 정보',
  건물정보: '건물 정보',
  옵션: '옵션',
  내부상태: '내부 상태',
  문제요소: '문제 요소',
  안전생활: '안전/생활',
  주변환경: '주변 환경',
};

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}

function SectionChip({
  id, active, onClick,
}: {
  id: ChecklistTabId;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-1.5 rounded-[4px] border text-[14px] font-semibold leading-[1.3] transition-colors whitespace-nowrap',
        active
          ? 'bg-white border-brand-primary text-brand-primary'
          : 'bg-white border-[#e2e2e2] text-text-caption',
      )}
    >
      {SECTION_LABELS[id]}
    </button>
  );
}

function CompareTableHeader({ rooms }: { rooms: Room[] }) {
  return (
    <div className="flex border-b border-[#e2e2e2] bg-[#fafafa] sticky top-[calc(theme(spacing.16)+45px)] z-10">
      <div className="w-[150px] shrink-0 px-5 py-4 text-[14px] font-bold text-text-main border-r border-[#e2e2e2]">
        비교 항목
      </div>
      {rooms.map((room) => (
        <div
          key={room.id}
          className="flex-1 min-w-[180px] px-5 py-4 text-center text-[14px] font-bold text-text-main border-r border-[#e2e2e2] last:border-0 truncate"
        >
          {room.name}
        </div>
      ))}
    </div>
  );
}

function CompareRow({
  label,
  values,
  isLast = false,
}: {
  label: string;
  values: React.ReactNode[];
  isLast?: boolean;
}) {
  return (
    <div className={cn('flex', !isLast && 'border-b border-[#e2e2e2]')}>
      <div className="w-[150px] shrink-0 px-5 py-4 text-[13px] text-[#777] bg-white border-r border-[#e2e2e2]">
        {label}
      </div>
      {values.map((val, i) => (
        <div
          key={i}
          className="flex-1 min-w-[180px] px-5 py-4 text-center text-[13px] text-text-main border-r border-[#e2e2e2] last:border-0"
        >
          {val ?? '-'}
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-5 py-2 bg-[#f5f5f5] text-[12px] font-bold text-[#777] uppercase tracking-wider border-b border-[#e2e2e2]">
      {label}
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ChecklistTabId>('기본정보');
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [pendingRoomIds, setPendingRoomIds] = useState<string[]>([]);
  const [activeSections, setActiveSections] = useState<ChecklistTabId[]>([...ALL_SECTIONS]);
  const [pendingSections, setPendingSections] = useState<ChecklistTabId[]>([...ALL_SECTIONS]);

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    enabled: isLoggedIn,
  });

  if (rooms.length > 0 && selectedRoomIds.length === 0) {
    const initial = rooms.slice(0, Math.min(2, rooms.length)).map((r) => r.id);
    setSelectedRoomIds(initial);
    setPendingRoomIds(initial);
  }

  const selectedRooms = rooms.filter((r) => selectedRoomIds.includes(r.id));

  const togglePendingRoom = (id: string) => {
    setPendingRoomIds((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((rid) => rid !== id) : prev
        : prev.length < 6 ? [...prev, id] : prev,
    );
  };

  const togglePendingSection = (id: ChecklistTabId) => {
    setPendingSections((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((s) => s !== id) : prev
        : [...prev, id],
    );
  };

  const handleSettingsDone = () => {
    setSelectedRoomIds(pendingRoomIds);
    setActiveSections(pendingSections);
    setIsSettingsOpen(false);
  };

  const handleSettingsReset = () => {
    setPendingRoomIds(selectedRoomIds);
    setPendingSections(activeSections);
  };

  const handleToggleSettings = () => {
    if (!isSettingsOpen) {
      setPendingRoomIds(selectedRoomIds);
      setPendingSections(activeSections);
    }
    setIsSettingsOpen((prev) => !prev);
  };

  const allRoomsSelected = pendingRoomIds.length === rooms.length;
  const allSectionsSelected = pendingSections.length === ALL_SECTIONS.length;

  if (isLoading) {
    return <div className="flex-1 bg-[#fafafa] min-h-screen" />;
  }

  return (
    <div className="flex-1 bg-[#fafafa] min-h-screen">
      {/* Sub-header */}
      <div className="bg-white border-b border-[#e2e2e2] sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-[136px] py-[24px] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-text-main hover:text-brand-primary transition-colors"
            >
              <BackIcon />
            </button>
            <span className="text-[30px] font-bold text-text-main leading-[1.3]">비교 리포트</span>
            <FilterToggle
              isOpen={isSettingsOpen}
              summary={!isSettingsOpen ? { rooms: selectedRoomIds.length, sections: activeSections.length } : undefined}
              onToggle={handleToggleSettings}
            />
            {!isSettingsOpen && (
              <span className="text-[14px] font-semibold text-text-caption">
                {selectedRoomIds.length}개 방 · {activeSections.length}개 섹션
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 h-8 px-4 border border-[#e2e2e2] rounded-[4px] text-[12px] font-semibold text-text-main bg-white hover:bg-[#f5f5f5] transition-colors"
            >
              <ShareIcon />
              공유
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 h-8 px-4 border border-[#e2e2e2] rounded-[4px] text-[12px] font-semibold text-text-main bg-white hover:bg-[#f5f5f5] transition-colors"
            >
              <DownloadIcon />
              PDF 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="bg-white border-b border-[#e2e2e2]">
          <div className="max-w-[1440px] mx-auto pl-[136px] py-0">
            <div className="bg-[#f7fafb] border border-[#e2e2e2] rounded-[6px] p-6 w-[814px] my-6 flex flex-col gap-0">
              {/* 비교할 방 선택 */}
              <div className="border-b border-[#e2e2e2] pb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[16px] font-semibold text-text-main leading-[1.3]">비교할 방 선택</p>
                    <p className="text-[14px] text-[#444] leading-[1.3] mt-1">
                      최소 2개는 선택되어야 해요. 선택 해제 시 해당 방은 비교 대상에서 제외됩니다.
                    </p>
                  </div>
                  <SelectAllButton
                    checked={allRoomsSelected}
                    onChange={(checked) =>
                      setPendingRoomIds(checked ? rooms.map((r) => r.id) : rooms.slice(0, 2).map((r) => r.id))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      name={room.name}
                      address={room.address}
                      tags={room.tags}
                      checked={pendingRoomIds.includes(room.id)}
                      onToggle={() => togglePendingRoom(room.id)}
                    />
                  ))}
                </div>
              </div>

              {/* 표시할 섹션 */}
              <div className="border-b border-[#e2e2e2] py-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[16px] font-semibold text-text-main leading-[1.3]">표시할 섹션</p>
                    <p className="text-[14px] text-[#444] leading-[1.3] mt-1">
                      선택되지 않은 섹션은 화면과 PDF에 모두 표시되지 않아요. (최소 1개)
                    </p>
                  </div>
                  <SelectAllButton
                    checked={allSectionsSelected}
                    onChange={(checked) =>
                      setPendingSections(checked ? [...ALL_SECTIONS] : [pendingSections[0] ?? '기본정보'])
                    }
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_SECTIONS.map((id) => (
                    <SectionChip
                      key={id}
                      id={id}
                      active={pendingSections.includes(id)}
                      onClick={() => togglePendingSection(id)}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 flex items-center justify-end gap-6">
                <button
                  type="button"
                  onClick={handleSettingsDone}
                  className="h-8 px-4 bg-brand-primary text-white text-[12px] font-semibold rounded-[4px] hover:brightness-110 transition-all"
                >
                  완료
                </button>
                <button
                  type="button"
                  onClick={handleSettingsReset}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#777] hover:text-text-main transition-colors"
                >
                  <ResetIcon />
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Tab Nav */}
      <div className="bg-white sticky top-[calc(theme(spacing.16)+73px)] z-20 border-b border-[#e2e2e2]">
        <div className="max-w-[1440px] mx-auto px-[136px]">
          <ChecklistTab
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="border-b-0"
          />
        </div>
      </div>

      {/* Comparison Content */}
      <div className="max-w-[1440px] mx-auto px-[136px] py-10 space-y-10">
        {selectedRooms.length < 2 ? (
          <div className="bg-white border border-[#e2e2e2] rounded-[6px] p-12 text-center">
            <p className="text-text-caption text-[14px]">방을 2개 이상 선택해야 비교할 수 있어요.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e2e2e2] rounded-[6px] overflow-hidden overflow-x-auto">
            <CompareTableHeader rooms={selectedRooms} />

            {/* 기본정보 */}
            {activeSections.includes('기본정보') && (
              <>
                <SectionHeader label="기본 정보" />
                <CompareRow label="매물명" values={selectedRooms.map((r) => r.name)} />
                <CompareRow label="주소" values={selectedRooms.map((r) => r.address)} />
                <CompareRow label="금액" values={selectedRooms.map((r) => r.price)} />
                <CompareRow
                  label="거래 유형"
                  values={selectedRooms.map((r) => r.type)}
                  isLast={!activeSections.some((s) => s !== '기본정보')}
                />
              </>
            )}

            {/* 건물정보 */}
            {activeSections.includes('건물정보') && (
              <>
                <SectionHeader label="건물 정보" />
                <CompareRow label="건물형태" values={selectedRooms.map(() => '-')} />
                <CompareRow label="층수" values={selectedRooms.map(() => '-')} />
                <CompareRow label="방향" values={selectedRooms.map(() => '-')} />
                <CompareRow label="엘리베이터" values={selectedRooms.map(() => '-')} isLast />
              </>
            )}

            {/* 옵션 */}
            {activeSections.includes('옵션') && (
              <>
                <SectionHeader label="옵션" />
                {['에어컨', '냉장고', '세탁기', '전자레인지', '인터넷'].map((opt, i, arr) => (
                  <CompareRow
                    key={opt}
                    label={opt}
                    values={selectedRooms.map((r) =>
                      r.tags.some((t) => t.includes(opt)) ? '✓' : '-',
                    )}
                    isLast={i === arr.length - 1}
                  />
                ))}
              </>
            )}

            {/* 내부상태 */}
            {activeSections.includes('내부상태') && (
              <>
                <SectionHeader label="내부 상태" />
                <div className="px-5 py-8 text-center text-text-caption text-[13px]">
                  체크리스트 점수 데이터가 필요합니다.
                </div>
              </>
            )}

            {/* 문제요소 */}
            {activeSections.includes('문제요소') && (
              <>
                <SectionHeader label="문제 요소" />
                <CompareRow
                  label="곰팡이"
                  values={selectedRooms.map((r) => (
                    <StatusTag variant={r.issues.mold ? '취소' : '처리완료'} />
                  ))}
                />
                <CompareRow
                  label="누수"
                  values={selectedRooms.map((r) => (
                    <StatusTag variant={r.issues.leak ? '취소' : '처리완료'} />
                  ))}
                />
                <CompareRow
                  label="벌레"
                  values={selectedRooms.map((r) => (
                    <StatusTag variant={r.issues.bug ? '취소' : '처리완료'} />
                  ))}
                  isLast
                />
              </>
            )}

            {/* 안전/생활 */}
            {activeSections.includes('안전생활') && (
              <>
                <SectionHeader label="안전/생활" />
                <CompareRow label="현관 보안" values={selectedRooms.map(() => '-')} />
                <CompareRow label="CCTV" values={selectedRooms.map(() => '-')} isLast />
              </>
            )}

            {/* 주변환경 */}
            {activeSections.includes('주변환경') && (
              <>
                <SectionHeader label="주변 환경" />
                <CompareRow label="대중교통" values={selectedRooms.map(() => '-')} />
                <CompareRow label="편의점" values={selectedRooms.map(() => '-')} isLast />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
