import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { ChevronRight } from '@/components/ui/ChevronRight';
import { SectionWrapper } from './SectionWrapper';
import { LoginRequiredModal } from '@/components/ui/Modals';
import { useAuthStore } from '@/store/use-auth-store';
import { SESSION_KEY_LANDING_MODAL_SHOWN } from '@/lib/constants';

type Feature = {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  description: string;
  cta?: { label: string; href: string };
};

const FEATURES: readonly Feature[] = [
  {
    imageSrc: '/images/landing/feature-checklist.png',
    imageAlt: '자취 체크리스트 화면',
    title: '자취 체크리스트',
    subtitle: '놓치기 쉬운 항목, 확인하는 방법까지',
    description: '곰팡이, 수압, 방음 등 초보 자취생이 챙겨야 할 필수 항목과 항목별 확인 가이드를 함께 제공합니다. 계약 전, 무엇을 확인해야 할지 미리 점검해보세요',
    cta: { label: '체크리스트 시작하기', href: ROUTES.HOME },
  },
  {
    imageSrc: '/images/landing/feature-distance.png',
    imageAlt: '학교·역 거리 확인 화면',
    title: '학교·역 거리 확인',
    subtitle: '지도 위에서 바로 확인하는 나의 생활권',
    description: '주요 거점까지의 실제 보행 거리를 지도 위에서 실시간으로 계산합니다. 단순히 직선거리가 아닌, 내가 직접 걷게 될 길과 소요 시간을 확인하여 완벽한 위치를 찾아보세요.',
  },
  {
    imageSrc: '/images/landing/feature-custom.png',
    imageAlt: '나만의 기준 설정 화면',
    title: '나만의 기준 설정',
    subtitle: '나에게 맞는 유형을 골라, 맞춤 체크리스트로',
    description: '나에게 가장 가까운 유형을 선택해보세요. 당신만의 전용 체크리스트를 통해 라이프스타일에 딱 맞는 최적의 방을 발견할 수 있습니다.',
  },
  {
    imageSrc: '/images/landing/feature-compare.png',
    imageAlt: '방 비교하기 화면',
    title: '방 비교하기',
    subtitle: '느낌이 아닌 내가 직접 체크한 데이터로',
    description: '여러 매물을 보느라 복잡해진 머릿속을 명쾌하게 정리해드립니다. 직접 체크한 매물들을 나란히 놓고 비교하며, 내 기준에 맞는 후회 없는 선택을 내려보세요',
  },
] as const;

function ChecklistStartButton({ className }: { className?: string }) {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    if (isLoggedIn) {
      navigate(ROUTES.HOME);
      return;
    }
    const alreadyShown = sessionStorage.getItem(SESSION_KEY_LANDING_MODAL_SHOWN);
    if (alreadyShown) {
      navigate(ROUTES.HOME);
      return;
    }
    sessionStorage.setItem(SESSION_KEY_LANDING_MODAL_SHOWN, '1');
    setModalOpen(true);
  };

  return (
    <>
      <button type="button" onClick={handleClick} className={className}>
        체크리스트 시작하기
        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </button>
      <LoginRequiredModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onContinueAsGuest={() => { setModalOpen(false); navigate(ROUTES.HOME); }}
        onLogin={() => { setModalOpen(false); navigate(ROUTES.LOGIN); }}
      />
    </>
  );
}

function FeatureRowMobile({ feature, isFirst }: { feature: Feature; isFirst: boolean }) {
  return (
    <div className="flex flex-col gap-[36px] items-start w-full">
      <div
        className={
          'border border-border-light rounded-[3px] overflow-hidden w-full ' +
          (isFirst ? 'aspect-[333/254]' : 'aspect-[220/158]')
        }
      >
        <img src={feature.imageSrc} alt={feature.imageAlt} className="w-full h-full object-cover" loading="lazy" />
      </div>

      <div className="flex flex-col gap-[18px] items-center w-full">
        <div className="flex flex-col gap-1 items-center w-full">
          <h3 className="font-bold text-fluid-2xl text-text-main tracking-[-0.18px] leading-[1.3] text-center">
            {feature.title}
          </h3>
          <p className="font-medium text-fluid-xl text-text-sub tracking-[-0.18px] leading-[1.3] text-center">
            &ldquo;{feature.subtitle}&rdquo;
          </p>
        </div>
        <p className="text-fluid-xs text-text-mute tracking-[-0.2px] leading-[1.3] text-center px-5">
          {feature.description}
        </p>
        {feature.cta && (
          <ChecklistStartButton className="flex items-center gap-1.5 bg-brand-primary text-white font-semibold text-fluid-base tracking-[-0.18px] pl-4 pr-3 py-3 rounded shadow-[0_12px_11px_rgba(10,96,125,0.27)] hover:bg-brand-primary-dark transition-colors cursor-pointer" />
        )}
      </div>
    </div>
  );
}

function FeatureRowDesktop({ feature }: { feature: Feature }) {
  return (
    <div className="flex items-start justify-between w-full gap-10">
      <div className="border border-bg-dark rounded-[8px] overflow-hidden flex-none w-[568px] h-[434px] relative">
        <img src={feature.imageSrc} alt={feature.imageAlt} className="w-full h-full object-cover" loading="lazy" />
      </div>

      <div className="flex flex-col gap-[33px] items-start w-[310px] flex-none">
        <div className="flex flex-col gap-2 items-start">
          <h3 className="font-bold text-fluid-4xl text-text-main tracking-[-0.5px] leading-[1.3]">
            {feature.title}
          </h3>
          <p className="font-medium text-fluid-3xl text-text-main tracking-[-0.5px] leading-[1.3] text-center">
            &ldquo;{feature.subtitle}&rdquo;
          </p>
        </div>
        <p className="text-fluid-xl text-text-main tracking-[-0.5px] leading-[1.7]">
          {feature.description}
        </p>
        {feature.cta && (
          <ChecklistStartButton className="flex items-center gap-2 bg-border-light text-text-main font-bold text-fluid-xl tracking-[-0.5px] px-[10px] py-[16px] rounded-[12px] w-[210px] justify-center hover:bg-bg-gray-hover transition-colors cursor-pointer" />
        )}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <SectionWrapper
      atlasNode="landing-features"
      atlasLabel="기능 소개 · 게스트 분기"
      className="bg-white px-6 py-[70px] md:px-[190px] md:py-[140px]"
    >
      <div className="flex flex-col gap-[50px] md:gap-[100px] items-start max-w-[962px]">
        <div className="flex flex-col gap-[40px] md:gap-[60px] items-start tracking-[-0.5px]">
          <p className="font-bold text-fluid-xl text-brand-primary leading-[1.7]">
            Key Features
          </p>
          <h2 className="font-bold text-fluid-5xl text-text-main leading-[1.35] md:leading-[1.22]">
            막막했던 첫 독립이 설렘이 되는 순간,<br />
            그 시작을 자취생들이 직접 만든 체크리스트가 함께합니다.
          </h2>
        </div>

        <div className="flex flex-col gap-[90px] md:gap-[100px] items-start w-full">
          {FEATURES.map((feature, i) => (
            <div key={feature.title} className="w-full">
              <div className="md:hidden">
                <FeatureRowMobile feature={feature} isFirst={i === 0} />
              </div>
              <div className="hidden md:block">
                <FeatureRowDesktop feature={feature} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
