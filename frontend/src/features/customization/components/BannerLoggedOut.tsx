type Props = {
  onGuest: () => void;
  onLogin: () => void;
};

export function BannerLoggedOut({ onGuest, onLogin }: Props) {
  return (
    <div className="bg-bg-gray border border-border-light rounded-[6px] px-6 lg:px-[30px] py-6 lg:py-[12px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="text-center lg:text-left space-y-1.5 md:space-y-2">
        <p className="text-[16px] md:text-[18px] font-bold text-text-main">커스텀 설정은 로그인 후 이용 가능해요</p>
        <p className="text-[12px] md:text-[14px] text-text-mute font-medium leading-relaxed">
          비로그인 상태에서는 기본 체크리스트가 그대로 제공됩니다.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto shrink-0">
        <button
          onClick={onGuest}
          className="w-full lg:w-[265px] py-3 bg-white border border-text-mid rounded-[4px] font-medium text-[14px] md:text-[16px] text-text-mid hover:bg-gray-50 transition-colors"
        >
          비로그인으로 진행하기
        </button>
        <button
          onClick={onLogin}
          className="w-full lg:w-auto px-4 py-3 bg-brand-primary rounded-[4px] font-medium text-[14px] md:text-[16px] text-white hover:bg-brand-primary-dark transition-colors"
        >
          로그인하고 나만의 체크리스트 만들기
        </button>
      </div>
    </div>
  );
}
