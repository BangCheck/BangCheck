import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useRoomDetail, useUpdateRoom, useDeleteRoom } from '@/features/rooms/hooks/use-rooms-query';

import { useChecklistState } from './hooks/use-checklist-state';
import { useChecklistItems } from './hooks/use-checklist-items';
import { useSectionScroll } from './hooks/use-section-scroll';
import { ChecklistPageHeader } from './components/ui/ChecklistPageHeader';
import { ChecklistTabNav } from './components/ui/ChecklistTabNav';
import { ChecklistSubmitFooter } from './components/ui/ChecklistSubmitFooter';

import BasicInfo from './components/01_basic-info';
import {
  BuildingSections,
  DynamicChecklistSections,
  CustomSections,
} from './components/checklist-sections';

export default function ChecklistDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuthStore();
  const { getGuestRoom, updateGuestRoom, deleteGuestRoom } = useGuestRoomStore();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const {
    basic, setBasic,
    building, setBuilding,
    interior, setInterior,
    safety, setSafety,
    custom, setCustom,
    answers, setAnswers,
    patchBasic, patchBuilding, patchCustom, patchAnswer,
  } = useChecklistState();
  const { data: checklistItems = [] } = useChecklistItems();
  const { activeSection, sectionRefs, tabNavRef, scrollToSection } = useSectionScroll();

  const { data: beRoom, isError: beError } = useRoomDetail(isLoggedIn ? id : undefined);
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  // 로그인 — BE 데이터로 폼 초기화 (에러 시 notFound)
  useEffect(() => {
    if (!isLoggedIn) return;
    if (beError) { setNotFound(true); return; }
    if (!beRoom) return;
    console.log('[ChecklistDetailPage] beRoom loaded:', beRoom);
    console.log('[ChecklistDetailPage] answers restored:', beRoom.answers);
    setBasic(beRoom.basic);
    setBuilding(beRoom.building);
    setInterior(beRoom.interior);
    setAnswers(beRoom.answers ?? {});
    setCustom(beRoom.custom);
  }, [isLoggedIn, beRoom, beError, setBasic, setBuilding, setInterior, setAnswers, setCustom]);

  // 비로그인 — sessionStorage에서 방 데이터 로드
  useEffect(() => {
    if (isLoggedIn) return;
    if (!id) { setNotFound(true); return; }
    const room = getGuestRoom(id);
    if (!room?.raw) { setNotFound(true); return; }
    setBasic(room.raw.basic);
    setBuilding(room.raw.building);
    setInterior(room.raw.interior);
    setSafety(room.raw.safety);
    setCustom(room.raw.custom);
  }, [isLoggedIn, id, getGuestRoom, setBasic, setBuilding, setInterior, setSafety, setCustom]);

  const handleUpdate = async () => {
    if (!id || !basic.name.trim()) {
      setSubmitError('매물정보(방 이름)를 입력해주세요.');
      return;
    }

    if (isLoggedIn) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await updateRoom.mutateAsync({ roomId: id, basic, building, interior, custom, answers, items: checklistItems });
        navigate(ROUTES.HOME);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setSubmitError(msg ?? '수정 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const ok = updateGuestRoom(id, { basic, building, interior, safety, custom });
    if (!ok) {
      setSubmitError('수정에 실패했습니다. 방 정보를 찾을 수 없어요.');
      return;
    }
    navigate(ROUTES.HOME);
  };

  const handleDelete = async () => {
    if (!id) return;
    if (isLoggedIn) {
      try {
        await deleteRoom.mutateAsync(id);
        navigate(ROUTES.HOME);
      } catch (err) {
        console.error('[ChecklistDetailPage] delete failed', err);
        setSubmitError('삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      return;
    }
    deleteGuestRoom(id);
    navigate(ROUTES.HOME);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-[18px] font-bold text-text-main">체크리스트를 찾을 수 없어요</h1>
        <p className="text-[13px] text-text-caption text-center">
          요청하신 방이 삭제되었거나, 다른 브라우저에서 저장된 데이터일 수 있어요.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.HOME)}
          className="mt-2 px-6 py-2.5 rounded-[6px] bg-brand-primary text-white text-[14px] font-bold cursor-pointer"
        >
          내 방 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ChecklistPageHeader
        title="체크리스트 수정"
        onBack={() => navigate(ROUTES.HOME)}
        actions={
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-[13px] text-red-500 hover:text-red-600 font-medium cursor-pointer"
          >
            삭제
          </button>
        }
      />
      <ChecklistTabNav
        tabNavRef={tabNavRef}
        activeSection={activeSection}
        onScrollTo={scrollToSection}
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
        label="수정 완료"
        disabled={!basic.name.trim() || isSubmitting}
        isSubmitting={isSubmitting}
        error={submitError}
        onClick={handleUpdate}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-[12px] w-full max-w-sm p-6 flex flex-col gap-4">
            <h2 className="text-[16px] font-bold text-text-main">체크리스트를 삭제할까요?</h2>
            <p className="text-[13px] text-text-mute">
              삭제하면 이 방에 대한 모든 체크 정보가 사라져요.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 rounded-[6px] border border-border-light text-[14px] text-text-main hover:bg-bg-gray cursor-pointer"
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
