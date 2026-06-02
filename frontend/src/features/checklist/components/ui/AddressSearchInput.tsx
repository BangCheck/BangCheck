import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { searchAddress, type AddressResult } from '@/services/address-service';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AddressSearchInput({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // query가 외부 value와 달라졌을 때만 동기화 (선택 후 재입력 시 덮어쓰기 방지)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const fetchSuggestions = useCallback((keyword: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!keyword.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchAddress(keyword);
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 300);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    fetchSuggestions(v);
  };

  const handleSelect = (addr: AddressResult) => {
    setQuery(addr.roadAddr);
    onChange(addr.roadAddr);
    setResults([]);
    setOpen(false);
  };

  // 외부 클릭 시 드롭다운 닫기
  useOnClickOutside(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn(
          'h-[36px] w-full px-3 py-[6px] rounded-[6px] border bg-white outline-none',
          'text-[14px] font-medium text-text-main',
          'placeholder:text-text-caption',
          'border-border-mute focus:border-brand-primary',
          'transition-colors',
        )}
      />
      {open && (
        <ul className="absolute z-50 top-[38px] left-0 right-0 bg-white border border-border-mute rounded-[6px] shadow-md max-h-[200px] overflow-y-auto">
          {results.map((addr, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(addr)}
              className="px-3 py-2 text-[13px] text-text-main hover:bg-bg-gray cursor-pointer leading-snug"
            >
              <span className="font-medium">{addr.roadAddr}</span>
              {addr.jibunAddr && (
                <span className="ml-2 text-text-mute text-[12px]">{addr.jibunAddr}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
