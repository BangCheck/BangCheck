import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import type { Room } from '@/types/room';

const SECTIONS = ['기본정보', '건물정보', '옵션', '내부상태', '문제요소', '안전/생활', '나만의항목'] as const;
type SectionKey = (typeof SECTIONS)[number];

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

function getBadge(score: number): { label: string; color: string } {
  if (score >= 80) return { label: '강력 추천', color: 'bg-[#0A607D] text-white' };
  if (score >= 60) return { label: '추천', color: 'bg-[#2196F3] text-white' };
  if (score >= 40) return { label: '보통', color: 'bg-[#FF9800] text-white' };
  return { label: '비추천', color: 'bg-[#F44336] text-white' };
}

export default function ReportPage() {
  const navigate = useNavigate();
  const { guestRooms } = useGuestRoomStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeSections, setActiveSections] = useState<SectionKey[]>([...SECTIONS]);

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

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > MIN_SELECT ? prev.filter((v) => v !== id) : prev;
      }
      return prev.length < MAX_SELECT ? [...prev, id] : prev;
    });
  };

  const toggleSection = (s: SectionKey) =>
    setActiveSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const canAdd = selectedIds.length < MAX_SELECT;

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
            className="px-6 py-3 rounded-[6px] bg-[#0A607D] text-white text-[14px] font-bold hover:bg-[#084e6d] cursor-pointer"
          >
            체크리스트 추가하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen">
      {/* 액션 바 */}
      <div className="bg-white border-b border-[#E2E2E2] sticky top-16 z-30">
        <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-[24px] md:text-[28px] font-bold text-[#232527]">비교 리포트</h1>
            <span className="text-[#0A607D] font-semibold bg-[#0A607D]/10 px-3 py-1 rounded-full text-sm">
              {selectedRooms.length}개 방 선택됨
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            className="px-4 py-2 border border-[#E2E2E2] rounded-[4px] text-sm font-semibold text-[#777] hover:bg-[#F5F5F5] cursor-pointer"
          >
            방 목록으로
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-10 space-y-10">
        {/* 방 선택 */}
        <section className="bg-white rounded-lg border border-[#E2E2E2] p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
              <h2 className="text-lg md:text-xl font-bold text-[#232527]">비교할 방 선택</h2>
              <p className="text-[#A0A0A0] text-sm">최소 {MIN_SELECT}개, 최대 {MAX_SELECT}개까지 선택할 수 있어요.</p>
            </div>
            <p className="text-sm font-semibold text-[#A0A0A0]">{selectedIds.length}/{MAX_SELECT}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guestRooms.map((room) => (
              <RoomSelectCard
                key={room.id}
                room={room}
                selected={selectedIds.includes(room.id)}
                onToggle={toggle}
                canAdd={canAdd}
              />
            ))}
          </div>
        </section>

        {/* 섹션 필터 */}
        {selectedRooms.length >= MIN_SELECT && (
          <section className="bg-white rounded-lg border border-[#E2E2E2] p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#232527] mb-4">표시할 섹션 선택</h2>
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSection(s)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer',
                    activeSections.includes(s)
                      ? 'bg-[#0A607D] text-white border-[#0A607D]'
                      : 'bg-white text-[#777] border-[#E2E2E2] hover:border-[#BFBFBF]',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 비교 테이블 */}
        {selectedRooms.length >= MIN_SELECT && (
          <section className="overflow-x-auto pb-4">
            <CompareTable rooms={selectedRooms} activeSections={activeSections} />
          </section>
        )}

        {/* 종합 요약 */}
        {selectedRooms.length >= MIN_SELECT && (
          <ReportSummary rooms={selectedRooms} />
        )}
      </div>
    </div>
  );
}

// ─── RoomSelectCard ───────────────────────────────────────────
function RoomSelectCard({
  room,
  selected,
  onToggle,
  canAdd,
}: {
  room: Room;
  selected: boolean;
  onToggle: (id: string) => void;
  canAdd: boolean;
}) {
  const disabled = !selected && !canAdd;
  return (
    <div
      onClick={() => !disabled && onToggle(room.id)}
      className={cn(
        'relative p-5 rounded-xl border-2 transition-all',
        selected ? 'border-[#0A607D] bg-[#0A607D]/5' : 'border-[#E2E2E2]',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-[#BFBFBF]',
      )}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1 min-w-0">
          <h3 className="font-bold text-[#232527] truncate">{room.name}</h3>
          <p className="text-xs text-[#A0A0A0] truncate">{room.address || '주소 없음'}</p>
          <p className="text-sm font-semibold text-[#0A607D] mt-2">{room.price}</p>
          <p className="text-xs text-[#A0A0A0]">총점 {room.score}점</p>
        </div>
        <div
          className={cn(
            'w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-2',
            selected ? 'bg-[#0A607D] border-[#0A607D]' : 'border-[#E2E2E2]',
          )}
        >
          {selected && <span className="text-white text-xs font-bold">✓</span>}
        </div>
      </div>
    </div>
  );
}

// ─── CompareTable ─────────────────────────────────────────────
function CompareTable({ rooms, activeSections }: { rooms: Room[]; activeSections: SectionKey[] }) {
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

      {activeSections.includes('기본정보') && (
        <>
          <SectionHeader title="기본 정보" />
          <Row label="거래유형" values={rooms.map((r) => r.type)} />
          <Row label="보증금" values={rooms.map((r) => fmtMoney(r.deposit))} />
          <Row label="월세" values={rooms.map((r) => fmtMoney(r.rent))} />
          <Row label="관리비" values={raws.map((raw) => raw?.basic.isMgmtUnknown ? '모름' : fmtMoney(parseInt(raw?.basic.managementFee || '0', 10) || 0))} />
          <Row label="대출" values={raws.map((raw) => raw?.basic.loanStatus ?? '-')} />
          <Row label="전입신고" values={raws.map((raw) => raw?.basic.moveInReport ?? '-')} />
          <Row label="입주일" values={raws.map((raw) => raw?.basic.moveInDate || (raw?.basic.moveInNegotiable ? '협의 가능' : '-'))} />
        </>
      )}

      {activeSections.includes('건물정보') && (
        <>
          <SectionHeader title="건물 정보" />
          <Row label="건물유형" values={rooms.map((r) => r.buildingType ?? '-')} />
          <Row label="층수" values={raws.map((raw) => raw?.building.floorLevel ?? (raw?.building.floorDirect ? `${raw.building.floorDirect}층` : '-'))} />
          <Row label="엘리베이터" values={raws.map((raw) => raw?.building.elevator ?? '-')} />
          <Row label="방향" values={rooms.map((r) => r.direction ? `${r.direction}향` : '-')} />
        </>
      )}

      {activeSections.includes('옵션') && (
        <>
          <SectionHeader title="옵션" />
          <Row
            label="옵션 목록"
            values={raws.map((raw) => raw?.building.options.length ? raw.building.options.join(', ') : '없음')}
            isLast
          />
        </>
      )}

      {activeSections.includes('내부상태') && (
        <>
          <SectionHeader title="내부 상태" />
          <Row label="채광" values={raws.map((raw) => ratingEmoji(raw?.interior.lighting))} />
          <Row label="환기" values={raws.map((raw) => ratingEmoji(raw?.interior.ventilation))} />
          <Row label="층간소음" values={raws.map((raw) => ratingEmoji(raw?.interior.floorNoise))} />
          <Row label="수압" values={raws.map((raw) => ratingEmoji(raw?.interior.waterPressure))} />
          <Row label="방음" values={raws.map((raw) => ratingEmoji(raw?.interior.soundProof))} />
          <Row label="난방" values={raws.map((raw) => ratingEmoji(raw?.interior.heating))} isLast />
        </>
      )}

      {activeSections.includes('문제요소') && (
        <>
          <SectionHeader title="문제 요소" />
          <Row label="곰팡이" values={raws.map((raw) => yesNoBadge(raw?.interior.mold, 'problem'))} />
          <Row label="벌레" values={raws.map((raw) => yesNoBadge(raw?.interior.pest, 'problem'))} />
          <Row label="누수/결로" values={raws.map((raw) => yesNoBadge(raw?.interior.leak, 'problem'))} />
          <Row label="벽지/장판" values={raws.map((raw) => yesNoBadge(raw?.interior.wallpaper, 'problem'))} />
          <Row label="배수구 냄새" values={raws.map((raw) => yesNoBadge(raw?.interior.drainSmell, 'problem'))} isLast />
        </>
      )}

      {activeSections.includes('안전/생활') && (
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

      {activeSections.includes('나만의항목') && (
        <>
          <SectionHeader title="나만의 항목" />
          {(() => {
            const allKeys = Array.from(
              new Set(raws.flatMap((raw) => raw?.custom.customItems.map((c) => c.label) ?? [])),
            ).filter((k) => k);
            if (allKeys.length === 0) return <Row label="-" values={rooms.map(() => '항목 없음')} isLast />;
            return allKeys.map((key, i) => (
              <Row
                key={key}
                label={key}
                values={raws.map((raw) => raw?.custom.customItems.find((c) => c.label === key)?.value ?? '-')}
                isLast={i === allKeys.length - 1}
              />
            ));
          })()}
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

// ─── ReportSummary ────────────────────────────────────────────
function ReportSummary({ rooms }: { rooms: Room[] }) {
  if (rooms.length === 0) return null;
  const best = rooms.reduce((a, b) => (a.score > b.score ? a : b));
  return (
    <section className="bg-white rounded-lg border border-[#E2E2E2] p-6 md:p-8 shadow-sm">
      <h2 className="text-lg md:text-xl font-bold text-[#232527] mb-6">종합 요약</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const badge = getBadge(room.score);
          const isBest = room.id === best.id && rooms.length > 1;
          return (
            <div
              key={room.id}
              className={cn('p-5 rounded-xl border-2', isBest ? 'border-[#0A607D]' : 'border-[#E2E2E2]')}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-[#232527] truncate">{room.name}</h3>
                {isBest && (
                  <span className="text-xs bg-[#0A607D]/10 text-[#0A607D] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
                    최고점
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('px-3 py-1 rounded-full text-sm font-bold', badge.color)}>{badge.label}</span>
                <span className="text-2xl font-bold text-[#232527]">
                  {room.score}
                  <span className="text-sm font-normal text-[#A0A0A0]">점</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
