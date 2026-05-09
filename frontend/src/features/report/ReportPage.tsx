import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import type { Room } from '@/types/room';
import { ConfigCard } from './components/ConfigCard';
import { FilterToggle } from './components/FilterToggle';
import { REPORT_SECTIONS, type ReportSectionId } from './lib/sections';

const ALL_SECTION_IDS = REPORT_SECTIONS.map((s) => s.id);

const MAX_SELECT = 6;
const MIN_SELECT = 2;

const fmtMoney = (v?: number) => (v ? `${v.toLocaleString()}만` : '-');
const ratingEmoji = (v: '좋음' | '보통' | '나쁨' | null | undefined) =>
  v === '좋음' ? '😊 좋음' : v === '보통' ? '😐 보통' : v === '나쁨' ? '😞 나쁨' : '-';
const yesNoBadge = (v: '있음' | '없음' | null | undefined, mode: 'problem' | 'feature' = 'feature') => {
  if (v == null) return '-';
  if (mode === 'problem') return v === '있음' ? '🔴 있음' : '⚪ 없음';
  return v === '있음' ? '있음' : '없음';
};


export default function ReportPage() {
  const navigate = useNavigate();
  const { guestRooms } = useGuestRoomStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeSections, setActiveSections] = useState<ReportSectionId[]>([...ALL_SECTION_IDS]);
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  // 초기 진입 시 등록된 방 중 앞에서부터 MIN_SELECT개 자동 선택
  useEffect(() => {
    if (guestRooms.length >= MIN_SELECT && selectedIds.length === 0) {
      setSelectedIds(guestRooms.slice(0, MIN_SELECT).map((r) => r.id));
    }
  }, [guestRooms, selectedIds.length]);

  const selectedRooms = useMemo(
    () => guestRooms.filter((r) => selectedIds.includes(r.id)),
    [guestRooms, selectedIds],
  );

  // 비로그인은 방 한도가 MIN_SELECT(=2)와 동일 → 두 카드 모두 선택 고정, 토글 비활성
  const isLockedSelection = guestRooms.length <= MIN_SELECT;

  const toggleRoom = (id: string) => {
    if (isLockedSelection) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > MIN_SELECT ? prev.filter((v) => v !== id) : prev;
      }
      return prev.length < MAX_SELECT ? [...prev, id] : prev;
    });
  };

  const toggleSection = (s: ReportSectionId) =>
    setActiveSections((prev) => {
      if (prev.includes(s)) {
        // 최소 1개 유지
        return prev.length > 1 ? prev.filter((x) => x !== s) : prev;
      }
      return [...prev, s];
    });

  const resetConfig = () => {
    setSelectedIds(guestRooms.slice(0, MIN_SELECT).map((r) => r.id));
    setActiveSections([...ALL_SECTION_IDS]);
  };

  const canSelectMore = selectedIds.length < MAX_SELECT;

  // 빈 상태
  if (guestRooms.length < MIN_SELECT) {
    return (
      <div className="flex-1 bg-[#FAFAFA] min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 max-w-[360px] text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E2E2E2" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <div className="space-y-2">
            <h2 className="text-[18px] font-bold text-[#232527]">비교하려면 방이 2개 이상 필요해요</h2>
            <p className="text-[13px] text-[#A0A0A0] leading-relaxed">
              현재 등록된 방: {guestRooms.length}개<br />
              체크리스트를 추가해 비교 리포트를 받아보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/checklist/new')}
            className="px-6 py-3 rounded-[6px] bg-brand-primary text-white text-[14px] font-bold hover:bg-brand-primary-dark cursor-pointer"
          >
            체크리스트 추가하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-footer min-h-screen">
      {/* 서브 헤더 */}
      <div className="bg-white border-b border-border-light sticky top-16 z-30">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            aria-label="방 목록으로 돌아가기"
            className="p-1 -ml-1 text-text-main hover:bg-bg-gray rounded-[4px]"
          >
            <Icon icon="ic:round-navigate-next" width={24} height={24} className="rotate-180" />
          </button>
          <h1 className="text-3xl font-bold text-text-main">비교 리포트</h1>
          <FilterToggle open={isConfigOpen} onToggle={() => setIsConfigOpen((v) => !v)} />
          <span className="text-sm text-text-mute">
            {selectedRooms.length}개 방 · {activeSections.length}개 섹션
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="공유"
              className="inline-flex h-8 items-center gap-2.5 rounded-[4px] border border-border-light px-4 py-2 text-xs font-semibold text-text-main hover:bg-bg-gray"
            >
              <Icon icon="material-symbols:share-outline" width={16} height={16} />
              <span>공유</span>
            </button>
            <button
              type="button"
              aria-label="PDF 다운로드"
              className="inline-flex h-8 items-center gap-2.5 rounded-[4px] border border-border-light px-4 py-2 text-xs font-semibold text-text-main hover:bg-bg-gray"
            >
              <Icon icon="material-symbols:download-rounded" width={16} height={16} />
              <span>PDF 다운로드</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-6 space-y-6">
        {/* 설정 패널 (펼침/접힘) */}
        {isConfigOpen && (
          <ConfigCard
            rooms={guestRooms}
            selectedRoomIds={selectedIds}
            onToggleRoom={toggleRoom}
            canSelectMore={canSelectMore}
            isLockedSelection={isLockedSelection}
            activeSections={activeSections}
            onToggleSection={toggleSection}
            onComplete={() => setIsConfigOpen(false)}
            onReset={resetConfig}
          />
        )}

        {/* 비교 테이블 */}
        {selectedRooms.length >= MIN_SELECT && (
          <section className="overflow-x-auto pb-4">
            <CompareTable rooms={selectedRooms} activeSections={activeSections} />
          </section>
        )}
      </div>
    </div>
  );
}

// ─── CompareTable ─────────────────────────────────────────────
function CompareTable({ rooms, activeSections }: { rooms: Room[]; activeSections: ReportSectionId[] }) {
  if (rooms.length === 0) return null;

  const Row = ({ label, values, isLast = false }: { label: string; values: string[]; isLast?: boolean }) => (
    <div className={cn('flex border-b border-[#E2E2E2]', isLast && 'border-0')}>
      <div className="w-[140px] md:w-[160px] shrink-0 p-4 border-r border-[#E2E2E2] bg-white text-sm font-medium text-[#777]">
        {label}
      </div>
      {values.map((val, i) => (
        <div
          key={i}
          className="flex-1 min-w-[120px] p-4 text-center text-sm text-[#232527] border-r border-[#E2E2E2] last:border-0 bg-white"
        >
          {val || '-'}
        </div>
      ))}
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#F5F5F5] px-5 py-2 text-xs font-bold text-[#777] tracking-wider">{title}</div>
  );

  // raw가 없는 옛 데이터 방어
  const raws = rooms.map((r) => r.raw);

  return (
    <div className="min-w-[700px] bg-white rounded-lg border border-[#E2E2E2] overflow-hidden shadow-md">
      <div className="flex border-b border-[#E2E2E2] bg-[#FAFAFA]">
        <div className="w-[140px] md:w-[160px] shrink-0 p-4 border-r border-[#E2E2E2] font-bold text-[#232527] text-sm">
          비교 항목
        </div>
        {rooms.map((r) => (
          <div
            key={r.id}
            className="flex-1 min-w-[120px] p-4 text-center font-bold text-[#232527] text-sm border-r border-[#E2E2E2] last:border-0"
          >
            {r.name}
          </div>
        ))}
      </div>

      {activeSections.includes('basic') && (
        <>
          <SectionHeader title="기본 정보" />
          <Row label="거래유형" values={rooms.map((r) => r.type)} />
          <Row
            label="금액"
            values={rooms.map((r, i) => {
              const raw = raws[i];
              const mgmt = raw?.basic.isMgmtUnknown ? '모름' : (parseInt(raw?.basic.managementFee || '0', 10) || 0) > 0 ? `관리비 ${fmtMoney(parseInt(raw!.basic.managementFee!, 10))}` : null;
              const base = `${fmtMoney(r.deposit)}/${fmtMoney(r.rent)}`;
              return mgmt ? `${base} (${mgmt})` : base;
            })}
          />
          <Row label="융자" values={raws.map((raw) => raw?.basic.loanStatus ?? '-')} />
          <Row label="전입신고" values={raws.map((raw) => raw?.basic.moveInReport ?? '-')} />
          <Row label="입주일" values={raws.map((raw) => raw?.basic.moveInDate || (raw?.basic.moveInNegotiable ? '협의 가능' : '-'))} />
        </>
      )}

      {activeSections.includes('building') && (
        <>
          <SectionHeader title="건물 정보" />
          <Row label="건물유형" values={rooms.map((r) => r.buildingType ?? '-')} />
          <Row label="층수" values={raws.map((raw) => raw?.building.floorLevel ?? (raw?.building.floorDirect ? `${raw.building.floorDirect}층` : '-'))} />
          <Row label="엘리베이터" values={raws.map((raw) => raw?.building.elevator ?? '-')} />
          <Row label="방향" values={rooms.map((r) => r.direction ? `${r.direction}향` : '-')} />
        </>
      )}

      {activeSections.includes('option') && (
        <>
          <SectionHeader title="옵션" />
          <Row
            label="옵션 목록"
            values={raws.map((raw) => raw?.building.options.length ? raw.building.options.join(', ') : '없음')}
            isLast
          />
        </>
      )}

      {/* TODO(E06-S03): 내부 상태 비교 — 레이더 차트 섹션 (recharts RadarChart)
          Figma: 373:23xxx 내부 상태 비교 노드. 항목별 점수 bar + 방사형 차트.
          activeSections.includes('condition') 조건 그대로 유지. */}

      {activeSections.includes('problem') && (
        <>
          <SectionHeader title="문제 요소" />
          <Row label="곰팡이" values={raws.map((raw) => yesNoBadge(raw?.interior.mold, 'problem'))} />
          <Row label="벌레" values={raws.map((raw) => yesNoBadge(raw?.interior.pest, 'problem'))} />
          <Row label="누수/결로" values={raws.map((raw) => yesNoBadge(raw?.interior.leak, 'problem'))} />
          <Row label="벽지/장판" values={raws.map((raw) => yesNoBadge(raw?.interior.wallpaper, 'problem'))} />
          <Row label="배수구 냄새" values={raws.map((raw) => yesNoBadge(raw?.interior.drainSmell, 'problem'))} isLast />
        </>
      )}

      {activeSections.includes('safety') && (
        <>
          <SectionHeader title="안전 / 생활" />
          <Row label="도어락" values={raws.map((raw) => ratingEmoji(raw?.safety.doorLock))} />
          <Row label="창문 잠금" values={raws.map((raw) => ratingEmoji(raw?.safety.windowLock))} />
          <Row label="CCTV" values={raws.map((raw) => ratingEmoji(raw?.safety.cctv))} />
          <Row label="방범" values={raws.map((raw) => ratingEmoji(raw?.safety.securityState))} />
          <Row label="밤길 안전" values={raws.map((raw) => ratingEmoji(raw?.safety.nightSafety))} />
          <Row label="소음 환경" values={raws.map((raw) => ratingEmoji(raw?.safety.surroundNoise))} />
          <Row label="대중교통" values={raws.map((raw) => ratingEmoji(raw?.safety.transit))} isLast />
        </>
      )}

      {activeSections.includes('environment') && (
        <>
          <SectionHeader title="주변 환경" />
          <Row label="-" values={rooms.map(() => '데이터 수집 예정')} isLast />
        </>
      )}

      <div className="flex border-t-2 border-[#0A607D] bg-[#0A607D]/5">
        <div className="w-[140px] md:w-[160px] shrink-0 p-4 border-r border-[#E2E2E2] font-bold text-[#0A607D] text-sm">
          총점
        </div>
        {rooms.map((r) => (
          <div
            key={r.id}
            className="flex-1 min-w-[120px] p-4 text-center font-bold text-[#0A607D] text-sm border-r border-[#E2E2E2] last:border-0"
          >
            {r.score}점
          </div>
        ))}
      </div>
    </div>
  );
}

