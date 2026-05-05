'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCheckFunnel } from '@/features/checklist/hooks/useCheckFunnel';
import Step1BasicInfo from '@/features/checklist/components/Step1BasicInfo';
import Step2BuildingInfo from '@/features/checklist/components/Step2BuildingInfo';
import Step3DetailedCheck from '@/features/checklist/components/Step3DetailedCheck';
import { cn } from '@/lib/utils';
import { useChecklist, useUpdateChecklist } from '@/features/checklist/hooks/useChecklistQuery';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { GuestEditDisabledModal } from '@/components/ui/Modals';
import { ROUTES } from '@/lib/routes';

// 스크린샷 기반 통합 Zod 스키마 (New 페이지와 동일하게 유지)
const checklistSchema = z.object({
  name: z.string().min(1, '매물명을 입력해주세요').max(20, '매물명은 최대 20자까지 가능합니다'),
  address: z.string().optional(),
  type: z.enum(['전세', '월세', '단기임대']).default('월세'),
  deposit: z.string().optional(),
  rent: z.string().optional(),
  managementFee: z.string().optional(),
  isManagementFeeUnknown: z.boolean().default(false),
  hasLoan: z.enum(['없음', '있음']).default('없음'),
  loanAmount: z.string().optional(),
  moveInReport: z.enum(['가능', '불가능']).default('가능'),
  moveInDate: z.string().optional(),
  isMoveInDateNegotiable: z.boolean().default(false),
  buildingType: z.string().optional(),
  hasElevator: z.enum(['없음', '있음']).default('있음'),
  hasParking: z.enum(['없음', '있음']).default('없음'),
  floor: z.string().optional(),
  specialFloor: z.string().nullable().optional(),
  direction: z.string().default('남'),
  options: z.array(z.string()).default([]),
  scores: z.record(z.string(), z.string()).default({}),
  problems: z.record(z.string(), z.string()).default({}),
  customItems: z.array(z.string()).default([]),
  memo: z.string().max(50, '메모는 최대 50자까지 가능합니다').optional(),
});

type ChecklistFormValues = z.input<typeof checklistSchema>;

const TABS = ['기본 정보', '건물 정보', '상세 점검'];

export default function ChecklistDetailPage() {
  return (
    <Suspense>
      <ChecklistDetailContent />
    </Suspense>
  );
}

function ChecklistDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const { guestRooms } = useGuestRoomStore();
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  const methods = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistSchema),
  });

  const { step, next, prev, setStep } = useCheckFunnel();
  const progress = Math.round((step / TABS.length) * 100);

  // 데이터 불러오기 — useChecklist가 내부적으로 mapResponseToForm 적용
  const { data: apiData, isLoading } = useChecklist(id);

  useEffect(() => {
    if (isLoggedIn && apiData) {
      methods.reset(apiData as any);
    } else if (!isLoggedIn) {
      const guestRoom = guestRooms.find(r => r.id === id);
      if (guestRoom) {
        methods.reset(guestRoom as any);
      }
    }
  }, [isLoggedIn, apiData, guestRooms, id, methods]);

  const { mutate: updateMutation, isPending } = useUpdateChecklist(id);

  const onSubmit = (data: ChecklistFormValues) => {
    if (isLoggedIn) {
      updateMutation(data as any, {
        onSuccess: () => {
          alert('체크리스트가 수정되었습니다!');
          router.push(ROUTES.ROOMS);
          router.refresh();
        },
        onError: (error: any) => {
          console.error('Update failed:', error);
          alert('수정 중 오류가 발생했습니다.');
        },
      });
    } else {
      setIsGuestModalOpen(true);
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="flex-1 bg-white min-h-screen flex flex-col">
      <nav className="border-b border-[#E2E2E2] overflow-x-auto no-scrollbar bg-white sticky top-16 z-40">
        <div className="max-w-[800px] mx-auto flex justify-center">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStep(idx + 1)}
              className={cn(
                "px-8 py-4 text-[15px] font-bold whitespace-nowrap transition-all border-b-2",
                step === idx + 1 
                  ? "text-[#0A607D] border-[#0A607D]" 
                  : "text-[#A0A0A0] border-transparent hover:text-[#232527]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto w-full px-6 pt-10">
        <div className="flex justify-between items-end mb-4">
          <h1 className="text-[24px] font-bold text-[#232527]">체크리스트 확인</h1>
          <span className="text-[14px] font-bold text-[#0A607D]">{progress}%</span>
        </div>
        <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-[#0A607D] transition-all duration-700 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="max-w-[800px] mx-auto w-full px-6 py-12 flex-1">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col min-h-full">
            <div className="flex-1">
              {step === 1 && <Step1BasicInfo />}
              {step === 2 && <Step2BuildingInfo />}
              {step === 3 && <Step3DetailedCheck />}
            </div>

            <div className="pt-16 pb-10 flex gap-3 sticky bottom-0 bg-white/95 backdrop-blur-sm mt-auto z-50 border-t border-[#F5F5F5] -mx-6 px-6">
              <button
                type="button"
                onClick={() => router.push(ROUTES.ROOMS)}
                className="flex-1 py-4 rounded-xl font-bold text-[16px] bg-white border border-[#E2E2E2] text-[#232527] hover:bg-gray-50 transition-all cursor-pointer"
              >
                닫기
              </button>
              {step > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  className="flex-1 py-4 rounded-xl font-bold text-[16px] bg-white border border-[#E2E2E2] text-[#232527] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  이전
                </button>
              )}
              <button 
                type="button"
                onClick={step === TABS.length ? methods.handleSubmit(onSubmit) : next}
                className="flex-[2_2_0%] bg-[#0A607D] text-white py-4 rounded-xl font-bold text-[16px] transition-all shadow-lg cursor-pointer"
              >
                {step === TABS.length ? '수정 완료' : '다음으로'}
              </button>
            </div>
          </form>
        </FormProvider>
      </main>

      <GuestEditDisabledModal 
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onLogin={() => router.push(ROUTES.LOGIN)}
      />
    </div>
  );
}
