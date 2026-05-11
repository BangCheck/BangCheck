import { useState, useCallback } from 'react';
import { initBasic, initBuilding, initInterior, initSafety, initCustom } from '../checklist-constants';
import type { BasicInfoData } from '../components/01_basic-info';
import type { BuildingInfoData } from '../components/02_building-info';
import type { InteriorCheckData } from '../components/03_interior-check';
import type { SafetyLivingData } from '../components/04_safety-living';
import type { CustomMemoData } from '../components/05_custom-memo';
import type { ChecklistAnswers } from '@/types';

export function useChecklistState() {
  const [basic, setBasic] = useState<BasicInfoData>(initBasic);
  const [building, setBuilding] = useState<BuildingInfoData>(initBuilding);
  const [interior, setInterior] = useState<InteriorCheckData>(initInterior);
  const [safety, setSafety] = useState<SafetyLivingData>(initSafety);
  const [custom, setCustom] = useState<CustomMemoData>(initCustom);
  const [answers, setAnswers] = useState<ChecklistAnswers>({});

  function patchBasic<K extends keyof BasicInfoData>(key: K, value: BasicInfoData[K]) {
    setBasic((prev) => ({ ...prev, [key]: value }));
  }
  function patchBuilding<K extends keyof BuildingInfoData>(key: K, value: BuildingInfoData[K]) {
    setBuilding((prev) => ({ ...prev, [key]: value }));
  }
  function patchInterior<K extends keyof InteriorCheckData>(key: K, value: InteriorCheckData[K]) {
    setInterior((prev) => ({ ...prev, [key]: value }));
  }
  function patchSafety<K extends keyof SafetyLivingData>(key: K, value: SafetyLivingData[K]) {
    setSafety((prev) => ({ ...prev, [key]: value }));
  }
  function patchCustom<K extends keyof CustomMemoData>(key: K, value: CustomMemoData[K]) {
    setCustom((prev) => ({ ...prev, [key]: value }));
  }
  const patchAnswer = useCallback((itemId: number, value: string | null) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  return {
    basic, setBasic,
    building, setBuilding,
    interior, setInterior,
    safety, setSafety,
    custom, setCustom,
    answers, setAnswers,
    patchBasic, patchBuilding, patchInterior, patchSafety, patchCustom, patchAnswer,
  };
}
