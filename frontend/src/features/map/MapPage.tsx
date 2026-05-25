import { useState, useRef, useEffect, useMemo } from 'react';
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

const IconSearch = ({ size = 18, color = '#A0A0A0' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const IconSiPin = ({ size = 16, color = '#777' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
);

const IconSolarPin = ({ size = 18, color = '#0a607d' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C7.589 2 4 5.589 4 9.995 3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12 0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
  </svg>
);

const IconTrain = ({ size = 18, color = '#fff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z" />
  </svg>
);

const IconReset = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IconReport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-6 14H7v-2h6v2zm4-4H7v-2h10v2zm0-4H7V7h10v2z" />
  </svg>
);

const IconCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="3" width="9" height="9" rx="1" />
    <rect x="13" y="3" width="9" height="9" rx="1" />
    <rect x="2" y="14" width="9" height="9" rx="1" />
    <rect x="13" y="14" width="9" height="9" rx="1" />
  </svg>
);

const IconMapTab = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

// 핀 라벨 — 지도 위에 떠 있는 카드/지하철역 표시
function PinLabel({
  variant = 'room',
  selected = false,
  children,
  style,
}: {
  variant?: 'room' | 'station' | 'landmark';
  selected?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  if (variant === 'station') {
    return (
      <div
        className="absolute bg-[#232527] px-[16px] py-[10px] rounded-[4px] flex items-center gap-[10px] shadow-[0_8px_2px_rgba(0,0,0,0.29)] whitespace-nowrap"
        style={style}
      >
        <IconTrain size={18} />
        <span className="font-bold text-[14px] text-white leading-[1.3]">{children}</span>
      </div>
    );
  }
  if (variant === 'landmark') {
    return (
      <div
        className="absolute bg-brand-primary px-[16px] py-[10px] rounded-[4px] flex items-center gap-[10px] shadow-[0_8px_2px_rgba(0,0,0,0.29)] whitespace-nowrap"
        style={style}
      >
        <IconSolarPin size={18} color="#fff" />
        <span className="font-bold text-[14px] text-white leading-[1.3]">{children}</span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        'absolute bg-white px-[16px] py-[10px] rounded-[4px] flex items-center gap-[10px] shadow-[0_8px_2px_rgba(0,0,0,0.29)] whitespace-nowrap',
        selected && 'border-2 border-[#004cbd]'
      )}
      style={style}
    >
      <span
        className={cn(
          'inline-block w-[10px] h-[10px] rounded-full',
          selected ? 'bg-[#004cbd]' : 'bg-text-main'
        )}
      />
      <span className={cn('text-[14px] text-text-main leading-[1.3]', selected ? 'font-bold' : 'font-semibold')}>
        {children}
      </span>
    </div>
  );
}

// 룸 카드 (Compact + Landmark) — 데스크톱 그리드용
function MapRoomCardCompact({
  registeredAt,
  title,
  address,
  landmarkDistance,
  dotColor = '#004cbd',
}: {
  registeredAt: string;
  title: string;
  address: string;
  landmarkDistance: string;
  dotColor?: string;
}) {
  return (
    <article className="bg-white border border-border-light rounded-[6px] shadow-[0_6px_8px_rgba(0,0,0,0.04)] flex items-center justify-between p-[24px] w-full max-w-[378px]">
      <div className="flex flex-col gap-[12px] items-start min-w-0">
        <div className="flex items-center gap-[12px]">
          <span className="w-[14px] h-[14px] rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          <div className="flex gap-[4px] items-center text-[12px] text-text-mute leading-[1.3]">
            <span>등록일시</span>
            <span>{registeredAt}</span>
          </div>
        </div>
        <div className="flex flex-col gap-[4px] items-start min-w-0">
          <p className="font-semibold text-[18px] text-text-main leading-[1.3] truncate">{title}</p>
          <div className="flex gap-[4px] items-center">
            <IconSiPin size={16} color="#777" />
            <p className="text-[12px] text-text-mute leading-[1.3] truncate">{address}</p>
          </div>
        </div>
        <div className="flex gap-[4px] items-center">
          <IconSolarPin size={18} color="#0a607d" />
          <p className="font-medium text-[12px] text-brand-primary leading-[1.3]">{landmarkDistance}</p>
        </div>
      </div>
      <button
        type="button"
        aria-label="펼치기"
        className="shrink-0 w-[36px] h-[36px] flex items-center justify-center cursor-pointer hover:bg-bg-gray rounded transition-colors"
      >
        <IconChevronRight />
      </button>
    </article>
  );
}

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

// Haversine 거리 계산 (km)
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TRANSACTION_CHIPS = ['전체', '전세', '월세', '단기'] as const;
type TransactionChip = (typeof TRANSACTION_CHIPS)[number];

// RoomType → chip 매핑
const TYPE_TO_CHIP: Record<string, TransactionChip> = {
  '전세': '전세',
  '월세': '월세',
  '단기임대': '단기',
};

const SORT_OPTIONS = [
  '거래방식 (정렬)',
  '월세 (보증금 낮은순)',
  '월세 (보증금 높은순)',
  '기준점 거리 가까운순',
  '기준점 거리 먼순',
] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const DEFAULT_SORT: SortOption = '거래방식 (정렬)';

export default function MapPage() {
  const { isLoggedIn } = useAuthStore();
  const { guestRooms } = useGuestRoomStore();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState('연세대학교');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionChip>('전체');
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 트랙 B가 landmark state를 제공할 때까지 null — 거리 정렬 disabled
  const landmark = null as { lat: number; lng: number } | null;

  const filterRef = useRef<HTMLDivElement>(null);

  const { data: apiRoomsData } = useRoomsList();
  const apiRooms = apiRoomsData ?? [];
  const rooms = isLoggedIn ? apiRooms : guestRooms;

  const isGuestAtLimit = !isLoggedIn && guestRooms.length >= GUEST_ROOM_LIMIT;

  const roomsWithAddress = rooms.filter((r) => {
    const raw = r as unknown as Record<string, unknown>;
    return raw['address'] || raw['addressDetail'];
  });

  // 거래방식 필터 → useMemo
  const filtered = useMemo(() => {
    if (transactionType === '전체') return roomsWithAddress;
    return roomsWithAddress.filter((r) => {
      const raw = r as unknown as Record<string, unknown>;
      const roomTypeValue = (raw['type'] ?? raw['transactionType'] ?? '') as string;
      return TYPE_TO_CHIP[roomTypeValue] === transactionType;
    });
  }, [roomsWithAddress, transactionType]);

  // 정렬 → useMemo
  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortOption === '월세 (보증금 낮은순)') {
      list.sort((a, b) => {
        const ra = a as unknown as Record<string, unknown>;
        const rb = b as unknown as Record<string, unknown>;
        return ((ra['deposit'] as number) ?? 0) - ((rb['deposit'] as number) ?? 0);
      });
    } else if (sortOption === '월세 (보증금 높은순)') {
      list.sort((a, b) => {
        const ra = a as unknown as Record<string, unknown>;
        const rb = b as unknown as Record<string, unknown>;
        return ((rb['deposit'] as number) ?? 0) - ((ra['deposit'] as number) ?? 0);
      });
    } else if (sortOption === '기준점 거리 가까운순' && landmark) {
      list.sort((a, b) => {
        const ra = a as unknown as Record<string, unknown>;
        const rb = b as unknown as Record<string, unknown>;
        const da = distanceKm(landmark.lat, landmark.lng, (ra['lat'] as number) ?? 0, (ra['lng'] as number) ?? 0);
        const db = distanceKm(landmark.lat, landmark.lng, (rb['lat'] as number) ?? 0, (rb['lng'] as number) ?? 0);
        return da - db;
      });
    } else if (sortOption === '기준점 거리 먼순' && landmark) {
      list.sort((a, b) => {
        const ra = a as unknown as Record<string, unknown>;
        const rb = b as unknown as Record<string, unknown>;
        const da = distanceKm(landmark.lat, landmark.lng, (ra['lat'] as number) ?? 0, (ra['lng'] as number) ?? 0);
        const db = distanceKm(landmark.lat, landmark.lng, (rb['lat'] as number) ?? 0, (rb['lng'] as number) ?? 0);
        return db - da;
      });
    }
    return list;
  }, [filtered, sortOption, landmark]);

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

  const handleReset = () => {
    setTransactionType('전체');
    setSortOption(DEFAULT_SORT);
  };

  const roomLimit = isLoggedIn ? ROOM_LIMIT : GUEST_ROOM_LIMIT;
  const totalRooms = rooms.length;
  const showEmpty = roomsWithAddress.length === 0;
  const isDistanceSortDisabled = !landmark;

  return (
    <main className="flex-1 flex flex-col bg-white">

      {/* 탭 — 카드 / 지도 */}
      <div className="flex justify-center gap-[28px] border-b border-border-light bg-white lg:border-b-0">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="flex items-center gap-[10px] px-[16px] py-[12px] text-text-caption font-bold text-[16px] cursor-pointer hover:text-text-sub transition-colors"
        >
          <IconCard />
          카드로 보기
        </button>
        <button
          className="flex items-center gap-[10px] px-[16px] py-[12px] border-b-2 border-text-main font-bold text-text-main text-[16px] cursor-default"
        >
          <IconMapTab />
          지도로 보기
        </button>
      </div>

      {/* 필터 바 — Desktop: 거래방식 칩 + 기준점 검색 + Sort + Reset + 비교 리포트 */}
      <div className="hidden lg:flex border border-border-light items-center justify-between px-[40px] py-[12px] w-full">
        <div className="flex gap-[10px] items-center flex-wrap">
          {/* 거래방식 칩 — SCR-MAP-FILTER-001 */}
          <div className="flex gap-[6px] items-center">
            {TRANSACTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setTransactionType(chip)}
                className={cn(
                  'h-[36px] px-[14px] rounded-[18px] text-[14px] font-semibold transition-colors cursor-pointer whitespace-nowrap',
                  transactionType === chip
                    ? 'bg-brand-primary text-white'
                    : 'bg-white border border-border-mute text-text-sub hover:border-brand-primary'
                )}
              >
                {chip}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="bg-white border border-border-mute rounded-[6px] h-[36px] px-[12px] py-[6px] flex items-center gap-[10px] w-[217px] cursor-pointer hover:border-brand-primary transition-colors"
          >
            <span className={cn('flex-1 text-left text-[14px] font-medium leading-[1.3]', searchValue ? 'text-brand-primary' : 'text-text-caption')}>
              {searchValue || '원하는 기준점을 입력해주세요'}
            </span>
            <IconSearch size={18} />
          </button>

          {/* 정렬 드롭다운 — SCR-MAP-FILTER-002 */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-white border border-border-mute rounded-[6px] h-[36px] px-[12px] py-[6px] flex items-center gap-[4px] cursor-pointer hover:border-brand-primary transition-colors"
            >
              <span className="text-[14px] font-medium text-brand-primary leading-[1.3] whitespace-nowrap">{sortOption}</span>
              <span className={cn('transition-transform', isFilterOpen ? 'rotate-180' : '')}>
                <IconChevronDown />
              </span>
            </button>
            {isFilterOpen && (
              <div className="absolute left-0 top-full mt-2 bg-white border border-border-light rounded-[6px] shadow-lg z-50 p-2 min-w-[210px]">
                {SORT_OPTIONS.map((opt) => {
                  const isDistanceOpt = opt === '기준점 거리 가까운순' || opt === '기준점 거리 먼순';
                  const disabled = isDistanceOpt && isDistanceSortDisabled;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={disabled}
                      onClick={() => { setSortOption(opt); setIsFilterOpen(false); }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-[14px] rounded transition-colors cursor-pointer',
                        sortOption === opt ? 'text-brand-primary font-semibold' : 'text-text-main',
                        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-bg-gray'
                      )}
                    >
                      {opt}
                      {disabled && <span className="ml-1 text-[11px] text-text-caption">(기준점 필요)</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 초기화 — SCR-MAP-FILTER-003 */}
          <button
            type="button"
            onClick={handleReset}
            className="bg-white border border-border-mute rounded-[6px] h-[36px] px-[12px] py-[6px] flex items-center gap-[10px] cursor-pointer hover:border-brand-primary transition-colors"
          >
            <IconReset />
            <span className="text-[12px] font-semibold text-text-main leading-[1.3]">초기화</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.REPORT)}
          disabled={showEmpty}
          className="bg-text-main h-[32px] px-[16px] py-[8px] rounded-[4px] flex items-center gap-[10px] cursor-pointer hover:bg-bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconReport />
          <span className="text-[12px] font-semibold text-white leading-[1.3]">비교 리포트</span>
        </button>
      </div>

      {/* 모바일 검색 바 */}
      <div className="lg:hidden border-b border-border-light px-[16px] py-[12px]">
        <div className="flex items-center h-[44px] bg-white border border-border-mute rounded-[6px] pl-[16px] pr-[4px]">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="원하는 기준점을 입력해주세요."
            className="flex-1 text-[15px] text-text-main placeholder:text-text-caption bg-transparent outline-none"
          />
          <button className="p-[10px] flex items-center justify-center cursor-pointer" type="button">
            <IconSearch size={20} />
          </button>
        </div>
      </div>

      {/* 카운터 */}
      <div className="flex items-center justify-between px-[16px] lg:px-[40px] py-[12px] lg:py-[20px] border-b border-border-light lg:border-b-[#a0a0a0]">
        <p className="text-[14px] font-semibold text-text-caption">
          등록된 방 {totalRooms}개/{roomLimit}개
        </p>
        {/* 모바일 sort */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-[4px] border border-border-mute rounded-[6px] pl-[12px] pr-[8px] py-[6px] text-[14px] font-medium text-text-sub bg-white cursor-pointer"
            type="button"
          >
            {sortOption}
            <span className={cn('transition-transform duration-200', isFilterOpen ? 'rotate-180' : '')}>
              <IconChevronDown />
            </span>
          </button>
        </div>
      </div>

      {/* 지도 영역 */}
      {showEmpty ? (
        <MapEmptyState onStart={handleStartChecklist} />
      ) : (
        <>
          {/* TODO(E11-S02): react-naver-maps 통합 — 현재는 placeholder + 오버레이 데모 */}
          <div className="relative w-full h-[661px] bg-bg-gray overflow-hidden">
            {/* 지도 placeholder grid */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  'linear-gradient(#e2e2e2 1px, transparent 1px), linear-gradient(90deg, #e2e2e2 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
              aria-hidden
            />
            <p className="absolute top-4 left-1/2 -translate-x-1/2 text-text-caption text-[12px] bg-white/80 px-2 py-1 rounded">
              지도 영역 (NCP Maps 연동 대기 — E11-S02)
            </p>

            {/* 오버레이 — Figma 노드 좌표 비율로 배치 (1440 폭 기준) */}
            {/* 룸 핀 라벨 */}
            <PinLabel selected style={{ left: '31.7%', top: '39.5%' }}>홍제동 (컨디션 별로, 위치 굳)</PinLabel>
            <PinLabel style={{ left: '57.3%', top: '38.3%' }}>홍제동 (컨디션 별로, 위치 굳)</PinLabel>
            <PinLabel style={{ left: '60.9%', top: '50.7%' }}>홍제동 (컨디션 별로, 위치 굳)</PinLabel>

            {/* 지하철역 (다크) */}
            <PinLabel variant="station" style={{ left: '20.4%', top: '54.9%' }}>신촌역</PinLabel>
            <PinLabel variant="station" style={{ left: '28.9%', top: '52.5%' }}>이대역</PinLabel>
            <PinLabel variant="station" style={{ left: '46.4%', top: '37.7%' }}>서대문역</PinLabel>
            <PinLabel variant="station" style={{ left: '49.9%', top: '53.5%' }}>서울역</PinLabel>
            <PinLabel variant="station" style={{ left: '77.4%', top: '45.6%' }}>종로5가역</PinLabel>
            <PinLabel variant="station" style={{ left: '81.4%', top: '24.7%' }}>동대입구역</PinLabel>

            {/* 랜드마크 (브랜드 파랑) */}
            <PinLabel variant="landmark" style={{ left: '22.6%', top: '35.7%' }}>연세대학교</PinLabel>

            {/* 줌 컨트롤 */}
            <div className="absolute right-[10px] top-[10px] flex flex-col gap-[10px] w-[32px]">
              <button
                type="button"
                aria-label="현재 위치"
                className="bg-white border border-text-main rounded-[4px] h-[32px] flex items-center justify-center hover:bg-bg-gray transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
              </button>
              <div className="bg-white border border-text-main rounded-[4px] flex flex-col items-center justify-between p-[8px] h-[58px]">
                <button type="button" aria-label="확대" className="cursor-pointer hover:opacity-70">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#232527"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                </button>
                <div className="w-[16px] h-px bg-border-light" />
                <button type="button" aria-label="축소" className="cursor-pointer hover:opacity-70">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#232527"><path d="M19 13H5v-2h14v2z" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* 카드 그리드 — Desktop 3-col / Tablet 2-col / Mobile 1-col */}
          <div className="border-t border-[#a0a0a0] px-[16px] lg:px-[40px] pt-[20px] lg:pt-[32px] pb-[20px] lg:pb-[32px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
              {sorted.map((r) => {
                const raw = r as unknown as Record<string, unknown>;
                return (
                  <MapRoomCardCompact
                    key={r.id}
                    registeredAt={(raw['registeredAt'] as string) ?? ''}
                    title={(raw['title'] as string) ?? (raw['name'] as string) ?? ''}
                    address={r.address ?? ''}
                    landmarkDistance={(raw['landmarkDistance'] as string) ?? ''}
                  />
                );
              })}
            </div>
          </div>
        </>
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
