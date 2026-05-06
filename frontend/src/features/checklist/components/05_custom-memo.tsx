import { SectionHeader, FieldLabel } from './ui/shared';

export interface CustomMemoData {
  customItems: { label: string; value: string }[];
  memo: string;
}

interface Props {
  data: CustomMemoData;
  onChange: <K extends keyof CustomMemoData>(key: K, value: CustomMemoData[K]) => void;
}

export default function CustomMemo({ data, onChange }: Props) {
  const addItem = () => {
    if (data.customItems.length >= 5) return;
    onChange('customItems', [...data.customItems, { label: `항목 ${data.customItems.length + 1}`, value: '' }]);
  };

  const removeItem = (idx: number) =>
    onChange('customItems', data.customItems.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: 'label' | 'value', val: string) =>
    onChange('customItems', data.customItems.map((it, i) => i === idx ? { ...it, [field]: val } : it));

  return (
    <div className="flex flex-col gap-10">

      {/* 나만의 체크 항목 */}
      <section>
        <SectionHeader title="나만의 체크 항목" />
        <div className="flex flex-col gap-4">
          {data.customItems.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2 p-4 bg-[#F9F9F9] rounded-[8px] border border-[#E2E2E2]">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">✏️</span>
                <input
                  value={item.label}
                  onChange={(e) => updateItem(idx, 'label', e.target.value)}
                  placeholder={`항목 이름`}
                  className="flex-1 text-[14px] font-medium text-[#232527] bg-transparent outline-none border-b border-[#E2E2E2] pb-0.5 focus:border-[#0A607D]"
                />
                <button type="button" onClick={() => removeItem(idx)} className="text-[12px] text-[#A0A0A0] hover:text-red-400 cursor-pointer shrink-0">
                  삭제
                </button>
              </div>
              <input
                value={item.value}
                onChange={(e) => updateItem(idx, 'value', e.target.value)}
                placeholder="답변을 입력하세요"
                className="w-full h-[36px] px-3 rounded-[6px] border border-[#BFBFBF] bg-white text-[14px] text-[#232527] placeholder:text-[#A0A0A0] outline-none focus:border-[#0A607D]"
              />
            </div>
          ))}
          {data.customItems.length < 5 && (
            <button
              type="button"
              onClick={addItem}
              className="flex items-center justify-center gap-2 py-3 border border-dashed border-[#BFBFBF] rounded-[6px] text-[14px] text-[#777] hover:border-[#0A607D] hover:text-[#0A607D] transition-colors cursor-pointer"
            >
              <span className="text-[18px] leading-none">+</span>
              항목 추가 ({data.customItems.length}/5)
            </button>
          )}
        </div>
      </section>

      {/* 메모 */}
      <section>
        <SectionHeader title="메모" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <FieldLabel>메모</FieldLabel>
            <span className="text-[12px] text-[#A0A0A0]">{data.memo.length}/200</span>
          </div>
          <textarea
            value={data.memo}
            onChange={(e) => onChange('memo', e.target.value)}
            maxLength={200}
            placeholder="방에 대한 메모를 자유롭게 입력하세요."
            rows={5}
            className="w-full px-3 py-3 rounded-[6px] border border-[#BFBFBF] bg-white outline-none focus:border-[#0A607D] text-[14px] text-[#232527] placeholder:text-[#A0A0A0] resize-none transition-colors"
          />
        </div>
      </section>
    </div>
  );
}
