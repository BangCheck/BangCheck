'use client';

import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { 
  ItemIcons, 
  IconRatingGood, 
  IconRatingNormal, 
  IconRatingBad, 
  IconChevron,
  IconEdit
} from '@/features/customization/components/Icons';

// 컬러 맵핑: 긍정(초록), 부정(빨강), 중립(파랑/회색)
const getOptionStyle = (value: string, isSelected: boolean, happyValue?: string, sadValue?: string) => {
  if (!isSelected) return "bg-white border-[#E2E2E2] text-[#A0A0A0]";
  
  // 명시적으로 지정된 경우 최우선 적용
  if (happyValue && value === happyValue) return "bg-[#F8FEFA] border-[#22D455] text-[#22D455]";
  if (sadValue && value === sadValue) return "bg-[#FFFAFA] border-[#F15556] text-[#F15556]";

  const positiveValues = ['좋음', '없음', '가깝다', '충분', '정상', '가능', '조용', '안전'];
  const negativeValues = ['나쁨', '있음', '멀다', '부족', '이상', '불가능', '위험', '시끄러움'];
  
  if (positiveValues.includes(value)) return "bg-[#F8FEFA] border-[#22D455] text-[#22D455]";
  if (negativeValues.includes(value)) return "bg-[#FFFAFA] border-[#F15556] text-[#F15556]";
  
  return "bg-[#FFFEF5] border-[#FFDF00] text-[#FFDF00]"; // 보통
};

const getRatingIcon = (value: string, className?: string, happyValue?: string, sadValue?: string) => {
  if (happyValue && value === happyValue) return <IconRatingGood className={className} />;
  if (sadValue && value === sadValue) return <IconRatingBad className={className} />;

  const positiveValues = ['좋음', '없음', '가깝다', '충분', '정상', '가능', '조용', '안전'];
  const negativeValues = ['나쁨', '있음', '멀다', '부족', '이상', '불가능', '위험', '시끄러움'];
  
  if (positiveValues.includes(value)) return <IconRatingGood className={className} />;
  if (negativeValues.includes(value)) return <IconRatingBad className={className} />;
  return <IconRatingNormal className={className} />;
};

const ChecklistEvaluationRow = ({ 
  iconKey, 
  label, 
  id, 
  tip, 
  guide, 
  options = ['좋음', '보통', '나쁨'],
  isCustom = false,
  happyValue,
  sadValue
}: { 
  iconKey?: string; 
  label: string; 
  id: string; 
  tip?: string; 
  guide?: string;
  options?: string[];
  isCustom?: boolean;
  happyValue?: string;
  sadValue?: string;
}) => {
  const { watch, setValue } = useFormContext();
  const currentValue = watch(`scores.${id}`);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      "py-6 border-b border-[#F5F5F5] last:border-0",
      isCustom && "bg-[#F9FBFC] px-4 -mx-4 rounded-xl mb-2 border-none"
    )}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              {isCustom ? (
                <span className="bg-[#0A607D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">사용자 추가</span>
              ) : (
                <span className="w-5 h-5 flex items-center justify-center text-[#232527]">
                  {iconKey ? ItemIcons[iconKey] || ItemIcons.default : ItemIcons.default}
                </span>
              )}
              <span className="text-[15px] font-bold text-[#232527]">{label}</span>
            </div>
            {tip && <p className="text-[12px] text-[#A0A0A0] leading-tight mb-1">💡 {tip}</p>}
            {guide && (
              <button 
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[12px] text-[#0A607D] font-bold flex items-center gap-0.5 mt-2 transition-opacity hover:opacity-70 cursor-pointer"
              >
                <IconChevron className={cn("w-3 h-3 transition-transform", isExpanded ? "-rotate-90" : "rotate-90")} />
                확인 가이드 보기
              </button>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 w-full">
          {options.map((v) => {
            const isSelected = currentValue === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setValue(`scores.${id}`, v)}
                className={cn(
                  "flex-1 py-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer",
                  getOptionStyle(v, isSelected, happyValue, sadValue)
                )}
              >
                {getRatingIcon(v, "w-5 h-5", happyValue, sadValue)}
                <span className="text-[14px] font-bold">{v}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {isExpanded && guide && (
        <div className="mt-4 p-5 bg-[#F8FAFB] rounded-xl text-[13px] text-[#4A4A4A] whitespace-pre-wrap leading-relaxed animate-in slide-in-from-top-2 duration-300 border border-[#EDF2F7]">
          <h4 className="font-bold text-[#232527] mb-2">{label} 가이드</h4>
          <ul className="space-y-1.5">
            {guide.split('\n').map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#0A607D]">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SectionTitle = ({ num, title }: { num: string; title: string }) => (
  <h3 className="text-[18px] font-bold text-[#232527] mb-6 flex items-center gap-2">
    <span className="w-7 h-7 bg-[#232527] text-white rounded-md flex items-center justify-center text-[14px]">{num}</span>
    {title}
  </h3>
);

export default function Step3DetailedCheck() {
  const { watch, setValue, register } = useFormContext();
  const options = watch('options') || [];
  const customItems = watch('customItems') || [];
  const memoValue = watch('memo') || '';

  const toggleOption = (opt: string) => {
    const next = options.includes(opt) ? options.filter((o: string) => o !== opt) : [...options, opt];
    setValue('options', next);
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-right-2 duration-500 pb-10">
      {/* 3. 옵션 */}
      <section>
        <SectionTitle num="3" title="옵션 (다중 선택)" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['에어컨', '세탁기', '냉장고', '인덕션', '가스레인지', '침대', '책상/의자', '옷장/수납'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOption(opt)}
              className={cn(
                "py-3.5 rounded-xl border text-[14px] font-semibold transition-all cursor-pointer text-center",
                options.includes(opt) ? "bg-[#F8FBFC] border-[#0A607D] text-[#0A607D] font-bold" : "bg-white border-[#E2E2E2] text-[#A0A0A0]"
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
        <div className="bg-white">
          <ChecklistEvaluationRow 
            iconKey="sunlight" 
            label="채광" 
            id="sunlight" 
            guide="낮 시간에 햇빛이 충분히 들어오는지 확인하세요.\n남향일수록 채광이 좋고 따뜻합니다.\n주변 건물에 가려 해가 안 들어오는지 체크하세요."
          />
          <ChecklistEvaluationRow 
            iconKey="ventilation" 
            label="환기" 
            id="ventilation" 
            guide="창문이 크고 맞바람이 치는 구조인지 확인하세요.\n주방과 화장실에 환기 시설이 잘 되어있는지 보세요."
          />
          <ChecklistEvaluationRow 
            iconKey="noise-all" 
            label="층간 소음" 
            id="floor_noise" 
            options={['조용', '보통', '시끄러움']}
            happyValue="조용"
            sadValue="시끄러움"
          />
          <ChecklistEvaluationRow 
            iconKey="water-pressure" 
            label="수압" 
            id="water_pressure" 
            guide="수도꼭지를 틀고 변기 물을 동시에 내려보세요.\n세면대와 샤워기의 수압 저하가 없는지 확인하세요."
          />
          <ChecklistEvaluationRow 
            iconKey="soundproof" 
            label="방음" 
            id="soundproof" 
          />
        </div>
      </section>

      {/* 5. 문제 요소 */}
      <section>
        <SectionTitle num="5" title="문제 요소" />
        <div className="bg-white">
          <ChecklistEvaluationRow 
            iconKey="mold" 
            label="곰팡이" 
            id="mold" 
            options={['없음', '있음']}
            happyValue="없음"
            sadValue="있음"
            tip="벽지 모서리, 가구 뒤쪽, 창틀 주변 확인"
          />
          <ChecklistEvaluationRow 
            iconKey="bug-trace" 
            label="벌레 흔적" 
            id="bug" 
            options={['없음', '있음']}
            happyValue="없음"
            sadValue="있음"
            tip="트랩 위치, 싱크대 하부, 싱크대/화장실 주변 배수구 확인"
            guide="싱크대 하단이나 욕실 배수구 주변에 벌레 사체나 배설물이 있는지 보세요.\n방역 업체 스티커가 붙어있는지도 확인하면 좋습니다."
          />
          <ChecklistEvaluationRow 
            iconKey="moisture" 
            label="누수/결로" 
            id="leak" 
            options={['없음', '있음']}
            happyValue="없음"
            sadValue="있음"
            tip="천장 얼룩, 창문 결로, 화장실 배관 선명부 확인"
          />
          <ChecklistEvaluationRow 
            iconKey="construction" 
            label="벽지/장판 상태" 
            id="wall_floor_status" 
            options={['좋음', '보통', '나쁨']}
            tip="장판의 뒤뜸, 오염, 긁힘 확인"
          />
          <ChecklistEvaluationRow 
            iconKey="drain-smell" 
            label="배수구 냄새" 
            id="drain_smell" 
            options={['없음', '있음']}
            happyValue="없음"
            sadValue="있음"
            tip="화장실/주방 배수구 냄새 확인"
          />
        </div>
      </section>

      {/* 6. 안전/보안 */}
      <section>
        <SectionTitle num="6" title="안전 / 보안" />
        <div className="bg-white">
          <ChecklistEvaluationRow 
            iconKey="entrance-security" 
            label="도어락 작동" 
            id="door_lock" 
            options={['정상', '이상']}
            happyValue="정상"
            sadValue="이상"
          />
          <ChecklistEvaluationRow 
            iconKey="window-lock" 
            label="창문 잠금장치" 
            id="window_lock" 
            options={['정상', '이상']}
            happyValue="정상"
            sadValue="이상"
          />
          <ChecklistEvaluationRow 
            iconKey="cctv" 
            label="CCTV/공동현관" 
            id="cctv" 
            options={['있음', '없음']}
            happyValue="있음"
            sadValue="없음"
          />
          <ChecklistEvaluationRow 
            iconKey="fire-safety" 
            label="소화기/화재 경보" 
            id="fire_safety" 
            options={['있음', '없음']}
            happyValue="있음"
            sadValue="없음"
          />
        </div>
      </section>

      {/* 7. 생활 편의 */}
      <section>
        <SectionTitle num="7" title="생활 편의" />
        <div className="bg-white">
          <ChecklistEvaluationRow 
            iconKey="dry-space" 
            label="세탁 건조 공간" 
            id="laundry_space" 
          />
          <ChecklistEvaluationRow 
            iconKey="trash" 
            label="쓰레기 배출" 
            id="trash_disposal" 
          />
          <ChecklistEvaluationRow 
            iconKey="parking" 
            label="자전거/킥보드 주차" 
            id="bike_parking" 
            options={['있음', '없음']}
            happyValue="있음"
            sadValue="없음"
          />
        </div>
      </section>

      {/* 8. 주변 환경 */}
      <section>
        <SectionTitle num="8" title="주변 환경" />
        <div className="bg-white">
          <ChecklistEvaluationRow 
            iconKey="noise-all" 
            label="소음 환경" 
            id="env_noise" 
            options={['조용', '보통', '시끄러움']}
            happyValue="조용"
            sadValue="시끄러움"
          />
          <ChecklistEvaluationRow 
            iconKey="convenience" 
            label="편의시설 접근성" 
            id="amenities" 
          />
          <ChecklistEvaluationRow 
            iconKey="transport" 
            label="대중교통 접근성" 
            id="transport" 
          />
          <ChecklistEvaluationRow 
            iconKey="night-safety" 
            label="밤길 안전" 
            id="night_safety" 
            options={['안전', '보통', '위험']}
            happyValue="안전"
            sadValue="위험"
          />
        </div>
      </section>

      {/* 나만의 항목 */}
      {customItems.length > 0 && (
        <section className="animate-in fade-in slide-in-from-left-2 duration-500">
          <SectionTitle num="9" title="나만의 체크 항목" />
          <div className="space-y-4">
            {customItems.map((item: string, idx: number) => (
              <div key={`${item}-${idx}`} className="border border-[#E2E2E2] rounded-2xl p-6 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <IconEdit className="w-4 h-4 text-[#0A607D]" />
                  <span className="text-[15px] font-bold text-[#232527]">{item}</span>
                </div>
                <input 
                  type="text" 
                  placeholder="메모를 입력해 주세요"
                  className="w-full bg-[#F5F5F5] rounded-lg px-4 py-3 text-[14px] outline-none focus:bg-white focus:ring-1 focus:ring-[#0A607D] transition-all"
                  {...register(`customScores.${idx}`)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* 메모 */}
      <section>
        <SectionTitle num="10" title="메모" />
        <div className="relative">
          <textarea
            {...register('memo')}
            placeholder="최대 50자까지 기록 가능해요"
            maxLength={50}
            className="w-full h-40 p-5 rounded-2xl border border-[#E2E2E2] outline-none focus:border-[#0A607D] resize-none text-[15px] leading-relaxed transition-all pb-10"
          />
          <div className="absolute right-5 bottom-4 text-[13px] font-bold text-[#A0A0A0]">
            <span className={cn(memoValue.length >= 50 ? "text-[#0A607D]" : "")}>
              {memoValue.length}
            </span>
            <span className="mx-0.5">/</span>
            <span>50</span>
          </div>
        </div>
      </section>
    </div>
  );
}
