import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useRoomsList, useDeleteRoom } from '@/features/rooms/hooks/useRoomsQuery';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { GUEST_ROOM_LIMIT, STORAGE_KEY_ONBOARDING } from '@/lib/constants';
import RoomCard from '@/components/RoomCard';
import {
  LoginRequiredModal,
  ComparisonDisabledModal,
  CustomChecklistModal,
} from '@/components/ui/Modals';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function RoomsPageSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-white animate-pulse">
      <div className="flex justify-center border-b border-border-light bg-white h-[50px]">
        <div className="flex gap-7 h-full items-center">
          <div className="w-20 h-4 bg-gray-100 rounded" />
          <div className="w-20 h-4 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="border-b border-border-light px-4 md:px-10 py-3 flex justify-between items-center bg-white h-[60px]">
        <div className="w-36 h-8 bg-gray-100 rounded-[6px]" />
        <div className="w-24 h-8 bg-gray-100 rounded-[4px]" />
      </div>
      <div className="px-4 md:px-10 py-8 space-y-6">
        <div className="w-32 h-4 bg-gray-100 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-60 bg-gray-50 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex items-center justify-center py-[120px]">
      <div className="flex flex-col items-center gap-[40px] w-[256px]">
        <div className="flex flex-col items-center gap-[28px]">
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#BFBFBF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M9 14l2 2 4-4" />
          </svg>
          <p className="text-[20px] font-bold text-text-main text-center leading-[1.3]">
            아직 등록된 체크리스트가 없어요
          </p>
          <div className="text-[16px] text-text-main text-center leading-[1.3]">
            <p>방체크에서</p>
            <p>체크리스트를 기록해보세요</p>
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-[237px] bg-brand-primary text-white py-[12px] px-[10px] rounded-[6px] flex items-center justify-center gap-[10px] font-semibold text-[16px] hover:bg-brand-primary-dark transition-colors cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          체크리스트 시작하기
        </button>
      </div>
    </div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function TransactionDropdown({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-border-light rounded-[12px] shadow-xl z-50 p-5 animate-in fade-in zoom-in-95 duration-150">
      <h4 className="text-[14px] font-bold text-text-main mb-4">거래방식</h4>
      <div className="flex gap-2">
        {['전체', '전세', '월세', '단기임대'].map((type) => (
          <button
            key={type}
            onClick={() => { onChange(type); onClose(); }}
            className={cn(
              'px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer',
              value === type
                ? 'border border-brand-primary text-brand-primary bg-white'
                : 'bg-bg-gray text-text-caption border border-transparent'
            )}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
  onReset,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-border-light rounded-[12px] shadow-xl z-50 p-5 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[14px] font-bold text-text-main">정렬</h4>
        <button onClick={onReset} className="text-[11px] text-text-caption hover:text-text-main transition-colors cursor-pointer">
          초기화
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {['보증금 낮은순', '월세 낮은순', '관리비 낮은순'].map((opt) => (
          <button
            key={opt}
            onClick={() => { onChange(opt); onClose(); }}
            className={cn(
              'px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer',
              value === opt
                ? 'border border-brand-primary text-brand-primary bg-white'
                : 'bg-bg-gray text-text-caption border border-transparent'
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── RoomsPage ────────────────────────────────────────────────────────────────

export default function RoomsPage() {
  const { isLoggedIn } = useAuthStore();
  const { guestRooms, deleteGuestRoom } = useGuestRoomStore();
  const navigate = useNavigate();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'transaction' | 'sort' | null>(null);
  const [transactionType, setTransactionType] = useState('전체');
  const [sortOption, setSortOption] = useState('보증금 낮은순');

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: apiRoomsData, isLoading, isFetched } =
    useRoomsList(transactionType, sortOption);

  const { mutate: deleteRoomById } = useDeleteRoom();

  const apiRooms = apiRoomsData ?? [];

  const guestFiltered = (() => {
    let list = [...guestRooms];
    if (transactionType !== '전체') {
      list = list.filter((r) => r.type === transactionType);
    }
    if (sortOption === '보증금 낮은순') list.sort((a, b) => (a.deposit ?? 0) - (b.deposit ?? 0));
    else if (sortOption === '월세 낮은순') list.sort((a, b) => (a.rent ?? 0) - (b.rent ?? 0));
    else if (sortOption === '관리비 낮은순') list.sort((a, b) => (a.managementFee ?? 0) - (b.managementFee ?? 0));
    return list;
  })();

  const rooms = isLoggedIn ? apiRooms : guestFiltered;
  const isGuestAtLimit = !isLoggedIn && guestRooms.length >= GUEST_ROOM_LIMIT;

  // 로그인 상태 + 방 목록 없음 → 온보딩 모달 노출
  useEffect(() => {
    if (isLoggedIn && isFetched && rooms.length === 0 && !localStorage.getItem(STORAGE_KEY_ONBOARDING)) {
      setIsCustomModalOpen(true);
    }
  }, [isLoggedIn, isFetched, rooms.length]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartChecklist = () => {
    if (!isLoggedIn) {
      if (isGuestAtLimit) {
        setIsLoginModalOpen(true);
        return;
      }
      navigate(ROUTES.CHECKLIST_NEW);
      return;
    }
    const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY_ONBOARDING);
    if (!hasSeenOnboarding) {
      setIsCustomModalOpen(true);
    } else {
      navigate(ROUTES.CHECKLIST_NEW);
    }
  };

  const handleComparisonClick = (e: React.MouseEvent) => {
    if (rooms.length <= 1) {
      e.preventDefault();
      setIsComparisonModalOpen(true);
    }
  };

  const handleDeleteRoom = (id: string) => {
    if (isLoggedIn) {
      deleteRoomById(id);
    } else {
      deleteGuestRoom(id);
    }
  };

  if (isLoggedIn && isLoading && !isFetched) {
    return <RoomsPageSkeleton />;
  }

  const showEmpty = (isFetched || !isLoggedIn) && rooms.length === 0;

  return (
    <main className="flex-1 flex flex-col bg-white min-h-[calc(100vh-64px)]">

      {/* 서브 탭 (카드로 보기 / 지도로 보기) */}
      <div className="flex justify-center border-b border-border-light bg-white">
        <div className="flex gap-7">
          <button className="flex items-center gap-[10px] px-[16px] py-[12px] border-b-2 border-text-main font-bold text-text-main text-fluid-xl cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="9" height="9" rx="1" /><rect x="13" y="3" width="9" height="9" rx="1" /><rect x="2" y="14" width="9" height="9" rx="1" /><rect x="13" y="14" width="9" height="9" rx="1" /></svg>
            카드로 보기
          </button>
          <button className="flex items-center gap-[10px] px-[16px] py-[12px] text-text-caption font-bold text-fluid-xl cursor-pointer hover:text-text-sub transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
            지도로 보기
          </button>
        </div>
      </div>

      {/* 필터 바 */}
      <div className="border-b border-border-light bg-white sticky top-14 md:top-16 z-40">
        <div className="px-4 md:px-10 lg:px-20 py-3 flex justify-between items-center max-w-screen-2xl mx-auto w-full">
          <div className="flex gap-2.5 relative" ref={dropdownRef}>
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'transaction' ? null : 'transaction')}
              className={cn(
                'border rounded-[6px] px-3 py-1.5 text-fluid-md font-medium flex items-center gap-1.5 transition-all cursor-pointer bg-white',
                activeDropdown === 'transaction' || transactionType !== '전체'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-border-mute text-text-sub'
              )}
            >
              거래방식{transactionType !== '전체' ? ` · ${transactionType}` : ''}
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={cn('transition-transform duration-200', activeDropdown === 'transaction' ? 'rotate-180' : '')}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <button
              onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
              className={cn(
                'border rounded-[6px] px-3 py-1.5 text-fluid-md font-medium flex items-center gap-1.5 transition-all cursor-pointer bg-white',
                activeDropdown === 'sort' || sortOption !== '보증금 낮은순'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-border-mute text-text-sub'
              )}
            >
              정렬 · {sortOption}
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={cn('transition-transform duration-200', activeDropdown === 'sort' ? 'rotate-180' : '')}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {activeDropdown === 'transaction' && (
              <TransactionDropdown
                value={transactionType}
                onChange={setTransactionType}
                onClose={() => setActiveDropdown(null)}
              />
            )}
            {activeDropdown === 'sort' && (
              <SortDropdown
                value={sortOption}
                onChange={setSortOption}
                onReset={() => setSortOption('보증금 낮은순')}
                onClose={() => setActiveDropdown(null)}
              />
            )}
          </div>

          <Link
            to={ROUTES.REPORT}
            onClick={handleComparisonClick}
            className={cn(
              'h-[32px] px-[16px] py-[8px] rounded-[4px] text-fluid-base font-semibold flex items-center gap-[10px] transition-all',
              rooms.length <= 1
                ? 'bg-border-mute text-white cursor-not-allowed pointer-events-none'
                : 'bg-brand-primary text-white hover:bg-brand-primary-dark cursor-pointer'
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 13h8v1H8v-1zm0 3h8v1H8v-1zm0-6h5v1H8v-1z" /></svg>
            비교 리포트
          </Link>
        </div>
      </div>

      {/* 방 카운터 + 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col px-4 md:px-10 lg:px-20 pb-10 max-w-screen-2xl mx-auto w-full">
        <p className="text-fluid-lg font-semibold text-text-caption py-5">
          등록된 방 {rooms.length}개{!isLoggedIn ? `/${GUEST_ROOM_LIMIT}개` : ''}
        </p>
        {showEmpty ? (
          <EmptyState onStart={handleStartChecklist} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onClick={(id) => navigate(ROUTES.CHECKLIST_DETAIL(id))}
                onDelete={handleDeleteRoom}
              />
            ))}
          </div>
        )}
      </div>

      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onContinueAsGuest={() => {
          setIsLoginModalOpen(false);
          navigate(ROUTES.CHECKLIST_NEW);
        }}
        onLogin={() => {
          setIsLoginModalOpen(false);
          navigate(ROUTES.LOGIN);
        }}
      />

      <ComparisonDisabledModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        onStartChecklist={() => {
          setIsComparisonModalOpen(false);
          navigate(ROUTES.CHECKLIST_NEW);
        }}
      />

      <CustomChecklistModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onLater={() => {
          localStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
          setIsCustomModalOpen(false);
          navigate(ROUTES.CHECKLIST_NEW);
        }}
        onSetup={() => {
          localStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
          setIsCustomModalOpen(false);
          navigate(ROUTES.SETTINGS);
        }}
      />
    </main>
  );
}
