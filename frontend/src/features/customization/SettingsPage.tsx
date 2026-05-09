import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { cn } from '@/lib/utils';
import { USER_TYPES, CHECKLIST_ITEMS, TYPE_ITEM_MAP } from '@/features/customization/constants';
import type { ChecklistCategory } from '@/types/checklist';
import { UserTypeCard } from '@/features/customization/components/UserTypeCard';
import { ChecklistItemToggle } from '@/features/customization/components/ChecklistItemToggle';
import { useCustomization } from '@/features/customization/hooks/useCustomization';
import { ItemIcons, IconChevron } from '@/features/customization/components/Icons';
import { ROUTES } from '@/lib/routes';

const CATEGORY_LABEL: Record<ChecklistCategory, string> = {
  BASIC_INFO: '기본 정보',
  BUILDING_INFO: '건물 정보',
  OPTION: '기본 옵션',
  INTERNAL_STATE: '내부 상태',
  PROBLEM: '문제 요소',
  SAFETY: '안전/보안',
  CONVENIENCE: '생활 편의',
  ENVIRONMENT: '주변 환경',
  CUSTOM: '나만의 항목',
};

const CATEGORY_ORDER: ChecklistCategory[] = [
  'OPTION', 'INTERNAL_STATE', 'PROBLEM', 'SAFETY', 'CONVENIENCE', 'ENVIRONMENT',
];

// ─────────────────────────────────────────────
// SectionHeader
// ─────────────────────────────────────────────
const SectionHeader = ({
  number,
  title,
  description,
  onSelectAll,
  isFolded,
  onToggleFold,
}: {
  number: number;
  title: string;
  description: string;
  onSelectAll?: () => void;
  isFolded?: boolean;
  onToggleFold?: () => void;
}) => (
  <div className="flex items-start justify-between mb-5 md:mb-6">
    <div className="space-y-1.5 md:space-y-2 max-w-[70%] md:max-w-none">
      <div className="flex items-center gap-2 md:gap-2.5">
        <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-[#232527] text-white flex items-center justify-center text-[10px] md:text-[12px] font-bold shrink-0">
          {number}
        </div>
        <h2 className="text-[16px] md:text-[18px] font-bold text-[#232527] truncate">{title}</h2>
      </div>
      <p className="text-[12px] md:text-[14px] font-medium text-[#777] leading-tight md:leading-normal w-full md:w-[386px]">
        {description}
      </p>
    </div>
    <div className="flex items-center gap-2 md:gap-3 shrink-0">
      {onSelectAll && (
        <button
          onClick={onSelectAll}
          className="h-7 md:h-8 px-2.5 md:px-4 bg-white border border-[#E2E2E2] rounded-[4px] flex items-center gap-1.5 md:gap-2.5 hover:bg-gray-50 transition-all"
        >
          <div className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] border border-[#E2E2E2] rounded-[2px] flex items-center justify-center bg-[#232527]">
            <svg width="10" height="8" viewBox="0 0 12 10" fill="none" className="md:w-3 md:h-2.5">
              <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[10px] md:text-[12px] font-semibold text-[#232527]">전체선택</span>
        </button>
      )}
      {onToggleFold && (
        <button
          onClick={onToggleFold}
          className="h-7 md:h-8 px-2.5 md:px-4 bg-white border border-[#E2E2E2] rounded-[4px] flex items-center gap-1.5 md:gap-2.5 hover:bg-gray-50 transition-all"
        >
          <span className="text-[10px] md:text-[12px] font-semibold text-[#232527]">{isFolded ? '펼치기' : '접기'}</span>
          <IconChevron
            className={cn('w-3 h-3 md:w-[18px] md:h-[18px] transition-transform duration-200', isFolded ? 'rotate-90' : '-rotate-90')}
          />
        </button>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// BannerLoggedOut — 비로그인 안내 카드
// ─────────────────────────────────────────────
const BannerLoggedOut = ({ onGuest, onLogin }: { onGuest: () => void; onLogin: () => void }) => (
  <div className="bg-[#F5F5F5] border border-[#E2E2E2] rounded-[6px] px-6 lg:px-[30px] py-6 lg:py-[12px] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    <div className="text-center lg:text-left space-y-1.5 md:space-y-2">
      <p className="text-[16px] md:text-[18px] font-bold text-[#232527]">커스텀 설정은 로그인 후 이용 가능해요</p>
      <p className="text-[12px] md:text-[14px] text-[#777] font-medium leading-relaxed">
        비로그인 상태에서는 기본 체크리스트가 그대로 제공됩니다.
      </p>
    </div>
    <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto shrink-0">
      <button
        onClick={onGuest}
        className="w-full lg:w-[265px] py-3 bg-white border border-[#636363] rounded-[4px] font-medium text-[14px] md:text-[16px] text-[#636363] hover:bg-gray-50 transition-colors"
      >
        비로그인으로 진행하기
      </button>
      <button
        onClick={onLogin}
        className="w-full lg:w-auto px-4 py-3 bg-[#0A607D] rounded-[4px] font-medium text-[14px] md:text-[16px] text-white hover:bg-[#084e6d] transition-colors"
      >
        로그인하고 나만의 체크리스트 만들기
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// SettingsPage (SCR-CUSTOM)
// ─────────────────────────────────────────────
export default function SettingsPage() {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  const {
    items,
    selectedTypeIds,
    activeItemNames,
    customItems,
    isLoading,
    isPending,
    toggleUserType,
    selectAllTypes,
    toggleItem,
    selectAllItems,
    toggleItemLocally,
    addCustomItem,
    removeCustomItem,
  } = useCustomization();

  const [isAllItemsVisible, setIsAllItemsVisible] = useState(false);
  const [isSection1Folded, setIsSection1Folded] = useState(false);
  const [isSection2Folded, setIsSection2Folded] = useState(false);
  const [isSection3Folded, setIsSection3Folded] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState('');

  const getServerIdByLabel = (label: string) => items.find((item) => item.itemName === label)?.id;

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomItem.trim()) {
      addCustomItem(newCustomItem);
      setNewCustomItem('');
    }
  };

  const recommendedItems = React.useMemo(() => {
    if (selectedTypeIds.length === 0) return CHECKLIST_ITEMS.filter((item) => item.isDefault);
    const itemIds = new Set<string>();
    selectedTypeIds.forEach((typeId) => {
      TYPE_ITEM_MAP[typeId]?.forEach((id) => itemIds.add(id));
    });
    return CHECKLIST_ITEMS.filter((item) => itemIds.has(item.id));
  }, [selectedTypeIds]);

  const totalSelectedCount = activeItemNames.length;

  if (isLoading) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#0A607D] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#777] font-medium">설정 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen relative">
      {/* isPending overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[100] flex items-center justify-center cursor-wait">
          <div className="w-8 h-8 border-4 border-[#0A607D] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <main
        className={cn(
          'max-w-screen-xl mx-auto w-full px-4 md:px-12 lg:px-24 py-8 md:py-12 flex-1',
          isLoggedIn ? 'pb-40' : 'pb-20',
        )}
      >
        {/* PageTitle (SCR-CUSTOM-08~10) */}
        <section className="mb-8 md:mb-12">
          <h1 className="text-fluid-4xl font-bold text-[#232527] mb-2 md:mb-3">
            체크리스트 맞춤 설정
          </h1>
          <p className="text-[14px] md:text-[16px] text-[#777] font-medium leading-relaxed">
            3단계로 나만의 체크리스트를 만들어 보세요.
          </p>
        </section>

        {/* Mobile inline banner (SCR-CUSTOM-11~13) — hidden on desktop */}
        {!isLoggedIn && (
          <div className="lg:hidden mb-10">
            <BannerLoggedOut
              onGuest={() => navigate(ROUTES.CHECKLIST_NEW)}
              onLogin={() => navigate('/login?redirect=/custom')}
            />
          </div>
        )}

        {/* Desktop overlay wrapper — relative container for absolute banner */}
        <div className="relative">
          {/* Desktop absolute banner (SCR-CUSTOM-11~13) — visible only lg+ */}
          {!isLoggedIn && (
            <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 z-10 w-[1173px]">
              <BannerLoggedOut
                onGuest={() => navigate(ROUTES.CHECKLIST_NEW)}
                onLogin={() => navigate('/login?redirect=/custom')}
              />
            </div>
          )}

          {/* Main content — dimmed + locked when not logged in (R-4 Strict) */}
          <div
            className={cn(
              'space-y-16 md:space-y-[100px] transition-opacity duration-300',
              !isLoggedIn && 'opacity-45 pointer-events-none',
              /* Desktop: top padding clears the absolute banner (~200px) */
              !isLoggedIn && 'lg:pt-[200px]',
            )}
            {...(!isLoggedIn
              ? ({
                  inert: true,
                  'aria-hidden': 'true',
                } as React.HTMLAttributes<HTMLDivElement>)
              : {})}
          >
            {/* ── STEP 1 — 사용자 유형 (SCR-CUSTOM-14~18) ── */}
            <section>
              <SectionHeader
                number={1}
                title="나는 이런 유형이에요"
                description="유형을 선택하면 맞춤 항목이 자동으로 체크돼요"
                onSelectAll={selectAllTypes}
                isFolded={isSection1Folded}
                onToggleFold={() => setIsSection1Folded(!isSection1Folded)}
              />
              {!isSection1Folded && (
                /* AC6: desktop 3열, mobile 2열 */
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
                  {USER_TYPES.map((type) => (
                    <UserTypeCard
                      key={type.id}
                      {...type}
                      isSelected={selectedTypeIds.includes(type.id)}
                      onClick={() => toggleUserType(type.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── STEP 2 — 맞춤 체크리스트 (SCR-CUSTOM-19~21) ── */}
            <section>
              <SectionHeader
                number={2}
                title="맞춤 체크리스트"
                description={
                  selectedTypeIds.length === 0
                    ? 'Step 1에서 유형을 선택하면 추천 항목이 표시돼요'
                    : `${activeItemNames.length}개 항목이 자동 체크되었어요 · 클릭하면 해제할 수 있어요`
                }
                isFolded={isSection2Folded}
                onToggleFold={() => setIsSection2Folded(!isSection2Folded)}
              />
              {!isSection2Folded && (
                <>
                  {recommendedItems.length === 0 ? (
                    /* EmptyState: 유형 미선택 시 */
                    <div className="bg-[#F5F5F5] border border-[#E2E2E2] rounded-[6px] p-3 md:p-4 flex items-center gap-2 text-[#777]">
                      <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm6 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Z"/></svg>
                      <p className="text-[14px] font-medium">위에서 유형을 먼저 선택해주세요</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[6px] border border-[#F0F0F0] p-4 md:p-6 shadow-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3">
                        {recommendedItems.map((item) => (
                          <ChecklistItemToggle
                            key={item.id}
                            label={item.label}
                            icon={ItemIcons[item.id] || ItemIcons.default}
                            isActive={activeItemNames.includes(item.label)}
                            onToggle={() => {
                              const serverId = getServerIdByLabel(item.label);
                              if (serverId) {
                                toggleItem(serverId, item.label);
                              } else {
                                toggleItemLocally(item.label);
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ── STEP 3 — 추가로 확인할 항목 (SCR-CUSTOM-22~29) ── */}
            <section>
              <SectionHeader
                number={3}
                title="추가로 확인할 항목"
                description="전체 체크리스트에서 추가하고 싶은 항목을 직접 선택하세요"
                onSelectAll={selectAllItems}
                isFolded={isSection3Folded}
                onToggleFold={() => setIsSection3Folded(!isSection3Folded)}
              />
              {!isSection3Folded && (
                <div className="space-y-8 md:space-y-10">
                  {/* RowToggle — 전체 체크리스트 보기 Switch */}
                  <div className="bg-[#f5f5f5] border border-[#e2e2e2] rounded-[6px] p-3 md:p-4 flex items-center justify-between">
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-[14px] md:text-[16px] font-medium text-[#232527]">전체 체크리스트 보기</p>
                      <p className="text-[12px] md:text-[14px] font-medium text-[#777] leading-tight">
                        모든 항목을 카테고리별로 펼쳐 보여줍니다
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAllItemsVisible(!isAllItemsVisible)}
                      className={cn(
                        'w-10 h-5 md:w-11 md:h-[22px] rounded-full transition-all relative p-[2px] shrink-0',
                        isAllItemsVisible ? 'bg-[#0A607D]' : 'bg-[#7F7F7F]',
                      )}
                      aria-label={isAllItemsVisible ? '전체 체크리스트 숨기기' : '전체 체크리스트 보기'}
                      role="switch"
                      aria-checked={isAllItemsVisible}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 md:w-[18px] md:h-[18px] bg-white rounded-full transition-all shadow-sm',
                          isAllItemsVisible ? 'translate-x-[20px] md:translate-x-[22px]' : 'translate-x-0',
                        )}
                      />
                    </button>
                  </div>

                  {/* 전체 카테고리 펼침 — 서버 items 기준 */}
                  {isAllItemsVisible && (
                    <div className="pt-4 border-t border-[#F5F5F5] space-y-10">
                      {CATEGORY_ORDER.map((cat) => {
                        const catItems = items.filter(
                          (i) => i.itemType !== 'CUSTOM' && i.category === cat,
                        );
                        if (catItems.length === 0) return null;
                        const activeCount = catItems.filter((i) => activeItemNames.includes(i.itemName)).length;
                        return (
                          <div key={cat} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[14px] font-bold text-[#232527]">
                                  {CATEGORY_LABEL[cat]}
                                </h4>
                                <span className="text-[14px] font-bold text-[#777]">
                                  {activeCount}/{catItems.length}
                                </span>
                              </div>
                              <button
                                className="text-[14px] font-medium text-[#232527] hover:text-[#0A607D]"
                                onClick={() => {
                                  catItems.forEach((i) => {
                                    if (!activeItemNames.includes(i.itemName)) {
                                      toggleItem(Number(i.id), i.itemName);
                                    }
                                  });
                                }}
                              >
                                전체 선택
                              </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                              {catItems.map((serverItem) => {
                                const frontItem = CHECKLIST_ITEMS.find(
                                  (c) => c.label === serverItem.itemName,
                                );
                                const icon = frontItem
                                  ? ItemIcons[frontItem.id] || ItemIcons.default
                                  : ItemIcons.default;
                                return (
                                  <ChecklistItemToggle
                                    key={serverItem.id}
                                    label={serverItem.itemName}
                                    icon={icon}
                                    isActive={activeItemNames.includes(serverItem.itemName)}
                                    onToggle={() => toggleItem(Number(serverItem.id), serverItem.itemName)}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 나만의 항목 추가 */}
                  <div className="space-y-4 md:space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px] font-bold text-[#232527]">나만의 항목 추가</h4>
                        <span className="text-[14px] font-bold text-[#777]">{customItems.length}건</span>
                      </div>
                    </div>
                    <form onSubmit={handleAddCustomItem} className="flex gap-3">
                      <input
                        type="text"
                        value={newCustomItem}
                        onChange={(e) => setNewCustomItem(e.target.value)}
                        placeholder="예 : 초인종 여부, 환기 상태"
                        className="flex-1 bg-white border border-[#BFBFBF] rounded-[6px] px-3 py-[6px] text-[14px] outline-none focus:border-[#0A607D]"
                      />
                      <button
                        type="submit"
                        disabled={isPending || !newCustomItem.trim()}
                        className="w-9 h-9 bg-white border border-[#BFBFBF] rounded-[6px] flex items-center justify-center disabled:opacity-50 shrink-0"
                        aria-label="항목 추가"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BFBFBF" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </form>
                    {/* 커스텀 항목 카드 — Figma: 아이콘 + 텍스트 + 삭제 버튼 */}
                    {customItems.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        {customItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 bg-[#f4f7ff] border-2 border-[#0A607D] rounded-[6px] p-6 drop-shadow-[0px_6px_8px_rgba(0,0,0,0.04)]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A607D"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>
                              </div>
                              <span className="text-[18px] font-semibold text-[#232527] leading-[1.3]">
                                {item.itemName}
                              </span>
                            </div>
                            <button
                              onClick={() => removeCustomItem(item.id, item.itemName)}
                              className="shrink-0 w-5 h-5 flex items-center justify-center text-[#777] hover:text-[#232527]"
                              aria-label={`${item.itemName} 삭제`}
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <line x1="2" y1="2" x2="10" y2="10" />
                                <line x1="10" y1="2" x2="2" y2="10" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* 저장 CTA — 로그인 상태에서만 노출 (SCR-CUSTOM-30~33 미확보, 기존 임시 UI 유지) */}
      {isLoggedIn && (
        <div className="fixed bottom-[80px] md:bottom-0 left-0 right-0 bg-[#FAFAFA] border-t border-[#E2E2E2] px-4 md:px-12 lg:px-24 py-6 z-40">
          <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-fluid-lg font-medium text-[#777]">총 선택된 항목</span>
              <span className="text-fluid-lg font-bold text-[#232527]">{totalSelectedCount}개</span>
            </div>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="w-full bg-[#0A607D] text-white py-3 rounded-[6px] font-semibold text-fluid-lg hover:bg-[#084e6d] transition-colors"
            >
              맞춤 설정 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
