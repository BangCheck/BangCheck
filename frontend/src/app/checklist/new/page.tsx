'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCheckFunnel } from '@/features/checklist/hooks/useCheckFunnel';
import Step1BasicInfo from '@/features/checklist/components/Step1BasicInfo';

// 전체 폼 스키마 (임시)
const checklistSchema = z.object({
  name: z.string().min(1, '방 이름을 입력해주세요'),
  // ... 나머지 필드들
});

type ChecklistFormValues = z.infer<typeof checklistSchema>;

export default function ChecklistNewPage() {
  const methods = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      name: '',
    }
  });

  const { step, next, prev } = useCheckFunnel();

  const onSubmit = (data: ChecklistFormValues) => {
    console.log('Final Data:', data);
    // TODO: 백엔드 API 호출
  };

  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-64px)] flex flex-col">
      {/* 상단 프로그레스 바 (선택 사항) */}
      <div className="h-1 bg-gray-100 w-full overflow-hidden">
        <div 
          className="h-full bg-[#0A607D] transition-all duration-300"
          style={{ width: `${(step / 8) * 100}%` }}
        />
      </div>

      <div className="max-w-[600px] mx-auto w-full px-5 py-10 flex-1 flex flex-col">
        <FormProvider {...methods}>
          <form 
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col"
          >
            {/* 퍼널 단계별 렌더링 */}
            {step === 1 && <Step1BasicInfo onNext={next} />}
            
            {step > 1 && step <= 8 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold mb-4">Step {step} 준비 중</h2>
                <p className="text-gray-500 mb-8">시니어 개발자의 조언에 따라 퍼널 구조로 설계되었습니다.</p>
                <div className="flex gap-4">
                  <button type="button" onClick={prev} className="px-6 py-2 border rounded-md">이전</button>
                  <button type="button" onClick={next} className="px-6 py-2 bg-[#0A607D] text-white rounded-md">다음</button>
                </div>
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
