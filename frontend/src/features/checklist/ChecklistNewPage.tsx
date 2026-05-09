import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useRoomsList } from '@/features/rooms/hooks/useRoomsQuery';
import { GUEST_ROOM_LIMIT, ROOM_LIMIT } from '@/lib/constants';

import BasicInfo from './components/01_basic-info';

import type { BasicInfoData } from './components/01_basic-info';
import type { BuildingInfoData } from './components/02_building-info';
import type { InteriorCheckData } from './components/03_interior-check';
import type { SafetyLivingData } from './components/04_safety-living';
import type { CustomMemoData } from './components/05_custom-memo';

// ─── 섹션 탭 정의 ────────────────────────────────────────────
const SECTION_TABS = [
  { id: 'basic', label: '기본 정보' },
  { id: 'building', label: '건물 정보' },
  { id: 'options', label: '옵션' },
  { id: 'interior', label: '내부 상태' },
  { id: 'problems', label: '문제 요소' },
  { id: 'safety', label: '안전/보안' },
  { id: 'living', label: '생활 편의' },
  { id: 'surround', label: '주변 환경' },
  { id: 'custom', label: '나만의 체크 항목' },
  { id: 'memo', label: '메모' },
] as const;

type SectionId = (typeof SECTION_TABS)[number]['id'];

// ─── 초기 상태 ───────────────────────────────────────────────
const initBasic: BasicInfoData = {
  name: '', address: '', transactionType: null,
  deposit: '', monthlyRent: '', managementFee: '',
  includeMgmtInRent: false, isMgmtUnknown: false,
  loanStatus: null, loanAmount: '', moveInReport: null,
  moveInDate: '', moveInNegotiable: false,
};

const initBuilding: BuildingInfoData = {
  buildingType: null, elevator: null,
  floorLevel: null, floorDirect: '',
  direction: null, options: [],
};

const initInterior: InteriorCheckData = {
  lighting: null, ventilation: null, floorNoise: null,
  waterPressure: null, soundProof: null, heating: null,
  mold: null, pest: null, leak: null,
  wallpaper: null, drainSmell: null,
};

const initSafety: SafetyLivingData = {
  doorLock: null, windowLock: null, cctv: null,
  fireSafety: null, hallLight: null, securityState: null,
  windowScreen: null, laundry: null, trash: null,
  bikeParking: null, internet: null,
  surroundNoise: null, amenity: null, transit: null, nightSafety: null,
};

const initCustom: CustomMemoData = { customItems: [], memo: '' };

// ─── Page ────────────────────────────────────────────────────
export default function ChecklistNewPage() {
  const navigate = useNavigate();
  const { addGuestRoom, guestRooms } = useGuestRoomStore();
  const { isLoggedIn } = useAuthStore();
  const { data: apiRooms } = useRoomsList();
  const loggedInRoomCount = apiRooms?.length ?? 0;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('basic');

  const [basic, setBasic] = useState<BasicInfoData>(initBasic);
  const [building, setBuilding] = useState<BuildingInfoData>(initBuilding);
  const [interior, setInterior] = useState<InteriorCheckData>(initInterior);
  const [safety, setSafety] = useState<SafetyLivingData>(initSafety);
  const [custom, setCustom] = useState<CustomMemoData>(initCustom);

  // 섹션 ref 맵
  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    basic: null, building: null, options: null, interior: null, problems: null,
    safety: null, living: null, surround: null, custom: null, memo: null,
  });

  const tabNavRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver — 가장 많이 보이는 섹션을 activeSection으로
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibilityMap: Record<string, number> = {};

    SECTION_TABS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          visibilityMap[id] = entry.intersectionRatio;
          const best = Object.entries(visibilityMap).reduce(
            (acc, [k, v]) => (v > acc[1] ? [k, v] : acc),
            ['', 0],
          );
          if (best[1] > 0) setActiveSection(best[0] as SectionId);
        },
        { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-80px 0px -20% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // 활성 탭이 바뀌면 탭 버튼을 스크롤로 보이게
  useEffect(() => {
    const nav = tabNavRef.current;
    if (!nav) return;
    const activeBtn = nav.querySelector(`[data-tab="${activeSection}"]`) as HTMLElement | null;
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeSection]);

  const scrollToSection = useCallback((id: SectionId) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const headerOffset = 112; // 헤더(56px) + 탭바(56px)
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  function patchBasic<K extends keyof BasicInfoData>(key: K, value: BasicInfoData[K]) {
    setBasic((prev) => ({ ...prev, [key]: value }));
  }
  function patchBuilding<K extends keyof BuildingInfoData>(key: K, value: BuildingInfoData[K]) {
    setBuilding((prev) => ({ ...prev, [key]: value }));
  }
  function patchInterior<K extends keyof InteriorCheckData>(key: K, value: InteriorCheckData[K]) {
    setInterior((prev) => ({ ...prev, [key]: value }));
  }
  function patchSafety<K extends keyof SafetyLivingData>(key: K, value: SafetyLivingData[K]) {
    setSafety((prev) => ({ ...prev, [key]: value }));
  }
  function patchCustom<K extends keyof CustomMemoData>(key: K, value: CustomMemoData[K]) {
    setCustom((prev) => ({ ...prev, [key]: value }));
  }

  const handleSubmit = () => {
    if (!basic.name.trim()) {
      setSubmitError('매물정보(방 이름)를 입력해주세요.');
      return;
    }

    if (isLoggedIn) {
      if (loggedInRoomCount >= ROOM_LIMIT) {
        setSubmitError(`방은 최대 ${ROOM_LIMIT}개까지 등록할 수 있어요.`);
        return;
      }
      // BE 연동은 E09-S10에서 통합 (mappers 재작성 + createChecklist mutation 부착)
      setSubmitError('로그인 모드 체크리스트 저장은 준비 중입니다.');
      return;
    }

    if (guestRooms.length >= GUEST_ROOM_LIMIT) {
      setSubmitError(`비로그인 상태에서는 방을 ${GUEST_ROOM_LIMIT}개까지만 등록할 수 있어요.`);
      return;
    }
    const success = addGuestRoom({ basic, building, interior, safety, custom });

    if (!success) {
      setSubmitError(`비로그인 상태에서는 방을 ${GUEST_ROOM_LIMIT}개까지만 등록할 수 있어요.`);
      return;
    }
    navigate('/rooms');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E2E2] h-14 flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => navigate('/rooms')}
          className="p-1 text-[#232527] cursor-pointer"
          aria-label="뒤로 가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-[16px] font-semibold text-[#232527]">방 체크리스트</h1>
      </header>

      {/* 섹션 점프 탭 */}
      <nav
        ref={tabNavRef}
        className="sticky top-14 z-30 bg-white border-b border-[#E2E2E2] px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar"
      >
        {SECTION_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            data-tab={id}
            onClick={() => scrollToSection(id)}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-[4px] text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap',
              activeSection === id
                ? 'bg-[#F7FAFB] border border-[#0A607D] text-[#0A607D]'
                : 'bg-[#EFEFEF] text-[#777] hover:bg-[#E5E5E5]',
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* 폼 — 단일 스크롤 */}
      <main className="flex-1 w-full max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-32 flex flex-col gap-10">

        {/* 기본 정보 */}
        <section ref={(el) => { sectionRefs.current.basic = el; }}>
          <BasicInfo data={basic} onChange={patchBasic} />
        </section>

        {/* 건물 정보 — BuildingInfo 내부를 두 섹션으로 분리해 ref 부착 */}
        <BuildingSections
          data={building}
          onChange={patchBuilding}
          buildingRef={(el) => { sectionRefs.current.building = el; }}
          optionsRef={(el) => { sectionRefs.current.options = el; }}
        />

        {/* 내부 상태 / 문제 요소 — InteriorCheck 내부 분리 */}
        <InteriorSections
          data={interior}
          onChange={patchInterior}
          interiorRef={(el) => { sectionRefs.current.interior = el; }}
          problemsRef={(el) => { sectionRefs.current.problems = el; }}
        />

        {/* 안전/보안 / 생활 편의 / 주변 환경 — SafetyLiving 내부 분리 */}
        <SafetySections
          data={safety}
          onChange={patchSafety}
          safetyRef={(el) => { sectionRefs.current.safety = el; }}
          livingRef={(el) => { sectionRefs.current.living = el; }}
          surroundRef={(el) => { sectionRefs.current.surround = el; }}
        />

        {/* 나만의 체크 항목 / 메모 */}
        <CustomSections
          data={custom}
          onChange={patchCustom}
          customRef={(el) => { sectionRefs.current.custom = el; }}
          memoRef={(el) => { sectionRefs.current.memo = el; }}
        />
      </main>

      {/* 하단 고정 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E2E2] px-4 py-4 z-30">
        <div className="max-w-3xl lg:max-w-5xl mx-auto flex flex-col gap-2">
          {submitError && (
            <p className="text-[12px] text-red-500 text-center">{submitError}</p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!basic.name.trim()}
            className={cn(
              'w-full py-3.5 rounded-[6px] text-[15px] font-bold transition-all',
              !basic.name.trim()
                ? 'bg-[#BFBFBF] text-white cursor-not-allowed'
                : 'bg-[#0A607D] text-white hover:bg-[#084e6d] cursor-pointer',
            )}
          >
            저장하기
          </button>
        </div>
      </div>

    </div>
  );
}

// ─── 섹션 분리 래퍼 컴포넌트들 ──────────────────────────────

import { SelectCard, EmojiCard, SectionHeader, FieldLabel, TextInput } from './components/ui/shared';
import { RatingCards, YesNoCards } from './components/ui/shared';

const BUILDING_TYPES = ['원룸', '투룸', '빌라', '오피스텔', '아파트', '고시원'];
const DIRECTIONS = ['남향', '동향', '서향', '북향'];
const OPTION_LIST = ['에어컨', '세탁기', '냉장고', '가스레인지', '인덕션', '전자레인지', '침대', '책상', '옷장'];

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
            <div className="flex flex-wrap gap-3">
              {(['저층', '중층', '고층'] as const).map((v) => (
                <SelectCard key={v} label={v} active={data.floorLevel === v} onClick={() => onChange('floorLevel', data.floorLevel === v ? null : v)} className="flex-1 min-w-[80px]" />
              ))}
              <div className="flex-1 min-w-[120px]">
                <TextInput value={data.floorDirect} onChange={(v) => onChange('floorDirect', v)} placeholder="직접 입력" suffix="층" type="number" />
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
}: {
  data: CustomMemoData;
  onChange: <K extends keyof CustomMemoData>(key: K, value: CustomMemoData[K]) => void;
  customRef: React.RefCallback<HTMLElement>;
  memoRef: React.RefCallback<HTMLElement>;
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
      <section ref={customRef}>
        <SectionHeader title="나만의 체크 항목" />
        <div className="flex flex-col gap-4">
          {data.customItems.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2 p-4 bg-[#F9F9F9] rounded-[8px] border border-[#E2E2E2]">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">✏️</span>
                <input
                  value={item.label}
                  onChange={(e) => updateItem(idx, 'label', e.target.value)}
                  placeholder="항목 이름"
                  className="flex-1 text-[14px] font-medium text-[#232527] bg-transparent outline-none border-b border-[#E2E2E2] pb-0.5 focus:border-[#0A607D]"
                />
                <button type="button" onClick={() => removeItem(idx)} className="text-[12px] text-[#A0A0A0] hover:text-red-400 cursor-pointer shrink-0">
                  삭제
                </button>
              </div>
              <input
                value={item.value}
                onChange={(e) => updateItem(idx, 'value', e.target.value)}
                placeholder="답변을 입력하세요"
                className="w-full h-[36px] px-3 rounded-[6px] border border-[#BFBFBF] bg-white text-[14px] text-[#232527] placeholder:text-[#A0A0A0] outline-none focus:border-[#0A607D]"
              />
            </div>
          ))}
          {data.customItems.length < 5 && (
            <button
              type="button"
              onClick={addItem}
              className="flex items-center justify-center gap-2 py-3 border border-dashed border-[#BFBFBF] rounded-[6px] text-[14px] text-[#777] hover:border-[#0A607D] hover:text-[#0A607D] transition-colors cursor-pointer"
            >
              <span className="text-[18px] leading-none">+</span>
              항목 추가 ({data.customItems.length}/5)
            </button>
          )}
        </div>
      </section>

      <section ref={memoRef}>
        <SectionHeader title="메모" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <FieldLabel>메모</FieldLabel>
            <span className="text-[12px] text-[#A0A0A0]">{data.memo.length}/200</span>
          </div>
          <textarea
            value={data.memo}
            onChange={(e) => onChange('memo', e.target.value)}
            maxLength={200}
            placeholder="방에 대한 메모를 자유롭게 입력하세요."
            rows={5}
            className="w-full px-3 py-3 rounded-[6px] border border-[#BFBFBF] bg-white outline-none focus:border-[#0A607D] text-[14px] text-[#232527] placeholder:text-[#A0A0A0] resize-none transition-colors"
          />
        </div>
      </section>
    </>
  );
}
