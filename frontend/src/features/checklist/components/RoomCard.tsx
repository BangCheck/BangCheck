'use client';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  name: string;
  address: string;
  tags: string[];
  checked?: boolean;
  onToggle?: () => void;
  className?: string;
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-[#a0a0a0]">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function CheckboxEmpty() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
      <rect x="1" y="1" width="16" height="16" rx="3" stroke="#BFBFBF" strokeWidth="1.5" />
    </svg>
  );
}

function CheckboxFilled() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
      <rect width="18" height="18" rx="4" fill="#0A607D" />
      <path d="M4 9L7.5 12.5L14 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RoomCard({ name, address, tags, checked = false, onToggle, className }: RoomCardProps) {
  const badgeVariant = checked ? 'pink' : 'blue';
  const dotColor = checked ? 'bg-[#e87a8c]' : 'bg-[#0A607D]';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'w-full bg-white border border-[#e2e2e2] rounded-[6px] p-3 flex items-start justify-between text-left transition-colors',
        checked && 'border-[#0a607d]',
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className={cn('shrink-0 size-2 rounded-full', dotColor)} />
          <span className="text-[14px] font-semibold leading-[1.3] text-text-main truncate">
            {name}
          </span>
        </div>

        <div className="flex items-center gap-1 pl-[18px]">
          <PinIcon />
          <span className="text-[12px] leading-[1.3] text-[#777] truncate">{address}</span>
        </div>

        <div className="flex flex-wrap gap-1 pl-[18px]">
          {tags.map((tag) => (
            <Badge key={tag} variant={badgeVariant}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="ml-2 mt-0.5">
        {checked ? <CheckboxFilled /> : <CheckboxEmpty />}
      </div>
    </button>
  );
}
