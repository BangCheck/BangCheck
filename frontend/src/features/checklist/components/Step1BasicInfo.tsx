'use client';

import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-[14px] font-bold text-[#232527] mb-2 tracking-tight">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "w-full px-4 py-3 rounded-[6px] border border-[#E2E2E2] bg-white outline-none focus:border-[#0A607D] transition-all text-[15px] disabled:bg-[#F5F5F5] disabled:text-[#A0A0A0]",
      props.className
    )}
  />
);

export default function Step1BasicInfo() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  
  const nameValue = watch('name') || '';
  const currentType = watch('type');
  const depositValue = watch('deposit') || '';
  const rentValue = watch('rent') || '';
  const isManagementFeeUnknown = watch('isManagementFeeUnknown');
  const hasLoan = watch('hasLoan');
  const isMoveInDateNegotiable = watch('isMoveInDateNegotiable');

  // 환산보증금 계산 및 포맷팅
  const calculateConvertedDeposit = () => {
    const d = parseInt(depositValue) || 0;
    const r = parseInt(rentValue) || 0;
    if (d === 0) return null;
    
    const total = d + (r * 100);
    
    const formatPrice = (val: number) => {
      const eok = Math.floor(val / 10000);
      const man = val % 10000;
      let result = '';
      if (eok > 0) result += `${eok}억 `;
      if (man > 0) result += `${man.toLocaleString()}만원`;
      return result.trim() || '0원';
    };

    return formatPrice(total);
  };

  const convertedDeposit = calculateConvertedDeposit();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <section>
        <h2 className="text-[18px] font-bold text-[#232527] mb-6 flex items-center gap-2">
           1. 기본 정보
        </h2>
        
        <div className="space-y-8">
          {/* 매물명 */}
          <div className="relative">
            <Label required>매물명</Label>
            <Input 
              {...register('name')} 
              placeholder="예: 역삼역 원룸 3층" 
              maxLength={20}
            />
            <div className="absolute right-0 top-0 text-[12px] font-medium text-[#A0A0A0]">
              <span className={cn(nameValue.length >= 20 ? "text-[#0A607D]" : "")}>{nameValue.length}</span>/20
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
          </div>

          {/* 주소 */}
          <div>
            <Label>주소 (지도 표시용)</Label>
            <Input {...register('address')} placeholder="예: 가천대학교, 신촌역..." />
          </div>

          {/* 거래 유형 */}
          <div>
            <Label required>거래 유형</Label>
            <div className="flex gap-2">
              {['전세', '월세', '단기임대'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={cn(
                    "px-6 py-2.5 rounded-full border text-[14px] font-semibold transition-all cursor-pointer",
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label required>보증금 (만원)</Label>
              <Input {...register('deposit')} placeholder="예: 1000" type="number" />
            </div>
            {currentType !== '전세' && (
              <div>
                <Label required>월세 (만원)</Label>
                <Input {...register('rent')} placeholder="예: 50" type="number" />
              </div>
            )}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>관리비 (만원)</Label>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isManagementFeeUnknown;
                    setValue('isManagementFeeUnknown', nextVal);
                    if (nextVal) setValue('managementFee', '');
                  }}
                  className={cn(
                    "text-[12px] font-bold px-2 py-1 rounded-[4px] transition-all cursor-pointer",
                    isManagementFeeUnknown 
                      ? "bg-[#0A607D] text-white" 
                      : "bg-[#F5F5F5] text-[#A0A0A0]"
                  )}
                >
                  모름
                </button>
              </div>
              <Input 
                {...register('managementFee')} 
                placeholder="예: 5" 
                type="number" 
                disabled={isManagementFeeUnknown}
              />
            </div>
          </div>

          {/* 융자 여부 */}
          <div className="space-y-4">
            <div>
              <Label>융자 여부</Label>
              <div className="flex gap-2">
                {['없음', '있음'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue('hasLoan', v)}
                    className={cn(
                      "px-8 py-2.5 rounded-full border text-[14px] font-semibold transition-all cursor-pointer",
                      hasLoan === v 
                        ? "bg-[#0A607D] border-[#0A607D] text-white shadow-sm" 
                        : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            {hasLoan === '있음' && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <Label>융자 금액 (만원)</Label>
                <Input {...register('loanAmount')} placeholder="예: 5000" type="number" className="max-w-[240px]" />
              </div>
            )}
          </div>

          {/* 전입신고 & 입주 가능일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>전입신고</Label>
              <div className="flex gap-2">
                {['가능', '불가능'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue('moveInReport', v)}
                    className={cn(
                      "px-8 py-2.5 rounded-full border text-[14px] font-semibold transition-all cursor-pointer",
                      watch('moveInReport') === v 
                        ? "bg-[#0A607D] border-[#0A607D] text-white shadow-sm" 
                        : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>입주 가능일</Label>
                <label className="flex items-center gap-1.5 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    {...register('isMoveInDateNegotiable')} 
                    className="w-4 h-4 rounded border-[#E2E2E2] text-[#0A607D] focus:ring-[#0A607D]"
                  />
                  <span className="text-[12px] font-bold text-[#A0A0A0] group-hover:text-[#777]">협의 가능</span>
                </label>
              </div>
              <Input 
                {...register('moveInDate')} 
                placeholder="YYYY-MM-DD" 
                type="date"
                disabled={isMoveInDateNegotiable}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 최우선변제금 가이드 */}
      {convertedDeposit && (
        <section className="bg-[#F9FBFC] border border-[#D9EAF0] rounded-[12px] p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A607D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-[15px] font-bold text-[#232527]">최우선 변제금 안내</h3>
              <p className="text-[14px] text-[#555] leading-relaxed">
                현재 입력하신 보증금 기준 <span className="text-[#0A607D] font-bold">환산보증금은 {convertedDeposit}</span>입니다.
              </p>
              <p className="text-[12px] text-[#A0A0A0]">
                * 지역별 소액임차인 범위에 따라 최우선 변제 가능 여부가 달라질 수 있으니 등기부등본을 꼭 확인하세요.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
