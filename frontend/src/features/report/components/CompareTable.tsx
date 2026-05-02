'use client';

import { cn } from '@/lib/utils';
import type { RoomDetail as Room } from '@/types';
import type { SectionKey } from './SectionFilter';

interface Props {
  rooms: Room[];
  activeSections: SectionKey[];
}

const TRANSACTION_LABEL = { JEONSE: '전세', MONTHLY: '월세', SHORT_TERM: '단기임대' };
const BUILDING_LABEL = { VILLA: '빌라', OFFICETEL: '오피스텔', ONE_ROOM: '원룸', TWO_ROOM: '투룸' };
const DIRECTION_LABEL = { SOUTH: '남향', EAST: '동향', WEST: '서향', NORTH: '북향', UNKNOWN: '-' };
const CONDITION_LABEL = { GOOD: '좋음', NORMAL: '보통', BAD: '나쁨' };
const PROBLEM_LABEL = { NONE: '⚪ 없음', SLIGHT: '🟡 약간', SEVERE: '🔴 심함' };
const EXIST_LABEL = { EXIST: '있음', NONE: '없음' };
const BRIGHTNESS_LABEL = { BRIGHT: '밝음', NORMAL: '보통', DARK: '어두움' };
const NOISE_LABEL = { QUIET: '조용', NORMAL: '보통', NOISY: '시끄러움' };
const SPECIAL_FLOOR_LABEL = { SEMI_BASEMENT: '반지하', ROOFTOP: '옥탑방' };

export function CompareTable({ rooms, activeSections }: Props) {
  if (rooms.length === 0) return null;

  const Row = ({ label, values, isLast = false }: { label: string; values: (string | undefined)[]; isLast?: boolean }) => (
    <div className={cn('flex border-b border-[#E2E2E2]', isLast && 'border-0')}>
      <div className="w-[160px] shrink-0 p-4 border-r border-[#E2E2E2] bg-white text-sm font-medium text-[#777]">{label}</div>
      {values.map((val, i) => (
        <div key={i} className="flex-1 p-4 text-center text-sm text-[#232527] border-r border-[#E2E2E2] last:border-0 bg-white">
          {val ?? '-'}
        </div>
      ))}
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-[#F5F5F5] px-5 py-2 text-xs font-bold text-[#777] tracking-wider">{title}</div>
  );

  return (
    <div className="min-w-[700px] bg-white rounded-lg border border-[#E2E2E2] overflow-hidden shadow-md">
      {/* 헤더 */}
      <div className="flex border-b border-[#E2E2E2] bg-[#FAFAFA]">
        <div className="w-[160px] shrink-0 p-4 border-r border-[#E2E2E2] font-bold text-[#232527] text-sm">비교 항목</div>
        {rooms.map(r => (
          <div key={r.id} className="flex-1 p-4 text-center font-bold text-[#232527] text-sm border-r border-[#E2E2E2] last:border-0">
            {r.name}
          </div>
        ))}
      </div>

      {activeSections.includes('기본정보') && (
        <>
          <SectionHeader title="기본 정보" />
          <Row label="거래유형" values={rooms.map(r => TRANSACTION_LABEL[r.transactionType])} />
          <Row label="보증금" values={rooms.map(r => `${r.deposit.toLocaleString()}만`)} />
          <Row label="월세" values={rooms.map(r => r.rent ? `${r.rent.toLocaleString()}만` : '-')} />
          <Row label="관리비" values={rooms.map(r => r.isManagementFeeUnknown ? '모름' : r.managementFee ? `${r.managementFee.toLocaleString()}만` : '-')} />
          <Row label="융자" values={rooms.map(r => r.hasLoan ? `있음 (${r.loanAmount?.toLocaleString() ?? '?'}만)` : '없음')} />
          <Row label="전입신고" values={rooms.map(r => r.canRegisterAddress != null ? (r.canRegisterAddress ? '가능' : '불가') : '-')} />
          <Row label="입주일" values={rooms.map(r => r.moveInDate ?? (r.isMoveInDateNegotiable ? '협의 가능' : '-'))} />
        </>
      )}

      {activeSections.includes('건물정보') && (
        <>
          <SectionHeader title="건물 정보" />
          <Row label="건물유형" values={rooms.map(r => r.buildingType ? BUILDING_LABEL[r.buildingType] : '-')} />
          <Row label="층수" values={rooms.map(r => r.specialFloor ? SPECIAL_FLOOR_LABEL[r.specialFloor] : r.floor ? `${r.floor}층` : '-')} />
          <Row label="엘리베이터" values={rooms.map(r => r.hasElevator != null ? (r.hasElevator ? '있음' : '없음') : '-')} />
          <Row label="주차" values={rooms.map(r => r.hasParking != null ? (r.hasParking ? '가능' : '불가') : '-')} />
          <Row label="향" values={rooms.map(r => r.direction ? DIRECTION_LABEL[r.direction] : '-')} />
        </>
      )}

      {activeSections.includes('옵션') && (
        <>
          <SectionHeader title="옵션" />
          <Row label="옵션 목록" values={rooms.map(r => r.options.length > 0 ? r.options.join(', ') : '없음')} isLast />
        </>
      )}

      {activeSections.includes('내부상태') && (
        <>
          <SectionHeader title="내부 상태" />
          <Row label="채광" values={rooms.map(r => r.evaluations?.sunlight ? CONDITION_LABEL[r.evaluations.sunlight] : '-')} />
          <Row label="환기" values={rooms.map(r => r.evaluations?.ventilation ? CONDITION_LABEL[r.evaluations.ventilation] : '-')} />
          <Row label="수압" values={rooms.map(r => r.evaluations?.waterPressure ? CONDITION_LABEL[r.evaluations.waterPressure] : '-')} />
          <Row label="방음" values={rooms.map(r => r.evaluations?.soundproof ? CONDITION_LABEL[r.evaluations.soundproof] : '-')} isLast />
        </>
      )}

      {activeSections.includes('문제요소') && (
        <>
          <SectionHeader title="문제 요소" />
          <Row label="곰팡이" values={rooms.map(r => r.evaluations?.mold ? PROBLEM_LABEL[r.evaluations.mold] : '-')} />
          <Row label="누수" values={rooms.map(r => r.evaluations?.leak ? PROBLEM_LABEL[r.evaluations.leak] : '-')} />
          <Row label="벌레" values={rooms.map(r => r.evaluations?.bug ? PROBLEM_LABEL[r.evaluations.bug] : '-')} isLast />
        </>
      )}

      {activeSections.includes('안전/생활') && (
        <>
          <SectionHeader title="안전/생활" />
          <Row label="CCTV" values={rooms.map(r => r.evaluations?.cctv ? EXIST_LABEL[r.evaluations.cctv] : '-')} />
          <Row label="야간 밝기" values={rooms.map(r => r.evaluations?.nightSafety ? BRIGHTNESS_LABEL[r.evaluations.nightSafety] : '-')} />
          <Row label="소음" values={rooms.map(r => r.evaluations?.noiseLevel ? NOISE_LABEL[r.evaluations.noiseLevel] : '-')} isLast />
        </>
      )}

      {activeSections.includes('나만의항목') && (
        <>
          <SectionHeader title="나만의 항목" />
          {(() => {
            const allKeys = Array.from(new Set(rooms.flatMap(r => r.customItems?.map(c => c.name) ?? [])));
            if (allKeys.length === 0) return <Row label="-" values={rooms.map(() => '항목 없음')} isLast />;
            return allKeys.map((key, i) => (
              <Row
                key={key}
                label={key}
                values={rooms.map(r => r.customItems?.find(c => c.name === key)?.value ?? '-')}
                isLast={i === allKeys.length - 1}
              />
            ));
          })()}
        </>
      )}

      {/* 총점 */}
      <div className="flex border-t-2 border-[#0A607D] bg-[#0A607D]/5">
        <div className="w-[160px] shrink-0 p-4 border-r border-[#E2E2E2] font-bold text-[#0A607D] text-sm">총점</div>
        {rooms.map(r => (
          <div key={r.id} className="flex-1 p-4 text-center font-bold text-[#0A607D] text-sm border-r border-[#E2E2E2] last:border-0">
            {r.score}점
          </div>
        ))}
      </div>
    </div>
  );
}
