'use client';

import React, { useState } from 'react';
import { cn, formatAmount } from '@/lib/utils';
import type { Room } from '@/types';
import { DeleteRoomModal } from '@/components/ui/Modals';

interface RoomCardProps {
  room: Room;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

const ISSUE_LABELS: Record<string, string> = {
  mold: '곰팡이',
  leak: '누수',
  bug: '벌레',
  condensation: '결로',
  drainSmell: '냄새',
};

const ISSUE_ICONS: Record<string, { color: string; path: React.ReactElement }> = {
  mold: {
    color: '#2EA86E',
    path: (
      <>
        <path d="M12 2C9 5 7 8 7 12c0 3.5 2.5 6 5 6s5-2.5 5-6c0-4-2-7-5-10z" />
        <circle cx="10" cy="11" r="1.2" />
        <circle cx="14" cy="13" r="1" />
        <circle cx="11.5" cy="15" r="0.8" />
      </>
    ),
  },
  leak: {
    color: '#2D8CFF',
    path: <path d="M12 3c-3.5 5-6 8.5-6 12a6 6 0 0 0 12 0c0-3.5-2.5-7-6-12z" />,
  },
  bug: {
    color: '#E5484D',
    path: (
      <>
        <ellipse cx="12" cy="13" rx="5" ry="6" />
        <path d="M7 11l-2-1M7 14h-2M7 17l-2 1M17 11l2-1M17 14h2M17 17l2 1M12 7V4M10 4l2-2 2 2" />
      </>
    ),
  },
  condensation: {
    color: '#0EA5E9',
    path: (
      <>
        <path d="M8 4c-1.5 2-3 4-3 6a3 3 0 0 0 6 0c0-2-1.5-4-3-6z" />
        <path d="M16 11c-1.5 2-3 4-3 6a3 3 0 0 0 6 0c0-2-1.5-4-3-6z" />
      </>
    ),
  },
  drainSmell: {
    color: '#A855F7',
    path: (
      <>
        <path d="M5 9c2-2 4-2 6 0s4 2 6 0M5 14c2-2 4-2 6 0s4 2 6 0M5 19c2-2 4-2 6 0s4 2 6 0" />
      </>
    ),
  },
};

export default function RoomCard({
  room,
  onDelete,
  onClick,
}: RoomCardProps) {
  const { id, name, address, type, deposit, rent, managementFee, price, issues, memo, createdAt, buildingType, floor, direction } = room;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const YYYY = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const DD = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${YYYY}.${MM}.${DD} ${HH}:${mm}`;
  };

  const formattedPrice = price || (type === '전세'
    ? `${formatAmount(deposit)}${managementFee ? `/${managementFee}만` : ''}`
    : `${formatAmount(deposit)}/${formatAmount(rent)}/${managementFee || 0}만`);

  const activeIssues = issues
    ? Object.entries(issues)
        .filter(([, active]) => active)
        .map(([key]) => ({ key, label: ISSUE_LABELS[key] || key }))
    : [];

  const displayIssues = activeIssues.slice(0, 3);
  const extraCount = activeIssues.length - 3;

  const themeColor = '#0a607d';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(id);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick?.(id)}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative p-6 rounded-[6px] bg-white border border-border-light shadow-[0px_6px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer group flex flex-col gap-5 h-full"
        )}
      >
        {/* 1. 등록일시 + 휴지통 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: themeColor }} />
            <span className="text-text-mute text-[12px] font-normal">등록일시</span>
            <span className="text-text-mute text-[12px] font-normal">{formatDateTime(createdAt)}</span>
          </div>
          <button
            type="button"
            aria-label="방 삭제"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteModalOpen(true);
            }}
            className="text-border-mid hover:text-status-danger-text transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>

        {/* 2. 매물명 */}
        <h3 className="text-[18px] font-semibold text-text-main truncate">
          {name}
        </h3>

        {/* 3. 주소 */}
        <div className="flex items-center gap-1 text-text-mute">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
          </svg>
          <span className="text-[12px] font-normal truncate">{address || "주소정보없음"}</span>
        </div>

        {/* 4. 정보 칩 */}
        <div className="flex flex-wrap gap-1.5">
          {[buildingType, floor, direction].filter(Boolean).map((tag, idx) => (
            <span key={idx} className="bg-slot-b-bg text-slot-b-text text-[12px] font-semibold px-1 py-0.5 rounded-[2px] whitespace-nowrap">
              {tag}
            </span>
          ))}
          <span className="bg-slot-b-bg text-slot-b-text text-[12px] font-semibold px-1 py-0.5 rounded-[2px] whitespace-nowrap">
            {formattedPrice}
          </span>
        </div>

        {/* 5. 문제사항 — 단색 보더 칩 */}
        <div className="flex flex-wrap items-center gap-2 min-h-[24px]">
          {activeIssues.length === 0 ? (
            <span className="text-[12px] text-border-light font-medium">문제사항 없음</span>
          ) : (
            <>
              {displayIssues.map((issue) => {
                const icon = ISSUE_ICONS[issue.key];
                return (
                  <div key={issue.key} className="flex items-center gap-1 border border-border-light text-text-main text-[12px] font-medium pl-1 pr-1.5 py-1 rounded-[4px]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={icon?.color ?? 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icon?.path ?? (
                        <>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 8v4M12 16h.01" />
                        </>
                      )}
                    </svg>
                    {issue.label}
                  </div>
                );
              })}
              {extraCount > 0 && (
                <span className="text-text-mute text-[12px] font-medium">
                  + {extraCount}개의 문제사항
                </span>
              )}
            </>
          )}
        </div>

        {/* 구분선 */}
        <div className="h-[1px] bg-border-light w-full" />

        {/* 6. 메모 (라벨 + 본문 분리) */}
        <div className="flex items-start gap-2">
          <span className="text-[12px] text-text-mute font-normal w-8 shrink-0">메모 :</span>
          <p className="text-[12px] text-text-mute font-normal line-clamp-1">
            {memo || "입력된 메모가 없습니다."}
          </p>
        </div>
      </div>

      <DeleteRoomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          onDelete?.(id);
        }}
      />
    </>
  );
}
