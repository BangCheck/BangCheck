import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useRoomsList, useCreateRoom } from '@/features/rooms/hooks/use-rooms-query';
import { GUEST_ROOM_LIMIT, ROOM_LIMIT } from '@/lib/constants';

import { useChecklistState } from './hooks/use-checklist-state';
import { useChecklistItems } from './hooks/use-checklist-items';
import { useSectionScroll } from './hooks/use-section-scroll';
import { deriveInteriorFromAnswers, deriveSafetyFromAnswers } from './mappers';
import { ChecklistPageHeader } from './components/ui/ChecklistPageHeader';
import { ChecklistTabNav } from './components/ui/ChecklistTabNav';
import { ChecklistSubmitFooter } from './components/ui/ChecklistSubmitFooter';

import BasicInfo from './components/01_basic-info';
import {
  BuildingSections,
  DynamicChecklistSections,
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

  const {
    basic, building, interior, safety, custom, answers,
    setInterior, setSafety,
    patchBasic, patchBuilding, patchCustom, patchAnswer,
  } = useChecklistState();
  const { data: checklistItems = [] } = useChecklistItems();
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
        await createRoom.mutateAsync({ basic, building, interior, custom, answers, items: checklistItems });
        navigate(ROUTES.HOME);
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
    // 비로그인 흐름: dynamic answers를 레거시 interior/safety로 변환 후 저장.
    const derivedInterior = deriveInteriorFromAnswers(checklistItems, answers, interior);
    const derivedSafety = deriveSafetyFromAnswers(checklistItems, answers, safety);
    setInterior(derivedInterior);
    setSafety(derivedSafety);
    const success = addGuestRoom({ basic, building, interior: derivedInterior, safety: derivedSafety, custom });
    if (!success) {
      setSubmitError(`비로그인 상태에서는 방을 ${GUEST_ROOM_LIMIT}개까지만 등록할 수 있어요.`);
      return;
    }
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ChecklistPageHeader title="방 체크리스트" onBack={() => navigate(ROUTES.HOME)} />
      <ChecklistTabNav
        tabNavRef={tabNavRef}
        activeSection={activeSection}
        onScrollTo={scrollToSection}
        filter={(id) => isLoggedIn || id !== 'custom'}
      />

      <main className="flex-1 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6 pb-28 flex flex-col gap-8">
        <section ref={(el) => { sectionRefs.current.basic = el; }}>
          <BasicInfo data={basic} onChange={patchBasic} />
        </section>

        <BuildingSections
          data={building}
          onChange={patchBuilding}
          buildingRef={(el) => { sectionRefs.current.building = el; }}
          optionsRef={(el) => { sectionRefs.current.options = el; }}
        />
        <DynamicChecklistSections
          items={checklistItems}
          answers={answers}
          onChange={patchAnswer}
          sectionRefs={{
            INTERNAL_STATE: (el) => { sectionRefs.current.interior = el; },
            PROBLEM: (el) => { sectionRefs.current.problems = el; },
            SAFETY: (el) => { sectionRefs.current.safety = el; },
            CONVENIENCE: (el) => { sectionRefs.current.living = el; },
            ENVIRONMENT: (el) => { sectionRefs.current.surround = el; },
            CUSTOM: (el) => { sectionRefs.current.custom = el; },
          }}
        />
        <CustomSections
          data={custom}
          onChange={patchCustom}
          customRef={(el) => { sectionRefs.current.custom = el; }}
          memoRef={(el) => { sectionRefs.current.memo = el; }}
        />
      </main>

      <ChecklistSubmitFooter
        label="저장하기"
        disabled={!basic.name.trim() || isSubmitting}
        isSubmitting={isSubmitting}
        error={submitError}
        onClick={handleSubmit}
      />
    </div>
  );
}
