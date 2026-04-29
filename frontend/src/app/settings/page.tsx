'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { USER_TYPES, CHECKLIST_ITEMS, CATEGORIES } from '@/features/customization/constants';
import { UserTypeCard } from '@/features/customization/components/UserTypeCard';
import { ChecklistItemToggle } from '@/features/customization/components/ChecklistItemToggle';
import { useCustomization } from '@/features/customization/hooks/useCustomization';

// Reusable Section Header Component matching Figma
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
  <div className="flex items-start justify-between mb-5">
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-[#232527] text-white flex items-center justify-center text-[12px] font-bold">
          {number}
        </div>
        <h2 className="text-[18px] font-bold text-[#232527]">{title}</h2>
      </div>
      <p className="text-[14px] font-medium text-[#777]">{description}</p>
    </div>
    <div className="flex items-center gap-3">
      {onSelectAll && (
        <button 
          onClick={onSelectAll}
          className="h-8 px-4 bg-white border border-[#E2E2E2] rounded-[4px] flex items-center gap-2.5 hover:bg-gray-50 transition-all"
        >
          <div className="w-[18px] h-[18px] border border-[#E2E2E2] rounded-[2px] flex items-center justify-center bg-[#232527]">
             <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
               <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
          <span className="text-[12px] font-semibold text-[#232527]">전체선택</span>
        </button>
      )}
      {onToggleFold && (
        <button 
          onClick={onToggleFold}
          className="h-8 px-4 bg-white border border-[#E2E2E2] rounded-[4px] flex items-center gap-2.5 hover:bg-gray-50 transition-all"
        >
          <span className="text-[12px] font-semibold text-[#232527]">{isFolded ? '펼치기' : '접기'}</span>
          <svg 
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={cn("transition-transform duration-200", isFolded ? "rotate-90" : "-rotate-90")}
          >
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      )}
    </div>
  </div>
);

export default function SettingsPage() {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const {
    selectedTypeIds,
    activeItemIds,
    customItems,
    toggleUserType,
    selectAllTypes,
    toggleItem,
    selectAllItems,
    addCustomItem,
    removeCustomItem,
  } = useCustomization();

  const [isAllItemsVisible, setIsAllItemsVisible] = useState(false);
  const [isSection1Folded, setIsSection1Folded] = useState(false);
  const [isSection2Folded, setIsSection2Folded] = useState(false);
  const [isSection3Folded, setIsSection3Folded] = useState(false);
  const [newCustomItem, setNewCustomItem] = useState('');

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomItem.trim()) {
      addCustomItem(newCustomItem);
      setNewCustomItem('');
    }
  };

  const totalSelectedCount = activeItemIds.length + customItems.length;

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      <main className="max-w-[1440px] mx-auto w-full px-[136px] py-[50px] flex-1 pb-40">
        {/* Title Section */}
        <section className="mb-12">
          <h1 className="text-[30px] font-bold text-[#232527] mb-3">체크리스트 맞춤 설정</h1>
          <p className="text-[16px] text-[#777] font-medium">3단계로 나만의 체크리스트를 만들어 보세요.</p>
        </section>

        {/* Non-login Banner */}
        {!isLoggedIn && (
          <section className="mb-24 p-[30px] bg-[#F5F5F5] rounded-[6px] border border-[#E2E2E2] flex flex-col items-center">
            <div className="text-center mb-6 space-y-2">
              <p className="text-[18px] font-bold text-[#232527]">커스텀 설정은 로그인 후 이용 가능해요</p>
              <p className="text-[14px] text-[#777] font-medium">비로그인 상태에서는 기본 체크리스트가 그대로 제공됩니다.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/checklist/new')}
                className="w-[265px] py-3 bg-white border border-[#636363] rounded-[4px] font-medium text-[16px] text-[#636363] hover:bg-gray-50 transition-all"
              >
                비로그인으로 진행하기
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="px-4 py-3 bg-[#0A607D] rounded-[4px] font-medium text-[16px] text-white hover:bg-[#084e6d] transition-all"
              >
                로그인하고 나만의 체크리스트 만들기
              </button>
            </div>
          </section>
        )}

        <div className={cn("space-y-24 transition-opacity duration-300", !isLoggedIn && "opacity-45 pointer-events-none")}>
          {/* Section 1: User Types */}
          <section>
            <SectionHeader 
              number={1} 
              title="나는 이런 유형이에요" 
              description="여러 개 선택 가능 · 선택한 유형에 맞는 항목이 자동으로 체크돼요"
              onSelectAll={selectAllTypes}
              isFolded={isSection1Folded}
              onToggleFold={() => setIsSection1Folded(!isSection1Folded)}
            />
            {!isSection1Folded && (
              <div className="grid grid-cols-3 gap-3">
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

          {/* Section 2: Custom Checklist */}
          <section>
            <SectionHeader 
              number={2} 
              title="맞춤 체크리스트" 
              description="Step 1에서 유형을 선택하면 추천 항목이 표시돼요"
              onSelectAll={selectAllItems}
              isFolded={isSection2Folded}
              onToggleFold={() => setIsSection2Folded(!isSection2Folded)}
            />
            {!isSection2Folded && (
              <>
                {activeItemIds.length === 0 ? (
                  <div className="bg-[#f5f5f5] border border-[#E2E2E2] rounded-[6px] p-3 flex items-center gap-2.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3a4 4 0 0 0 4-4V6a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 4a6 6 0 0 1-7 7l-1.5-1"/></svg>
                    <p className="text-[14px] font-medium text-[#777]">위에서 유형을 먼저 선택해주세요</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-[6px] border border-[#F0F0F0] p-6 shadow-sm">
                    <div className="flex flex-wrap gap-3">
                      {CHECKLIST_ITEMS.filter(item => activeItemIds.includes(item.id)).map((item) => (
                        <ChecklistItemToggle
                          key={item.id}
                          label={item.label}
                          isActive={activeItemIds.includes(item.id)}
                          onToggle={() => toggleItem(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Section 3: Additional Items */}
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
              <div className="space-y-10">
                {/* All Items Toggle ... unchanged code ... */}
                
                {/* Custom Items Add */}
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-bold text-[#232527]">나만의 항목 추가</h4>
                      <span className="text-[14px] font-bold text-[#777]">{customItems.length}건</span>
                    </div>
                    <button 
                      onClick={() => {}} // TODO: Implement custom items all select if needed
                      className="text-[14px] font-medium text-[#232527] hover:underline"
                    >
                      전체 선택
                    </button>
                  </div>
                  <form onSubmit={handleAddCustomItem} className="flex gap-3">
                    <input
                      type="text"
                      value={newCustomItem}
                      onChange={(e) => setNewCustomItem(e.target.value)}
                      placeholder="예 : 초인종 여부, 환기 상태"
                      className="flex-1 bg-white border border-[#BFBFBF] rounded-[6px] px-3 py-[6px] text-[14px] outline-none focus:border-[#0A607D] transition-all"
                    />
                    <button 
                      type="submit"
                      className="w-9 h-9 bg-white border border-[#BFBFBF] rounded-[6px] flex items-center justify-center hover:bg-gray-50 transition-all group"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BFBFBF" strokeWidth="2.5" strokeLinecap="round" className="group-hover:stroke-[#232527] transition-all">
                        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </form>

                  {customItems.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customItems.map((item, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 bg-[#D9EAF0] text-[#0A607D] px-3 py-1.5 rounded-lg text-[13px] font-bold"
                        >
                          {item}
                          <button 
                            onClick={() => removeCustomItem(idx)}
                            className="text-[#0A607D]/60 hover:text-[#0A607D]"
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FAFAFA] border-t border-[#E2E2E2] px-10 py-[28px] z-50">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[12px] text-[#A0A0A0] font-bold">내 선택 정보</span>
            <p className="text-[16px] font-bold text-[#0A607D]">{totalSelectedCount}개 선택됨</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="w-[400px] bg-[#0A607D] text-white py-4 rounded-xl font-bold text-[18px] hover:bg-[#084e6d] transition-all shadow-lg active:scale-[0.98]"
          >
            내 방 보러가기
          </button>
        </div>
      </div>
    </div>
  );
}
