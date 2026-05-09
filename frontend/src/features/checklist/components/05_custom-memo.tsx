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
            <div key={idx} className="flex flex-col gap-2 p-4 bg-bg-gray-light rounded-[8px] border border-border-light">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">✏️</span>
                <input
                  value={item.label}
                  onChange={(e) => updateItem(idx, 'label', e.target.value)}
                  placeholder={`항목 이름`}
                  className="flex-1 text-[14px] font-medium text-text-main bg-transparent outline-none border-b border-border-light pb-0.5 focus:border-brand-primary"
                />
                <button type="button" onClick={() => removeItem(idx)} className="text-[12px] text-text-caption hover:text-red-400 cursor-pointer shrink-0">
                  삭제
                </button>
              </div>
              <input
                value={item.value}
                onChange={(e) => updateItem(idx, 'value', e.target.value)}
                placeholder="답변을 입력하세요"
                className="w-full h-[36px] px-3 rounded-[6px] border border-border-mute bg-white text-[14px] text-text-main placeholder:text-text-caption outline-none focus:border-brand-primary"
              />
            </div>
          ))}
          {data.customItems.length < 5 && (
            <button
              type="button"
              onClick={addItem}
              className="flex items-center justify-center gap-2 py-3 border border-dashed border-border-mute rounded-[6px] text-[14px] text-text-mute hover:border-brand-primary hover:text-brand-primary transition-colors cursor-pointer"
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
            <span className="text-[12px] text-text-caption">{data.memo.length}/200</span>
          </div>
          <textarea
            value={data.memo}
            onChange={(e) => onChange('memo', e.target.value)}
            maxLength={200}
            placeholder="방에 대한 메모를 자유롭게 입력하세요."
            rows={5}
            className="w-full px-3 py-3 rounded-[6px] border border-border-mute bg-white outline-none focus:border-brand-primary text-[14px] text-text-main placeholder:text-text-caption resize-none transition-colors"
          />
        </div>
      </section>
    </div>
  );
}
