type Props = {
  onGuest: () => void;
  onLogin: () => void;
};

export function BannerLoggedOut({ onGuest, onLogin }: Props) {
  return (
    <div
      data-atlas-node="custom-guest-gate"
      data-atlas-label="비로그인 게이트"
      className="bg-bg-gray border border-border-light rounded-[6px] px-6 lg:px-[30px] py-6 lg:py-[12px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6"
    >
      <div className="text-center lg:text-left space-y-1.5 md:space-y-2">
        <p className="text-[16px] md:text-[18px] font-bold text-text-main">커스텀 설정은 로그인 후 이용 가능해요</p>
        <p className="text-[12px] md:text-[14px] text-text-mute font-medium leading-relaxed">
          비로그인 상태에서는 기본 체크리스트가 그대로 제공됩니다.
        </p>
      </div>
      <div className="flex flex-row gap-2 lg:gap-3 w-full lg:w-auto shrink-0">
        <button
          onClick={onGuest}
          className="flex-1 lg:flex-none lg:w-[265px] h-[34px] lg:h-auto lg:py-3 bg-white border border-text-mid rounded-[4px] font-medium text-[12px] md:text-[14px] lg:text-[16px] text-text-mid hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          비로그인으로 진행하기
        </button>
        <button
          onClick={onLogin}
          className="flex-1 lg:flex-none lg:w-auto lg:px-4 h-[34px] lg:h-auto lg:py-3 bg-brand-primary rounded-[4px] font-medium text-[12px] md:text-[14px] lg:text-[16px] text-white hover:bg-brand-primary-dark transition-colors whitespace-nowrap"
        >
          로그인하고 맞춤 설정하기
        </button>
      </div>
    </div>
  );
}
