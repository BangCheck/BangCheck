import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useRoomsList } from '@/features/rooms/hooks/use-rooms-query';
import { useWalkingDirections, formatWalkingDistance, formatWalkingDuration } from './hooks/use-directions-query';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { GUEST_ROOM_LIMIT, ROOM_LIMIT } from '@/lib/constants';
import { LoginRequiredModal } from '@/components/ui/Modals';
import type { Room } from '@/types/room';
import type { WalkingDirectionsParams } from '@/types/directions';

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
  { name: '서대문역', lat: 37.5647, lng: 126.9638 },
  { name: '서울역', lat: 37.5547, lng: 126.9707 },
  { name: '종로5가역', lat: 37.5700, lng: 126.9993 },
  { name: '동대입구역', lat: 37.5595, lng: 127.0062 },
];

// P2-A: LANDMARK_PRESETS에서 역만 파생 — 중복 상수 제거
const FIXED_STATIONS = LANDMARK_PRESETS.filter((p) =>
  ['신촌역', '서대문역', '이대역', '서울역', '종로5가역', '동대입구역'].includes(p.name)
);

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


function formatCreatedAt(raw: string): string {
  try {
    const d = new Date(raw);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  } catch {
    return raw;
  }
}

// P1: XSS 방지 — InfoWindow HTML 보간 전 escape
function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// P2-C: fmtPrice 모듈 스코프로 이동
function fmtPrice(v: number): string {
  return v >= 10000
    ? `${Math.floor(v / 10000)}억${v % 10000 ? ` ${v % 10000}만` : ''}`
    : `${v.toLocaleString()}만`;
}

// 룸 카드 (Compact + 호버 확장) — 데스크톱 그리드용
function MapRoomCardCompact({
  room,
  roomPos,
  landmark,
  dotColor = '#004cbd',
  isSelected = false,
  walkingLabel = null,
  onCardClick,
}: {
  room: Room;
  roomPos: { lat: number; lng: number } | null;
  landmark: LandmarkSelection | null;
  dotColor?: string;
  isSelected?: boolean;
  walkingLabel?: string | null;
  onCardClick?: () => void;
}) {
  const navigate = useNavigate();

  const issueCount = room.issues
    ? Object.values(room.issues).filter(Boolean).length
    : 0;

  const tags = [room.buildingType, room.floor, room.direction].filter(Boolean) as string[];

  const landmarkDist = landmark && roomPos
    ? `${landmark.name} ${formatDist(distanceKm(landmark.lat, landmark.lng, roomPos.lat, roomPos.lng))}`
    : null;

  const stationDists = roomPos
    ? FIXED_STATIONS.map((s) => ({
        name: s.name,
        dist: formatDist(distanceKm(s.lat, s.lng, roomPos.lat, roomPos.lng)),
      }))
    : [];

  return (
    <article
      onClick={onCardClick}
      className={cn(
        'group bg-white border rounded-[6px] shadow-[0_6px_8px_rgba(0,0,0,0.04)] flex flex-col p-[24px] w-full max-w-[378px] cursor-pointer hover:shadow-[0_8px_16px_rgba(0,0,0,0.10)] transition-all duration-200',
        isSelected ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-border-light hover:border-brand-primary'
      )}
    >
      {/* 기본 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[12px] items-start min-w-0 flex-1">
          <div className="flex items-center gap-[12px]">
            <span className="w-[14px] h-[14px] rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
            <div className="flex gap-[4px] items-center text-[12px] text-text-mute leading-[1.3]">
              <span>등록일시</span>
              <span>{formatCreatedAt(room.createdAt)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-[4px] items-start min-w-0 w-full">
            <p className="font-semibold text-[18px] text-text-main leading-[1.3] truncate w-full">{room.name}</p>
            <div className="flex gap-[4px] items-center w-full">
              <IconSiPin size={16} color="#777" />
              <p className="text-[12px] text-text-mute leading-[1.3] truncate">{room.address}</p>
            </div>
          </div>

          {/* 기준점 거리 */}
          {landmarkDist && (
            <div className="flex gap-[4px] items-center">
              <IconSolarPin size={18} color="#0a607d" />
              <p className="font-medium text-[12px] text-brand-primary leading-[1.3]">{landmarkDist}</p>
            </div>
          )}

          {/* 고정 역 거리 칩 */}
          {stationDists.length > 0 && (
            <div className="flex flex-wrap gap-[4px]">
              {stationDists.map((s) => (
                <span
                  key={s.name}
                  className="text-[11px] text-text-caption bg-bg-gray px-[6px] py-[2px] rounded-[4px] leading-[1.4]"
                >
                  {s.name} {s.dist}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-[6px]">
          {isSelected && walkingLabel && (
            <span className="text-[12px] font-semibold text-brand-primary whitespace-nowrap">
              {walkingLabel}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.CHECKLIST_DETAIL(room.id));
            }}
            className="text-[11px] font-medium px-[8px] py-[4px] rounded-[4px] border border-border-mute text-text-sub bg-white hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer whitespace-nowrap"
            aria-label={`${room.name} 자세히 보기`}
          >
            자세히 보기
          </button>
        </div>
      </div>

      {/* 호버 확장 영역 */}
      <div className="overflow-hidden max-h-0 group-hover:max-h-[120px] transition-all duration-200 ease-in-out">
        <div className="pt-[12px] mt-[12px] border-t border-border-light flex flex-col gap-[6px]">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-[6px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-bg-gray text-text-sub text-[11px] font-medium px-[8px] py-[3px] rounded-[4px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {issueCount > 0 && (
            <p className="text-[12px] text-[#d9534f] font-medium leading-[1.3]">
              문제요소 {issueCount}건
            </p>
          )}
          {room.memo && (
            <p className="text-[12px] text-text-caption leading-[1.3] truncate">{room.memo}</p>
          )}
        </div>
      </div>
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

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
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
    getCenter(): LatLng;
    setCenter(latlng: LatLng): void;
  }
  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setIcon(icon: { content: string; anchor?: { x: number; y: number } }): void;
  }
  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }
  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
  }
  namespace Event {
    function addListener(target: Map | Marker, eventName: string, listener: () => void): void;
  }
  class InfoWindow {
    constructor(options: { content: string; borderWidth?: number; backgroundColor?: string; borderColor?: string; anchorSize?: { width: number; height: number } });
    open(map: Map, anchor: Marker | LatLng): void;
    close(): void;
    getMap(): Map | null;
  }
  namespace Service {
    enum Status { ERROR = 'ERROR', OK = 'OK' }
    interface GeocodeResponse {
      v2: { addresses: Array<{ x: string; y: string }> };
    }
    function geocode(options: { query: string }, callback: (status: Status, response: GeocodeResponse) => void): void;
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
    icon?: { content: string; anchor?: { x: number; y: number } };
  }
  interface PolylineOptions {
    path: LatLng[];
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    strokeStyle?: string;
    map?: Map;
  }
}

const NCP_CLIENT_ID = import.meta.env.VITE_NCP_MAP_CLIENT_ID as string;

function stationMarkerContent(name: string, selected: boolean): string {
  if (selected) {
    return `<div style="background:#0a607d;color:#fff;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 3px 10px rgba(10,96,125,0.55);cursor:pointer;border:2px solid #fff">📍 ${escHtml(name)}</div>`;
  }
  return `<div style="background:#fff;color:#0a607d;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:700;white-space:nowrap;border:2px solid #0a607d;box-shadow:0 2px 6px rgba(10,96,125,0.2);cursor:pointer;display:flex;align-items:center;gap:5px"><span style="width:7px;height:7px;border-radius:50%;background:#0a607d;display:inline-block;flex-shrink:0"></span>${escHtml(name)}</div>`;
}
const MAP_CENTER = { lat: 37.5651, lng: 126.9385 };
const SEODAEMUN_BOUNDS = { latMin: 37.548, latMax: 37.613, lngMin: 126.907, lngMax: 126.985 };
const SEOUL_BOUNDS = { latMin: 37.41, latMax: 37.70, lngMin: 126.77, lngMax: 127.18 };
const MAP_ZOOM = 14;


function loadNcpMaps(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps?.Map && window.naver?.maps?.Service) {
      resolve();
      return;
    }
    // Service 없으면 기존 스크립트 제거 후 geocoder 포함해 재로드
    document.querySelector('script[data-ncp-map]')?.remove();
    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NCP_CLIENT_ID}&submodules=geocoder`;
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
  const [mapReady, setMapReady] = useState(false);
  const [roomPositions, setRoomPositions] = useState<Record<string, { lat: number; lng: number }>>({});

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionChip>('전체');
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [outOfService, setOutOfService] = useState(false);

  // 기준점 state — LocalStorage 영구 저장 (key: landmark-selection)
  const [landmark, setLandmark] = useState<LandmarkSelection | null>(null);
  const [showLandmarkInput, setShowLandmarkInput] = useState(false);
  const [selectedRoomForRoute, setSelectedRoomForRoute] = useState<Room | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const stationMarkersRef = useRef<Record<string, naver.maps.Marker>>({});
  const polylinesRef = useRef<naver.maps.Polyline[]>([]);
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null);

  // 도보 경로 파라미터 — 기준점 + 선택된 방 좌표가 모두 있을 때만 활성화
  const directionsParams = useMemo((): WalkingDirectionsParams | null => {
    if (!landmark || !selectedRoomForRoute) return null;
    const pos = roomPositions[selectedRoomForRoute.id];
    if (!pos) return null;
    return { startLat: landmark.lat, startLng: landmark.lng, goalLat: pos.lat, goalLng: pos.lng };
  }, [landmark, selectedRoomForRoute, roomPositions]);

  const { data: directionsData } = useWalkingDirections(directionsParams);

  const { data: apiRoomsData } = useRoomsList();
  const apiRooms = apiRoomsData ?? [];
  const rooms = isLoggedIn ? apiRooms : guestRooms;

  const isGuestAtLimit = !isLoggedIn && guestRooms.length >= GUEST_ROOM_LIMIT;

  // P0-2: useMemo로 감싸 매 렌더마다 새 배열 생성 방지 + r.address 직접 접근
  const roomsWithAddress = useMemo(
    () => rooms.filter((r) => r.address),
    [rooms]
  );

  const showEmpty = roomsWithAddress.length === 0;

  // LocalStorage hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANDMARK_STORAGE_KEY);
      if (stored) {
        // P2-B: LocalStorage 검증
        const parsed = JSON.parse(stored) as unknown;
        if (
          parsed &&
          typeof parsed === 'object' &&
          'name' in parsed && typeof (parsed as { name: unknown }).name === 'string' &&
          'lat' in parsed && typeof (parsed as { lat: unknown }).lat === 'number' &&
          'lng' in parsed && typeof (parsed as { lng: unknown }).lng === 'number'
        ) {
          setLandmark(parsed as LandmarkSelection);
        } else {
          localStorage.removeItem(LANDMARK_STORAGE_KEY);
        }
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
          zoomControl: false,
        });
        mapInstanceRef.current = map;
        setMapReady(true);
        window.naver.maps.Event.addListener(map, 'idle', () => {
          const center = map.getCenter();
          const lat = center.lat();
          const lng = center.lng();
          // 서울 범위 이탈 시 clamp
          const clampedLat = Math.min(Math.max(lat, SEOUL_BOUNDS.latMin), SEOUL_BOUNDS.latMax);
          const clampedLng = Math.min(Math.max(lng, SEOUL_BOUNDS.lngMin), SEOUL_BOUNDS.lngMax);
          if (clampedLat !== lat || clampedLng !== lng) {
            map.setCenter(new window.naver.maps.LatLng(clampedLat, clampedLng));
            return;
          }
          const inside =
            lat >= SEODAEMUN_BOUNDS.latMin && lat <= SEODAEMUN_BOUNDS.latMax &&
            lng >= SEODAEMUN_BOUNDS.lngMin && lng <= SEODAEMUN_BOUNDS.lngMax;
          setOutOfService(!inside);
        });
        // 지도 배경 클릭 시 InfoWindow 닫기
        window.naver.maps.Event.addListener(map, 'click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
            infoWindowRef.current = null;
          }
        });
      })
      .catch((err: Error) => {
        if (!cancelled) setMapError(err.message);
      });

    // P2-D: unmount 시 지도 인스턴스 정리
    return () => {
      cancelled = true;
      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;
    };
  }, [showEmpty]);

  // 역/랜드마크 고정 마커 초기 배치 + 클릭으로 기준점 설정
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    Object.values(stationMarkersRef.current).forEach((m) => m.setMap(null));
    stationMarkersRef.current = {};

    LANDMARK_PRESETS.forEach((s) => {
      const content = stationMarkerContent(s.name, false);
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(s.lat, s.lng),
        map: mapInstanceRef.current!,
        icon: { content, anchor: { x: 0, y: 0 } },
      });
      window.naver.maps.Event.addListener(marker, 'click', () => selectLandmark(s));
      stationMarkersRef.current[s.name] = marker;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady]);

  // 기준점 선택 시 해당 마커 강조
  useEffect(() => {
    if (!mapReady) return;
    LANDMARK_PRESETS.forEach((s) => {
      const marker = stationMarkersRef.current[s.name];
      if (!marker) return;
      marker.setIcon({ content: stationMarkerContent(s.name, landmark?.name === s.name), anchor: { x: 0, y: 0 } });
    });
  }, [landmark, mapReady]);

  // 기준점 → 방 직선 경로 polyline (CORS로 Directions API 불가 → 직선 사용)
  useEffect(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    if (!landmark || !mapReady || !mapInstanceRef.current) return;

    Object.values(roomPositions).forEach((pos) => {
      if (!mapInstanceRef.current) return;
      const polyline = new window.naver.maps.Polyline({
        path: [
          new window.naver.maps.LatLng(landmark.lat, landmark.lng),
          new window.naver.maps.LatLng(pos.lat, pos.lng),
        ],
        strokeColor: '#0a607d',
        strokeWeight: 2,
        strokeOpacity: 0.5,
        strokeStyle: 'shortdash',
        map: mapInstanceRef.current,
      });
      polylinesRef.current.push(polyline);
    });
  }, [landmark, roomPositions, mapReady]);

  // 실 마커 렌더링 — 주소 geocoding 후 마커 배치
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!window.naver?.maps?.Service) {
      console.warn('[Map] naver.maps.Service 미로드 — NCP 콘솔에서 Geocoding 서비스 활성화 필요');
      return;
    }

    roomsWithAddress.forEach((r) => {
      // P0-1: r.address 직접 접근 (as unknown as Record 패턴 제거)
      const address = r.address;
      if (!address) return;
      window.naver.maps.Service.geocode({ query: address }, (status, response) => {
        if (status !== window.naver.maps.Service.Status.OK) return;
        const result = response.v2.addresses[0];
        if (!result || !mapInstanceRef.current) return;

        const posLat = parseFloat(result.y);
        const posLng = parseFloat(result.x);
        setRoomPositions((prev) => ({ ...prev, [r.id]: { lat: posLat, lng: posLng } }));

        // P0-1: 직접 접근
        const name = r.name ?? '';
        const type = r.type ?? '';
        const deposit = r.deposit ?? null;
        const rent = r.rent ?? null;
        const id = r.id;

        // P2-C: 모듈 스코프 fmtPrice 사용
        const priceLine = type === '전세'
          ? `전세 ${deposit ? fmtPrice(deposit) : '-'}`
          : type === '월세'
          ? `월세 ${deposit ? fmtPrice(deposit) : '-'} / ${rent ? `${rent}만` : '-'}`
          : type === '단기임대'
          ? `단기 ${deposit ? fmtPrice(deposit) : '-'} / ${rent ? `${rent}만` : '-'}`
          : '';

        const bubbleLabel = priceLine || name;
        const markerIcon = {
          // P1: XSS 방지
          content: `<div style="background:#004cbd;color:#fff;padding:7px 14px;border-radius:20px;font-size:13px;font-weight:700;white-space:nowrap;box-shadow:0 3px 10px rgba(0,76,189,0.4);cursor:pointer;letter-spacing:-0.3px">${escHtml(bubbleLabel)}</div>`,
          anchor: { x: 0, y: 0 },
        };
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(posLat, posLng),
          map: mapInstanceRef.current,
          icon: markerIcon,
        });
        markersRef.current.push(marker);

        // P1: XSS 방지 — name, address, priceLine escape 적용
        const content = `
          <div style="padding:12px 14px;min-width:180px;max-width:240px;font-family:inherit;cursor:default">
            <p style="font-weight:700;font-size:14px;color:#111;margin:0 0 4px">${escHtml(name)}</p>
            <p style="font-size:12px;color:#888;margin:0 0 6px;line-height:1.4">${escHtml(address)}</p>
            ${priceLine ? `<p style="font-size:13px;color:#004cbd;font-weight:600;margin:0 0 10px">${escHtml(priceLine)}</p>` : ''}
            <a href="/checklist/${id}" style="display:inline-block;background:#111;color:#fff;font-size:12px;font-weight:600;padding:5px 12px;border-radius:4px;text-decoration:none">자세히 보기</a>
          </div>`;

        const iw = new window.naver.maps.InfoWindow({ content, borderWidth: 0, backgroundColor: '#fff', anchorSize: { width: 10, height: 10 } });

        // P1: InfoWindow 토글 버그 수정 — close 후 비교 버그 제거
        window.naver.maps.Event.addListener(marker, 'click', () => {
          const prev = infoWindowRef.current;
          if (prev) prev.close();
          infoWindowRef.current = null;
          if (prev === iw) return;
          if (!mapInstanceRef.current) return;
          iw.open(mapInstanceRef.current, marker);
          infoWindowRef.current = iw;
        });
      });
    });
  }, [roomsWithAddress, mapReady]);

  // 거래방식 필터 → useMemo
  const filtered = useMemo(() => {
    if (transactionType === '전체') return roomsWithAddress;
    // P0-1: r.type 직접 접근
    return roomsWithAddress.filter((r) => TYPE_TO_CHIP[r.type] === transactionType);
  }, [roomsWithAddress, transactionType]);

  // 정렬 → useMemo
  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortOption === '월세 (보증금 낮은순)') {
      // P0-1: a.deposit, b.deposit 직접 접근
      list.sort((a, b) => (a.deposit ?? 0) - (b.deposit ?? 0));
    } else if (sortOption === '월세 (보증금 높은순)') {
      list.sort((a, b) => (b.deposit ?? 0) - (a.deposit ?? 0));
    } else if ((sortOption === '기준점 거리 가까운순' || sortOption === '기준점 거리 먼순') && landmark) {
      // P0-3: roomPositions state 사용해 올바른 거리 계산 + 두 케이스 통합
      list.sort((a, b) => {
        const posA = roomPositions[a.id];
        const posB = roomPositions[b.id];
        if (!posA && !posB) return 0;
        if (!posA) return 1;
        if (!posB) return -1;
        const da = distanceKm(landmark.lat, landmark.lng, posA.lat, posA.lng);
        const db = distanceKm(landmark.lat, landmark.lng, posB.lat, posB.lng);
        return sortOption === '기준점 거리 가까운순' ? da - db : db - da;
      });
    }
    return list;
  }, [filtered, sortOption, landmark, roomPositions]);

  // 도보 경로 Polyline — directionsData.path 변경 시 기존 선 제거 후 재그림
  const directionsPolylineRef = useRef<naver.maps.Polyline | null>(null);
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (directionsPolylineRef.current) {
      directionsPolylineRef.current.setMap(null);
      directionsPolylineRef.current = null;
    }
    const path = directionsData?.data?.path;
    if (!path || path.length < 2) return;
    const latLngs = path.map(([lng, lat]) => new window.naver.maps.LatLng(lat, lng));
    directionsPolylineRef.current = new window.naver.maps.Polyline({
      map: mapInstanceRef.current,
      path: latLngs,
      strokeColor: '#0A607D',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      strokeStyle: 'solid',
    });
  }, [directionsData]);

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
    setTransactionType('전체');
    setSortOption(DEFAULT_SORT);
  };

  const roomLimit = isLoggedIn ? ROOM_LIMIT : GUEST_ROOM_LIMIT;
  const totalRooms = rooms.length;
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
          {/* 카드 그리드 — Desktop 3-col / Tablet 2-col / Mobile 1-col */}
          <div className="border-b border-[#a0a0a0] px-[16px] lg:px-[40px] pt-[20px] lg:pt-[32px] pb-[20px] lg:pb-[32px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
              {sorted.map((r, idx) => {
                const isSelected = selectedRoomForRoute?.id === r.id;
                const result = isSelected ? directionsData?.data : null;
                const walkingLabel = result
                  ? `${formatWalkingDuration(result.duration)} · ${formatWalkingDistance(result.distance)}`
                  : isSelected && landmark ? '경로 불러오는 중…' : null;
                return (
                  <MapRoomCardCompact
                    key={r.id}
                    room={r}
                    roomPos={roomPositions[r.id] ?? null}
                    landmark={landmark}
                    dotColor={idx % 2 === 0 ? '#004cbd' : '#461a2b'}
                    isSelected={isSelected}
                    walkingLabel={walkingLabel}
                    onCardClick={() => setSelectedRoomForRoute(isSelected ? null : r)}
                  />
                );
              })}
            </div>
          </div>

          {/* NCP 지도 본체 */}
          <div className="px-[16px] lg:px-[40px] py-[16px]">
          <div className="relative w-full h-[500px] bg-bg-gray overflow-hidden rounded-[10px]">
            {mapError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-text-caption text-[14px] bg-white/90 px-4 py-2 rounded shadow">{mapError}</p>
              </div>
            ) : (
              <>
                <div
                  ref={mapContainerRef}
                  className="absolute inset-0 w-full h-full"
                  aria-label="네이버 지도"
                />
                {outOfService && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/75 text-white text-[14px] font-semibold px-[20px] py-[10px] rounded-[8px] shadow-lg pointer-events-none whitespace-nowrap">
                    서비스 지역이 아닙니다
                  </div>
                )}
              </>
            )}
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
