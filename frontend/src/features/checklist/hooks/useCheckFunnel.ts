import { useState } from 'react';

export const FUNNEL_STEPS = [
  { id: 1, label: '기본 정보' },
  { id: 2, label: '건물 정보' },
  { id: 3, label: '내부 점검' },
  { id: 4, label: '안전/생활' },
  { id: 5, label: '나만의 항목' },
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number]['id'];

export function useCheckFunnel() {
  const [step, setStep] = useState<FunnelStep>(1);

  const next = () => setStep((s) => (s < 5 ? ((s + 1) as FunnelStep) : s));
  const prev = () => setStep((s) => (s > 1 ? ((s - 1) as FunnelStep) : s));
  const isFirst = step === 1;
  const isLast = step === 5;

  return { step, setStep, next, prev, isFirst, isLast };
}
