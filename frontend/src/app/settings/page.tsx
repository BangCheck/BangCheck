'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { USER_TYPES, CHECKLIST_ITEMS, CATEGORIES, TYPE_ITEM_MAP } from '@/features/customization/constants';
import { UserTypeCard } from '@/features/customization/components/UserTypeCard';
import { ChecklistItemToggle } from '@/features/customization/components/ChecklistItemToggle';
import { useCustomization } from '@/features/customization/hooks/useCustomization';
import { ItemIcons, IconChevron } from '@/features/customization/components/Icons';

// Reusable Section Header Component
const SectionHeader = ({ 
  number, 
  title, 
  description, 
  onSelectAll, 
  isFolded, 
  onToggleFold 
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
      <p className="text-[12px] md:text-[14px] font-medium text-[#777] leading-tight md:leading-normal">{description}</p>
    </div>
    <div className="flex items-center gap-2 md:gap-3 shrink-0">
      {onSelectAll && (
        <button 
          onClick={onSelectAll}
          className="h-7 md:h-8 px-2.5 md:px-4 bg-white border border-[#E2E2E2] rounded-[4px] flex items-center gap-1.5 md:gap-2.5 hover:bg-gray-50 transition-all"
        >
          <div className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] border border-[#E2E2E2] rounded-[2px] flex items-center justify-center bg-[#232527]">
             <svg width="10" height="8" viewBox="0 0 12 10" fill="none" className="md:w-3 md:h-2.5">
               <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <IconChevron className={cn("w-3 h-3 md:w-[18px] md:h-[18px] transition-transform duration-200", isFolded ? "rotate-90" : "-rotate-90")} />
        </button>
      )}
    </div>
  </div>
);

export default function SettingsPage() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const {
    items,
    selectedTypeIds,
    activeItemNames,
    customItems,
    isLoading,
    isPending,
    toggleUserType,
    toggleItem,
    toggleItemLocally,
    addCustomItem,
    removeCustomItem,
  } = useCustomization();

  const [isAllItemsVisible, setIsAllItemsVisible] = useState(false);
  const [isSection1Folded, setIsSection1Folded] = useState(false);
  const [isSection2Folded, setIsSection2Folded] = useState(false);
  const [isSection3Folded, setIsSection3Folded] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState('');

  // 아이템 이름(Label)으로 서버 ID를 찾는 헬퍼
  const getServerIdByLabel = (label: string) => {
    return items.find(item => item.itemName === label)?.id;
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomItem.trim()) {
      addCustomItem(newCustomItem);
      setNewCustomItem('');
    }
  };

  // Section 2에 표시할 추천 항목 계산
  const recommendedItems = React.useMemo(() => {
    if (selectedTypeIds.length === 0) {
      return CHECKLIST_ITEMS.filter(item => item.isDefault);
    }
    const itemIds = new Set<string>();
    selectedTypeIds.forEach(typeId => {
      TYPE_ITEM_MAP[typeId]?.forEach(id => itemIds.add(id));
    });
    return CHECKLIST_ITEMS.filter(item => itemIds.has(item.id));
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
      {isPending && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[100] flex items-center justify-center cursor-wait">
          <div className="w-8 h-8 border-4 border-[#0A607D] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <main className={cn("max-w-[1440px] mx-auto w-full px-6 md:px-[136px] py-[40px] md:py-[50px] flex-1", isLoggedIn ? "pb-40" : "pb-20")}>
        <section className="mb-8 md:mb-12">
          <h1 className="text-[24px] md:text-[30px] font-bold text-[#232527] mb-2 md:mb-3">체크리스트 맞춤 설정</h1>
          <p className="text-[14px] md:text-[16px] text-[#777] font-medium leading-relaxed">3단계로 나만의 체크리스트를 만들어 보세요.</p>
        </section>

        {!isLoggedIn && (
          <section className="mb-16 md:mb-24 p-6 md:p-[30px] bg-[#F5F5F5] rounded-[6px] border border-[#E2E2E2] flex flex-col items-center">
            <div className="text-center mb-6 space-y-1.5 md:space-y-2">
              <p className="text-[16px] md:text-[18px] font-bold text-[#232527]">커스텀 설정은 로그인 후 이용 가능해요</p>
              <p className="text-[12px] md:text-[14px] text-[#777] font-medium leading-relaxed">비로그인 상태에서는 기본 체크리스트가 그대로 제공됩니다.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button onClick={() => router.push('/checklist/new')} className="w-full md:w-[265px] py-3 bg-white border border-[#636363] rounded-[4px] font-medium text-[14px] md:text-[16px] text-[#636363]">비로그인으로 진행하기</button>
              <button onClick={() => router.push('/login')} className="w-full md:px-4 py-3 bg-[#0A607D] rounded-[4px] font-medium text-[14px] md:text-[16px] text-white">로그인하고 나만의 체크리스트 만들기</button>
            </div>
          </section>
        )}

        <div className={cn("space-y-16 md:space-y-24 transition-opacity duration-300", !isLoggedIn && "opacity-45 pointer-events-none")}>
          <section>
            <SectionHeader 
              number={1} title="나는 이런 유형이에요" 
              description="여러 개 선택 가능 · 선택한 유형에 맞는 항목이 자동으로 체크돼요"
              isFolded={isSection1Folded} onToggleFold={() => setIsSection1Folded(!isSection1Folded)}
            />
            {!isSection1Folded && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {USER_TYPES.map((type) => (
                  <UserTypeCard key={type.id} {...type} isSelected={selectedTypeIds.includes(type.id)} onClick={() => toggleUserType(type.id)} />
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeader 
              number={2} title="맞춤 체크리스트" 
              description={`${activeItemNames.length}개 항목이 자동 체크되었어요 · 클릭하면 해제할 수 있어요`}
              isFolded={isSection2Folded} onToggleFold={() => setIsSection2Folded(!isSection2Folded)}
            />
            {!isSection2Folded && (
              <div className="bg-white rounded-[6px] border border-[#F0F0F0] p-4 md:p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
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
                          // 서버에 항목이 없는 경우 화면 반응만 제공
                          toggleItemLocally(item.label);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          <section>
            <SectionHeader 
              number={3} title="추가로 확인할 항목" 
              description="전체 체크리스트에서 추가하고 싶은 항목을 직접 선택하세요"
              isFolded={isSection3Folded} onToggleFold={() => setIsSection3Folded(!isSection3Folded)}
            />
            {!isSection3Folded && (
              <div className="space-y-8 md:space-y-10">
                <div className="bg-[#f5f5f5] border border-[#e2e2e2] rounded-[6px] p-3 md:p-4 flex items-center justify-between">
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-[14px] md:text-[16px] font-medium text-[#232527]">전체 체크리스트 보기</p>
                    <p className="text-[12px] md:text-[14px] font-medium text-[#777] leading-tight">모든 항목을 카테고리별로 펼쳐 보여줍니다</p>
                  </div>
                  <button onClick={() => setIsAllItemsVisible(!isAllItemsVisible)} className={cn("w-10 h-5 md:w-11 md:h-[22px] rounded-full transition-all relative p-[2px] shrink-0", isAllItemsVisible ? "bg-[#0A607D]" : "bg-[#7F7F7F]")}>
                    <div className={cn("w-4 h-4 md:w-[18px] md:h-[18px] bg-white rounded-full transition-all shadow-sm", isAllItemsVisible ? "translate-x-[20px] md:translate-x-[22px]" : "translate-x-0")} />
                  </button>
                </div>
                
                {isAllItemsVisible && (
                  <div className="pt-4 border-t border-[#F5F5F5] space-y-8 md:space-y-10">
                    {CATEGORIES.map(category => (
                      <div key={category} className="space-y-3 md:space-y-4">
                        <h4 className="text-[13px] md:text-[14px] font-bold text-[#A0A0A0]">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                          {CHECKLIST_ITEMS.filter(item => item.category === category).map((item) => (
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
                    ))}
                  </div>
                )}

                <div className="space-y-4 md:space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-bold text-[#232527]">나만의 항목 추가</h4>
                      <span className="text-[13px] md:text-[14px] font-bold text-[#777]">{customItems.length}건</span>
                    </div>
                  </div>
                  <form onSubmit={handleAddCustomItem} className="flex gap-2 md:gap-3">
                    <input type="text" value={newCustomItem} onChange={(e) => setNewCustomItem(e.target.value)} placeholder="예 : 초인종 여부, 환기 상태" className="flex-1 bg-white border border-[#BFBFBF] rounded-[6px] px-3 py-1.5 md:py-[6px] text-[13px] md:text-[14px] outline-none focus:border-[#0A607D]" />
                    <button type="submit" disabled={isPending || !newCustomItem.trim()} className="w-9 h-9 bg-white border border-[#BFBFBF] rounded-[6px] flex items-center justify-center disabled:opacity-50 shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BFBFBF" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </form>
                  {customItems.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 bg-[#D9EAF0] text-[#0A607D] px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-[12px] md:text-[13px] font-bold">
                          {item.itemName}
                          <button onClick={() => removeCustomItem(item.id, item.itemName)} className="text-[#0A607D]/60 hover:text-[#0A607D]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
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
      </main>

      {isLoggedIn && (
        <div className="fixed bottom-[80px] md:bottom-0 left-0 right-0 bg-[#FAFAFA] border-t border-[#E2E2E2] px-6 md:px-[136px] py-6 md:py-[30px] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1440px] mx-auto space-y-4 md:space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] md:text-[14px] font-bold text-[#232527]">총 선택된 항목</span>
              <span className="text-[15px] md:text-[16px] font-bold text-[#232527]">{totalSelectedCount}개</span>
            </div>
            <button 
              onClick={() => router.push('/')} 
              className="w-full bg-[#0A607D] text-white py-3.5 md:py-4 rounded-xl font-bold text-[16px] md:text-[18px] shadow-lg hover:bg-[#084e6d] transition-all active:scale-[0.99]"
            >
              맞춤 설정 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
