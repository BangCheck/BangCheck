import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useRoomsList, useCreateRoom } from '@/features/rooms/hooks/useRoomsQuery';
import { GUEST_ROOM_LIMIT, ROOM_LIMIT } from '@/lib/constants';

import { SECTION_TABS } from './checklist-constants';
import { useChecklistState } from './hooks/use-checklist-state';
import { useSectionScroll } from './hooks/use-section-scroll';

import BasicInfo from './components/01_basic-info';
import {
  BuildingSections,
  InteriorSections,
  SafetySections,
  CustomSections,
} from './components/checklist-sections';

export default function ChecklistNewPage() {
  const navigate = useNavigate();
  const { addGuestRoom, guestRooms } = useGuestRoomStore();
  const { isLoggedIn } = useAuthStore();
  const { data: apiRooms } = useRoomsList();
  const loggedInRoomCount = apiRooms?.length ?? 0;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createRoom = useCreateRoom();

  const { basic, building, interior, safety, custom, patchBasic, patchBuilding, patchInterior, patchSafety, patchCustom } = useChecklistState();
  const { activeSection, sectionRefs, tabNavRef, scrollToSection } = useSectionScroll();

  const handleSubmit = async () => {
    if (!basic.name.trim()) {
      setSubmitError('매물정보(방 이름)를 입력해주세요.');
      return;
    }

    if (isLoggedIn) {
      if (loggedInRoomCount >= ROOM_LIMIT) {
        setSubmitError(`방은 최대 ${ROOM_LIMIT}개까지 등록할 수 있어요.`);
        return;
      }
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await createRoom.mutateAsync({ basic, building, interior, custom });
        navigate('/rooms');
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setSubmitError(msg ?? '등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
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

      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E2E2] h-14 flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => navigate('/rooms')}
          className="p-1 text-[#232527] cursor-pointer"
          aria-label="뒤로 가기"
        >
          <BackChevron />
        </button>
        <h1 className="text-[16px] font-semibold text-[#232527]">방 체크리스트</h1>
      </header>

      <nav
        ref={tabNavRef}
        className="sticky top-14 z-30 bg-white border-b border-[#E2E2E2] px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar"
      >
        {SECTION_TABS.filter((t) => isLoggedIn || t.id !== 'custom').map(({ id, label }) => (
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

      <main className="flex-1 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8 pb-32 flex flex-col gap-10">
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
          isLoggedIn={isLoggedIn}
        />
      </main>

      <div className="fixed bottom-0 left-0 right-0 md:sticky md:bottom-auto bg-white border-t border-[#E2E2E2] px-4 py-4 z-30">
        <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto flex flex-col gap-2">
          {submitError && (
            <p className="text-[12px] text-red-500 text-center">{submitError}</p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!basic.name.trim() || isSubmitting}
            className={cn(
              'w-full py-3.5 rounded-[6px] text-fluid-lg font-bold transition-all',
              !basic.name.trim() || isSubmitting
                ? 'bg-[#BFBFBF] text-white cursor-not-allowed'
                : 'bg-[#0A607D] text-white hover:bg-[#084e6d] cursor-pointer',
            )}
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>

    </div>
  );
}

function BackChevron() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
