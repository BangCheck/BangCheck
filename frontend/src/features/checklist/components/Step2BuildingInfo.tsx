'use client';

import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[14px] font-bold text-[#232527] mb-2 tracking-tight">
    {children}
  </label>
);

export default function Step2BuildingInfo() {
  const { register, watch, setValue } = useFormContext();
  
  const buildingType = watch('buildingType');
  const hasElevator = watch('hasElevator');
  const hasParking = watch('hasParking');
  const direction = watch('direction');
  const specialFloor = watch('specialFloor'); // '반지하' | '옥탑방' | null

  const handleSpecialFloor = (type: string) => {
    if (specialFloor === type) {
      setValue('specialFloor', null);
    } else {
      setValue('specialFloor', type);
      setValue('floor', ''); // 숫자 입력창 초기화
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-500">
      <section>
        <h2 className="text-[18px] font-bold text-[#232527] mb-6">2. 건물 정보</h2>
        
        <div className="space-y-8">
          {/* 건물 유형 */}
          <div>
            <Label>건물 유형</Label>
            <div className="flex flex-wrap gap-2">
              {['빌라', '오피스텔', '하숙', '1.5룸', '원룸', '고시원'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('buildingType', t)}
                  className={cn(
                    "px-5 py-2 rounded-full border text-[13px] font-semibold transition-all",
                    buildingType === t 
                      ? "bg-[#0A607D] border-[#0A607D] text-white" 
                      : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 엘리베이터 & 주차 (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>엘리베이터</Label>
              <div className="flex gap-2">
                {['없음', '있음'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue('hasElevator', v)}
                    className={cn(
                      "flex-1 md:flex-none px-8 py-2.5 rounded-full border text-[14px] font-semibold transition-all",
                      hasElevator === v ? "bg-[#0A607D] border-[#0A607D] text-white" : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>주차</Label>
              <div className="flex gap-2">
                {['없음', '있음'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValue('hasParking', v)}
                    className={cn(
                      "flex-1 md:flex-none px-8 py-2.5 rounded-full border text-[14px] font-semibold transition-all",
                      hasParking === v ? "bg-[#0A607D] border-[#0A607D] text-white" : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 층수 & 방향 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label>층수</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    {...register('floor')}
                    type="number"
                    disabled={!!specialFloor}
                    placeholder={specialFloor ? "" : "예: 3"}
                    className={cn(
                      "w-full px-4 py-3 rounded-[6px] border border-[#E2E2E2] outline-none transition-all",
                      specialFloor ? "bg-[#F5F5F5] border-[#E2E2E2] cursor-not-allowed" : "focus:border-[#0A607D]"
                    )}
                  />
                  {!specialFloor && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#A0A0A0]">층</span>}
                </div>
                <div className="flex gap-1.5">
                  {['반지하', '옥탑방'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSpecialFloor(type)}
                      className={cn(
                        "px-4 py-3 rounded-[6px] border text-[13px] font-semibold transition-all whitespace-nowrap",
                        specialFloor === type 
                          ? "bg-[#0A607D] border-[#0A607D] text-white" 
                          : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label>방향</Label>
              <div className="flex flex-wrap gap-2">
                {['남', '동', '서', '북', '모름'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValue('direction', d)}
                    className={cn(
                      "px-5 py-2.5 rounded-full border text-[14px] font-semibold transition-all",
                      direction === d ? "bg-[#0A607D] border-[#0A607D] text-white" : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
