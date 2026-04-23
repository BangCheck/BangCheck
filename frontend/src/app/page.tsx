'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { getRooms, Room } from '@/services/room-service';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * 01_홈화면 (SCR-HOME)
 * 1. 비로그인 / 빈 상태 (429:5169, 429:5479)
 * 2. 방 카드 리스트 (429:6000)
 */
export default function Home() {
  const { isLoggedIn } = useAuthStore();
  
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
    enabled: isLoggedIn,
  });

  // 1. 비로그인 또는 등록된 방이 없는 상태 (Empty State)
  if (!isLoggedIn || (!isLoading && rooms.length === 0)) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-[#FAFAFA] min-h-[calc(100vh-64px)] pb-20">
        <div className="flex flex-col items-center gap-10 max-w-[256px]">
          <div className="flex flex-col items-center gap-7">
            <div className="w-[70px] h-[70px] relative">
              <Image 
                src="/images/empty-checklist.svg" // 피그마 아이콘 대체 (임시)
                alt="" 
                fill 
                className="object-contain"
                onError={(e) => { (e.target as any).src = 'https://www.figma.com/api/mcp/asset/8c0b0798-e015-40d9-bb1c-5deb42ba4283' }}
              />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-[20px] font-bold text-[#232527]">아직 등록된 체크리스트가 없어요</h2>
              <p className="text-[16px] text-[#232527] leading-relaxed">
                방체크에서<br />체크리스트를 기록해보세요
              </p>
            </div>
          </div>
          <Link 
            href="/checklist/new"
            className="w-[237px] bg-[#0A607D] text-white py-3 rounded-[6px] flex items-center justify-center gap-2 font-semibold hover:bg-[#084e6d] transition-colors"
          >
            <span className="text-xl">+</span>
            체크리스트 시작하기
          </Link>
        </div>
      </main>
    );
  }

  // 2. 방 목록이 있는 상태 (Room Grid)
  return (
    <main className="flex-1 bg-white min-h-screen">
      {/* View Toggle Bar (카드로 보기 / 지도로 보기) */}
      <div className="flex justify-center border-b border-[#E2E2E2]">
        <div className="flex gap-7">
          <button className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#232527] font-bold text-[#232527]">
            <span className="w-5 h-5">🗂️</span> 카드로 보기
          </button>
          <button className="flex items-center gap-2 px-4 py-3 text-[#A0A0A0] font-bold">
            <span className="w-5 h-5">🗺️</span> 지도로 보기
          </button>
        </div>
      </div>

      {/* Filter Bar */}
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
          📄 비교 리포트
        </Link>
      </div>

      <div className="px-10 py-5">
        <p className="text-sm font-semibold text-[#A0A0A0] mb-4">등록된 방 {rooms.length}개/6개</p>
        
        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="border border-[#E2E2E2] rounded-[6px] p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <button className="absolute top-6 right-6 text-[#BFBFBF] hover:text-red-500">🗑️</button>
              
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-[#777] text-xs">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#8E44AD]" />
                    <span>등록일시 {new Date(room.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#232527] line-clamp-1">{room.name}</h3>
                    <p className="text-xs text-[#777] flex items-center gap-1">
                      📍 {room.address}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1">
                    {room.tags.map(tag => (
                      <span key={tag} className="bg-[#F9E8F0] text-[#461A2B] text-xs font-semibold px-1 py-0.5 rounded-[2px]">
                        {tag}
                      </span>
                    ))}
                    <span className="bg-[#F9E8F0] text-[#461A2B] text-xs font-semibold px-1 py-0.5 rounded-[2px]">
                      {room.price}
                    </span>
                  </div>
                  
                  <div className="flex gap-3 text-xs text-[#232527]">
                    {room.issues.mold && <span className="flex items-center gap-1">🦠 곰팡이</span>}
                    {room.issues.leak && <span className="flex items-center gap-1">💧 누수</span>}
                    {room.issues.bug && <span className="flex items-center gap-1">🪲 벌레</span>}
                    {room.issues.etcCount > 0 && <span>+ {room.issues.etcCount}개의 문제사항</span>}
                  </div>
                </div>

                {room.memo && (
                  <p className="text-xs text-[#777] pt-5 border-t border-[#E2E2E2]">
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
