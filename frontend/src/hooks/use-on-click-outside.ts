import { useEffect, type RefObject } from 'react';

/**
 * 지정한 ref(들) 바깥을 클릭(mousedown)하면 handler를 호출한다.
 * 드롭다운·팝오버·필터 패널의 외부 클릭 닫힘 처리에 공용으로 쓴다.
 *
 * - ref가 여러 개면 그 중 어느 하나라도 내부면 무시한다(데스크톱/모바일 ref 동시 운용).
 * - null ref는 건너뛴다(아직 마운트되지 않은 패널).
 *
 * @example
 * useOnClickOutside([dropdownRef, dropdownRefMobile], () => setOpen(false));
 */
export function useOnClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  handler: (e: MouseEvent) => void,
) {
  useEffect(() => {
    const refList = Array.isArray(refs) ? refs : [refs];
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const isInsideAny = refList.some((ref) => ref.current?.contains(target));
      if (!isInsideAny) handler(e);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // handler는 호출처에서 안정적으로 전달한다고 가정(인라인 화살표여도 effect는 최초 1회 등록).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
