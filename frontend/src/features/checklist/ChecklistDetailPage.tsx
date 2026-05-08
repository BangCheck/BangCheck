import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useGuestRoomStore } from '@/store/use-guest-room-store';

import BasicInfo from './components/01_basic-info';
import {
  BuildingSections,
  InteriorSections,
  SafetySections,
  CustomSections,
} from './ChecklistNewPage';

import type { BasicInfoData } from './components/01_basic-info';
import type { BuildingInfoData } from './components/02_building-info';
import type { InteriorCheckData } from './components/03_interior-check';
import type { SafetyLivingData } from './components/04_safety-living';
import type { CustomMemoData } from './components/05_custom-memo';

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

export default function ChecklistDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getGuestRoom, updateGuestRoom, deleteGuestRoom } = useGuestRoomStore();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('basic');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [basic, setBasic] = useState<BasicInfoData>(initBasic);
  const [building, setBuilding] = useState<BuildingInfoData>(initBuilding);
  const [interior, setInterior] = useState<InteriorCheckData>(initInterior);
  const [safety, setSafety] = useState<SafetyLivingData>(initSafety);
  const [custom, setCustom] = useState<CustomMemoData>(initCustom);

  // 초기 로드: id로 sessionStorage 조회 → raw 복원
  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }
    const room = getGuestRoom(id);
    if (!room || !room.raw) {
      setNotFound(true);
      return;
    }
    setBasic(room.raw.basic);
    setBuilding(room.raw.building);
    setInterior(room.raw.interior);
    setSafety(room.raw.safety);
    setCustom(room.raw.custom);
  }, [id, getGuestRoom]);

  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    basic: null, building: null, options: null, interior: null, problems: null,
    safety: null, living: null, surround: null, custom: null, memo: null,
  });
  const tabNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visibilityMap: Record<string, number> = {};
    SECTION_TABS.forEach(({ id: sid }) => {
      const el = sectionRefs.current[sid];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          visibilityMap[sid] = entry.intersectionRatio;
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

  useEffect(() => {
    const nav = tabNavRef.current;
    if (!nav) return;
    const activeBtn = nav.querySelector(`[data-tab="${activeSection}"]`) as HTMLElement | null;
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeSection]);

  const scrollToSection = useCallback((sid: SectionId) => {
    const el = sectionRefs.current[sid];
    if (!el) return;
    const headerOffset = 112;
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

  const handleUpdate = () => {
    if (!id) return;
    if (!basic.name.trim()) {
      setSubmitError('매물정보(방 이름)를 입력해주세요.');
      return;
    }
    const ok = updateGuestRoom(id, { basic, building, interior, safety, custom });
    if (!ok) {
      setSubmitError('수정에 실패했습니다. 방 정보를 찾을 수 없어요.');
      return;
    }
    navigate('/rooms');
  };

  const handleDelete = () => {
    if (!id) return;
    deleteGuestRoom(id);
    navigate('/rooms');
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-[18px] font-bold text-[#232527]">체크리스트를 찾을 수 없어요</h1>
        <p className="text-[13px] text-[#A0A0A0] text-center">
          요청하신 방이 삭제되었거나, 다른 브라우저에서 저장된 데이터일 수 있어요.
        </p>
        <button
          type="button"
          onClick={() => navigate('/rooms')}
          className="mt-2 px-6 py-2.5 rounded-[6px] bg-[#0A607D] text-white text-[14px] font-bold cursor-pointer"
        >
          내 방 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
        <h1 className="text-[16px] font-semibold text-[#232527] flex-1">체크리스트 수정</h1>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="text-[13px] text-red-500 hover:text-red-600 font-medium cursor-pointer"
        >
          삭제
        </button>
      </header>

      <nav
        ref={tabNavRef}
        className="sticky top-14 z-30 bg-white border-b border-[#E2E2E2] px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar"
      >
        {SECTION_TABS.map(({ id: sid, label }) => (
          <button
            key={sid}
            type="button"
            data-tab={sid}
            onClick={() => scrollToSection(sid)}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-[4px] text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap',
              activeSection === sid
                ? 'bg-[#F7FAFB] border border-[#0A607D] text-[#0A607D]'
                : 'bg-[#EFEFEF] text-[#777] hover:bg-[#E5E5E5]',
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="flex-1 w-full max-w-3xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-32 flex flex-col gap-10">
        <section ref={(el) => { sectionRefs.current.basic = el; }}>
          <BasicInfo data={basic} onChange={patchBasic} />
        </section>

        <BuildingSections
          data={building}
          onChange={patchBuilding}
          buildingRef={(el) => { sectionRefs.current.building = el; }}
          optionsRef={(el) => { sectionRefs.current.options = el; }}
        />
        <InteriorSections
          data={interior}
          onChange={patchInterior}
          interiorRef={(el) => { sectionRefs.current.interior = el; }}
          problemsRef={(el) => { sectionRefs.current.problems = el; }}
        />
        <SafetySections
          data={safety}
          onChange={patchSafety}
          safetyRef={(el) => { sectionRefs.current.safety = el; }}
          livingRef={(el) => { sectionRefs.current.living = el; }}
          surroundRef={(el) => { sectionRefs.current.surround = el; }}
        />
        <CustomSections
          data={custom}
          onChange={patchCustom}
          customRef={(el) => { sectionRefs.current.custom = el; }}
          memoRef={(el) => { sectionRefs.current.memo = el; }}
        />
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E2E2] px-4 py-4 z-30">
        <div className="max-w-3xl lg:max-w-5xl mx-auto flex flex-col gap-2">
          {submitError && (
            <p className="text-[12px] text-red-500 text-center">{submitError}</p>
          )}
          <button
            type="button"
            onClick={handleUpdate}
            disabled={!basic.name.trim()}
            className={cn(
              'w-full py-3.5 rounded-[6px] text-[15px] font-bold transition-all',
              !basic.name.trim()
                ? 'bg-[#BFBFBF] text-white cursor-not-allowed'
                : 'bg-[#0A607D] text-white hover:bg-[#084e6d] cursor-pointer',
            )}
          >
            수정 완료
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-[12px] w-full max-w-sm p-6 flex flex-col gap-4">
            <h2 className="text-[16px] font-bold text-[#232527]">체크리스트를 삭제할까요?</h2>
            <p className="text-[13px] text-[#777]">
              삭제하면 이 방에 대한 모든 체크 정보가 사라져요.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-[6px] border border-[#E2E2E2] text-[14px] text-[#232527] hover:bg-[#F5F5F5] cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-[6px] bg-red-500 text-white text-[14px] font-bold hover:bg-red-600 cursor-pointer"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
