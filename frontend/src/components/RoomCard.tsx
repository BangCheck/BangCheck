'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Room } from '@/types';
import { ItemIcons } from '@/features/customization/components/Icons';

interface RoomCardProps {
  room: Room;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

/**
 * 방 카드 컴포넌트 (SCR-DASHBOARD-CARD)
 * 최신 디자인 시안 및 기능 명세서 반영
 */
export default function RoomCard({
  room,
  onDelete,
  onClick,
}: RoomCardProps) {
  const { id, name, address, type, deposit, rent, managementFee, price, issues, memo, createdAt, buildingType, floor, direction } = room;

  // 1. 등록일자 포맷: YYYY.MM.DD HH:mm (24시간제)
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const YYYY = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const DD = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${YYYY}.${MM}.${DD} ${HH}:${mm}`;
  };

  // 2. 금액 변환 로직 (만원 단위 입력 기준)
  const formatPriceValue = (val: number | undefined) => {
    if (val === undefined || val === null) return '0';
    if (val >= 10000) {
      const eok = Math.floor(val / 10000);
      const remainder = val % 10000;
      const cheon = Math.floor(remainder / 1000);
      return `${eok}억${cheon > 0 ? ` ${cheon}천` : ''}`;
    }
    return val.toLocaleString();
  };

  const formattedPrice = price || (type === '전세' 
    ? `${formatPriceValue(deposit)}` 
    : `${formatPriceValue(deposit)}/${formatPriceValue(rent)}${managementFee ? `/${managementFee}` : ''}`);

  // 3. 문제 요소 설정
  const issueConfig: Record<string, { label: string; color: string }> = {
    mold: { label: '곰팡이', color: 'text-[#228A2C]' },
    leak: { label: '누수', color: 'text-[#94BDF9]' },
    bug: { label: '벌레', color: 'text-[#34181F]' },
    condensation: { label: '결로', color: 'text-[#A0A0A0]' },
    drainSmell: { label: '냄새', color: 'text-[#A0A0A0]' },
  };

  const activeIssues = issues ? Object.entries(issues)
    .filter(([, active]) => active)
    .map(([key]) => ({
      key,
      ...issueConfig[key] || { label: key, color: 'text-[#A0A0A0]' }
    })) : [];

  const displayIssues = activeIssues.slice(0, 3);
  const extraCount = activeIssues.length - 3;

  // 4. 카드 테마 (Dot 컬러)
  const colors = ['#5B213B', '#0A607D', '#3E4F2E', '#777777', '#21255B', '#7D0A4E'];
  const themeColor = colors[parseInt(id.slice(-1), 16) % colors.length] || colors[0];

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
        "relative p-6 rounded-[20px] bg-white border border-[#E2E2E2] shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all cursor-pointer group flex flex-col h-full"
      )}
    >
      {/* 1. 등록일자 및 삭제 버튼 */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: themeColor }} />
          <span className="text-[#A0A0A0] text-[13px] font-bold">등록일시 {formatDateTime(createdAt)}</span>
        </div>
        <button
          type="button"
          onClick={(e) => { 
            e.stopPropagation();
            onDelete?.(id); 
          }}
          className="text-[#D9D9D9] hover:text-[#F15556] transition-colors cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>

      {/* 2. 매물명 및 위치 */}
      <div className="mb-6">
        <h3 className="text-[22px] font-bold text-[#232527] truncate mb-1.5 tracking-tight">
          {name}
        </h3>
        <div className="flex items-center gap-1 text-[#A0A0A0]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="text-[13px] font-bold">{address || "주소정보없음"}</span>
        </div>
      </div>

      {/* 3. 요약 정보 (Chips) */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {[buildingType, floor, direction].filter(Boolean).map((tag, idx) => (
          <span key={idx} className="bg-[#F6E7EF] text-[#7D0A4E] text-[13px] font-bold px-3 py-1 rounded-md">
            {tag}
          </span>
        ))}
        <span className="bg-[#F6E7EF] text-[#7D0A4E] text-[13px] font-bold px-3 py-1 rounded-md">
          {type} {formattedPrice}
        </span>
      </div>

      {/* 4. 문제 요소 */}
      <div className="flex items-center gap-3 mb-6 min-h-[24px]">
        {activeIssues.length === 0 ? (
          <span className="text-[14px] text-[#E2E2E2] font-bold tracking-tight">문제사항 없음</span>
        ) : (
          <div className="flex items-center gap-2.5">
            {displayIssues.map((issue) => (
              <div key={issue.key} className={cn("flex items-center gap-1 text-[14px] font-bold", issue.color)}>
                <span className="w-4 h-4 flex items-center justify-center">
                  {ItemIcons[issue.key] || ItemIcons.default}
                </span>
                {issue.label}
              </div>
            ))}
            {extraCount > 0 && (
              <span className="text-[#A0A0A0] text-[14px] font-bold">
                + {extraCount}개의 문제사항
              </span>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[#F5F5F5] w-full mb-5" />

      {/* 6. 하단 메모 */}
      {memo && (
        <div className="flex items-start gap-1">
          <p className="text-[14px] text-[#777777] font-bold line-clamp-1">
            메모 : {memo}
          </p>
        </div>
      )}
    </div>
  );
}
