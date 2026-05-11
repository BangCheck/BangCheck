import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useRoomsList } from '@/features/rooms/hooks/use-rooms-query';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { GUEST_ROOM_LIMIT, ROOM_LIMIT } from '@/lib/constants';
import { LoginRequiredModal } from '@/components/ui/Modals';

const IconMapPin = () => (
  <svg width="82" height="82" viewBox="0 0 24 24" fill="none" stroke="#BFBFBF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

function MapEmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[10px] py-[80px]">
      <IconMapPin />
      <div className="flex flex-col gap-[6px] items-center text-center mt-2">
        <p className="text-[18px] font-bold text-text-main leading-[1.3]">주소가 등록된 방이 없어요</p>
        <p className="text-[15px] text-text-caption leading-[1.3]">방 체크리스트에서 주소를 입력해주세요</p>
      </div>
      <button
        onClick={onStart}
        className="mt-4 bg-brand-primary text-white px-[16px] py-[12px] rounded-[6px] flex items-center gap-[8px] font-semibold text-[16px] hover:bg-brand-primary-dark transition-colors cursor-pointer"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        체크리스트 시작하기
      </button>
    </div>
  );
}

export default function MapPage() {
  const { isLoggedIn } = useAuthStore();
  const { guestRooms } = useGuestRoomStore();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('거래방식 (정렬)');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  const { data: apiRoomsData } = useRoomsList();
  const apiRooms = apiRoomsData ?? [];
  const rooms = isLoggedIn ? apiRooms : guestRooms;

  const isGuestAtLimit = !isLoggedIn && guestRooms.length >= GUEST_ROOM_LIMIT;

  // 주소가 있는 방만 필터 (address 필드가 있을 때)
  const roomsWithAddress = rooms.filter((r) => {
    const raw = r as unknown as Record<string, unknown>;
    return raw['address'] || raw['addressDetail'];
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartChecklist = () => {
    if (!isLoggedIn && isGuestAtLimit) {
      setIsLoginModalOpen(true);
      return;
    }
    navigate(ROUTES.CHECKLIST_NEW);
  };

  const roomLimit = isLoggedIn ? ROOM_LIMIT : GUEST_ROOM_LIMIT;
  const showEmpty = roomsWithAddress.length === 0;

  return (
    <main className="flex-1 flex flex-col bg-white min-h-[calc(100vh-64px)]">

      {/* 탭 — 지도로 보기 활성 */}
      <div className="flex border-b border-border-light bg-white">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="flex flex-1 items-center justify-center gap-[10px] px-[16px] py-[12px] text-text-caption font-semibold text-[16px] cursor-pointer hover:text-text-sub transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="3" width="9" height="9" rx="1" />
            <rect x="13" y="3" width="9" height="9" rx="1" />
            <rect x="2" y="14" width="9" height="9" rx="1" />
            <rect x="13" y="14" width="9" height="9" rx="1" />
          </svg>
          카드로 보기
        </button>
        <button
          className="flex flex-1 items-center justify-center gap-[10px] px-[16px] py-[12px] border-b-2 border-text-main font-semibold text-text-main text-[16px] cursor-default"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          지도로 보기
        </button>
      </div>

      {/* 검색 바 */}
      <div className="border-b border-border-light px-[16px] py-[12px]">
        <div className="flex items-center h-[44px] bg-white border border-[#BFBFBF] rounded-[6px] pl-[16px] pr-[4px]">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="원하는 기준점을 입력해주세요."
            className="flex-1 text-[15px] text-text-main placeholder:text-text-caption bg-transparent outline-none"
          />
          <button className="p-[10px] flex items-center justify-center cursor-pointer">
            <IconSearch />
          </button>
        </div>
      </div>

      {/* 방 개수 + 필터 */}
      <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-border-light">
        <p className="text-[14px] font-semibold text-text-caption">
          등록된 방 {rooms.length}개/{roomLimit}개
        </p>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-[4px] border border-[#BFBFBF] rounded-[6px] pl-[12px] pr-[8px] py-[6px] text-[14px] font-medium text-text-sub bg-white cursor-pointer hover:border-brand-primary transition-colors"
          >
            {sortOption}
            <span className={cn('transition-transform duration-200', isFilterOpen ? 'rotate-180' : '')}>
              <IconChevronDown />
            </span>
          </button>
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-max bg-white border border-border-light rounded-[12px] shadow-xl z-50 p-5 animate-in fade-in zoom-in-95 duration-150">
              <h4 className="text-[14px] font-bold text-text-main mb-4">거래방식 (정렬)</h4>
              <div className="flex flex-wrap gap-2">
                {['전체', '전세', '월세', '단기임대'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortOption(opt === '전체' ? '거래방식 (정렬)' : opt); setIsFilterOpen(false); }}
                    className={cn(
                      'px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap',
                      sortOption === opt
                        ? 'border border-brand-primary text-brand-primary bg-white'
                        : 'bg-bg-gray text-text-caption border border-transparent'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 지도 영역 or 빈 상태 */}
      {showEmpty ? (
        <MapEmptyState onStart={handleStartChecklist} />
      ) : (
        <div className="flex-1 bg-bg-gray flex items-center justify-center">
          <p className="text-text-caption text-[14px]">지도 준비 중...</p>
        </div>
      )}

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
    </main>
  );
}
