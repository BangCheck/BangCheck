import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { useAuthStore } from '@/store/use-auth-store';
import { useRoomDetail, useUpdateRoom, useDeleteRoom } from '@/features/rooms/hooks/useRoomsQuery';

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

export default function ChecklistDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuthStore();
  const { getGuestRoom, updateGuestRoom, deleteGuestRoom } = useGuestRoomStore();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const { basic, setBasic, building, setBuilding, interior, setInterior, safety, setSafety, custom, setCustom, patchBasic, patchBuilding, patchInterior, patchSafety, patchCustom } = useChecklistState();
  const { activeSection, sectionRefs, tabNavRef, scrollToSection } = useSectionScroll();

  // 로그인 상태 — BE에서 방 데이터 로드
  const { data: beRoom, isError: beError } = useRoomDetail(isLoggedIn ? id : undefined);
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  // BE 데이터로 폼 초기화
  useEffect(() => {
    if (!isLoggedIn || !beRoom) return;
    setBasic(beRoom.basic);
    setBuilding(beRoom.building);
    setInterior(beRoom.interior);
    setCustom(beRoom.custom);
  }, [isLoggedIn, beRoom, setBasic, setBuilding, setInterior, setCustom]);

  // 비로그인 상태 — sessionStorage에서 방 데이터 로드
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

  // BE 조회 실패 처리
  useEffect(() => {
    if (isLoggedIn && beError) setNotFound(true);
  }, [isLoggedIn, beError]);

  const handleUpdate = async () => {
    if (!id || !basic.name.trim()) {
      setSubmitError('매물정보(방 이름)를 입력해주세요.');
      return;
    }

    if (isLoggedIn) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await updateRoom.mutateAsync({ roomId: id, basic, building, interior, custom });
        navigate('/rooms');
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
    navigate('/rooms');
  };

  const handleDelete = async () => {
    if (!id) return;
    if (isLoggedIn) {
      try {
        await deleteRoom.mutateAsync(id);
      } catch {
        // 삭제 실패 시에도 목록으로 이동
      }
    } else {
      deleteGuestRoom(id);
    }
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
          <BackChevron />
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
        />
      </main>

      <div className="fixed bottom-0 left-0 right-0 md:sticky md:bottom-auto bg-white border-t border-[#E2E2E2] px-4 py-4 z-30">
        <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto flex flex-col gap-2">
          {submitError && (
            <p className="text-fluid-base text-red-500 text-center">{submitError}</p>
          )}
          <button
            type="button"
            onClick={handleUpdate}
            disabled={!basic.name.trim() || isSubmitting}
            className={cn(
              'w-full py-3.5 rounded-[6px] text-fluid-lg font-bold transition-all',
              !basic.name.trim() || isSubmitting
                ? 'bg-[#BFBFBF] text-white cursor-not-allowed'
                : 'bg-[#0A607D] text-white hover:bg-[#084e6d] cursor-pointer',
            )}
          >
            {isSubmitting ? '저장 중...' : '수정 완료'}
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

function BackChevron() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
