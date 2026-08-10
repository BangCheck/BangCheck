import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { useAtlasPreview } from '@/lib/use-atlas-preview';
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
  // Atlas 상세 캔버스가 이 페이지를 띄우면 [data-atlas-node] 영역 좌표를 부모로 보고한다.
  // 화면 동작은 바꾸지 않는다 — 이 페이지는 비로그인 상태에서도 폼 전체가 그려지기 때문이다.
  useAtlasPreview(ROUTES.CHECKLIST_NEW);
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
  const optionItems = checklistItems.filter((i) => i.category === 'OPTION');
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
    // answers 를 함께 넘긴다. 파생 섹션(interior/safety)은 카드 chip·score 용이고
    // 원본이 아니다 — deriveSafetyFromAnswers 는 SAFETY·CONVENIENCE·ENVIRONMENT 를
    // 아직 매핑하지 않아 그 답변들이 파생만으로는 남지 않는다 (BC-ROOM-06).
    const success = addGuestRoom({
      basic, building, interior: derivedInterior, safety: derivedSafety, custom, answers,
    });
    if (!success) {
      setSubmitError(`비로그인 상태에서는 방을 ${GUEST_ROOM_LIMIT}개까지만 등록할 수 있어요.`);
      return;
    }
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ChecklistPageHeader
        title="방 체크리스트"
        onBack={() => navigate(ROUTES.HOME)}
        atlasNode="checklist-new-header"
        atlasLabel="헤더 · 나가기"
      />
      <ChecklistTabNav
        tabNavRef={tabNavRef}
        activeSection={activeSection}
        onScrollTo={scrollToSection}
        filter={(id) => isLoggedIn || id !== 'custom'}
        atlasNode="checklist-new-tabnav"
        atlasLabel="섹션 탭 · 로그인 분기"
      />

      <main className="flex-1 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6 pb-28 flex flex-col gap-8">
        <section
          ref={(el) => { sectionRefs.current.basic = el; }}
          data-atlas-node="checklist-new-basic"
          data-atlas-label="기본 정보 · 주소 검색"
        >
          <BasicInfo data={basic} onChange={patchBasic} />
        </section>

        <BuildingSections
          data={building}
          onChange={patchBuilding}
          optionItems={optionItems}
          buildingRef={(el) => { sectionRefs.current.building = el; }}
          optionsRef={(el) => { sectionRefs.current.options = el; }}
          buildingAtlasNode="checklist-new-building"
          buildingAtlasLabel="건물 정보"
          optionsAtlasNode="checklist-new-options"
          optionsAtlasLabel="옵션"
        />
        <DynamicChecklistSections
          items={checklistItems}
          answers={answers}
          onChange={patchAnswer}
          atlasNode="checklist-new-dynamic"
          atlasLabel="체크 항목 6구간"
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
          atlasNode="checklist-new-memo"
          atlasLabel="메모"
        />
      </main>

      <ChecklistSubmitFooter
        label="저장하기"
        disabled={!basic.name.trim() || isSubmitting}
        isSubmitting={isSubmitting}
        error={submitError}
        onClick={handleSubmit}
        atlasNode="checklist-new-submit"
        atlasLabel="저장 · 방 등록"
      />
    </div>
  );
}
