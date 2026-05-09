import Checkbox from './Checkbox';
import MoneyInput from './MoneyInput';

interface DepositFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showManagementFeeCheckbox?: boolean;
  includeManagementFee?: boolean;
  onIncludeManagementFeeChange?: (v: boolean) => void;
  convertedValue?: string;
}

export default function DepositField({
  label,
  value,
  onChange,
  showManagementFeeCheckbox,
  includeManagementFee,
  onIncludeManagementFeeChange,
  convertedValue,
}: DepositFieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between w-full">
        <span className="text-[14px] font-medium text-text-main whitespace-nowrap">{label}</span>
        {showManagementFeeCheckbox && onIncludeManagementFeeChange && (
          <Checkbox
            checked={!!includeManagementFee}
            onChange={onIncludeManagementFeeChange}
            label="관리비 포함"
          />
        )}
      </div>
      {convertedValue && (
        <p className="text-[18px] font-medium text-brand-primary">{convertedValue}</p>
      )}
      <MoneyInput
        value={value}
        onChange={onChange}
        placeholder="예 : 1000"
        focused={!!value}
      />
    </div>
  );
}
