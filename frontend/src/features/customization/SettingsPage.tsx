import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth-store';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { USER_TYPES, CHECKLIST_ITEMS, TYPE_ITEM_MAP, CATEGORY_LABEL, CATEGORY_ORDER, BASE_ITEM_LABELS } from '@/features/customization/constants';
import { UserTypeCard } from '@/features/customization/components/UserTypeCard';
import { ChecklistItemToggle } from '@/features/customization/components/ChecklistItemToggle';
import { useCustomization } from '@/features/customization/hooks/use-customization';
import { ItemIcons } from '@/features/customization/components/Icons';
import { SectionHeader } from '@/features/customization/components/SectionHeader';
import { BannerLoggedOut } from '@/features/customization/components/BannerLoggedOut';
import { ROUTES } from '@/lib/routes';

export default function SettingsPage() {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  const {
    items,
    allItems,
    selectedTypeIds,
    activeItemNames,
    customItems,
    isLoading,
    isPending,
    isError,
    refetch,
    toggleUserType,
    toggleItem,
    selectAllItems,
    saveCurrentSettings,
    enableItems,
    toggleItemLocally,
    addCustomItem,
    removeCustomItem,
  } = useCustomization();

  // ── UI state ──────────────────────────────────────────────
  const [folded, setFolded] = useState({ s1: false, s2: false, s3: false });
  const [isAllItemsVisible, setIsAllItemsVisible] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Derived / memoized ───────────────────────────────────
  const activeNamesSet = useMemo(() => new Set(activeItemNames), [activeItemNames]);

  const recommendedItems = useMemo(() => {
    if (selectedTypeIds.length === 0) return [];
    const typeId = selectedTypeIds[0];
    const mappedIds = TYPE_ITEM_MAP[typeId] ?? [];
    if (mappedIds.length > 0) {
      return CHECKLIST_ITEMS.filter((item) => mappedIds.includes(item.id));
    }
    // FIRST_TIMER / ESSENTIALS_ONLY: 서버 enabled 항목을 직접 표시
    return items
      .filter(i => i.itemType !== 'CUSTOM' && i.isEnabled)
      .map(i => CHECKLIST_ITEMS.find(c => c.label === i.itemName) ?? { id: String(i.id), label: i.itemName });
  }, [selectedTypeIds, items]);

  // ── Handlers ─────────────────────────────────────────────
  const getServerIdByLabel = (label: string) => allItems.find((item) => item.itemName === label)?.id;

  // UX-WEB-07: trim + dedupe + error 표시. 실패 시 입력값 보존 (재시도 편의).
  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCustomItem.trim();
    if (!trimmed) return;
    try {
      setErrorMessage(null);
      await addCustomItem(trimmed);
      setNewCustomItem('');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : '항목 추가에 실패했어요. 잠시 후 다시 시도해주세요.',
      );
    }
  };

  // ── Guards ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-text-mute font-medium">설정 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // P8: 로그인 사용자에 한해 에러 분기 UI (auth 만료/500 시 stale empty 고착 회피)
  if (isError && isLoggedIn) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-fluid-lg font-semibold text-text-main">설정을 불러오지 못했어요</p>
          <p className="text-[14px] text-text-mute">잠시 후 다시 시도하거나, 로그인이 만료된 경우 다시 로그인해주세요.</p>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              className="bg-brand-primary text-white px-4 py-2 rounded-[6px] font-medium"
            >다시 시도</button>
            <button
              onClick={() => navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.SETTINGS}`)}
              className="bg-white border border-border-mute text-text-main px-4 py-2 rounded-[6px] font-medium"
            >로그인</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[100] flex items-center justify-center cursor-wait">
          <Spinner />
        </div>
      )}

      <main
        className={cn(
          'max-w-screen-xl mx-auto w-full px-4 md:px-12 lg:px-24 py-8 md:py-12 flex-1',
          isLoggedIn ? 'pb-40' : 'pb-20',
        )}
      >
        {errorMessage && (
          <div role="alert" className="mb-6 bg-[#FFF5F5] border border-[#F5A8A8] rounded-[6px] p-3 flex items-center justify-between gap-3">
            <p className="text-[14px] text-[#9B2C2C] font-medium">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[12px] text-[#9B2C2C] underline shrink-0"
              aria-label="알림 닫기"
            >닫기</button>
          </div>
        )}

        <section className="mb-8 md:mb-12">
          <h1 className="text-fluid-4xl font-bold text-text-main mb-2 md:mb-3">
            체크리스트 맞춤 설정
          </h1>
          <p className="text-[14px] md:text-[16px] text-text-mute font-medium leading-relaxed">
            3단계로 나만의 체크리스트를 만들어 보세요.
          </p>
        </section>

        {/* Mobile inline banner — hidden on desktop */}
        {!isLoggedIn && (
          <div className="lg:hidden mb-10">
            <BannerLoggedOut
              onGuest={() => navigate(ROUTES.CHECKLIST_NEW)}
              onLogin={() => navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.SETTINGS}`)}
            />
          </div>
        )}

        <div className="relative">
          {/* Desktop absolute banner — visible only lg+ */}
          {!isLoggedIn && (
            <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 z-10 w-[1173px]">
              <BannerLoggedOut
                onGuest={() => navigate(ROUTES.CHECKLIST_NEW)}
                onLogin={() => navigate(`${ROUTES.LOGIN}?redirect=${ROUTES.SETTINGS}`)}
              />
            </div>
          )}

          {/* Main content — dimmed + locked when not logged in */}
          {/* P6: React 19 native inert (boolean attr) + aria-hidden. 타입 세탁 제거 */}
          <div
            className={cn(
              'space-y-10 md:space-y-16 transition-opacity duration-300',
              !isLoggedIn && 'opacity-45 pointer-events-none',
              !isLoggedIn && 'lg:pt-[200px]',
            )}
            inert={!isLoggedIn || undefined}
            aria-hidden={!isLoggedIn || undefined}
          >
            {/* ── STEP 1 — 사용자 유형 ── */}
            <section>
              <SectionHeader
                number={1}
                title="나는 이런 유형이에요"
                description="유형을 선택하면 맞춤 항목이 자동으로 체크돼요"
                // onDeselectAll={selectedTypeIds.length > 0 ? deselectAllTypes : undefined}
                isFolded={folded.s1}
                onToggleFold={() => setFolded((f) => ({ ...f, s1: !f.s1 }))}
              />
              {!folded.s1 && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-3">
                  {USER_TYPES.map((type) => (
                    <UserTypeCard
                      key={type.id}
                      {...type}
                      isSelected={selectedTypeIds.includes(type.id)}
                      onClick={() => {
                        if (isPending) return; // P7: 더블클릭/연타 가드
                        void toggleUserType(type.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── STEP 2 — 맞춤 체크리스트 ── */}
            <section>
              <SectionHeader
                number={2}
                title="맞춤 체크리스트"
                description={
                  selectedTypeIds.length === 0
                    ? 'Step 1에서 유형을 선택하면 추천 항목이 표시돼요'
                    : `${recommendedItems.filter((r) => activeNamesSet.has(r.label)).length}/${recommendedItems.length}개 추천 항목이 체크되었어요 · 클릭하면 해제할 수 있어요`
                }
                isFolded={folded.s2}
                onToggleFold={() => setFolded((f) => ({ ...f, s2: !f.s2 }))}
              />
              {!folded.s2 && (
                <>
                  {recommendedItems.length === 0 ? (
                    <div className="bg-bg-gray border border-border-light rounded-[6px] p-3 md:p-4 flex items-center gap-2 text-text-mute">
                      <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm6 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Z" /></svg>
                      <p className="text-[14px] font-medium">위에서 유형을 먼저 선택해주세요</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[6px] border border-border-light p-4 md:p-6 shadow-sm">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3">
                        {recommendedItems.map((item) => (
                          <ChecklistItemToggle
                            key={item.id}
                            label={item.label}
                            icon={ItemIcons[item.id] || ItemIcons.default}
                            isActive={activeNamesSet.has(item.label)}
                            onToggle={() => {
                              if (isPending) return; // P7: 더블클릭/연타 가드
                              const serverId = getServerIdByLabel(item.label);
                              if (serverId) toggleItem(serverId, item.label);
                              else toggleItemLocally(item.label);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ── STEP 3 — 추가로 확인할 항목 ── */}
            <section>
              <SectionHeader
                number={3}
                title="추가로 확인할 항목"
                description="전체 체크리스트에서 추가하고 싶은 항목을 직접 선택하세요"
                onSelectAll={() => {
                  setFolded((f) => ({ ...f, s3: false }));
                  setIsAllItemsVisible(true);
                  selectAllItems();
                }}
                isFolded={folded.s3}
                onToggleFold={() => setFolded((f) => ({ ...f, s3: !f.s3 }))}
              />
              {!folded.s3 && (
                <div className="space-y-8 md:space-y-10">
                  {/* 전체 체크리스트 보기 Toggle */}
                  <div className="bg-bg-gray border border-border-light rounded-[6px] p-3 md:p-4 flex items-center justify-between">
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-[14px] md:text-[16px] font-medium text-text-main">전체 체크리스트 보기</p>
                      <p className="text-[12px] md:text-[14px] font-medium text-text-mute leading-tight">
                        모든 항목을 카테고리별로 펼쳐 보여줍니다
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAllItemsVisible(!isAllItemsVisible)}
                      className={cn(
                        'w-10 h-5 md:w-11 md:h-[22px] rounded-full transition-all relative p-[2px] shrink-0',
                        isAllItemsVisible ? 'bg-brand-primary' : 'bg-[#7F7F7F]',
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

                  {/* 기본 항목 — 토글 OFF여도 항상 표시 */}
                  <div className="pt-4 border-t border-bg-gray">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px] font-bold text-text-main">기본 항목</h4>
                        <span className="text-[14px] font-bold text-text-mute">
                          {BASE_ITEM_LABELS.filter((l) => activeNamesSet.has(l)).length}/{BASE_ITEM_LABELS.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        {BASE_ITEM_LABELS.map((label) => {
                          const constItem = CHECKLIST_ITEMS.find((c) => c.label === label);
                          const icon = constItem ? (ItemIcons[constItem.id] || ItemIcons.default) : ItemIcons.default;
                          const si = items.find((s) => s.itemName === label);
                          return (
                            <ChecklistItemToggle
                              key={label}
                              label={label}
                              icon={icon}
                              isActive={activeNamesSet.has(label)}
                              onToggle={() => {
                                if (isPending) return;
                                if (si) toggleItem(Number(si.id), label);
                                else toggleItemLocally(label);
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {isAllItemsVisible && (
                    <div className="pt-4 border-t border-bg-gray space-y-10">
                      {CATEGORY_ORDER.map((cat) => {
                        const catLabel = CATEGORY_LABEL[cat];
                        // 기본 항목은 위에서 따로 렌더 → 비기본만 카테고리별로 표시
                        const catConstItems = CHECKLIST_ITEMS
                          .filter((i) => i.category === catLabel)
                          .filter((i) => !BASE_ITEM_LABELS.includes(i.label));
                        if (catConstItems.length === 0) return null;
                        const activeCount = catConstItems.filter((i) => activeNamesSet.has(i.label)).length;
                        return (
                          <div key={cat} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="text-[14px] font-bold text-text-main">{catLabel}</h4>
                                <span className="text-[14px] font-bold text-text-mute">{activeCount}/{catConstItems.length}</span>
                              </div>
                              <button
                                className="text-[14px] font-medium text-text-main hover:text-brand-primary"
                                onClick={() => {
                                  const toActivate = catConstItems
                                    .filter((c) => !activeNamesSet.has(c.label))
                                    .map((c) => c.label);
                                  if (toActivate.length === 0) return;
                                  enableItems(toActivate);
                                }}
                              >
                                전체 선택
                              </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                              {catConstItems.map((constItem) => {
                                const icon = ItemIcons[constItem.id] || ItemIcons.default;
                                const si = items.find((s) => s.itemName === constItem.label);
                                return (
                                  <ChecklistItemToggle
                                    key={constItem.id}
                                    label={constItem.label}
                                    icon={icon}
                                    isActive={activeNamesSet.has(constItem.label)}
                                    onToggle={() => {
                                      if (isPending) return; // P7: 더블클릭/연타 가드
                                      if (si) toggleItem(Number(si.id), constItem.label);
                                      else toggleItemLocally(constItem.label);
                                    }}
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
                        <h4 className="text-[14px] font-bold text-text-main">나만의 항목 추가</h4>
                        <span className="text-[14px] font-bold text-text-mute">{customItems.length}건</span>
                      </div>
                    </div>
                    {customItems.length >= 3 ? (
                      <p className="text-[13px] text-text-mute">최대 3개까지 추가할 수 있어요</p>
                    ) : (
                      <form onSubmit={handleAddCustomItem} className="flex gap-3">
                        <input
                          type="text"
                          value={newCustomItem}
                          onChange={(e) => setNewCustomItem(e.target.value)}
                          placeholder="예 : 초인종 여부, 환기 상태"
                          className="flex-1 bg-white border border-border-mute rounded-[6px] px-3 py-[6px] text-[14px] outline-none focus:border-brand-primary"
                        />
                        <button
                          type="submit"
                          disabled={isPending || !newCustomItem.trim()}
                          className="w-9 h-9 bg-white border border-border-mute rounded-[6px] flex items-center justify-center disabled:opacity-50 shrink-0"
                          aria-label="항목 추가"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BFBFBF" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </button>
                      </form>
                    )}
                    {customItems.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        {customItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 bg-slot-b-bg border-2 border-brand-primary rounded-[6px] p-3 lg:p-4 drop-shadow-[0px_6px_8px_rgba(0,0,0,0.04)]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A607D"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z" /></svg>
                              </div>
                              <span className="text-fluid-base font-semibold text-text-main leading-[1.3]">{item.itemName}</span>
                            </div>
                            <button
                              onClick={() => removeCustomItem(item.id, item.itemName)}
                              className="shrink-0 w-5 h-5 flex items-center justify-center text-text-mute hover:text-text-main"
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

      {/* 저장 CTA — 로그인 상태에서만 노출 */}
      {isLoggedIn && (
        <div className="fixed bottom-[80px] md:bottom-0 left-0 right-0 bg-bg-footer border-t border-border-light px-4 md:px-12 lg:px-24 py-6 z-40">
          <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-fluid-lg font-medium text-text-mute">총 선택된 항목</span>
              <span className="text-fluid-lg font-bold text-text-main">{activeItemNames.length}개</span>
            </div>
            <button
              onClick={async () => {
                // P5: 저장 실패 시 navigate 차단 + 사용자에 알림
                try {
                  setErrorMessage(null);
                  await saveCurrentSettings();
                  navigate(ROUTES.HOME);
                } catch {
                  setErrorMessage('설정 저장에 실패했어요. 잠시 후 다시 시도해주세요.');
                }
              }}
              disabled={isPending}
              className="w-full bg-brand-primary text-white py-3 rounded-[6px] font-semibold text-fluid-lg hover:bg-brand-primary-dark transition-colors disabled:opacity-60"
            >
              맞춤 설정 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
