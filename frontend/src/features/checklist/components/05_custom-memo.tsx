import { SectionHeader, FieldLabel } from './ui/shared';
import type { CustomMemoData } from '@/types';

export type { CustomMemoData };

interface Props {
  data: CustomMemoData;
  onChange: <K extends keyof CustomMemoData>(key: K, value: CustomMemoData[K]) => void;
}

export default function CustomMemo({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-10">

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
