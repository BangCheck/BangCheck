import { RatingCards, YesNoCards, SectionHeader } from './ui/shared';
import type { Rating, YesNo } from './ui/shared';

export interface InteriorCheckData {
  lighting: Rating;
  ventilation: Rating;
  floorNoise: Rating;
  waterPressure: Rating;
  soundProof: Rating;
  heating: Rating;
  mold: YesNo;
  pest: YesNo;
  leak: YesNo;
  wallpaper: YesNo;
  drainSmell: YesNo;
}

interface Props {
  data: InteriorCheckData;
  onChange: <K extends keyof InteriorCheckData>(key: K, value: InteriorCheckData[K]) => void;
}

export default function InteriorCheck({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-10">

      {/* 내부 상태 */}
      <section>
        <SectionHeader title="내부 상태" />
        <div className="flex flex-col gap-5">
          <RatingCards label="채광" value={data.lighting} onChange={(v) => onChange('lighting', v)} />
          <RatingCards label="환기" value={data.ventilation} onChange={(v) => onChange('ventilation', v)} />
          <RatingCards label="층간소음" value={data.floorNoise} onChange={(v) => onChange('floorNoise', v)} />
          <RatingCards label="수압" value={data.waterPressure} onChange={(v) => onChange('waterPressure', v)} />
          <RatingCards label="방음" value={data.soundProof} onChange={(v) => onChange('soundProof', v)} />
          <RatingCards label="난방 상태" value={data.heating} onChange={(v) => onChange('heating', v)} />
        </div>
      </section>

      {/* 문제 요소 */}
      <section>
        <SectionHeader title="문제 요소" />
        <div className="flex flex-col gap-5">
          <YesNoCards label="곰팡이" hint="벽지 모서리, 욕실 천장, 창문 주변, 싱크대 하부 확인" value={data.mold} onChange={(v) => onChange('mold', v)} />
          <YesNoCards label="벌레 흔적" hint="싱크대 하부, 창틀, 몰딩 주변, 배수구 확인" value={data.pest} onChange={(v) => onChange('pest', v)} />
          <YesNoCards label="누수/결로" hint="천장 얼룩, 창문 물기, 화장실 배관 연결부 확인" value={data.leak} onChange={(v) => onChange('leak', v)} />
          <YesNoCards label="벽지/장판 상태" hint="찢어짐, 들뜸, 오염 확인" value={data.wallpaper} onChange={(v) => onChange('wallpaper', v)} />
          <YesNoCards label="배수구 냄새" hint="욕실/주방 배수구 냄새 확인" value={data.drainSmell} onChange={(v) => onChange('drainSmell', v)} />
        </div>
      </section>
    </div>
  );
}
