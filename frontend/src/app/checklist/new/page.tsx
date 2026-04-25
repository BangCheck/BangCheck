'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCheckFunnel } from '@/features/checklist/hooks/useCheckFunnel';
import Step1BasicInfo from '@/features/checklist/components/Step1BasicInfo';
import Step2BuildingInfo from '@/features/checklist/components/Step2BuildingInfo';
import Step3DetailedCheck from '@/features/checklist/components/Step3DetailedCheck';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 스크린샷 기반 통합 Zod 스키마
const checklistSchema = z.object({
  name: z.string().min(1, '매물명을 입력해주세요'),
  address: z.string().optional(),
  type: z.enum(['전세', '월세', '단기임대']).default('월세'),
  deposit: z.string().optional(),
  rent: z.string().optional(),
  managementFee: z.string().optional(),
  hasLoan: z.enum(['없음', '있음']).default('없음'),
  moveInDate: z.string().optional(),
  buildingType: z.string().optional(),
  hasElevator: z.enum(['없음', '있음']).default('있음'),
  hasParking: z.enum(['없음', '있음']).default('없음'),
  floor: z.string().optional(),
  direction: z.enum(['남', '동', '서', '북']).default('남'),
  options: z.array(z.string()).default([]),
  scores: z.record(z.string(), z.enum(['좋음', '보통', '나쁨'])).default({}),
  problems: z.record(z.string(), z.enum(['없음', '있음'])).default({}),
  memo: z.string().optional(),
});

type ChecklistFormValues = z.infer<typeof checklistSchema>;

const TABS = ['기본 정보', '건물 정보', '상세 점검'];

export default function ChecklistNewPage() {
  const router = useRouter();
  const methods = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      type: '월세',
      hasLoan: '없음',
      hasElevator: '있음',
      hasParking: '없음',
      direction: '남',
    }
  });

  const { step, next, prev, setStep } = useCheckFunnel();
  // 8단계에서 3단계로 조정됨에 따른 퍼센트 계산
  const progress = Math.round((step / TABS.length) * 100);

  const onSubmit = (data: ChecklistFormValues) => {
    console.log('Final Data:', data);
    alert('체크리스트가 성공적으로 저장되었습니다!');
    router.push('/');
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

            {/* Navigation Buttons */}
            <div className="pt-16 pb-10 flex gap-3 sticky bottom-0 bg-white/90 backdrop-blur-md mt-auto">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  className="flex-1 py-4 rounded-xl font-bold text-[16px] bg-white border border-[#E2E2E2] text-[#232527] hover:bg-gray-50 transition-all"
                >
                  이전으로
                </button>
              )}
              <button 
                type="button"
                onClick={step === TABS.length ? methods.handleSubmit(onSubmit) : next}
                className={cn(
                  "py-4 rounded-xl font-bold text-[16px] transition-all shadow-lg",
                  step === 1 ? "w-full bg-[#0A607D] text-white" : "flex-[2_2_0%] bg-[#0A607D] text-white"
                )}
              >
                {step === TABS.length ? '저장하기' : '다음으로'}
              </button>
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  );
}
