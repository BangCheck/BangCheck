import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useRoomsList } from '@/features/rooms/hooks/use-rooms-query';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { GUEST_ROOM_LIMIT, ROOM_LIMIT } from '@/lib/constants';
import { LoginRequiredModal } from '@/components/ui/Modals';

// 기준점 타입 — 트랙 A가 참조할 수 있도록 export
export interface LandmarkSelection {
  name: string;
  lat: number;
  lng: number;
}

const LANDMARK_STORAGE_KEY = 'landmark-selection';

const LANDMARK_PRESETS: LandmarkSelection[] = [
  { name: '연세대학교', lat: 37.5651, lng: 126.9385 },
  { name: '이화여자대학교', lat: 37.5620, lng: 126.9469 },
  { name: '신촌역', lat: 37.5551, lng: 126.9368 },
  { name: '이대역', lat: 37.5567, lng: 126.9462 },
  { name: '서울역', lat: 37.5547, lng: 126.9707 },
];

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

// Figma 노드 587:31796 — 데스크톱 데모용 더미 데이터
// TODO(E11-S02): roomsWithAddress + NCP geocoding 응답 → 실제 좌표/거리로 대체
const DEMO_ROOMS = [
  { id: '1', registeredAt: '2026.02.13 16:00', title: '홍제동 (컨디션 별로, 위치 굳)', address: '홍제동, 홍제2동, 서대문구, 서울특별시,03', landmarkDistance: '연세대학교에서 1.7km', dotColor: '#004cbd' },
  { id: '2', registeredAt: '2026.02.13 16:00', title: '홍제동 (컨디션 별로, 위치 굳)', address: '홍제동, 홍제2동, 서대문구, 서울특별시,03', landmarkDistance: '연세대학교에서 1.7km', dotColor: '#461a2b' },
  { id: '3', registeredAt: '2026.02.13 16:00', title: '홍제동 (컨디션 별로, 위치 굳)', address: '홍제동, 홍제2동, 서대문구, 서울특별시,03', landmarkDistance: '연세대학교에서 1.7km', dotColor: '#004cbd' },
  { id: '4', registeredAt: '2026.02.13 16:00', title: '홍제동 (컨디션 별로, 위치 굳)', address: '홍제동, 홍제2동, 서대문구, 서울특별시,03', landmarkDistance: '연세대학교에서 1.7km', dotColor: '#461a2b' },
  { id: '5', registeredAt: '2026.02.13 16:00', title: '홍제동 (컨디션 별로, 위치 굳)', address: '홍제동, 홍제2동, 서대문구, 서울특별시,03', landmarkDistance: '연세대학교에서 1.7km', dotColor: '#004cbd' },
  { id: '6', registeredAt: '2026.02.13 16:00', title: '홍제동 (컨디션 별로, 위치 굳)', address: '홍제동, 홍제2동, 서대문구, 서울특별시,03', landmarkDistance: '연세대학교에서 1.7km', dotColor: '#461a2b' },
];

const SORT_OPTIONS = ['거래방식 (정렬)', '월세 (보증금 낮은순)', '전세 (보증금 낮은순)', '단기임대 (보증금 낮은순)'];

// NCP Maps SDK 타입 선언
declare global {
  interface Window {
    naver: typeof naver;
    navermap_authFailure?: () => void;
  }
}

declare namespace naver.maps {
  class Map {
    constructor(element: HTMLElement | string, options?: MapOptions);
    destroy(): void;
  }
  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
  }
  class LatLng {
    constructor(lat: number, lng: number);
  }
  interface MapOptions {
    center?: LatLng;
    zoom?: number;
    mapTypeControl?: boolean;
    scaleControl?: boolean;
    logoControl?: boolean;
    mapDataControl?: boolean;
    zoomControl?: boolean;
  }
  interface MarkerOptions {
    position: LatLng;
    map?: Map;
  }
}

const NCP_CLIENT_ID = import.meta.env.VITE_NCP_MAP_CLIENT_ID as string;
const MAP_CENTER = { lat: 37.5792, lng: 126.9365 };
const MAP_ZOOM = 14;

function loadNcpMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.naver?.maps?.Map) {
      resolve();
      return;
    }
    const existingScript = document.querySelector('script[data-ncp-map]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('NCP Maps SDK 로드 실패')));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NCP_CLIENT_ID}`;
    script.async = true;
    script.dataset.ncpMap = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('NCP Maps SDK 로드 실패'));
    document.head.appendChild(script);
  });
}

export default function MapPage() {
  const { isLoggedIn } = useAuthStore();
  const { guestRooms } = useGuestRoomStore();
  const navigate = useNavigate();
  const [mapError, setMapError] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('월세 (보증금 낮은순)');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 기준점 state — LocalStorage 영구 저장 (key: landmark-selection)
  const [landmark, setLandmark] = useState<LandmarkSelection | null>(null);
  const [showLandmarkInput, setShowLandmarkInput] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);

  const { data: apiRoomsData } = useRoomsList();
  const apiRooms = apiRoomsData ?? [];
  const rooms = isLoggedIn ? apiRooms : guestRooms;

  const isGuestAtLimit = !isLoggedIn && guestRooms.length >= GUEST_ROOM_LIMIT;

  const roomsWithAddress = rooms.filter((r) => {
    const raw = r as unknown as Record<string, unknown>;
    return raw['address'] || raw['addressDetail'];
  });

  const showEmpty = roomsWithAddress.length === 0;

  // LocalStorage hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANDMARK_STORAGE_KEY);
      if (stored) {
        setLandmark(JSON.parse(stored) as LandmarkSelection);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // NCP 지도 초기화
  useEffect(() => {
    if (showEmpty) return;
    let cancelled = false;

    // 인증 실패 콜백 등록
    window.navermap_authFailure = () => {
      if (!cancelled) setMapError('NCP 지도 인증에 실패했습니다. 키를 확인해주세요.');
    };

    loadNcpMaps()
      .then(() => {
        if (cancelled || !mapContainerRef.current) return;
        if (mapInstanceRef.current) return;
        const map = new window.naver.maps.Map(mapContainerRef.current, {
          center: new window.naver.maps.LatLng(MAP_CENTER.lat, MAP_CENTER.lng),
          zoom: MAP_ZOOM,
          mapTypeControl: false,
          scaleControl: false,
          logoControl: true,
          mapDataControl: false,
          zoomControl: true,
        });
        mapInstanceRef.current = map;
      })
      .catch((err: Error) => {
        if (!cancelled) setMapError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [showEmpty]);

  // 실 마커 렌더링
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const roomsWithCoords = rooms.filter((r) => {
      const raw = r as unknown as Record<string, unknown>;
      return typeof raw['latitude'] === 'number' && typeof raw['longitude'] === 'number';
    });

    roomsWithCoords.forEach((r) => {
      const raw = r as unknown as Record<string, unknown>;
      const lat = raw['latitude'] as number;
      const lng = raw['longitude'] as number;
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: mapInstanceRef.current!,
      });
      markersRef.current.push(marker);
    });
  }, [rooms, mapInstanceRef.current]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLandmark = (preset: LandmarkSelection) => {
    setLandmark(preset);
    localStorage.setItem(LANDMARK_STORAGE_KEY, JSON.stringify(preset));
    setShowLandmarkInput(false);
  };

  const clearLandmark = () => {
    setLandmark(null);
    localStorage.removeItem(LANDMARK_STORAGE_KEY);
    setShowLandmarkInput(false);
  };

  const handleStartChecklist = () => {
    if (!isLoggedIn && isGuestAtLimit) {
      setIsLoginModalOpen(true);
      return;
    }
    navigate(ROUTES.CHECKLIST_NEW);
  };

  const handleReset = () => {
    setSortOption('거래방식 (정렬)');
  };

  const roomLimit = isLoggedIn ? ROOM_LIMIT : GUEST_ROOM_LIMIT;
  const totalRooms = rooms.length;

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

      {/* 기준점 배너 — 기준점 선택 시 상단 sticky 표시 */}
      {landmark && (
        <div className="sticky top-0 z-40 bg-brand-primary/10 border-b border-brand-primary/20 px-[16px] lg:px-[40px] py-[10px] flex items-center gap-[12px]">
          <IconSolarPin size={16} color="#0a607d" />
          <span className="flex-1 text-[14px] font-semibold text-brand-primary leading-[1.3]">
            기준점: {landmark.name}
          </span>
          <button
            type="button"
            onClick={() => setShowLandmarkInput(true)}
            className="text-[13px] font-medium text-text-sub border border-border-mute rounded px-[10px] py-[4px] bg-white hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
          >
            변경
          </button>
          <button
            type="button"
            onClick={clearLandmark}
            className="text-[13px] font-medium text-text-sub border border-border-mute rounded px-[10px] py-[4px] bg-white hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            초기화
          </button>
        </div>
      )}

      {/* 필터 바 — Desktop: SearchFilter Applied + Sort + Reset + 비교 리포트 */}
      <div className="hidden lg:flex border border-border-light items-center justify-between px-[40px] py-[12px] w-full">
        <div className="flex gap-[10px] items-center">
          {/* 기준점 선택 버튼 / 빠른 선택 패널 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLandmarkInput(!showLandmarkInput)}
              className="bg-white border border-border-mute rounded-[6px] h-[36px] px-[12px] py-[6px] flex items-center gap-[10px] w-[217px] cursor-pointer hover:border-brand-primary transition-colors"
            >
              <span className={cn('flex-1 text-left text-[14px] font-medium leading-[1.3]', landmark ? 'text-brand-primary' : 'text-text-caption')}>
                {landmark ? landmark.name : '원하는 기준점을 입력해주세요'}
              </span>
              <IconSearch size={18} />
            </button>
            {showLandmarkInput && (
              <div className="absolute left-0 top-full mt-2 bg-white border border-border-light rounded-[6px] shadow-lg z-50 p-2 min-w-[217px]">
                <p className="text-[11px] text-text-caption px-2 py-1 font-medium">빠른 선택</p>
                {LANDMARK_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => selectLandmark(preset)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-[14px] rounded flex items-center gap-[8px] hover:bg-bg-gray transition-colors cursor-pointer',
                      landmark?.name === preset.name ? 'text-brand-primary font-semibold' : 'text-text-main'
                    )}
                  >
                    <IconSolarPin size={14} color={landmark?.name === preset.name ? '#0a607d' : '#aaa'} />
                    {preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>

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
              <div className="absolute left-0 top-full mt-2 bg-white border border-border-light rounded-[6px] shadow-lg z-50 p-2 min-w-[200px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setSortOption(opt); setIsFilterOpen(false); }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-[14px] rounded hover:bg-bg-gray transition-colors cursor-pointer',
                      sortOption === opt ? 'text-brand-primary font-semibold' : 'text-text-main'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

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
        <div
          className="flex items-center h-[44px] bg-white border border-border-mute rounded-[6px] pl-[16px] pr-[4px] cursor-pointer"
          onClick={() => setShowLandmarkInput(!showLandmarkInput)}
        >
          <span className={cn('flex-1 text-[15px] bg-transparent outline-none select-none', landmark ? 'text-brand-primary font-medium' : 'text-text-caption')}>
            {landmark ? landmark.name : '원하는 기준점을 입력해주세요.'}
          </span>
          <button className="p-[10px] flex items-center justify-center cursor-pointer" type="button">
            <IconSearch size={20} />
          </button>
        </div>
        {/* 모바일 빠른 선택 패널 */}
        {showLandmarkInput && (
          <div className="mt-2 bg-white border border-border-light rounded-[6px] shadow-lg p-2">
            <p className="text-[11px] text-text-caption px-2 py-1 font-medium">빠른 선택</p>
            {LANDMARK_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => selectLandmark(preset)}
                className={cn(
                  'w-full text-left px-3 py-2 text-[14px] rounded flex items-center gap-[8px] hover:bg-bg-gray transition-colors cursor-pointer',
                  landmark?.name === preset.name ? 'text-brand-primary font-semibold' : 'text-text-main'
                )}
              >
                <IconSolarPin size={14} color={landmark?.name === preset.name ? '#0a607d' : '#aaa'} />
                {preset.name}
              </button>
            ))}
          </div>
        )}
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
          {/* NCP 지도 본체 */}
          <div className="relative w-full h-[661px] bg-bg-gray overflow-hidden">
            {mapError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-text-caption text-[14px] bg-white/90 px-4 py-2 rounded shadow">{mapError}</p>
              </div>
            ) : (
              <div
                ref={mapContainerRef}
                className="absolute inset-0 w-full h-full"
                aria-label="네이버 지도"
              />
            )}
          </div>

          {/* 카드 그리드 — Desktop 3-col / Tablet 2-col / Mobile 1-col */}
          <div className="border-t border-[#a0a0a0] px-[16px] lg:px-[40px] pt-[20px] lg:pt-[32px] pb-[20px] lg:pb-[32px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
              {DEMO_ROOMS.map((r) => (
                <MapRoomCardCompact key={r.id} {...r} />
              ))}
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
