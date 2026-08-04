import type { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { SectionIcon } from './SectionIcon';
import type { Room } from '@/types/room';
import type { RoomFormState } from '@/types';
import { REPORT_SECTIONS, type ReportSectionId } from '@/features/report/lib/sections';

// ─── Badge primitives ────────────────────────────────────────────

function RedBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-px rounded-[4px] border border-status-danger-border bg-status-danger-bg text-xs text-status-danger-text whitespace-nowrap">
      {children}
    </span>
  );
}

function GreenBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-px rounded-[4px] border border-status-safe-border bg-status-safe-bg text-xs text-status-safe-text whitespace-nowrap">
      {children}
    </span>
  );
}

function YellowBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-px rounded-[4px] border border-[#ffc43e] bg-[#fffbf0] text-xs text-[#946200] whitespace-nowrap">
      {children}
    </span>
  );
}

function LoanBadge({ value }: { value: string | null | undefined }) {
  if (!value || value === '-') return <span className="text-text-mute text-sm">-</span>;
  const isProblematic = value !== '없음' && value !== '처리완료';
  return isProblematic ? <RedBadge>{value}</RedBadge> : <GreenBadge>처리완료</GreenBadge>;
}

function ProblemBadge({ value }: { value: '있음' | '없음' | null | undefined }) {
  if (!value) return <span className="text-text-mute text-sm">-</span>;
  return value === '있음' ? <RedBadge>있음</RedBadge> : <GreenBadge>없음</GreenBadge>;
}

function RatingBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-text-mute text-sm">-</span>;
  if (value === '좋음') return <GreenBadge>좋음</GreenBadge>;
  if (value === '보통') return <YellowBadge>보통</YellowBadge>;
  return <RedBadge>나쁨</RedBadge>;
}

function ExistBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-text-mute text-sm">-</span>;
  return value === '있음' ? <GreenBadge>있음</GreenBadge> : <RedBadge>없음</RedBadge>;
}

function DistanceBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-text-mute text-sm">-</span>;
  if (value === '가깝다') return <GreenBadge>가깝다</GreenBadge>;
  if (value === '보통') return <YellowBadge>보통</YellowBadge>;
  return <RedBadge>멀다</RedBadge>;
}

function CheckCell({ value }: { value: boolean | null | undefined }) {
  if (value == null) return <span className="text-text-mute text-sm">-</span>;
  return value ? (
    <Icon icon="material-symbols:check-rounded" width={20} height={20} className="text-brand-primary" />
  ) : (
    <span className="text-text-mute text-sm">-</span>
  );
}

// ─── Table primitives ────────────────────────────────────────────

const LABEL_CLS =
  'w-[80px] md:w-[102px] shrink-0 flex items-center px-2 py-2 bg-[rgba(0,0,0,0.02)] border-r border-[rgba(0,0,0,0.06)] text-sm text-text-main leading-8';

const CELL_CLS = 'flex-1 min-w-[90px] md:min-w-[120px] flex items-center px-2 py-2 text-sm text-text-main leading-8';

function TableRow({ label, values }: { label: string; values: ReactNode[] }) {
  return (
    <div className="flex border-b border-[#f0f0f0] last:border-0">
      <div className={LABEL_CLS}>{label}</div>
      {values.map((val, i) => (
        <div key={i} className={CELL_CLS}>
          {val ?? <span className="text-text-mute">-</span>}
        </div>
      ))}
    </div>
  );
}

function RoomHeader({ rooms }: { rooms: Room[] }) {
  return (
    <div className="flex border-b border-[rgba(0,0,0,0.06)] bg-[rgba(0,0,0,0.02)]">
      <div className={`${LABEL_CLS} border-b-0`} />
      {rooms.map((r) => (
        <div key={r.id} className={`${CELL_CLS} font-semibold text-text-main`}>
          {r.name}
        </div>
      ))}
    </div>
  );
}

function SectionCard({
  id,
  section,
  children,
}: {
  id: ReportSectionId;
  section: ReportSectionId;
  children: ReactNode;
}) {
  const s = REPORT_SECTIONS.find((x) => x.id === section)!;
  return (
    <section id={`section-${id}`} className="space-y-4 scroll-mt-[160px]">
      <div className="flex items-center gap-2.5">
        <SectionIcon section={section} size={20} className="text-text-main" />
        <h2 className="text-base font-bold text-text-main">{s.label}</h2>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[rgba(0,0,0,0.06)] bg-white shadow-sm">
        <div className="min-w-[400px] md:min-w-[560px]">{children}</div>
      </div>
    </section>
  );
}

// ─── 금액 포맷터 ─────────────────────────────────────────────────

const fmtMoney = (v?: number) => (v ? `${v.toLocaleString()}만` : '');

function formatPrice(r: Room, detail: RoomFormState | null): string {
  const base = `${r.type} ${fmtMoney(r.deposit)}${r.rent ? `/${fmtMoney(r.rent)}` : ''}`;
  const mgmtFee = detail
    ? (!detail.basic.isMgmtUnknown && detail.basic.managementFee ? parseInt(detail.basic.managementFee, 10) : 0)
    : (r.raw?.basic ? parseInt(r.raw.basic.managementFee || '0', 10) : 0);
  const isMgmtUnknown = detail?.basic.isMgmtUnknown ?? r.raw?.basic.isMgmtUnknown;
  const mgmt = isMgmtUnknown
    ? ' (관리비 모름)'
    : mgmtFee > 0
      ? ` (관리비 ${mgmtFee.toLocaleString()}만)`
      : '';
  return base + mgmt;
}

// ─── 데이터 접근 헬퍼 ────────────────────────────────────────────

// detail 우선, 없으면 raw fallback
function useBasic(rooms: Room[], details: (RoomFormState | null)[]) {
  return rooms.map((r, i) => details[i]?.basic ?? r.raw?.basic);
}
function useBuilding(rooms: Room[], details: (RoomFormState | null)[]) {
  return rooms.map((r, i) => details[i]?.building ?? r.raw?.building);
}
function useInterior(rooms: Room[], details: (RoomFormState | null)[]) {
  return rooms.map((r, i) => details[i]?.interior ?? r.raw?.interior);
}
function ans(details: (RoomFormState | null)[], i: number, itemId: number): string | null {
  return details[i]?.answers?.[itemId] ?? null;
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────

type Props = {
  rooms: Room[];
  activeSections: ReportSectionId[];
  details?: (RoomFormState | null)[];
};

export function CompareTable({ rooms, activeSections, details = [] }: Props) {
  if (rooms.length === 0) return null;

  const basics   = useBasic(rooms, details);
  const buildings = useBuilding(rooms, details);
  const interiors = useInterior(rooms, details);

  const allOptions = Array.from(
    new Set(buildings.flatMap((b) => b?.options ?? [])),
  );

  return (
    <div className="space-y-10">
      {/* ── 기본 정보 ── */}
      {activeSections.includes('basic') && (
        <SectionCard id="basic" section="basic">
          <RoomHeader rooms={rooms} />
          <TableRow label="거래유형" values={rooms.map((r) => r.type)} />
          <TableRow label="금액" values={rooms.map((r, i) => formatPrice(r, details[i] ?? null))} />
          <TableRow
            label="융자"
            values={basics.map((b) => <LoanBadge value={b?.loanStatus} />)}
          />
          <TableRow
            label="전입신고"
            values={basics.map((b) => b?.moveInReport ?? '-')}
          />
          <TableRow
            label="입주일"
            values={basics.map((b) =>
              b?.moveInDate || (b?.moveInNegotiable ? '협의 가능' : '-'),
            )}
          />
        </SectionCard>
      )}

      {/* ── 건물 정보 ── */}
      {activeSections.includes('building') && (
        <SectionCard id="building" section="building">
          <RoomHeader rooms={rooms} />
          <TableRow label="건물유형" values={rooms.map((r) => r.buildingType ?? '-')} />
          <TableRow
            label="층수"
            values={buildings.map((b) =>
              b?.floorLevel ?? (b?.floorDirect ? `${b.floorDirect}층` : '-'),
            )}
          />
          <TableRow
            label="방향"
            values={rooms.map((r) => r.direction || '-')}
          />
          <TableRow
            label="엘리베이터"
            values={buildings.map((b) => {
              const v = b?.elevator;
              if (v === '있음')
                return <Icon icon="material-symbols:check-rounded" width={20} height={20} className="text-brand-primary" />;
              if (v === '없음') return <span className="text-text-mute text-sm">✕</span>;
              return <span className="text-text-mute text-sm">-</span>;
            })}
          />
        </SectionCard>
      )}

      {/* ── 옵션 ── */}
      {activeSections.includes('option') && (
        <SectionCard id="option" section="option">
          <RoomHeader rooms={rooms} />
          {allOptions.length > 0 ? (
            allOptions.map((opt) => (
              <TableRow
                key={opt}
                label={opt}
                values={buildings.map((b) => (
                  <CheckCell value={b?.options.includes(opt)} />
                ))}
              />
            ))
          ) : (
            <TableRow label="옵션" values={rooms.map(() => '-')} />
          )}
        </SectionCard>
      )}

      {/* ── 내부 상태 ── */}
      {activeSections.includes('condition') && (
        <SectionCard id="condition" section="condition">
          <RoomHeader rooms={rooms} />
          <TableRow label="채광"       values={rooms.map((_, i) => <RatingBadge value={ans(details, i, 9)} />)} />
          <TableRow label="환기"       values={rooms.map((_, i) => <RatingBadge value={ans(details, i, 10)} />)} />
          <TableRow label="수압 및 배수" values={rooms.map((_, i) => <RatingBadge value={ans(details, i, 11)} />)} />
        </SectionCard>
      )}

      {/* ── 문제 요소 ── */}
      {activeSections.includes('problem') && (
        <SectionCard id="problem" section="problem">
          <RoomHeader rooms={rooms} />
          <TableRow label="곰팡이"    values={interiors.map((t) => <ProblemBadge value={t?.mold} />)} />
          <TableRow label="벌레"      values={interiors.map((t) => <ProblemBadge value={t?.pest} />)} />
          <TableRow label="누수/결로" values={interiors.map((t) => <ProblemBadge value={t?.leak} />)} />
          <TableRow label="벽지/장판" values={interiors.map((t) => <ProblemBadge value={t?.wallpaper} />)} />
          <TableRow label="배수구 냄새" values={interiors.map((t) => <ProblemBadge value={t?.drainSmell} />)} />
        </SectionCard>
      )}

      {/* ── 안전/생활 ── */}
      {activeSections.includes('safety') && (
        <SectionCard id="safety" section="safety">
          <RoomHeader rooms={rooms} />
          <TableRow label="공동 현관"     values={rooms.map((_, i) => <ExistBadge value={ans(details, i, 21)} />)} />
          <TableRow label="창문 잠금장치"  values={rooms.map((_, i) => <ExistBadge value={ans(details, i, 22)} />)} />
          <TableRow label="CCTV"         values={rooms.map((_, i) => <ExistBadge value={ans(details, i, 23)} />)} />
          <TableRow label="소화기/화재경보" values={rooms.map((_, i) => <ExistBadge value={ans(details, i, 28)} />)} />
          <TableRow label="카페/공부공간"  values={rooms.map((_, i) => <ExistBadge value={ans(details, i, 29)} />)} />
          <TableRow label="코인세탁소"    values={rooms.map((_, i) => <ExistBadge value={ans(details, i, 30)} />)} />
          <TableRow label="자전거/주차"   values={rooms.map((_, i) => <ExistBadge value={ans(details, i, 31)} />)} />
          <TableRow label="병원/약국"     values={rooms.map((_, i) => <ExistBadge value={ans(details, i, 32)} />)} />
          <TableRow label="세탁건조공간"  values={rooms.map((_, i) => <ExistBadge value={ans(details, i, 36)} />)} />
        </SectionCard>
      )}

      {/* ── 주변 환경 ── */}
      {activeSections.includes('environment') && (
        <SectionCard id="environment" section="environment">
          <RoomHeader rooms={rooms} />
          <TableRow label="편의점/마트"   values={rooms.map((_, i) => <DistanceBadge value={ans(details, i, 37)} />)} />
          <TableRow label="대중교통"     values={rooms.map((_, i) => <DistanceBadge value={ans(details, i, 38)} />)} />
        </SectionCard>
      )}
    </div>
  );
}
