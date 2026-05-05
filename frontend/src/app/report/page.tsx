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
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

function ReportSkeleton() {
  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-[calc(100vh-64px)] animate-pulse">
      {/* 액션 바 스켈레톤 */}
      <div className="bg-white border-b border-[#E2E2E2] sticky top-16 z-30">
        <div className="max-w-[1200px] mx-auto px-10 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-28 h-7 bg-gray-100 rounded" />
            <div className="w-20 h-6 bg-gray-100 rounded-full" />
          </div>
          <div className="flex gap-3">
            <div className="w-24 h-9 bg-gray-100 rounded" />
            <div className="w-28 h-9 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
      {/* 방 선택 스켈레톤 */}
      <div className="max-w-[1200px] mx-auto px-10 py-10 space-y-6">
        <div className="bg-white rounded-lg border border-[#E2E2E2] p-8">
          <div className="mb-6 space-y-2">
            <div className="w-36 h-5 bg-gray-100 rounded" />
            <div className="w-48 h-4 bg-gray-50 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 bg-gray-50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    return <ReportSkeleton />;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex-1 bg-[#FAFAFA] min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-8 max-w-[320px] text-center">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#E2E2E2" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <div className="space-y-3">
            <h2 className="text-[20px] font-bold text-[#232527]">비교 리포트는 로그인 후 이용 가능해요</h2>
            <p className="text-[14px] text-[#A0A0A0] leading-relaxed">로그인하고 여러 방을 한눈에 비교해보세요.</p>
          </div>
          <Link
            href={ROUTES.LOGIN}
            className="w-full bg-[#0A607D] text-white py-3.5 rounded-xl font-bold text-[16px] text-center hover:bg-[#084e6d] transition-all"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen">
      {/* 상단 액션 바 */}
      <div className="bg-white border-b border-[#E2E2E2] sticky top-16 z-30">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-bold text-[#232527]">비교 리포트</h1>
            <span className="text-[#0A607D] font-semibold bg-[#0A607D]/10 px-3 py-1 rounded-full text-sm">
              {selectedRooms.length}개 방 선택됨
            </span>
          </div>
          <div className="flex gap-3">
            {/* TODO(be): 공유 링크 API 연동 필요 */}
            <button
              disabled
              title="준비 중"
              className="flex items-center gap-2 px-5 py-2 border border-[#E2E2E2] rounded-[4px] text-sm font-semibold text-[#A0A0A0] cursor-not-allowed opacity-50"
            >
              공유하기
            </button>
            {/* TODO(be): PDF 생성 API 연동 필요 */}
            <button
              disabled
              title="준비 중"
              className="flex items-center gap-2 px-5 py-2 bg-[#232527] text-white rounded-[4px] text-sm font-semibold opacity-50 cursor-not-allowed"
            >
              PDF 다운로드
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-10 space-y-10">
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
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E2E2E2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              <p className="text-[#A0A0A0] text-sm font-medium">아직 등록된 방이 없어요.</p>
              <a href={ROUTES.CHECKLIST_NEW} className="text-[#0A607D] text-sm font-bold underline underline-offset-2">
                체크리스트 추가하기
              </a>
            </div>
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
