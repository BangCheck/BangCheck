'use client';

import { cn } from '@/lib/utils';
import type { Room } from '@/types';

interface Props {
  rooms: Room[];
}

function getBadge(score: number): { label: string; color: string } {
  if (score >= 80) return { label: '강력 추천', color: 'bg-[#0A607D] text-white' };
  if (score >= 60) return { label: '추천', color: 'bg-[#2196F3] text-white' };
  if (score >= 40) return { label: '보통', color: 'bg-[#FF9800] text-white' };
  return { label: '비추천', color: 'bg-[#F44336] text-white' };
}

export function ReportSummary({ rooms }: Props) {
  if (rooms.length === 0) return null;

  const best = rooms.reduce((a, b) => a.score > b.score ? a : b);

  return (
    <section className="bg-white rounded-lg border border-[#E2E2E2] p-8 shadow-sm">
      <h2 className="text-xl font-bold text-[#232527] mb-6">종합 요약</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => {
          const badge = getBadge(room.score);
          const isBest = room.id === best.id;
          return (
            <div key={room.id} className={cn(
              'p-5 rounded-xl border-2',
              isBest ? 'border-[#0A607D]' : 'border-[#E2E2E2]'
            )}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-[#232527]">{room.name}</h3>
                {isBest && (
                  <span className="text-xs bg-[#0A607D]/10 text-[#0A607D] font-bold px-2 py-0.5 rounded-full">
                    최고점
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('px-3 py-1 rounded-full text-sm font-bold', badge.color)}>
                  {badge.label}
                </span>
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
