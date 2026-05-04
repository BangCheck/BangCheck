import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/lib/routes';
import { ChevronRight } from '@/components/ui/ChevronRight';
import { SectionWrapper } from './SectionWrapper';

const FEATURES = [
  {
    imageSrc: '/images/landing/feature-checklist.png',
    imageAlt: '자취 체크리스트 화면',
    title: '자취 체크리스트',
    subtitle: '놓치기 쉬운 항목, 확인하는 방법까지',
    description: '곰팡이, 수압, 방음 등 초보 자취생이 챙겨야 할 필수 항목과 항목별 확인 가이드를 함께 제공합니다. 계약 전, 무엇을 확인해야 할지 미리 점검해보세요',
    cta: { label: '체크리스트 시작하기', href: ROUTES.CHECKLIST_NEW },
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

interface FeatureRowProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  description: string;
  cta?: { label: string; href: string };
}

function FeatureRow({ imageSrc, imageAlt, title, subtitle, description, cta }: FeatureRowProps) {
  return (
    <div className="flex items-start justify-between w-full gap-10">
      <div className="border border-[#191b1e] rounded-[8px] overflow-hidden flex-none w-[568px] h-[434px] relative">
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
      </div>

      <div className="flex flex-col gap-[33px] items-start w-[310px] flex-none">
        <div className="flex flex-col gap-2 items-start">
          <h3 className="font-bold text-[32px] text-[#232527] tracking-[-0.5px] leading-[1.3]">
            {title}
          </h3>
          <p className="font-medium text-[20px] text-[#232527] tracking-[-0.5px] leading-[1.3] text-center">
            &ldquo;{subtitle}&rdquo;
          </p>
        </div>
        <p className="text-[16px] text-[#232527] tracking-[-0.5px] leading-[1.7]">
          {description}
        </p>
        {cta && (
          <Link
            href={cta.href}
            className="flex items-center gap-2 bg-[#e2e2e2] text-[#232527] font-bold text-[16px] tracking-[-0.5px] px-[10px] py-[16px] rounded-[12px] w-[210px] justify-center hover:bg-[#d0d0d0] transition-colors"
          >
            {cta.label}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <SectionWrapper className="bg-white">
      <div className="flex flex-col gap-[100px] items-start max-w-[962px]">
        <div className="flex flex-col gap-[60px] items-start tracking-[-0.5px]">
          <p className="font-bold text-[20px] text-[#0a607d] leading-[1.7]">
            Key Features
          </p>
          <h2 className="font-bold text-[32px] md:text-[40px] text-[#232527] leading-[1.22]">
            막막했던 첫 독립이 설렘이 되는 순간,<br />
            그 시작을 자취생들이 직접 만든 체크리스트가 함께합니다.
          </h2>
        </div>

        <div className="flex flex-col gap-[100px] items-start w-full">
          {FEATURES.map((feature) => (
            <FeatureRow key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
