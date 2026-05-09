import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { ConfigCard } from './components/ConfigCard';
import { FilterToggle } from './components/FilterToggle';
import { CompareTable } from './components/CompareTable';
import { SectionTabNav } from './components/SectionTabNav';
import { ALL_REPORT_SECTION_IDS, REPORT_MAX_SELECT, REPORT_MIN_SELECT, type ReportSectionId } from './lib/sections';

export default function ReportPage() {
  const navigate = useNavigate();
  const { guestRooms } = useGuestRoomStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeSections, setActiveSections] = useState<ReportSectionId[]>([...ALL_REPORT_SECTION_IDS]);
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  useEffect(() => {
    if (guestRooms.length >= REPORT_MIN_SELECT && selectedIds.length === 0) {
      setSelectedIds(guestRooms.slice(0, REPORT_MIN_SELECT).map((r) => r.id));
    }
  }, [guestRooms, selectedIds.length]);

  const selectedRooms = useMemo(
    () => guestRooms.filter((r) => selectedIds.includes(r.id)),
    [guestRooms, selectedIds],
  );

  const isLockedSelection = guestRooms.length <= REPORT_MIN_SELECT;

  const toggleRoom = (id: string) => {
    if (isLockedSelection) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > REPORT_MIN_SELECT ? prev.filter((v) => v !== id) : prev;
      }
      return prev.length < REPORT_MAX_SELECT ? [...prev, id] : prev;
    });
  };

  const toggleSection = (s: ReportSectionId) =>
    setActiveSections((prev) => {
      if (prev.includes(s)) return prev.length > 1 ? prev.filter((x) => x !== s) : prev;
      return [...prev, s];
    });

  const resetConfig = () => {
    setSelectedIds(guestRooms.slice(0, REPORT_MIN_SELECT).map((r) => r.id));
    setActiveSections([...ALL_REPORT_SECTION_IDS]);
  };

  const canSelectMore = selectedIds.length < REPORT_MAX_SELECT;

  // ── 빈 상태 ──────────────────────────────────────────────────
  if (guestRooms.length < REPORT_MIN_SELECT) {
    return (
      <div className="flex-1 bg-bg-footer min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 max-w-[360px] text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E2E2E2" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <div className="space-y-2">
            <h2 className="text-[18px] font-bold text-text-main">비교하려면 방이 2개 이상 필요해요</h2>
            <p className="text-[13px] text-text-caption leading-relaxed">
              현재 등록된 방: {guestRooms.length}개<br />
              체크리스트를 추가해 비교 리포트를 받아보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/checklist/new')}
            className="px-6 py-3 rounded-[6px] bg-brand-primary text-white text-[14px] font-bold hover:bg-brand-primary-dark cursor-pointer"
          >
            체크리스트 추가하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-footer min-h-screen">
      {/* ── 서브 헤더 ── */}
      <div className="bg-white border-b border-border-light sticky top-16 z-30">
        <div className="max-w-screen-xl mx-auto px-4 md:px-10 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            aria-label="방 목록으로 돌아가기"
            className="p-1 -ml-1 text-text-main hover:bg-bg-gray rounded-[4px]"
          >
            <Icon icon="ic:round-navigate-next" width={24} height={24} className="rotate-180" />
          </button>
          <h1 className="text-fluid-4xl font-bold text-text-main">비교 리포트</h1>
          <FilterToggle open={isConfigOpen} onToggle={() => setIsConfigOpen((v) => !v)} />
          <span className="text-fluid-md text-text-mute">
            {selectedRooms.length}개 방 · {activeSections.length}개 섹션
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="공유"
              className="inline-flex h-8 items-center gap-2.5 rounded-[4px] border border-border-light px-4 py-2 text-xs font-semibold text-text-main hover:bg-bg-gray"
            >
              <Icon icon="material-symbols:share-outline" width={16} height={16} />
              <span>공유</span>
            </button>
            {/* TODO(E06-S06): html2canvas + jsPDF 교체 예정 */}
            <button
              type="button"
              aria-label="PDF 다운로드"
              onClick={() => window.print()}
              className="inline-flex h-8 items-center gap-2.5 rounded-[4px] border border-border-light px-4 py-2 text-xs font-semibold text-text-main hover:bg-bg-gray"
            >
              <Icon icon="material-symbols:download-rounded" width={16} height={16} />
              <span>PDF 다운로드</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 설정 패널 ── */}
      {isConfigOpen && (
        <div className="bg-white border-b border-border-light">
          <div className="max-w-screen-xl mx-auto px-4 md:px-10 py-6">
            <ConfigCard
              rooms={guestRooms}
              selectedRoomIds={selectedIds}
              onToggleRoom={toggleRoom}
              canSelectMore={canSelectMore}
              isLockedSelection={isLockedSelection}
              activeSections={activeSections}
              onToggleSection={toggleSection}
              onComplete={() => setIsConfigOpen(false)}
              onReset={resetConfig}
            />
          </div>
        </div>
      )}

      {/* ── 섹션 탭 내비게이션 ── */}
      {selectedRooms.length >= REPORT_MIN_SELECT && (
        <SectionTabNav activeSections={activeSections} />
      )}

      {/* ── 비교 테이블 ── */}
      {selectedRooms.length >= REPORT_MIN_SELECT && (
        <div className="max-w-screen-xl mx-auto px-4 md:px-10 py-10 space-y-10">
          <CompareTable rooms={selectedRooms} activeSections={activeSections} />
        </div>
      )}
    </div>
  );
}
