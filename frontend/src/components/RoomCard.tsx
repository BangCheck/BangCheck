'use client';

import React from 'react';
import { cn, formatAmount } from '@/lib/utils';
import type { Room } from '@/types';
import { ItemIcons } from '@/features/customization/components/Icons';

interface RoomCardProps {
  room: Room;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

/**
 * 방 카드 컴포넌트 (SCR-DASHBOARD-CARD)
 * 최신 디자인 시안 반영
 */
export default function RoomCard({
  room,
  onDelete,
  onClick,
}: RoomCardProps) {
  const { id, name, address, type, deposit, rent, managementFee, price, issues, memo, createdAt, buildingType, floor, direction } = room;

  // 1. 등록일자 포맷: YYYY.MM.DD HH:mm
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
    ? formatAmount(deposit)
    : `${formatAmount(deposit)}/${formatAmount(rent)}/${managementFee || 0}만`);

  // 3. 문제 요소 설정
  const issueConfig: Record<string, { label: string; color: string }> = {
    mold: { label: '곰팡이', color: 'text-[#228A2C]' },   // 자연 녹색 — 토큰 없음
    leak: { label: '누수', color: 'text-[#94BDF9]' },     // 하늘 파랑 — 토큰 없음
    bug: { label: '벌레', color: 'text-[#34181F]' },      // 다크 브라운 — 토큰 없음
    condensation: { label: '결로', color: 'text-text-caption' },
    drainSmell: { label: '냄새', color: 'text-text-caption' },
  };

  const activeIssues = issues ? Object.entries(issues)
    .filter(([, active]) => active)
    .map(([key]) => ({
      key,
      ...issueConfig[key] || { label: key, color: 'text-text-caption' }
    })) : [];

  const displayIssues = activeIssues.slice(0, 3);
  const extraCount = activeIssues.length - 3;

  // 4. 카드 테마 (Blue Dot 고정) — brand-primary hex, inline style 필요
  const themeColor = '#0a607d';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(id)}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative p-4 lg:p-5 rounded-[12px] bg-white border border-border-light shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer group flex flex-col h-full"
      )}
    >
      {/* 1. 상단: 등록일자 및 액션 */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }} />
          <span className="text-text-caption text-fluid-base font-medium">등록일시 {formatDateTime(createdAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* TODO: 삭제 확인 모달 추가 필요 — 현재는 confirm 없이 즉시 삭제됨 */}
          <button
            type="button"
            aria-label="방 삭제"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(id);
            }}
            className="text-border-mid hover:text-status-danger-text transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
          <div className="text-border-mid">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 2. 매물명 및 주소 */}
      <div className="mb-3">
        <h3 className="text-fluid-2xl font-bold text-text-main truncate mb-1 tracking-tight">
          {name}
        </h3>
        <div className="flex items-center gap-1 text-text-caption">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
          </svg>
          <span className="text-fluid-base font-medium truncate">{address || "주소정보없음"}</span>
        </div>
      </div>

      {/* 3. 요약 정보 (Chips) - 블루 테마 적용 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {[buildingType, floor, direction].filter(Boolean).map((tag, idx) => (
          <span key={idx} className="bg-bg-brand-lighter text-brand-primary text-fluid-base font-bold px-2 py-0.5 rounded-[4px] whitespace-nowrap">
            {tag}
          </span>
        ))}
        <span className="bg-bg-brand-lighter text-brand-primary text-fluid-base font-bold px-2 py-0.5 rounded-[4px] whitespace-nowrap">
          {formattedPrice}
        </span>
      </div>

      {/* 4. 문제 요소 */}
      <div className="flex items-center gap-3 mb-4 min-h-[20px]">
        {activeIssues.length === 0 ? (
          <span className="text-fluid-base text-border-light font-medium tracking-tight">문제사항 없음</span>
        ) : (
          <div className="flex items-center gap-3">
            {displayIssues.map((issue) => (
              <div key={issue.key} className={cn("flex items-center gap-1 text-fluid-base font-medium", issue.color)}>
                <span className="w-5 h-5 flex items-center justify-center">
                  {ItemIcons[issue.key] || ItemIcons.default}
                </span>
                {issue.label}
              </div>
            ))}
            {extraCount > 0 && (
              <span className="text-text-caption text-fluid-base font-medium">
                + {extraCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="h-[1px] bg-border-light w-full mb-3" />

      {/* 6. 하단 메모 */}
      <div className="flex items-start gap-1">
        <p className="text-fluid-lg text-text-mute font-medium line-clamp-1">
          메모 : {memo || "입력된 메모가 없습니다."}
        </p>
      </div>
    </div>
  );
}
