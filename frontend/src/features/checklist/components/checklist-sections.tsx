import { SelectCard, EmojiCard, SectionHeader, FieldLabel, TextInput, RatingCards, YesNoCards } from './ui/shared';
import type { BuildingInfoData } from './02_building-info';
import type { InteriorCheckData } from './03_interior-check';
import type { SafetyLivingData } from './04_safety-living';
import type { CustomMemoData } from './05_custom-memo';

const BUILDING_TYPES = ['원룸', '1.5룸', '빌라', '오피스텔', '고시원', '하숙'];
const DIRECTIONS = ['남향', '동향', '서향', '북향'];
const OPTION_LIST = ['에어컨', '세탁기', '냉장고', '인터넷/와이파이', '가스레인지/인덕션', '책상/의자', '옷장/수납', '난방'];

export function BuildingSections({
  data,
  onChange,
  buildingRef,
  optionsRef,
}: {
  data: BuildingInfoData;
  onChange: <K extends keyof BuildingInfoData>(key: K, value: BuildingInfoData[K]) => void;
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
                <EmojiCard key={v} emoji={v === '있음' ? '😊' : '😞'} label={v} active={data.elevator === v} onClick={() => onChange('elevator', data.elevator === v ? null : v)} />
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

      <section ref={optionsRef}>
        <SectionHeader title="옵션 (다중 선택)" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OPTION_LIST.map((opt) => (
            <SelectCard key={opt} label={opt} active={data.options.includes(opt)} onClick={() => toggleOption(opt)} />
          ))}
        </div>
      </section>
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
          <RatingCards label="채광" value={data.lighting} onChange={(v) => onChange('lighting', v)} />
          <RatingCards label="환기" value={data.ventilation} onChange={(v) => onChange('ventilation', v)} />
          <RatingCards label="층간소음" value={data.floorNoise} onChange={(v) => onChange('floorNoise', v)} />
          <RatingCards label="수압" value={data.waterPressure} onChange={(v) => onChange('waterPressure', v)} />
          <RatingCards label="방음" value={data.soundProof} onChange={(v) => onChange('soundProof', v)} />
          <RatingCards label="난방 상태" value={data.heating} onChange={(v) => onChange('heating', v)} />
        </div>
      </section>

      <section ref={problemsRef}>
        <SectionHeader title="문제 요소" />
        <div className="flex flex-col gap-5">
          <YesNoCards label="곰팡이" hint="벽지 모서리, 욕실 천장, 창문 주변, 싱크대 하부 확인" value={data.mold} onChange={(v) => onChange('mold', v)} />
          <YesNoCards label="벌레 흔적" hint="싱크대 하부, 창틀, 몰딩 주변, 배수구 확인" value={data.pest} onChange={(v) => onChange('pest', v)} />
          <YesNoCards label="누수/결로" hint="천장 얼룩, 창문 물기, 화장실 배관 연결부 확인" value={data.leak} onChange={(v) => onChange('leak', v)} />
          <YesNoCards label="벽지/장판 상태" hint="찢어짐, 들뜸, 오염 확인" value={data.wallpaper} onChange={(v) => onChange('wallpaper', v)} />
          <YesNoCards label="배수구 냄새" hint="욕실/주방 배수구 냄새 확인" value={data.drainSmell} onChange={(v) => onChange('drainSmell', v)} />
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
  customRef,
  memoRef,
  isLoggedIn = false,
}: {
  data: CustomMemoData;
  onChange: <K extends keyof CustomMemoData>(key: K, value: CustomMemoData[K]) => void;
  customRef: React.RefCallback<HTMLElement>;
  memoRef: React.RefCallback<HTMLElement>;
  isLoggedIn?: boolean;
}) {
  const addItem = () => {
    if (data.customItems.length >= 5) return;
    onChange('customItems', [...data.customItems, { label: `항목 ${data.customItems.length + 1}`, value: '' }]);
  };
  const removeItem = (idx: number) =>
    onChange('customItems', data.customItems.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: 'label' | 'value', val: string) =>
    onChange('customItems', data.customItems.map((it, i) => i === idx ? { ...it, [field]: val } : it));

  return (
    <>
      {isLoggedIn && (
        <section ref={customRef}>
          <SectionHeader title="나만의 체크 항목" />
          <div className="flex flex-col gap-4">
            {data.customItems.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 p-4 bg-bg-gray-light rounded-[8px] border border-border-light">
                <div className="flex items-center gap-2">
                  <span className="text-[18px]">✏️</span>
                  <input
                    value={item.label}
                    onChange={(e) => updateItem(idx, 'label', e.target.value)}
                    placeholder="항목 이름"
                    className="flex-1 text-[14px] font-medium text-text-main bg-transparent outline-none border-b border-border-light pb-0.5 focus:border-brand-primary"
                  />
                  <button type="button" onClick={() => removeItem(idx)} className="text-[12px] text-text-caption hover:text-red-400 cursor-pointer shrink-0">
                    삭제
                  </button>
                </div>
                <input
                  value={item.value}
                  onChange={(e) => updateItem(idx, 'value', e.target.value)}
                  placeholder="답변을 입력하세요"
                  className="w-full h-[36px] px-3 rounded-[6px] border border-border-mute bg-white text-[14px] text-text-main placeholder:text-text-caption outline-none focus:border-brand-primary"
                />
              </div>
            ))}
            {data.customItems.length < 5 && (
              <button
                type="button"
                onClick={addItem}
                className="flex items-center justify-center gap-2 py-3 border border-dashed border-border-mute rounded-[6px] text-[14px] text-text-mute hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
              >
                <span className="text-[18px] leading-none">+</span>
                항목 추가 ({data.customItems.length}/5)
              </button>
            )}
          </div>
        </section>
      )}

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
