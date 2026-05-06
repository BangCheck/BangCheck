import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  SectionTab,
  SectionContainer,
  DepositField,
  ManagementFeeField,
  OptionCardSmall,
  OptionCardMedium,
  RatingField,
  SubmitButton,
  TextInput,
} from './components/ui';

// ─── Icons ───────────────────────────────────────────────
const IconLock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconWindow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);
const IconBuilding = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="9" y1="6" x2="9" y2="6.01" />
    <line x1="15" y1="6" x2="15" y2="6.01" />
    <line x1="9" y1="10" x2="9" y2="10.01" />
    <line x1="15" y1="10" x2="15" y2="10.01" />
    <line x1="9" y1="14" x2="9" y2="14.01" />
    <line x1="15" y1="14" x2="15" y2="14.01" />
  </svg>
);
const IconSun = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const IconBug = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
const IconMold = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="14" r="3" />
    <circle cx="14" cy="10" r="2" />
    <circle cx="18" cy="15" r="2.5" />
  </svg>
);
const IconLeak = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6 9 4 13 4 16a8 8 0 0 0 16 0c0-3-2-7-8-14z" />
  </svg>
);
const IconStore = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#232527" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const EmojiGood = () => <span className="text-[28px]">😊</span>;
const EmojiBad = () => <span className="text-[28px]">😞</span>;
const EmojiNeutral = () => <span className="text-[28px]">😐</span>;

// ─── Tab 정의 ─────────────────────────────────────────────
const TABS = ['기본 정보', '건물 정보', '상세 점검', '메모/사진'];

// ─── toggle helper ────────────────────────────────────────
function useToggle<T extends string>(initial?: T) {
  const [value, setValue] = useState<T | undefined>(initial);
  const toggle = (v: T) => setValue((prev) => (prev === v ? undefined : v));
  return [value, toggle] as const;
}

function useMultiSelect(initial: string[] = []) {
  const [selected, setSelected] = useState<string[]>(initial);
  const toggle = (v: string) =>
    setSelected((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  return [selected, toggle] as const;
}

// ─── Page ─────────────────────────────────────────────────
export default function ChecklistNewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  // 1. 기본 정보
  const [name, setName] = useState('');
  const [transactionType, toggleTransactionType] = useToggle<string>();
  const [deposit, setDeposit] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [managementFee, setManagementFee] = useState('');
  const [isMgmtUnknown, setIsMgmtUnknown] = useState(false);
  const [includeMgmtInDeposit, setIncludeMgmtInDeposit] = useState(false);
  const [loanStatus, toggleLoanStatus] = useToggle<string>();
  const [loanAmount, setLoanAmount] = useState('');

  // 2. 건물 정보
  const [buildingType, toggleBuildingType] = useToggle<string>();
  const [elevator, toggleElevator] = useToggle<string>();
  const [floorLevel, toggleFloorLevel] = useToggle<string>();
  const [direction, toggleDirection] = useToggle<string>();

  // 3. 옵션
  const [options, toggleOption] = useMultiSelect();

  // 4. 내부 상태
  const [lightingScore, setLightingScore] = useState<number | null>(null);
  const [noiseScore, setNoiseScore] = useState<number | null>(null);
  const [waterScore, setWaterScore] = useState<number | null>(null);
  const [soundScore, setSoundScore] = useState<number | null>(null);

  // 5. 문제 요소
  const [moldStatus, toggleMoldStatus] = useToggle<string>();
  const [pestStatus, togglePestStatus] = useToggle<string>();
  const [leakStatus, toggleLeakStatus] = useToggle<string>();

  // 6. 안전/생활
  const [doorLock, toggleDoorLock] = useToggle<string>();
  const [security, toggleSecurity] = useToggle<string>();
  const [windowScreen, toggleWindowScreen] = useToggle<string>();

  // 7. 주변 환경
  const [surroundNoise, toggleSurroundNoise] = useToggle<string>();
  const [accessibility, toggleAccessibility] = useToggle<string>();

  // 8. 메모/사진
  const [memo, setMemo] = useState('');

  // 환산보증금 계산
  const convertedDeposit = (() => {
    const d = parseInt(deposit) || 0;
    const r = parseInt(monthlyRent) || 0;
    if (!d) return '';
    const total = d + r * 100;
    const eok = Math.floor(total / 10000);
    const man = total % 10000;
    let result = '';
    if (eok > 0) result += `${eok}억 `;
    if (man > 0) result += `${man.toLocaleString()}만원`;
    return result.trim();
  })();

  const tabCardSmall = (label: string, icon: React.ReactNode, currentValue: string | undefined, onToggle: (v: string) => void) => (
    <OptionCardSmall
      icon={icon}
      label={label}
      state={currentValue === label ? 'active' : 'default'}
      onClick={() => onToggle(label)}
    />
  );

  const tabCardMedium = (label: string, icon: React.ReactNode, currentValue: string | undefined, onToggle: (v: string) => void, activeState: 'selected' | 'active' = 'active') => (
    <OptionCardMedium
      icon={icon}
      label={label}
      state={currentValue === label ? activeState : 'default'}
      onClick={() => onToggle(label)}
    />
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E2E2] px-4 h-14 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/rooms')}
          className="p-1 text-[#232527] cursor-pointer"
          aria-label="뒤로 가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-[16px] font-semibold text-[#232527]">체크리스트</h1>
      </header>

      {/* 섹션 탭 */}
      <nav className="sticky top-14 z-30 bg-white border-b border-[#E2E2E2] px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((tab, idx) => (
          <SectionTab
            key={tab}
            label={tab}
            active={activeTab === idx}
            onClick={() => setActiveTab(idx)}
          />
        ))}
      </nav>

      {/* 폼 영역 */}
      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8 flex flex-col gap-10">

        {/* ── Tab 0: 기본 정보 ── */}
        {activeTab === 0 && (
          <>
            <SectionContainer number={1} title="기본 정보">
              {/* 매물명 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#232527]">매물명 <span className="text-red-500">*</span></span>
                  <span className="text-[12px] text-[#A0A0A0]">{name.length}/20</span>
                </div>
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 역삼역 원룸 3층"
                  maxLength={20}
                />
              </div>

              {/* 거래 유형 */}
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">거래 유형 <span className="text-red-500">*</span></span>
                <div className="grid grid-cols-3 gap-3">
                  {['전세', '월세', '단기임대'].map((t) =>
                    tabCardSmall(t, <IconBuilding />, transactionType, toggleTransactionType)
                  )}
                </div>
              </div>

              {/* 보증금 */}
              <DepositField
                label={`보증금 (만원)${transactionType ? ' *' : ''}`}
                value={deposit}
                onChange={setDeposit}
                showManagementFeeCheckbox={transactionType === '월세'}
                includeManagementFee={includeMgmtInDeposit}
                onIncludeManagementFeeChange={setIncludeMgmtInDeposit}
                convertedValue={convertedDeposit}
              />

              {/* 월세 (월세 선택 시) */}
              {transactionType === '월세' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium text-[#232527]">월세 (만원) *</span>
                  <div className="flex flex-col gap-1">
                    {monthlyRent && (
                      <p className="text-[18px] font-medium text-[#0A607D]">{parseInt(monthlyRent).toLocaleString()}만원</p>
                    )}
                    <TextInput
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="예 : 50"
                      className={cn(monthlyRent ? 'border-[#0A607D]' : 'border-[#BFBFBF]')}
                    />
                  </div>
                </div>
              )}

              {/* 관리비 */}
              <ManagementFeeField
                value={managementFee}
                onChange={setManagementFee}
                isUnknown={isMgmtUnknown}
                onIsUnknownChange={setIsMgmtUnknown}
              />

              {/* 융자 여부 */}
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">융자 여부</span>
                <div className="grid grid-cols-2 gap-3">
                  {['없음', '있음'].map((v) =>
                    tabCardMedium(v, v === '없음' ? <EmojiGood /> : <EmojiBad />, loanStatus, toggleLoanStatus)
                  )}
                </div>
              </div>

              {/* 융자 금액 */}
              {loanStatus === '있음' && (
                <DepositField
                  label="융자 금액 (만원)"
                  value={loanAmount}
                  onChange={setLoanAmount}
                />
              )}
            </SectionContainer>
          </>
        )}

        {/* ── Tab 1: 건물 정보 ── */}
        {activeTab === 1 && (
          <>
            <SectionContainer number={2} title="건물 정보">
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">건물 유형</span>
                <div className="grid grid-cols-3 gap-3">
                  {['아파트', '빌라', '오피스텔'].map((t) =>
                    tabCardSmall(t, <IconBuilding />, buildingType, toggleBuildingType)
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">엘리베이터</span>
                <div className="grid grid-cols-2 gap-3">
                  {['없음', '있음'].map((v) =>
                    tabCardMedium(v, v === '없음' ? <EmojiBad /> : <EmojiGood />, elevator, toggleElevator)
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">층수</span>
                <div className="grid grid-cols-3 gap-3">
                  {['저층', '중층', '고층'].map((v) =>
                    tabCardSmall(v, <IconBuilding />, floorLevel, toggleFloorLevel)
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">방향</span>
                <div className="grid grid-cols-4 gap-3">
                  {['동', '서', '남', '북'].map((v) =>
                    tabCardSmall(v, <IconSun />, direction, toggleDirection)
                  )}
                </div>
              </div>
            </SectionContainer>

            <SectionContainer number={3} title="옵션 (다중 선택)">
              <div className="grid grid-cols-3 gap-3">
                {['에어컨', '세탁기', '냉장고', '침대', '책상', '전자레인지'].map((opt) => (
                  <OptionCardSmall
                    key={opt}
                    icon={<IconBuilding />}
                    label={opt}
                    state={options.includes(opt) ? 'active' : 'default'}
                    onClick={() => toggleOption(opt)}
                  />
                ))}
              </div>
            </SectionContainer>
          </>
        )}

        {/* ── Tab 2: 상세 점검 ── */}
        {activeTab === 2 && (
          <>
            <SectionContainer number={4} title="내부 상태">
              <RatingField label="채광" value={lightingScore} onChange={setLightingScore} />
              <RatingField label="소음" value={noiseScore} onChange={setNoiseScore} />
              <RatingField label="수압" value={waterScore} onChange={setWaterScore} />
              <RatingField label="방음" value={soundScore} onChange={setSoundScore} />
            </SectionContainer>

            <SectionContainer number={5} title="문제 요소">
              <div className="flex flex-col gap-3">
                <span className="text-[14px] font-medium text-[#232527]">곰팡이</span>
                <div className="grid grid-cols-2 gap-3">
                  {['없음', '있음'].map((v) =>
                    tabCardMedium(v, v === '없음' ? <EmojiGood /> : <IconMold />, moldStatus, toggleMoldStatus, v === '없음' ? 'active' : 'selected')
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[14px] font-medium text-[#232527]">벌레 흔적</span>
                <div className="grid grid-cols-2 gap-3">
                  {['없음', '있음'].map((v) =>
                    tabCardMedium(v, v === '없음' ? <EmojiGood /> : <IconBug />, pestStatus, togglePestStatus, v === '없음' ? 'active' : 'selected')
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[14px] font-medium text-[#232527]">누수/결로</span>
                <div className="grid grid-cols-2 gap-3">
                  {['없음', '있음'].map((v) =>
                    tabCardMedium(v, v === '없음' ? <EmojiGood /> : <IconLeak />, leakStatus, toggleLeakStatus, v === '없음' ? 'active' : 'selected')
                  )}
                </div>
              </div>
            </SectionContainer>

            <SectionContainer number={6} title="안전/생활">
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">도어락 상태</span>
                <div className="grid grid-cols-2 gap-3">
                  {['정상', '이상'].map((v) =>
                    tabCardSmall(v, <IconLock />, doorLock, toggleDoorLock)
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">방범 상태</span>
                <div className="grid grid-cols-3 gap-3">
                  {['좋음', '보통', '나쁨'].map((v) =>
                    tabCardSmall(v, <IconShield />, security, toggleSecurity)
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">방충망 상태</span>
                <div className="grid grid-cols-2 gap-3">
                  {['정상', '파손'].map((v) =>
                    tabCardSmall(v, <IconWindow />, windowScreen, toggleWindowScreen)
                  )}
                </div>
              </div>
            </SectionContainer>

            <SectionContainer number={7} title="주변 환경">
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">소음 환경</span>
                <div className="grid grid-cols-3 gap-3">
                  {['조용', '보통', '시끄러움'].map((v) =>
                    tabCardSmall(v, <EmojiNeutral />, surroundNoise, toggleSurroundNoise)
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#232527]">편의시설 접근성</span>
                <div className="grid grid-cols-3 gap-3">
                  {['좋음', '보통', '나쁨'].map((v) =>
                    tabCardSmall(v, <IconStore />, accessibility, toggleAccessibility)
                  )}
                </div>
              </div>
            </SectionContainer>
          </>
        )}

        {/* ── Tab 3: 메모/사진 ── */}
        {activeTab === 3 && (
          <SectionContainer number={8} title="메모 및 사진">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#232527]">메모</span>
                <span className="text-[12px] text-[#A0A0A0]">{memo.length}/200</span>
              </div>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={200}
                placeholder="방에 대한 메모를 자유롭게 입력하세요."
                rows={5}
                className="w-full px-3 py-3 rounded-[6px] border border-[#BFBFBF] bg-white outline-none focus:border-[#0A607D] text-[14px] text-[#232527] placeholder:text-[#A0A0A0] resize-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-medium text-[#232527]">사진 업로드 (최대 3장)</span>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[6px] border-2 border-dashed border-[#BFBFBF] flex items-center justify-center cursor-pointer hover:border-[#0A607D] transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BFBFBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#A0A0A0]">* 사진 업로드는 추후 지원 예정입니다.</p>
            </div>
          </SectionContainer>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-[#E2E2E2] px-4 py-4 flex gap-3 max-w-[800px] w-full mx-auto">
        {activeTab > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab((p) => p - 1)}
            className="flex-1 py-3 rounded-[6px] border border-[#E2E2E2] text-[14px] font-semibold text-[#232527] bg-white cursor-pointer"
          >
            이전
          </button>
        )}
        {activeTab < TABS.length - 1 ? (
          <button
            type="button"
            onClick={() => setActiveTab((p) => p + 1)}
            className="flex-[2] py-3 rounded-[6px] bg-[#0A607D] text-white text-[14px] font-semibold cursor-pointer"
          >
            다음
          </button>
        ) : (
          <SubmitButton
            disabled={!name.trim()}
            className="flex-[2]"
            onClick={() => {
              // TODO: API 연동 (E09-S03 이후)
              navigate('/rooms');
            }}
          />
        )}
      </div>
    </div>
  );
}
