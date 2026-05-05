'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { getRooms } from '@/services/room-service';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import RoomCard from '@/components/RoomCard';
import {
  LoginRequiredModal,
  ComparisonDisabledModal,
  CustomChecklistModal
} from '@/components/ui/Modals';
import { ROUTES } from '@/lib/routes';

/**
 * 로딩 중 보여줄 스켈레톤 UI
 */
function HomeSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-white animate-pulse">
      <div className="flex justify-center border-b border-[#E2E2E2] bg-white h-[50px]">
        <div className="flex gap-7 h-full items-center">
          <div className="w-20 h-4 bg-gray-100 rounded" />
          <div className="w-20 h-4 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="border-b border-[#E2E2E2] px-4 md:px-10 py-3 flex justify-between items-center bg-white h-[60px]">
        <div className="flex gap-2.5">
          <div className="w-24 h-8 bg-gray-100 rounded-[6px]" />
          <div className="w-32 h-8 bg-gray-100 rounded-[6px]" />
        </div>
        <div className="w-24 h-8 bg-gray-100 rounded-[4px]" />
      </div>
      <div className="px-4 md:px-10 py-8 space-y-6">
        <div className="w-32 h-4 bg-gray-100 rounded mb-4" />
        <div className="w-full h-12 bg-gray-50 rounded-[8px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-60 bg-gray-50 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

// 거래방식 드롭다운
function TransactionDropdown({ 
  transactionType, 
  setTransactionType, 
  onClose 
}: { 
  transactionType: string; 
  setTransactionType: (val: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-[#E2E2E2] rounded-[12px] shadow-xl z-50 p-5 animate-in fade-in zoom-in-95 duration-150">
      <h4 className="text-[14px] font-bold text-[#232527] mb-4">거래방식</h4>
      <div className="flex gap-2">
        {['전체', '월세', '단기임대'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setTransactionType(type);
              onClose();
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer",
              transactionType === type
                ? "border border-[#0A607D] text-[#0A607D] bg-white"
                : "bg-[#F5F5F5] text-[#A0A0A0] border border-transparent"
            )}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

// 정렬 드롭다운
function SortDropdown({ 
  sortOption, 
  setSortOption, 
  onReset, 
  onClose 
}: { 
  sortOption: string; 
  setSortOption: (val: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-[#E2E2E2] rounded-[12px] shadow-xl z-50 p-5 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[14px] font-bold text-[#232527]">정렬 (중복 선택)</h4>
        <button 
          onClick={onReset}
          className="text-[11px] text-[#A0A0A0] hover:text-[#232527] transition-colors cursor-pointer flex items-center gap-0.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>
          초기화
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {['보증금 낮은순', '월세 낮은순', '관리비 낮은순'].map((option) => (
          <button
            key={option}
            onClick={() => {
              setSortOption(option);
              onClose();
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer",
              sortOption === option
                ? "border border-[#0A607D] text-[#0A607D] bg-white"
                : "bg-[#F5F5F5] text-[#A0A0A0] border border-transparent"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// 맞춤 설정 정보 바
// TODO(be): activeItemCount, customItemCount를 유저 설정 API에서 받아와야 함
function CustomizationInfoBar({ activeItemCount, customItemCount }: { activeItemCount?: number; customItemCount?: number }) {
  return (
    <div className="w-full bg-[#F5F5F5] rounded-[8px] px-[16px] py-[14px] flex items-center gap-2 mb-10 border border-[#E2E2E2]/50">
      {activeItemCount != null && (
        <span className="bg-[#777] text-white text-[12px] font-bold px-2 py-1 rounded-[4px]">
          {activeItemCount}개 항목 활성
        </span>
      )}
      {customItemCount != null && customItemCount > 0 && (
        <span className="bg-[#D9EAF0] text-[#0A607D] text-[12px] font-bold px-2 py-1 rounded-[4px]">
          + {customItemCount}개 커스텀
        </span>
      )}
    </div>
  );
}

/**
 * 01_홈화면 (SCR-HOME)
 */
export default function Home() {
  const { isLoggedIn } = useAuthStore();
  const { guestRooms, deleteGuestRoom } = useGuestRoomStore();
  const router = useRouter();
  
  // 모달 및 드롭다운 상태
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'transaction' | 'sort' | null>(null);
  
  // 필터 상태
  const [transactionType, setTransactionType] = useState('전체');
  const [sortOption, setSortOption] = useState('보증금 낮은순');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 설정
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    isFetched,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['rooms', transactionType, sortOption],
    queryFn: ({ pageParam = 0 }) => getRooms(pageParam, 6),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 6 ? allPages.length : undefined;
    },
    enabled: isLoggedIn,
    staleTime: 1000 * 60,
  });

  const apiRooms = data?.pages.flat() || [];
  const rooms = isLoggedIn ? apiRooms : guestRooms;

  // 스크롤이 끝에 닿으면 다음 페이지 로드
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && isLoggedIn) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isLoggedIn]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartChecklist = () => {
    if (!isLoggedIn) {
      // 비로그인 한도 초과 시에도 로그인 유도 모달 표시
      setIsLoginModalOpen(true);
    } else {
      const hasSeenOnboarding = localStorage.getItem('onboarding_custom_checklist');
      if (!hasSeenOnboarding) {
        setIsCustomModalOpen(true);
      } else {
        router.push(ROUTES.CHECKLIST_NEW);
      }
    }
  };

  const handleCustomSetup = () => {
    localStorage.setItem('onboarding_custom_checklist', 'true');
    setIsCustomModalOpen(false);
    router.push(ROUTES.SETTINGS);
  };

  const handleCustomLater = () => {
    localStorage.setItem('onboarding_custom_checklist', 'true');
    setIsCustomModalOpen(false);
    router.push(ROUTES.CHECKLIST_NEW);
  };

  const handleComparisonClick = (e: React.MouseEvent) => {
    if (rooms.length <= 1) {
      e.preventDefault();
      setIsComparisonModalOpen(true);
    }
  };

  const toggleDropdown = (type: 'transaction' | 'sort') => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  // 1. 로딩 상태 처리
  if (isLoggedIn && isLoading && !isFetched) {
    return <HomeSkeleton />;
  }

  return (
    <main className="flex-1 flex flex-col bg-white min-h-[calc(100vh-64px)]">
      {/* 탭 네비게이션 */}
      <div className="flex justify-center border-b border-[#E2E2E2] bg-white">
        <div className="flex gap-7">
          <button className="flex items-center gap-2 px-4 py-3 border-b-2 border-[#232527] font-bold text-[#232527] cursor-pointer">
            <div className="w-3.5 h-3.5 bg-[#232527] rounded-[2px]" />
            카드로 보기
          </button>
          <button className="flex items-center gap-2 px-4 py-3 text-[#A0A0A0] font-bold cursor-pointer hover:text-[#444] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            지도로 보기
          </button>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="border-b border-[#E2E2E2] bg-white sticky top-16 z-40">
        <div className="px-4 md:px-10 py-3 flex justify-between items-center">
          <div className="flex gap-2.5 relative" ref={dropdownRef}>
            <button 
              onClick={() => toggleDropdown('transaction')}
              className={cn(
                "border border-[#E2E2E2] rounded-[6px] px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-sm",
                activeDropdown === 'transaction' ? "border-[#0A607D] text-[#0A607D]" : "text-[#232527] hover:bg-gray-50"
              )}
            >
              거래방식 
              <svg 
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                className={cn("transition-transform duration-200", activeDropdown === 'transaction' ? "rotate-0" : "rotate-180")}
              >
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </button>
            <button 
              onClick={() => toggleDropdown('sort')}
              className={cn(
                "border border-[#E2E2E2] rounded-[6px] px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-sm",
                activeDropdown === 'sort' ? "border-[#0A607D] text-[#0A607D]" : "text-[#0A607D] hover:bg-gray-50"
              )}
            >
              {transactionType} ({sortOption})
              <svg 
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                className={cn("transition-transform duration-200", activeDropdown === 'sort' ? "rotate-0" : "rotate-180")}
              >
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </button>
            
            {activeDropdown === 'transaction' && (
              <TransactionDropdown 
                transactionType={transactionType} 
                setTransactionType={setTransactionType}
                onClose={() => setActiveDropdown(null)}
              />
            )}
            {activeDropdown === 'sort' && (
              <SortDropdown 
                sortOption={sortOption} 
                setSortOption={setSortOption}
                onReset={() => setSortOption('보증금 낮은순')}
                onClose={() => setActiveDropdown(null)}
              />
            )}
          </div>
          
          <Link 
            href={ROUTES.REPORT}
            onClick={handleComparisonClick}
            className={cn(
              "px-4 py-2 rounded-[4px] text-[12px] font-semibold flex items-center gap-2 transition-all shadow-sm",
              rooms.length <= 1 
                ? "bg-[#BFBFBF] text-white cursor-not-allowed" 
                : "bg-[#0A607D] text-white hover:bg-[#084e6d] cursor-pointer"
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            비교 리포트
          </Link>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        <div className="w-full px-4 md:px-10 py-8">
          <div className="flex justify-between items-center mb-5">
            <p className="text-[14px] font-bold text-[#A0A0A0]">
              등록된 방 {rooms.length}개{ !isLoggedIn && '/2개' }
            </p>
            <button 
              onClick={handleStartChecklist}
              className="text-[15px] font-bold text-[#0A607D] flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span className="text-[20px] leading-none mb-0.5">+</span>
              추가하기
            </button>
          </div>

          {/* TODO(be): activeItemCount, customItemCount를 API에서 주입 필요 */}
          {isLoggedIn && <CustomizationInfoBar />}

          {((isFetched || !isLoggedIn) && rooms.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex flex-col items-center gap-[40px] max-w-[320px]">
                <div className="flex flex-col items-center gap-[28px]">
                  <div className="w-[100px] h-[100px] relative">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#E2E2E2" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>
                  </div>
                  <div className="text-center space-y-4">
                    <h2 className="text-[22px] font-bold text-[#232527] leading-tight tracking-tight">
                      아직 등록된 체크리스트가 없어요
                    </h2>
                    <div className="text-[16px] text-[#232527] font-medium leading-relaxed opacity-60">
                      <p>방체크에서</p>
                      <p>체크리스트를 기록해보세요</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleStartChecklist}
                  className="w-[260px] bg-[#0A607D] text-white py-[14px] rounded-[8px] flex items-center justify-center gap-[10px] font-bold text-[18px] hover:bg-[#084e6d] transition-all active:scale-[0.98] cursor-pointer shadow-md"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  체크리스트 시작하기
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  onClick={(id) => router.push(`/checklist/${id}`)}
                  onDelete={(id) => {
                    if (!isLoggedIn) {
                      deleteGuestRoom(id);
                    } else {
                      // TODO: Implement API delete logic
                      console.log('Delete room:', id);
                    }
                  }}
                />
              ))}
              
              {/* 무한 스크롤 관찰 대상 */}
              {isLoggedIn && (
                <div ref={ref} className="col-span-full h-20 flex items-center justify-center">
                  {isFetchingNextPage && (
                    <div className="w-6 h-6 border-2 border-[#0A607D]/30 border-t-[#0A607D] rounded-full animate-spin" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <LoginRequiredModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onContinueAsGuest={() => {
          setIsLoginModalOpen(false);
          router.push(ROUTES.CHECKLIST_NEW);
        }}
        onLogin={() => {
          setIsLoginModalOpen(false);
          router.push(ROUTES.LOGIN);
        }}
      />

      <ComparisonDisabledModal 
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        onStartChecklist={() => {
          setIsComparisonModalOpen(false);
          router.push(ROUTES.CHECKLIST_NEW);
        }}
      />

      <CustomChecklistModal 
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onLater={handleCustomLater}
        onSetup={handleCustomSetup}
      />
    </main>
  );
}
