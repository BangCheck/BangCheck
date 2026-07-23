import { SelectCard, EmojiCard, SectionHeader, FieldLabel, TextInput } from './ui/shared';
import AddressSearchInput from './ui/AddressSearchInput';
import { ROOM_TYPES } from '@/lib/constants';
import type { BasicInfoData } from '@/types';

export type { BasicInfoData };

interface Props {
  data: BasicInfoData;
  onChange: <K extends keyof BasicInfoData>(key: K, value: BasicInfoData[K]) => void;
}

export default function BasicInfo({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionHeader title="기본 정보" />
        <div className="flex flex-col gap-5">

          {/* 매물정보 + 주소 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <FieldLabel required>매물정보</FieldLabel>
                <span className="text-[12px] text-text-caption">{(data.name ?? '').length}/20</span>
              </div>
              <TextInput
                value={data.name}
                onChange={(v) => onChange('name', v)}
                placeholder="예 : 역삼역 원룸 3층"
                maxLength={20}
              />
            </div>
            <div>
              <FieldLabel>주소 (지도 표시용)</FieldLabel>
              <AddressSearchInput
                value={data.address}
                onChange={(v) => onChange('address', v)}
                placeholder="예 : 가천대학교, 신촌역.."
              />
            </div>
          </div>

          {/* 거래 유형 */}
          <div>
            <FieldLabel>거래 유형</FieldLabel>
            <div className="grid grid-cols-3 gap-3">
              {ROOM_TYPES.map((t) => (
                <SelectCard
                  key={t}
                  label={t}
                  active={data.transactionType === t}
                  onClick={() => onChange('transactionType', data.transactionType === t ? null : t)}
                />
              ))}
            </div>
          </div>

          {/* 보증금 */}
          <div>
            <FieldLabel>보증금 (만원)</FieldLabel>
            <TextInput value={data.deposit} onChange={(v) => onChange('deposit', v)} placeholder="예 : 1000" suffix="만원" type="number" max={999999} />
          </div>

          {/* 월세 — 전세 선택 시 비노출 */}
          {data.transactionType !== '전세' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <FieldLabel>월세 (만원)</FieldLabel>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.includeMgmtInRent}
                    onChange={(e) => onChange('includeMgmtInRent', e.target.checked)}
                    className="w-4 h-4 accent-brand-primary"
                  />
                  <span className="text-[13px] text-text-main">관리비 포함</span>
                </label>
              </div>
              <TextInput value={data.monthlyRent} onChange={(v) => onChange('monthlyRent', v)} placeholder="예 : 50" suffix="만원" type="number" max={9999} />
            </div>
          )}

          {/* 관리비 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel>관리비 (만원)</FieldLabel>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.isMgmtUnknown}
                  onChange={(e) => onChange('isMgmtUnknown', e.target.checked)}
                  className="w-4 h-4 accent-brand-primary"
                />
                <span className="text-[13px] text-text-main">모름</span>
              </label>
            </div>
            <TextInput value={data.managementFee} onChange={(v) => onChange('managementFee', v)} placeholder="예 : 5" suffix="만원" type="number" disabled={data.isMgmtUnknown} max={9999} />
          </div>

          {/* 융자 여부 */}
          <div>
            <FieldLabel>융자 여부</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {(['없음', '있음'] as const).map((v) => (
                <EmojiCard key={v} label={v} active={data.loanStatus === v} onClick={() => onChange('loanStatus', data.loanStatus === v ? null : v)} />
              ))}
            </div>
            {data.loanStatus === '있음' && (
              <div className="mt-3">
                <FieldLabel>융자 금액 (만원)</FieldLabel>
                <TextInput
                  value={data.loanAmount}
                  onChange={(v) => onChange('loanAmount', v)}
                  placeholder="예 : 5000"
                  suffix="만원"
                  type="number"
                  max={9999}
                />
              </div>
            )}
          </div>

          {/* 전입신고 가능여부 */}
          <div>
            <FieldLabel>전입신고 가능여부</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {(['가능', '불가능'] as const).map((v) => (
                <EmojiCard key={v} label={v} variant="binary" active={data.moveInReport === v} onClick={() => onChange('moveInReport', data.moveInReport === v ? null : v)} />
              ))}
            </div>
          </div>

          {/* 입주가능일 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel>입주가능일</FieldLabel>
              <button
                type="button"
                onClick={() => { onChange('moveInDate', ''); onChange('moveInNegotiable', false); }}
                className="text-[12px] text-text-mute border border-border-light px-2 py-0.5 rounded-[4px] cursor-pointer hover:text-text-main"
              >
                초기화
              </button>
            </div>
            <label className="flex items-center gap-1.5 mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.moveInNegotiable}
                onChange={(e) => {
                  onChange('moveInNegotiable', e.target.checked);
                  if (e.target.checked) onChange('moveInDate', '');
                }}
                className="w-4 h-4 accent-brand-primary"
              />
              <span className="text-[13px] text-text-main">협의 가능</span>
            </label>
            <input
              type="date"
              value={data.moveInDate}
              onChange={(e) => onChange('moveInDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={data.moveInNegotiable}
              className="h-[32px] px-3 border border-border-mute rounded-[6px] text-[14px] text-text-main outline-none focus:border-brand-primary w-[160px] disabled:bg-bg-gray disabled:text-border-mute disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
