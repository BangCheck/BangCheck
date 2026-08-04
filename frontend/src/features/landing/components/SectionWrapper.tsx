import { cn } from '@/lib/utils';
import { SECTION_PADDING } from './constants';

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Atlas 상세 캔버스가 이 영역을 카드와 잇기 위해 읽는 식별자.
   * LandingPage가 [data-atlas-node]를 훑어 좌표를 부모 프레임으로 보낸다.
   * 값이 없으면 속성 자체가 붙지 않는다.
   */
  atlasNode?: string;
  atlasLabel?: string;
}

export function SectionWrapper({ children, className, atlasNode, atlasLabel }: SectionWrapperProps) {
  return (
    <section
      className={cn(SECTION_PADDING, 'w-full', className)}
      data-atlas-node={atlasNode}
      data-atlas-label={atlasLabel}
    >
      {children}
    </section>
  );
}
