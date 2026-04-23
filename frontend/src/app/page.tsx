'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getRooms } from '@/services/room-service';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * 01_홈화면 (SCR-HOME)
 * 429:5365 디자인 반영: 로그인 후 등록된 정보가 없을 때
 */
export default function Home() {
  const { isLoggedIn } = useAuthStore();
  
  const { data: rooms = [], isLoading, isFetched } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    enabled: isLoggedIn,
    staleTime: 1000 * 60, // 1분간 캐시 유지하여 반복 진입 시 속도 향상
  });

  // 1. 로딩 상태 (Skeleton)
  if (isLoggedIn && isLoading && !isFetched) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-[#FAFAFA] min-h-[calc(100vh-64px)]">
        <div className="w-[256px] space-y-6 animate-pulse">
          <div className="w-[70px] h-[70px] bg-gray-200 rounded-full mx-auto" />
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
          <div className="h-12 bg-gray-200 rounded-md w-full mt-10" />
        </div>
      </main>
    );
  }

  // 2. 비로그인 또는 등록된 방이 없는 상태 (429:5365 반영)
  if (!isLoggedIn || (isFetched && rooms.length === 0)) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-[#FAFAFA] min-h-[calc(100vh-64px)] pb-20">
        <div className="flex flex-col items-center gap-[40px] max-w-[300px]">
          <div className="flex flex-col items-center gap-[28px]">
            <div className="w-[70px] h-[70px] relative">
              <Image 
                src="https://www.figma.com/api/mcp/asset/8c0b0798-e015-40d9-bb1c-5deb42ba4283" 
                alt="" 
                fill 
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-[20px] font-bold text-[#232527] leading-tight">
                아직 등록된 체크리스트가 없어요
              </h2>
              <div className="text-[16px] text-[#232527] font-normal leading-relaxed opacity-80">
                <p>방체크에서</p>
                <p>체크리스트를 기록해보세요</p>
              </div>
            </div>
          </div>
          <Link 
            href="/checklist/new"
            className="w-[237px] bg-[#0A607D] text-white py-[12px] rounded-[6px] flex items-center justify-center gap-[10px] font-semibold text-[16px] hover:bg-[#084e6d] transition-all active:scale-[0.98]"
          >
            <span className="w-5 h-5 flex items-center justify-center">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </span>
            체크리스트 시작하기
          </Link>
        </div>
      </main>
    );
  }

  // 3. 방 목록이 있는 상태 (생략 - 기존 로직 유지)
  return (
    <main className="flex-1 bg-white min-h-screen">
      {/* ... 기존 방 목록 UI 동일 ... */}
      <div className="flex justify-center border-b border-[#E2E2E2]">
        <div className="flex gap-7">
          <button className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#232527] font-bold text-[#232527]">
             카드로 보기
          </button>
          <button className="flex items-center gap-2 px-4 py-3 text-[#A0A0A0] font-bold">
             지도로 보기
          </button>
        </div>
      </div>

      <div className="border-b border-[#E2E2E2] px-10 py-3 flex justify-between items-center bg-white sticky top-16 z-40">
        <div className="flex gap-2.5">
          <button className="border border-[#BFBFBF] rounded-[6px] px-3 py-1.5 text-sm font-medium text-[#444] flex items-center gap-1">
            거래방식 ▾
          </button>
          <button className="border border-[#BFBFBF] rounded-[6px] px-3 py-1.5 text-sm font-medium text-[#0A607D] flex items-center gap-1">
            전체 (보증금 낮은순) ▾
          </button>
        </div>
        <Link 
          href="/report"
          className="bg-[#BFBFBF] text-white px-4 py-2 rounded-[4px] text-xs font-semibold flex items-center gap-2 hover:bg-[#232527] transition-colors"
        >
          비교 리포트
        </Link>
      </div>

      <div className="px-10 py-5">
        <p className="text-sm font-semibold text-[#A0A0A0] mb-4">등록된 방 {rooms.length}개/6개</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="border border-[#E2E2E2] rounded-[6px] p-6 shadow-sm hover:shadow-md transition-shadow relative bg-white">
              <button className="absolute top-6 right-6 text-[#BFBFBF] hover:text-red-500">🗑️</button>
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-[#777] text-xs">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#8E44AD]" />
                    <span>등록일시 {new Date(room.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#232527] line-clamp-1">{room.name}</h3>
                    <p className="text-xs text-[#777]">📍 {room.address}</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1">
                    {room.tags.map(tag => (
                      <span key={tag} className="bg-[#F9E8F0] text-[#461A2B] text-[12px] font-semibold px-1.5 py-0.5 rounded-[2px]">
                        {tag}
                      </span>
                    ))}
                    <span className="bg-[#F9E8F0] text-[#461A2B] text-[12px] font-semibold px-1.5 py-0.5 rounded-[2px]">
                      {room.price}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-[#232527] font-medium">
                    {room.issues.mold && <span>🦠 곰팡이</span>}
                    {room.issues.leak && <span>💧 누수</span>}
                    {room.issues.bug && <span>🪲 벌레</span>}
                  </div>
                </div>
                {room.memo && (
                  <p className="text-xs text-[#777] pt-4 border-t border-[#E2E2E2] line-clamp-2">
                    메모 : {room.memo}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
