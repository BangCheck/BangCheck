import type { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { SectionIcon } from '@/components/ui/SectionIcon';
import type { Room } from '@/types/room';
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

function RatingBadge({ value }: { value: '좋음' | '보통' | '나쁨' | null | undefined }) {
  if (!value) return <span className="text-text-mute text-sm">-</span>;
  if (value === '좋음') return <GreenBadge>좋음</GreenBadge>;
  if (value === '보통') return <YellowBadge>보통</YellowBadge>;
  return <RedBadge>나쁨</RedBadge>;
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
  'w-[102px] shrink-0 flex items-center px-2 py-2 bg-[rgba(0,0,0,0.02)] border-r border-[rgba(0,0,0,0.06)] text-sm text-text-main leading-8';

const CELL_CLS = 'flex-1 min-w-[120px] flex items-center px-2 py-2 text-sm text-text-main leading-8';

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
        <div className="min-w-[560px]">{children}</div>
      </div>
    </section>
  );
}

// ─── 금액 포맷터 ─────────────────────────────────────────────────

const fmtMoney = (v?: number) => (v ? `${v.toLocaleString()}만` : '');

function formatPrice(r: Room): string {
  const raw = r.raw?.basic;
  const base = `${r.type} ${fmtMoney(r.deposit)}${r.rent ? `/${fmtMoney(r.rent)}` : ''}`;
  if (!raw) return base;
  const mgmtFee = parseInt(raw.managementFee || '0', 10) || 0;
  const mgmt = raw.isMgmtUnknown
    ? ' (관리비 모름)'
    : mgmtFee > 0
      ? ` (관리비 ${mgmtFee.toLocaleString()}만)`
      : '';
  return base + mgmt;
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────

type Props = {
  rooms: Room[];
  activeSections: ReportSectionId[];
};

export function CompareTable({ rooms, activeSections }: Props) {
  if (rooms.length === 0) return null;

  const raws = rooms.map((r) => r.raw);

  const allOptions = Array.from(
    new Set(raws.flatMap((raw) => raw?.building.options ?? [])),
  );

  return (
    <div className="space-y-10">
      {activeSections.includes('basic') && (
        <SectionCard id="basic" section="basic">
          <RoomHeader rooms={rooms} />
          <TableRow label="거래유형" values={rooms.map((r) => r.type)} />
          <TableRow label="금액" values={rooms.map((r) => formatPrice(r))} />
          <TableRow
            label="융자"
            values={raws.map((raw) => <LoanBadge value={raw?.basic.loanStatus} />)}
          />
          <TableRow
            label="전입신고"
            values={raws.map((raw) => raw?.basic.moveInReport ?? '-')}
          />
          <TableRow
            label="입주일"
            values={raws.map((raw) =>
              raw?.basic.moveInDate || (raw?.basic.moveInNegotiable ? '협의 가능' : '-'),
            )}
          />
        </SectionCard>
      )}

      {activeSections.includes('building') && (
        <SectionCard id="building" section="building">
          <RoomHeader rooms={rooms} />
          <TableRow label="건물유형" values={rooms.map((r) => r.buildingType ?? '-')} />
          <TableRow
            label="층수"
            values={raws.map((raw) =>
              raw?.building.floorLevel ??
              (raw?.building.floorDirect ? `${raw.building.floorDirect}층` : '-'),
            )}
          />
          <TableRow
            label="방향"
            values={rooms.map((r) => (r.direction ? `${r.direction}향` : '-'))}
          />
          <TableRow
            label="엘리베이터"
            values={raws.map((raw) => {
              const v = raw?.building.elevator;
              if (v === '있음')
                return <Icon icon="material-symbols:check-rounded" width={20} height={20} className="text-brand-primary" />;
              if (v === '없음') return <span className="text-text-mute text-sm">✕</span>;
              return <span className="text-text-mute text-sm">-</span>;
            })}
          />
        </SectionCard>
      )}

      {activeSections.includes('option') && (
        <SectionCard id="option" section="option">
          <RoomHeader rooms={rooms} />
          {allOptions.length > 0 ? (
            allOptions.map((opt) => (
              <TableRow
                key={opt}
                label={opt}
                values={raws.map((raw) => (
                  <CheckCell value={raw?.building.options.includes(opt)} />
                ))}
              />
            ))
          ) : (
            <TableRow label="옵션" values={rooms.map(() => '-')} />
          )}
        </SectionCard>
      )}

      {activeSections.includes('condition') && (
        <SectionCard id="condition" section="condition">
          <RoomHeader rooms={rooms} />
          {/* TODO(E06-S03): recharts RadarChart — 내부 상태 항목별 점수 레이더 차트
              데이터: ventilation / waterPressure / soundProof (Rating → 점수 변환)
              설치: npm install recharts */}
          <div className="flex items-center justify-center py-12 text-sm text-text-caption">
            내부 상태 비교 차트 준비 중
          </div>
        </SectionCard>
      )}

      {activeSections.includes('problem') && (
        <SectionCard id="problem" section="problem">
          <RoomHeader rooms={rooms} />
          <TableRow label="곰팡이" values={raws.map((raw) => <ProblemBadge value={raw?.interior.mold} />)} />
          <TableRow label="벌레" values={raws.map((raw) => <ProblemBadge value={raw?.interior.pest} />)} />
          <TableRow label="누수/결로" values={raws.map((raw) => <ProblemBadge value={raw?.interior.leak} />)} />
          <TableRow label="벽지/장판" values={raws.map((raw) => <ProblemBadge value={raw?.interior.wallpaper} />)} />
          <TableRow label="배수구 냄새" values={raws.map((raw) => <ProblemBadge value={raw?.interior.drainSmell} />)} />
        </SectionCard>
      )}

      {activeSections.includes('safety') && (
        <SectionCard id="safety" section="safety">
          <RoomHeader rooms={rooms} />
          <TableRow label="도어락" values={raws.map((raw) => <RatingBadge value={raw?.safety.doorLock} />)} />
          <TableRow label="창문 잠금" values={raws.map((raw) => <RatingBadge value={raw?.safety.windowLock} />)} />
          <TableRow label="CCTV" values={raws.map((raw) => <RatingBadge value={raw?.safety.cctv} />)} />
          <TableRow label="방범" values={raws.map((raw) => <RatingBadge value={raw?.safety.securityState} />)} />
          <TableRow label="밤길 안전" values={raws.map((raw) => <RatingBadge value={raw?.safety.nightSafety} />)} />
          <TableRow label="소음 환경" values={raws.map((raw) => <RatingBadge value={raw?.safety.surroundNoise} />)} />
          <TableRow label="대중교통" values={raws.map((raw) => <RatingBadge value={raw?.safety.transit} />)} />
        </SectionCard>
      )}

      {activeSections.includes('environment') && (
        <SectionCard id="environment" section="environment">
          <RoomHeader rooms={rooms} />
          <TableRow label="데이터 수집" values={rooms.map(() => '준비 중')} />
        </SectionCard>
      )}
    </div>
  );
}
