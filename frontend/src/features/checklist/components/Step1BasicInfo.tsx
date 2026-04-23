'use client';

import { useFormContext } from 'react-hook-form';

interface Step1Props {
  onNext: () => void;
}

export default function Step1BasicInfo({ onNext }: Step1Props) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-10">
        <h1 className="text-[24px] font-bold text-[#232527] leading-tight">
          가장 먼저,<br />방 이름을 정해주세요.
        </h1>
        <p className="text-sm text-text-caption mt-2 italic">예: 역삼동 풀옵션 원룸</p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="space-y-2">
          <input
            {...register('name')}
            placeholder="방 이름을 입력하세요"
            className="w-full text-xl py-3 border-b-2 border-gray-100 focus:border-[#0A607D] outline-none transition-colors"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message as string}</p>
          )}
        </div>
      </div>

      <div className="pt-10">
        <button
          type="button"
          onClick={onNext}
          className="w-full bg-[#0A607D] text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all"
        >
          다음으로
        </button>
      </div>
    </div>
  );
}
