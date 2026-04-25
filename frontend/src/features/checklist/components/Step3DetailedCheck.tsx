'use client';

import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';

export default function Step3DetailedCheck() {
  const { watch, setValue } = useFormContext();
  
  const options = watch('options') || [];
  const scores = watch('scores') || {};
  const problems = watch('problems') || {};

  const toggleOption = (opt: string) => {
    const next = options.includes(opt) ? options.filter((o: string) => o !== opt) : [...options, opt];
    setValue('options', next);
  };

  const setScore = (key: string, val: string) => {
    setValue('scores', { ...scores, [key]: val });
  };

  const toggleProblem = (key: string, val: string) => {
    setValue('problems', { ...problems, [key]: val });
  };

  const SectionTitle = ({ num, title }: { num: string; title: string }) => (
    <h3 className="text-[16px] font-bold text-[#232527] mb-5 border-b border-[#F5F5F5] pb-2">
      {num}. {title}
    </h3>
  );

  const RatingRow = ({ label, id }: { label: string; id: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#FAFAFA] last:border-0">
      <span className="text-[14px] text-[#444] font-medium">{label}</span>
      <div className="flex gap-1.5">
        {['좋음', '보통', '나쁨'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setScore(id, v)}
            className={cn(
              "px-4 py-1.5 rounded-full border text-[12px] font-bold transition-all",
              scores[id] === v 
                ? (v === '나쁨' ? "bg-red-50 border-red-400 text-red-500" : "bg-[#0A607D] border-[#0A607D] text-white")
                : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  const ProblemRow = ({ label, id }: { label: string; id: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#FAFAFA] last:border-0">
      <span className="text-[14px] text-[#444] font-medium">{label}</span>
      <div className="flex gap-1.5">
        {['없음', '있음'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => toggleProblem(id, v)}
            className={cn(
              "px-6 py-1.5 rounded-full border text-[12px] font-bold transition-all",
              problems[id] === v 
                ? (v === '있음' ? "bg-red-50 border-red-400 text-red-500" : "bg-[#0A607D] border-[#0A607D] text-white")
                : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-2 duration-500">
      {/* 3. 옵션 */}
      <section>
        <SectionTitle num="3" title="옵션" />
        <div className="flex flex-wrap gap-2">
          {['에어컨', '세탁기', '냉장고', '인덕션', '가스레인지', '침대', '책상', '전자레인지'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              className={cn(
                "px-4 py-2 rounded-full border text-[13px] font-semibold transition-all",
                options.includes(opt) ? "bg-[#0A607D] border-[#0A607D] text-white" : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      {/* 4. 내부 상태 */}
      <section>
        <SectionTitle num="4" title="내부 상태" />
        <div className="bg-white rounded-xl">
          <RatingRow label="벽지/도배 상태" id="wall" />
          <RatingRow label="바닥 상태" id="floor_score" />
          <RatingRow label="천장 상태" id="ceiling" />
          <RatingRow label="수압 상태" id="water_pressure" />
          <RatingRow label="배수 상태" id="drainage" />
        </div>
      </section>

      {/* 5. 문제 요소 */}
      <section>
        <SectionTitle num="5" title="문제 요소" />
        <div className="bg-white">
          <ProblemRow label="곰팡이" id="mold" />
          <ProblemRow label="누수" id="leak" />
          <ProblemRow label="벌레" id="bug" />
          <ProblemRow label="결로" id="condensation" />
        </div>
      </section>

      {/* 6. 생활 편의 */}
      <section>
        <SectionTitle num="6" title="생활 편의" />
        <RatingRow label="일조량 (채광)" id="sunlight" />
        <RatingRow label="환기 (창문 크기)" id="ventilation" />
        <RatingRow label="수납 공간" id="storage" />
      </section>
      
      {/* 메모 */}
      <section>
        <SectionTitle num="+" title="비고" />
        <textarea
          placeholder="방에 대한 추가적인 메모를 남겨주세요."
          className="w-full h-32 p-4 rounded-xl border border-[#E2E2E2] outline-none focus:border-[#0A607D] resize-none text-sm"
          {...watch('memo')}
        />
      </section>
    </div>
  );
}
