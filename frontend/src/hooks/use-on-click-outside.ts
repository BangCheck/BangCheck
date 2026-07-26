import { useEffect, useRef, type RefObject } from 'react';

type Refs = RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[];
type OutsideHandler = (e: MouseEvent | KeyboardEvent) => void;

/**
 * 지정한 ref(들) 바깥 클릭(mousedown) 또는 Escape 키에 handler를 호출한다.
 * 드롭다운·팝오버·필터 패널의 닫힘 처리 공용.
 *
 * - ref가 여러 개면 그 중 어느 하나라도 내부면 무시한다(데스크톱/모바일 동시 운용).
 * - null ref는 건너뛴다(아직 마운트 안 된 패널).
 * - refs/handler는 매 렌더 최신값을 ref에 보관해 참조한다 — 인라인 화살표·조건부 ref 교체에도
 *   stale closure 없이 항상 현재 값으로 판정한다(리스너는 최초 1회만 등록).
 *
 * @example
 * useOnClickOutside([dropdownRef, dropdownRefMobile], () => setActiveDropdown(null));
 */
export function useOnClickOutside(refs: Refs, handler: OutsideHandler) {
  const savedRefs = useRef(refs);
  const savedHandler = useRef(handler);
  useEffect(() => {
    savedRefs.current = refs;
    savedHandler.current = handler;
  });

  useEffect(() => {
    function isOutside(target: Node): boolean {
      const list = Array.isArray(savedRefs.current) ? savedRefs.current : [savedRefs.current];
      return !list.some((ref) => ref.current?.contains(target));
    }
    function handleMouse(e: MouseEvent) {
      if (isOutside(e.target as Node)) savedHandler.current(e);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') savedHandler.current(e);
    }
    document.addEventListener('mousedown', handleMouse);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleMouse);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);
}
