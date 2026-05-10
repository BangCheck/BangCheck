import Checkbox from './Checkbox';
import MoneyInput from './MoneyInput';

interface ManagementFeeFieldProps {
  value: string;
  onChange: (value: string) => void;
  isUnknown: boolean;
  onIsUnknownChange: (v: boolean) => void;
}

export default function ManagementFeeField({
  value,
  onChange,
  isUnknown,
  onIsUnknownChange,
}: ManagementFeeFieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between w-full">
        <span className="text-[14px] font-medium text-text-main whitespace-nowrap">관리비 (만원)</span>
        <Checkbox
          checked={isUnknown}
          onChange={onIsUnknownChange}
          label="모름"
        />
      </div>
      <MoneyInput
        value={isUnknown ? '' : value}
        onChange={onChange}
        placeholder={isUnknown ? '관리비 정보 없음' : '예 : 5'}
        disabled={isUnknown}
      />
    </div>
  );
}
