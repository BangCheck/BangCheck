'use client';

import { Suspense } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCheckFunnel } from '@/features/checklist/hooks/useCheckFunnel';
import Step1BasicInfo from '@/features/checklist/components/Step1BasicInfo';
import Step2BuildingInfo from '@/features/checklist/components/Step2BuildingInfo';
import Step3DetailedCheck from '@/features/checklist/components/Step3DetailedCheck';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { createChecklist } from '@/services/checklist-service';
import { useAuthStore } from '@/store/use-auth-store';
import { useGuestRoomStore } from '@/store/use-guest-room-store';
import { ROUTES } from '@/lib/routes';
import { useState } from 'react';

// 스크린샷 기반 통합 Zod 스키마
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

export default function ChecklistNewPage() {
  return (
    <Suspense>
      <ChecklistNewContent />
    </Suspense>
  );
}

function ChecklistNewContent() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const { addGuestRoom, guestRooms } = useGuestRoomStore();

  const methods = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      type: '월세',
      hasLoan: '없음',
      moveInReport: '가능',
      isManagementFeeUnknown: false,
      isMoveInDateNegotiable: false,
      hasElevator: '있음',
      hasParking: '없음',
      direction: '남',
      // TODO(be): customItems는 유저 설정 API 연동 후 서버에서 불러올 것
      customItems: [],
    }
  });

  const { step, next, prev, setStep } = useCheckFunnel();
  const progress = Math.round((step / TABS.length) * 100);

  const nameValue = methods.watch('name');
  const isNameEmpty = !nameValue || nameValue.trim().length === 0;

  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutate: submitChecklist, isPending } = useMutation({
    mutationFn: createChecklist,
    onSuccess: () => {
      router.push(ROUTES.ROOMS);
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Save failed:', error);
      setSubmitError(error.response?.data?.message || '저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  });

  const onSubmit = (data: ChecklistFormValues) => {
    setSubmitError(null);
    if (isLoggedIn) {
      submitChecklist(data as any);
    } else {
      // 비로그인 사용자 로직
      if (guestRooms.length >= 2) {
        // TODO(be): 비로그인 한도 초과 시 로그인 유도 모달로 교체 필요
        setSubmitError('비로그인 상태에서는 최대 2개까지만 등록할 수 있습니다. 로그인하시면 무제한으로 이용 가능해요.');
        return;
      }

      const success = addGuestRoom(data as any);
      if (success) {
        router.push(ROUTES.ROOMS);
      } else {
        setSubmitError('저장 가능한 개수를 초과했습니다.');
      }
    }
  };

  return (
    <div className="flex-1 bg-white min-h-screen flex flex-col">
      {/* 1. Category Tabs */}
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

      {/* 2. Progress Bar Section */}
      <div className="max-w-[800px] mx-auto w-full px-6 pt-10">
        <div className="flex justify-between items-end mb-4">
          <h1 className="text-[24px] font-bold text-[#232527]">방 체크리스트</h1>
          <span className="text-[14px] font-bold text-[#0A607D]">{progress}%</span>
        </div>
        <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-[#0A607D] transition-all duration-700 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 3. Main Form Area */}
      <main className="max-w-[800px] mx-auto w-full px-6 py-12 flex-1">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col min-h-full">
            <div className="flex-1">
              {step === 1 && <Step1BasicInfo />}
              {step === 2 && <Step2BuildingInfo />}
              {step === 3 && <Step3DetailedCheck />}
            </div>

            {/* Navigation Buttons - Sticky at the bottom */}
            <div className="pt-16 pb-10 sticky bottom-0 bg-white/95 backdrop-blur-sm mt-auto z-50 border-t border-[#F5F5F5] -mx-6 px-6">
              {submitError && (
                <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-600 font-medium">
                  {submitError}
                </div>
              )}
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prev}
                    disabled={isPending}
                    className="flex-1 py-4 rounded-xl font-bold text-[16px] bg-white border border-[#E2E2E2] text-[#232527] hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    이전으로
                  </button>
                )}
                <button
                  type="button"
                  onClick={step === TABS.length ? methods.handleSubmit(onSubmit) : next}
                  disabled={isPending || (step === TABS.length && isNameEmpty)}
                  className={cn(
                    "py-4 rounded-xl font-bold text-[16px] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer",
                    step === 1 ? "w-full bg-[#0A607D] text-white" : "flex-[2_2_0%] bg-[#0A607D] text-white",
                    (isPending || (step === TABS.length && isNameEmpty)) && "opacity-50 cursor-not-allowed grayscale-[0.5]"
                  )}
                >
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    step === TABS.length ? '저장하기' : '다음으로'
                  )}
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
