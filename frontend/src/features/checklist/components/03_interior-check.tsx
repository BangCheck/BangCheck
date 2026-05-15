import { useState } from 'react';
import { RatingCards, YesNoCards, SectionHeader } from './ui/shared';
import { GuideToggleButton, GuidePanel } from './ui/GuidePanel';
import { CHECKLIST_GUIDES } from '../checklist-guides';
import type { InteriorCheckData } from '@/types';

export type { InteriorCheckData };

type InteriorKey = keyof InteriorCheckData;

interface Props {
  data: InteriorCheckData;
  onChange: <K extends keyof InteriorCheckData>(key: K, value: InteriorCheckData[K]) => void;
}

/** 항목 카드 + (가이드가 있으면) 토글 + 펼침 패널을 감싸는 wrapper */
function ItemWithGuide({
  itemKey,
  children,
}: {
  itemKey: InteriorKey;
  children: React.ReactNode;
}) {
  const guide = CHECKLIST_GUIDES[itemKey];
  const [expanded, setExpanded] = useState(false);

  if (!guide) return <>{children}</>;

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">{children}</div>
        <GuideToggleButton expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      </div>
      {expanded && <GuidePanel guide={guide} />}
    </div>
  );
}

export default function InteriorCheck({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-10">
      {/* §4 내부 상태 — 3-radio (좋음/보통/나쁨) */}
      <section>
        <SectionHeader title="내부 상태" />
        <div className="flex flex-col gap-5">
          <ItemWithGuide itemKey="lighting">
            <RatingCards
              label="채광"
              hint={CHECKLIST_GUIDES.lighting?.hint}
              value={data.lighting}
              onChange={(v) => onChange('lighting', v)}
            />
          </ItemWithGuide>
          <ItemWithGuide itemKey="ventilation">
            <RatingCards
              label="환기"
              hint={CHECKLIST_GUIDES.ventilation?.hint}
              value={data.ventilation}
              onChange={(v) => onChange('ventilation', v)}
            />
          </ItemWithGuide>
          <ItemWithGuide itemKey="waterPressure">
            <RatingCards
              label="수압 및 배수"
              hint={CHECKLIST_GUIDES.waterPressure?.hint}
              value={data.waterPressure}
              onChange={(v) => onChange('waterPressure', v)}
            />
          </ItemWithGuide>
          <ItemWithGuide itemKey="soundProof">
            <RatingCards
              label="방음"
              hint={CHECKLIST_GUIDES.soundProof?.hint}
              value={data.soundProof}
              onChange={(v) => onChange('soundProof', v)}
            />
          </ItemWithGuide>
          <ItemWithGuide itemKey="entrance">
            <RatingCards
              label="현관/문틈"
              hint={CHECKLIST_GUIDES.entrance?.hint}
              value={data.entrance}
              onChange={(v) => onChange('entrance', v)}
            />
          </ItemWithGuide>
          {/* 가이드 없음 — 기존 유지 */}
          <RatingCards label="층간소음" value={data.floorNoise} onChange={(v) => onChange('floorNoise', v)} />
          <RatingCards label="난방 상태" value={data.heating} onChange={(v) => onChange('heating', v)} />
        </div>
      </section>

      {/* §5 문제 요소 — 2-radio (없음/있음) */}
      <section>
        <SectionHeader title="문제 요소" />
        <div className="flex flex-col gap-5">
          <ItemWithGuide itemKey="mold">
            <YesNoCards
              label="곰팡이"
              hint={CHECKLIST_GUIDES.mold?.hint}
              value={data.mold}
              onChange={(v) => onChange('mold', v)}
            />
          </ItemWithGuide>
          <ItemWithGuide itemKey="leak">
            <YesNoCards
              label="누수흔적"
              hint={CHECKLIST_GUIDES.leak?.hint}
              value={data.leak}
              onChange={(v) => onChange('leak', v)}
            />
          </ItemWithGuide>
          <ItemWithGuide itemKey="pest">
            <YesNoCards
              label="벌레 흔적"
              hint={CHECKLIST_GUIDES.pest?.hint}
              value={data.pest}
              onChange={(v) => onChange('pest', v)}
            />
          </ItemWithGuide>
          <ItemWithGuide itemKey="noise">
            <YesNoCards
              label="내/외부 소음"
              hint={CHECKLIST_GUIDES.noise?.hint}
              value={data.noise}
              onChange={(v) => onChange('noise', v)}
            />
          </ItemWithGuide>
          <ItemWithGuide itemKey="drainSmell">
            <YesNoCards
              label="하수구/곰팡이 냄새"
              hint={CHECKLIST_GUIDES.drainSmell?.hint}
              value={data.drainSmell}
              onChange={(v) => onChange('drainSmell', v)}
            />
          </ItemWithGuide>
          <ItemWithGuide itemKey="humidity">
            <YesNoCards
              label="습기/결로"
              hint={CHECKLIST_GUIDES.humidity?.hint}
              value={data.humidity}
              onChange={(v) => onChange('humidity', v)}
            />
          </ItemWithGuide>
          {/* 가이드 없음 — 기존 유지 */}
          <YesNoCards label="벽지/장판 상태" value={data.wallpaper} onChange={(v) => onChange('wallpaper', v)} />
        </div>
      </section>
    </div>
  );
}
