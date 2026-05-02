'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getReportRooms } from '@/services/room-service';
import { useRoomCompare } from '@/features/report/hooks/useRoomCompare';
import { RoomSelectCard } from '@/features/report/components/RoomSelectCard';
import { SectionFilter, SECTIONS } from '@/features/report/components/SectionFilter';
import { CompareTable } from '@/features/report/components/CompareTable';
import { ReportSummary } from '@/features/report/components/ReportSummary';
import type { SectionKey } from '@/features/report/components/SectionFilter';

export default function ReportPage() {
  const { isLoggedIn } = useAuthStore();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['report-rooms'],
    queryFn: getReportRooms,
    enabled: isLoggedIn,
  });

  const { selectedIds, selectedRooms, toggle, canAdd } = useRoomCompare(rooms);
  const [activeSections, setActiveSections] = useState<SectionKey[]>([...SECTIONS]);

  const toggleSection = (section: SectionKey) => {
    setActiveSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  if (isLoading) {
    return <div className="flex-1 bg-[#FAFAFA] min-h-[calc(100vh-64px)]" />;
  }

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen">
      {/* 상단 액션 바 */}
      <div className="bg-white border-b border-[#E2E2E2] sticky top-16 z-30">
        <div className="max-w-[1200px] mx-auto px-10 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-bold text-[#232527]">비교 리포트</h1>
            <span className="text-[#0A607D] font-semibold bg-[#0A607D]/10 px-3 py-1 rounded-full text-sm">
              {selectedRooms.length}개 방 선택됨
            </span>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2 border border-[#E2E2E2] rounded-[4px] text-sm font-semibold hover:bg-gray-50">
              공유하기
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-[#232527] text-white rounded-[4px] text-sm font-semibold hover:brightness-125">
              PDF 다운로드
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-10 py-10 space-y-10">
        {/* 방 선택 영역 */}
        <section className="bg-white rounded-lg border border-[#E2E2E2] p-8 shadow-sm">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#232527]">비교할 방 선택</h2>
              <p className="text-[#A0A0A0] text-sm">최소 2개, 최대 6개까지 선택할 수 있어요.</p>
            </div>
            <p className="text-sm font-semibold text-[#A0A0A0]">{selectedIds.length}/6</p>
          </div>

          {rooms.length === 0 ? (
            <p className="text-[#A0A0A0] text-sm text-center py-10">저장된 방이 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => (
                <RoomSelectCard
                  key={room.id}
                  room={room}
                  selected={selectedIds.includes(room.id)}
                  onToggle={toggle}
                  canAdd={canAdd}
                />
              ))}
            </div>
          )}
        </section>

        {/* 섹션 필터 */}
        {selectedRooms.length >= 2 && (
          <section className="bg-white rounded-lg border border-[#E2E2E2] p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#232527] mb-4">표시할 섹션 선택</h2>
            <SectionFilter active={activeSections} onToggle={toggleSection} />
          </section>
        )}

        {/* 비교 테이블 */}
        {selectedRooms.length >= 2 && (
          <section className="overflow-x-auto pb-4">
            <CompareTable rooms={selectedRooms} activeSections={activeSections} />
          </section>
        )}

        {/* 종합 요약 */}
        {selectedRooms.length >= 2 && (
          <ReportSummary rooms={selectedRooms} />
        )}
      </div>
    </div>
  );
}
