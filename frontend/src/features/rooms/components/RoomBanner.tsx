interface RoomBannerProps {
  activeCount: number;
  customCount: number;
}

export function RoomBanner({ activeCount, customCount }: RoomBannerProps) {
  return (
    <div className="px-4 pb-3">
      <div className="bg-bg-gray border border-border-light rounded-[6px] flex items-center gap-2 px-3 py-2">
        <span className="bg-text-mute text-white text-[12px] font-semibold px-2 py-1 rounded-[4px] leading-none">
          {activeCount}개 항목 활성
        </span>
        {customCount > 0 && (
          <span className="bg-brand-primary/[0.14] text-brand-primary text-[12px] font-semibold px-2 py-1 rounded-[4px] leading-none">
            + {customCount}개 커스텀
          </span>
        )}
      </div>
    </div>
  );
}
