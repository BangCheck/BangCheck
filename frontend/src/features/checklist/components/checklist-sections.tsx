import { useState } from 'react';
import { SelectCard, EmojiCard, SectionHeader, FieldLabel, TextInput, RatingCards, YesNoCards, DynamicOptionCards } from './ui/shared';
import { GuideToggleButton, GuidePanel } from './ui/GuidePanel';
import { CHECKLIST_GUIDES, getGuideByItemName } from '../checklist-guides';
import type { ChecklistGuide } from '../checklist-guides';
import type { BuildingInfoData } from './02_building-info';
import { BUILDING_TYPES, DIRECTIONS } from './02_building-info';
import type { InteriorCheckData } from './03_interior-check';

/** 항목 카드 + (가이드가 있으면) 토글 + 모달 wrapper — static key 기반 */
function ItemWithGuide({
  itemKey,
  children,
}: {
  itemKey: keyof InteriorCheckData;
  children: React.ReactNode;
}) {
  const guide = CHECKLIST_GUIDES[itemKey];
  return <ItemWithGuideRaw guide={guide} children={children} />;
}

/** 가이드 객체를 직접 받는 wrapper (BE-driven 경로용) — 모달 다이얼로그 */
function ItemWithGuideRaw({
  guide,
  children,
}: {
  guide?: ChecklistGuide;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (!guide) return <>{children}</>;
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">{children}</div>
        <GuideToggleButton expanded={open} onToggle={() => setOpen(true)} />
      </div>
      {open && <GuidePanel guide={guide} onClose={() => setOpen(false)} />}
    </>
  );
}
import type { SafetyLivingData } from './04_safety-living';
import type { CustomMemoData } from './05_custom-memo';
import type { ChecklistAnswers } from '@/types';
import type { ChecklistItemResponse, ChecklistCategory } from '@/types';
import { CATEGORY_LABEL } from '../hooks/use-checklist-items';

export function BuildingSections({
  data,
  onChange,
  optionItems,
  buildingRef,
  optionsRef,
}: {
  data: BuildingInfoData;
  onChange: <K extends keyof BuildingInfoData>(key: K, value: BuildingInfoData[K]) => void;
  optionItems: ChecklistItemResponse[];
  buildingRef: React.RefCallback<HTMLElement>;
  optionsRef: React.RefCallback<HTMLElement>;
}) {
  const toggleOption = (v: string) =>
    onChange('options', data.options.includes(v) ? data.options.filter((x) => x !== v) : [...data.options, v]);

  return (
    <>
      <section ref={buildingRef}>
        <SectionHeader title="건물 정보" />
        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel>건물 유형</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BUILDING_TYPES.map((t) => (
                <SelectCard key={t} label={t} active={data.buildingType === t} onClick={() => onChange('buildingType', data.buildingType === t ? null : t)} />
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>엘리베이터</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {(['있음', '없음'] as const).map((v) => (
                <EmojiCard key={v} label={v} variant="feature" active={data.elevator === v} onClick={() => onChange('elevator', data.elevator === v ? null : v)} />
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>층수</FieldLabel>
            <div className="flex items-center gap-3">
              <SelectCard
                label="반지하"
                active={data.floorLevel === '반지하'}
                onClick={() => onChange('floorLevel', data.floorLevel === '반지하' ? null : '반지하')}
                className="shrink-0"
              />
              <div className="flex-1">
                <TextInput
                  value={data.floorDirect}
                  onChange={(v) => onChange('floorDirect', v)}
                  placeholder="층수 입력"
                  suffix="층"
                  type="number"
                  disabled={data.floorLevel === '반지하'}
                />
              </div>
            </div>
          </div>
          <div>
            <FieldLabel>방향</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIRECTIONS.map((v) => (
                <SelectCard key={v} label={v} active={data.direction === v} onClick={() => onChange('direction', data.direction === v ? null : v)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {optionItems.length > 0 && (
        <section ref={optionsRef}>
          <SectionHeader title="옵션 (다중 선택)" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {optionItems.map((item) => (
              <SelectCard
                key={item.id}
                label={item.itemName}
                active={data.options.includes(item.itemName)}
                onClick={() => toggleOption(item.itemName)}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function InteriorSections({
  data,
  onChange,
  interiorRef,
  problemsRef,
}: {
  data: InteriorCheckData;
  onChange: <K extends keyof InteriorCheckData>(key: K, value: InteriorCheckData[K]) => void;
  interiorRef: React.RefCallback<HTMLElement>;
  problemsRef: React.RefCallback<HTMLElement>;
}) {
  return (
    <>
      <section ref={interiorRef}>
        <SectionHeader title="내부 상태" />
        <div className="flex flex-col gap-5">
          <ItemWithGuide itemKey="lighting">
            <RatingCards label="채광" hint={CHECKLIST_GUIDES.lighting?.hint} value={data.lighting} onChange={(v) => onChange('lighting', v)} />
          </ItemWithGuide>
          <ItemWithGuide itemKey="ventilation">
            <RatingCards label="환기" hint={CHECKLIST_GUIDES.ventilation?.hint} value={data.ventilation} onChange={(v) => onChange('ventilation', v)} />
          </ItemWithGuide>
          <ItemWithGuide itemKey="waterPressure">
            <RatingCards label="수압 및 배수" hint={CHECKLIST_GUIDES.waterPressure?.hint} value={data.waterPressure} onChange={(v) => onChange('waterPressure', v)} />
          </ItemWithGuide>
          <ItemWithGuide itemKey="soundProof">
            <RatingCards label="방음" hint={CHECKLIST_GUIDES.soundProof?.hint} value={data.soundProof} onChange={(v) => onChange('soundProof', v)} />
          </ItemWithGuide>
          <ItemWithGuide itemKey="entrance">
            <RatingCards label="현관/문틈" hint={CHECKLIST_GUIDES.entrance?.hint} value={data.entrance} onChange={(v) => onChange('entrance', v)} />
          </ItemWithGuide>
          <RatingCards label="층간소음" value={data.floorNoise} onChange={(v) => onChange('floorNoise', v)} />
          <RatingCards label="난방 상태" value={data.heating} onChange={(v) => onChange('heating', v)} />
        </div>
      </section>

      <section ref={problemsRef}>
        <SectionHeader title="문제 요소" />
        <div className="flex flex-col gap-5">
          <ItemWithGuide itemKey="mold">
            <YesNoCards label="곰팡이" hint={CHECKLIST_GUIDES.mold?.hint} value={data.mold} onChange={(v) => onChange('mold', v)} />
          </ItemWithGuide>
          <ItemWithGuide itemKey="leak">
            <YesNoCards label="누수흔적" hint={CHECKLIST_GUIDES.leak?.hint} value={data.leak} onChange={(v) => onChange('leak', v)} />
          </ItemWithGuide>
          <ItemWithGuide itemKey="pest">
            <YesNoCards label="벌레 흔적" hint={CHECKLIST_GUIDES.pest?.hint} value={data.pest} onChange={(v) => onChange('pest', v)} />
          </ItemWithGuide>
          <ItemWithGuide itemKey="noise">
            <YesNoCards label="내/외부 소음" hint={CHECKLIST_GUIDES.noise?.hint} value={data.noise} onChange={(v) => onChange('noise', v)} />
          </ItemWithGuide>
          <ItemWithGuide itemKey="drainSmell">
            <YesNoCards label="하수구/곰팡이 냄새" hint={CHECKLIST_GUIDES.drainSmell?.hint} value={data.drainSmell} onChange={(v) => onChange('drainSmell', v)} />
          </ItemWithGuide>
          <ItemWithGuide itemKey="humidity">
            <YesNoCards label="습기/결로" hint={CHECKLIST_GUIDES.humidity?.hint} value={data.humidity} onChange={(v) => onChange('humidity', v)} />
          </ItemWithGuide>
          <YesNoCards label="벽지/장판 상태" value={data.wallpaper} onChange={(v) => onChange('wallpaper', v)} />
        </div>
      </section>
    </>
  );
}

export function SafetySections({
  data,
  onChange,
  safetyRef,
  livingRef,
  surroundRef,
}: {
  data: SafetyLivingData;
  onChange: <K extends keyof SafetyLivingData>(key: K, value: SafetyLivingData[K]) => void;
  safetyRef: React.RefCallback<HTMLElement>;
  livingRef: React.RefCallback<HTMLElement>;
  surroundRef: React.RefCallback<HTMLElement>;
}) {
  return (
    <>
      <section ref={safetyRef}>
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

      <section ref={livingRef}>
        <SectionHeader title="생활 편의" />
        <div className="flex flex-col gap-5">
          <RatingCards label="세탁 건조 공간" value={data.laundry} onChange={(v) => onChange('laundry', v)} />
          <RatingCards label="쓰레기 배출" value={data.trash} onChange={(v) => onChange('trash', v)} />
          <YesNoCards label="자전거/킥보드 주차" value={data.bikeParking} onChange={(v) => onChange('bikeParking', v)} />
          <YesNoCards label="인터넷/와이파이" value={data.internet} onChange={(v) => onChange('internet', v)} />
        </div>
      </section>

      <section ref={surroundRef}>
        <SectionHeader title="주변 환경" />
        <div className="flex flex-col gap-5">
          <RatingCards label="소음 환경" value={data.surroundNoise} onChange={(v) => onChange('surroundNoise', v)} />
          <RatingCards label="편의시설 접근성" value={data.amenity} onChange={(v) => onChange('amenity', v)} />
          <RatingCards label="대중교통 접근성" value={data.transit} onChange={(v) => onChange('transit', v)} />
          <RatingCards label="밤길 안전" value={data.nightSafety} onChange={(v) => onChange('nightSafety', v)} />
        </div>
      </section>
    </>
  );
}

export function CustomSections({
  data,
  onChange,
  memoRef,
}: {
  data: CustomMemoData;
  onChange: <K extends keyof CustomMemoData>(key: K, value: CustomMemoData[K]) => void;
  customRef?: React.RefCallback<HTMLElement>;
  memoRef: React.RefCallback<HTMLElement>;
  isLoggedIn?: boolean;
}) {
  return (
    <>
      <section ref={memoRef}>
        <SectionHeader title="메모" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <FieldLabel>메모</FieldLabel>
            <span className="text-[12px] text-text-caption">{data.memo.length}/200</span>
          </div>
          <textarea
            value={data.memo}
            onChange={(e) => onChange('memo', e.target.value)}
            maxLength={200}
            placeholder="방에 대한 메모를 자유롭게 입력하세요."
            rows={5}
            className="w-full px-3 py-3 rounded-[6px] border border-border-mute bg-white outline-none focus:border-brand-primary text-[14px] text-text-main placeholder:text-text-caption resize-none transition-colors"
          />
        </div>
      </section>
    </>
  );
}

// ─── DynamicChecklistSections ─────────────────────────────
const FORM_CATEGORY_ORDER: ChecklistCategory[] = [
  'INTERNAL_STATE', 'PROBLEM', 'SAFETY', 'CONVENIENCE', 'ENVIRONMENT', 'CUSTOM',
];

const POSITIVE_IS_있음_CATEGORIES: ChecklistCategory[] = ['SAFETY', 'CONVENIENCE'];

function DynamicItem({
  item,
  value,
  onChange,
  hintOverride,
}: {
  item: ChecklistItemResponse;
  value: string | null;
  onChange: (v: string | null) => void;
  hintOverride?: string;
}) {
  const beOptions = item.options.map((o) => o.optionValue);
  const isBooleanFallback = beOptions.length === 0 && item.inputType === 'BOOLEAN';
  const isPositiveFirst = item.inputType === 'BOOLEAN' && POSITIVE_IS_있음_CATEGORIES.includes(item.category);
  const options = isBooleanFallback
    ? ['있음', '없음']
    : isPositiveFirst
      ? ['있음', '없음']
      : beOptions;
  const positiveValue = isPositiveFirst ? '있음' : undefined;
  return (
    <DynamicOptionCards
      label={item.itemName}
      hint={hintOverride ?? item.description ?? undefined}
      options={options}
      value={value}
      onChange={onChange}
      positiveValue={positiveValue}
    />
  );
}

export function DynamicChecklistSections({
  items,
  answers,
  onChange,
  sectionRefs = {},
}: {
  items: ChecklistItemResponse[];
  answers: ChecklistAnswers;
  onChange: (itemId: number, value: string | null) => void;
  sectionRefs?: Partial<Record<ChecklistCategory, React.RefCallback<HTMLElement>>>;
}) {
  if (items.length === 0) return null;

  return (
    <>
      {FORM_CATEGORY_ORDER.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <section key={cat} ref={sectionRefs[cat]}>
            <SectionHeader title={CATEGORY_LABEL[cat]} />
            <div className="flex flex-col gap-5">
              {catItems.map((item) => {
                const guide = getGuideByItemName(item.itemName);
                return (
                  <ItemWithGuideRaw key={item.id} guide={guide}>
                    <DynamicItem
                      item={item}
                      value={answers[item.id] ?? null}
                      onChange={(v) => onChange(item.id, v)}
                      hintOverride=""
                    />
                  </ItemWithGuideRaw>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
