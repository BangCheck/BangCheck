'use client';

import { useRouter, useSearchParams } from 'next/navigation';

/**
 * 체크리스트 8단계 퍼널 제어를 위한 커스텀 훅
 */
export const useCheckFunnel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 현재 단계를 쿼리 파라미터에서 가져옴 (기본값 1)
  const step = Number(searchParams.get('step')) || 1;

  const setStep = (nextStep: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('step', nextStep.toString());
    router.push(`/checklist/new?${params.toString()}`);
  };

  const next = () => {
    if (step < 8) setStep(step + 1);
  };

  const prev = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  return { step, next, prev, setStep };
};
