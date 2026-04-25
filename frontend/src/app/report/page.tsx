'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getRooms, Room } from '@/services/room-service';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * 매물 비교 리포트 페이지 (SCR-REPORT)
 * 429:5168 (선택), 429:8131 (상세 리포트) 디자인 반영
 */
export default function ReportPage() {
  const { isLoggedIn } = useAuthStore();
  
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    enabled: isLoggedIn,
  });

  const [selectedRoomIds, setSelectedRooms] = useState<string[]>([]);
  const [activeSections, setActiveSections] = useState<string[]>([
    '기본 정보', '건물 정보', '옵션', '내부 상태', '문제 요소', '안전/생활', '주변 환경'
  ]);

  // 초기 로드 시 처음 2개 방 자동 선택
  if (rooms.length > 0 && selectedRoomIds.length === 0) {
    setSelectedRooms(rooms.slice(0, 2).map(r => r.id));
  }

  const toggleRoomSelection = (id: string) => {
    setSelectedRooms(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(roomId => roomId !== id) : prev)
        : prev.length < 6 ? [...prev, id] : prev
    );
  };

  const selectedRooms = rooms.filter(r => selectedRoomIds.includes(r.id));

  // 1. 로딩 상태
  if (isLoading) {
    return <div className="flex-1 bg-[#FAFAFA] min-h-[calc(100vh-64px)]" />;
  }

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen">
      {/* Header & Actions (429:18568) */}
      <div className="bg-white border-b border-[#E2E2E2] sticky top-16 z-30">
        <div className="max-w-[1200px] mx-auto px-10 py-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-bold text-[#232527]">비교 리포트</h1>
            <span className="text-[#0A607D] font-semibold bg-[#0A607D]/10 px-3 py-1 rounded-full text-sm">
              {selectedRooms.length}개 방 선택됨
            </span>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2 border border-[#E2E2E2] rounded-[4px] text-sm font-semibold hover:bg-gray-50">
              <span className="w-4 h-4 opacity-70">🔗</span> 공유하기
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-[#232527] text-white rounded-[4px] text-sm font-semibold hover:brightness-125">
              <span className="w-4 h-4">📥</span> PDF 다운로드
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-10 py-10 space-y-12">
        {/* Selection Area (429:5168) */}
        <section className="bg-white rounded-lg border border-[#E2E2E2] p-8 shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#232527]">비교할 방 선택</h2>
              <p className="text-[#A0A0A0] text-sm">최대 6개까지 선택하여 한눈에 비교할 수 있어요.</p>
            </div>
            <p className="text-sm font-semibold text-[#A0A0A0]">선택된 방 {selectedRooms.length}/6</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div 
                key={room.id}
                onClick={() => toggleRoomSelection(room.id)}
                className={cn(
                  "relative p-5 rounded-xl border-2 transition-all cursor-pointer",
                  selectedRoomIds.includes(room.id) 
                    ? "border-[#0A607D] bg-[#0A607D]/5" 
                    : "border-[#E2E2E2] hover:border-[#BFBFBF]"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#232527]">{room.name}</h3>
                    <p className="text-xs text-[#A0A0A0] truncate max-w-[200px]">{room.address}</p>
                    <p className="text-sm font-semibold text-[#0A607D] mt-2">{room.price}</p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border flex items-center justify-center",
                    selectedRoomIds.includes(room.id) ? "bg-[#0A607D] border-[#0A607D]" : "border-[#E2E2E2]"
                  )}>
                    {selectedRoomIds.includes(room.id) && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table (429:8131) */}
        <section className="space-y-6 overflow-x-auto pb-10">
          <div className="min-w-[800px] bg-white rounded-lg border border-[#E2E2E2] overflow-hidden shadow-md">
            {/* Table Header (Room Names) */}
            <div className="flex border-b border-[#E2E2E2] bg-[#FAFAFA]">
              <div className="w-[180px] p-5 shrink-0 border-r border-[#E2E2E2] font-bold text-[#232527]">
                비교 항목
              </div>
              {selectedRooms.map((room) => (
                <div key={room.id} className="flex-1 p-5 text-center font-bold text-[#232527] border-r border-[#E2E2E2] last:border-0">
                  {room.name}
                </div>
              ))}
            </div>

            {/* Basic Info Section */}
            <div className="bg-[#F5F5F5] px-5 py-2 text-xs font-bold text-[#777] uppercase tracking-wider">
              기본 정보
            </div>
            <TableRow label="거래 유형" values={selectedRooms.map(r => r.type)} />
            <TableRow label="가격" values={selectedRooms.map(r => r.price)} />
            <TableRow label="주소" values={selectedRooms.map(r => r.address)} />

            {/* Condition Section */}
            <div className="bg-[#F5F5F5] px-5 py-2 text-xs font-bold text-[#777] uppercase tracking-wider">
              내부 상태 (문제 요소)
            </div>
            <TableRow 
              label="곰팡이" 
              values={selectedRooms.map(r => r.issues.mold ? '🔴 있음' : '⚪ 없음')} 
            />
            <TableRow 
              label="누수" 
              values={selectedRooms.map(r => r.issues.leak ? '🔴 있음' : '⚪ 없음')} 
            />
            <TableRow 
              label="벌레" 
              values={selectedRooms.map(r => r.issues.bug ? '🔴 있음' : '⚪ 없음')} 
            />

            {/* Memo Section */}
            <div className="bg-[#F5F5F5] px-5 py-2 text-xs font-bold text-[#777] uppercase tracking-wider">
              기타 메모
            </div>
            <TableRow 
              label="상세 메모" 
              values={selectedRooms.map(r => r.memo || '-')} 
              isLast 
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function TableRow({ label, values, isLast = false }: { label: string; values: string[]; isLast?: boolean }) {
  return (
    <div className={cn("flex border-b border-[#E2E2E2]", isLast && "border-0")}>
      <div className="w-[180px] p-5 shrink-0 border-r border-[#E2E2E2] bg-white text-sm font-medium text-[#777]">
        {label}
      </div>
      {values.map((val, idx) => (
        <div key={idx} className="flex-1 p-5 text-center text-sm text-[#232527] border-r border-[#E2E2E2] last:border-0 bg-white">
          {val}
        </div>
      ))}
    </div>
  );
}
