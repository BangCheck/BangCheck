import { RatingCards, YesNoCards, SectionHeader } from './ui/shared';
import type { SafetyLivingData } from '@/types';

export type { SafetyLivingData };

interface Props {
  data: SafetyLivingData;
  onChange: <K extends keyof SafetyLivingData>(key: K, value: SafetyLivingData[K]) => void;
}

export default function SafetyLiving({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-10">

      {/* 안전/보안 */}
      <section>
        <SectionHeader title="안전 / 보안" />
        <div className="flex flex-col gap-5">
          <RatingCards label="도어락 작동" value={data.doorLock} onChange={(v) => onChange('doorLock', v)} />
          <RatingCards label="창문 잠금장치" value={data.windowLock} onChange={(v) => onChange('windowLock', v)} />
          <RatingCards label="CCTV/공용현관" value={data.cctv} onChange={(v) => onChange('cctv', v)} />
          <RatingCards label="소화기/화재경보" value={data.fireSafety} onChange={(v) => onChange('fireSafety', v)} />
          <RatingCards label="복도/주변 조명" value={data.hallLight} onChange={(v) => onChange('hallLight', v)} />
          <RatingCards label="방범 상태" value={data.securityState} onChange={(v) => onChange('securityState', v)} />
          <RatingCards label="방충망 상태" value={data.windowScreen} onChange={(v) => onChange('windowScreen', v)} />
        </div>
      </section>

      {/* 생활 편의 */}
      <section>
        <SectionHeader title="생활 편의" />
        <div className="flex flex-col gap-5">
          <RatingCards label="세탁 건조 공간" value={data.laundry} onChange={(v) => onChange('laundry', v)} />
          <RatingCards label="쓰레기 배출" value={data.trash} onChange={(v) => onChange('trash', v)} />
          <YesNoCards label="자전거/킥보드 주차" value={data.bikeParking} onChange={(v) => onChange('bikeParking', v)} />
          <YesNoCards label="인터넷/와이파이" value={data.internet} onChange={(v) => onChange('internet', v)} />
        </div>
      </section>

      {/* 주변 환경 */}
      <section>
        <SectionHeader title="주변 환경" />
        <div className="flex flex-col gap-5">
          <RatingCards label="소음 환경" value={data.surroundNoise} onChange={(v) => onChange('surroundNoise', v)} />
          <RatingCards label="편의시설 접근성" value={data.amenity} onChange={(v) => onChange('amenity', v)} />
          <RatingCards label="대중교통 접근성" value={data.transit} onChange={(v) => onChange('transit', v)} />
          <RatingCards label="밤길 안전" value={data.nightSafety} onChange={(v) => onChange('nightSafety', v)} />
        </div>
      </section>
    </div>
  );
}
