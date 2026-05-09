import type { BasicInfoData } from './components/01_basic-info';
import type { BuildingInfoData } from './components/02_building-info';
import type { InteriorCheckData } from './components/03_interior-check';
import type { SafetyLivingData } from './components/04_safety-living';
import type { CustomMemoData } from './components/05_custom-memo';

export const SECTION_TABS = [
  { id: 'basic', label: '기본 정보' },
  { id: 'building', label: '건물 정보' },
  { id: 'options', label: '옵션' },
  { id: 'interior', label: '내부 상태' },
  { id: 'problems', label: '문제 요소' },
  { id: 'safety', label: '안전/보안' },
  { id: 'living', label: '생활 편의' },
  { id: 'surround', label: '주변 환경' },
  { id: 'custom', label: '나만의 체크 항목' },
  { id: 'memo', label: '메모' },
] as const;

export type SectionId = (typeof SECTION_TABS)[number]['id'];

export const initBasic: BasicInfoData = {
  name: '', address: '', transactionType: null,
  deposit: '', monthlyRent: '', managementFee: '',
  includeMgmtInRent: false, isMgmtUnknown: false,
  loanStatus: null, loanAmount: '', moveInReport: null,
  moveInDate: '', moveInNegotiable: false,
};

export const initBuilding: BuildingInfoData = {
  buildingType: null, elevator: null,
  floorLevel: null, floorDirect: '',
  direction: null, options: [],
};

export const initInterior: InteriorCheckData = {
  lighting: null, ventilation: null, floorNoise: null,
  waterPressure: null, soundProof: null, heating: null,
  mold: null, pest: null, leak: null,
  wallpaper: null, drainSmell: null,
};

export const initSafety: SafetyLivingData = {
  doorLock: null, windowLock: null, cctv: null,
  fireSafety: null, hallLight: null, securityState: null,
  windowScreen: null, laundry: null, trash: null,
  bikeParking: null, internet: null,
  surroundNoise: null, amenity: null, transit: null, nightSafety: null,
};

export const initCustom: CustomMemoData = { customItems: [], memo: '' };
