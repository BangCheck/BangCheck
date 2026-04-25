'use client';

import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

export default function Step1BasicInfo() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  
  const currentType = watch('type');
  const hasLoan = watch('hasLoan');

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[14px] font-bold text-[#232527] mb-2 tracking-tight">
      {children}
    </label>
  );

  const Input = (props: any) => (
    <input
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-[6px] border border-[#E2E2E2] bg-white outline-none focus:border-[#0A607D] transition-all text-[15px]",
        props.className
      )}
    />
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section>
        <h2 className="text-[18px] font-bold text-[#232527] mb-6 flex items-center gap-2">
           1. 기본 정보
        </h2>
        
        <div className="space-y-6">
          {/* 매물명 */}
          <div>
            <Label>매물명</Label>
            <Input {...register('name')} placeholder="예: 역삼역 원룸 3층" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
          </div>

          {/* 주소 */}
          <div>
            <Label>주소 (지도 표시용)</Label>
            <Input {...register('address')} placeholder="예: 가천대학교, 신촌역..." />
          </div>

          {/* 거래 유형 */}
          <div>
            <Label>거래 유형</Label>
            <div className="flex gap-2">
              {['전세', '월세', '단기임대'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={cn(
                    "px-6 py-2.5 rounded-full border text-[14px] font-semibold transition-all",
                    currentType === t 
                      ? "bg-[#0A607D] border-[#0A607D] text-white shadow-md" 
                      : "bg-white border-[#E2E2E2] text-[#A0A0A0] hover:border-[#BFBFBF]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 금액 정보 (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>보증금 (만원)</Label>
              <Input {...register('deposit')} placeholder="예: 1000" type="number" />
            </div>
            <div>
              <Label>월세 (만원)</Label>
              <Input {...register('rent')} placeholder="예: 50" type="number" />
            </div>
            <div>
              <Label>관리비 (만원)</Label>
              <Input {...register('managementFee')} placeholder="예: 5" type="number" />
            </div>
          </div>

          {/* 융자 여부 & 입주 가능일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>융자 여부</Label>
              <div className="flex gap-2">
                {['없음', '있음'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue('hasLoan', v)}
                    className={cn(
                      "px-8 py-2.5 rounded-full border text-[14px] font-semibold transition-all",
                      hasLoan === v 
                        ? "bg-[#0A607D] border-[#0A607D] text-white" 
                        : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>입주 가능일</Label>
              <div className="relative">
                <Input {...register('moveInDate')} placeholder="월 · 일 🗓️" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
