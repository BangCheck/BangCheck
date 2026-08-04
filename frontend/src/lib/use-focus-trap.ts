/**
 * 모달 포커스 트랩. `aria-modal="true"`를 선언한 표면이 실제로 그렇게 동작하게 한다.
 *
 * 왜 여기(lib)에 두는가
 *   이 훅을 쓰는 곳이 features/research의 페이지 브리프 카드와
 *   features/project-atlas의 카드 상세 둘이다. features 사이의 교차 import는
 *   금지돼 있고(frontend/CLAUDE.md), 같은 동작을 두 번 구현하면 갈라진다.
 *   도메인과 무관한 DOM 동작이므로 lib이 자리다.
 *
 * 무엇이 문제였는가 (2026-08-04 교차검증)
 *   두 모달 모두 `aria-modal="true"`를 선언하면서 포커스를 가두지 않았다.
 *   스크린리더에는 "이 뒤는 없는 것으로 치라"고 말해놓고 실제로는 Tab이 뒤
 *   화면을 순회했다. 선언과 동작이 어긋나면 보조기술 사용자에게는 거짓말이다.
 *
 * 이 훅이 보장하는 것
 *   1. 열릴 때 포커스를 모달로 옮긴다
 *   2. Tab / Shift+Tab이 모달 안에서만 순환한다
 *   3. 닫힐 때 열기 직전에 포커스를 갖고 있던 요소로 되돌린다
 *   4. 열려 있는 동안 모달 바깥의 형제 노드를 inert로 만든다
 *
 * inert를 조상까지 거슬러 올라가며 형제에 거는 이유
 *   모달은 body 직속이 아니라 페이지 트리 깊숙이 렌더된다(포털을 쓰지 않는다).
 *   body의 자식에만 inert를 걸면 모달 자신이 그 안에 들어 있어 아무것도
 *   차단되지 않는다. 그래서 모달에서 body까지 올라가며 각 층의 형제를 끈다.
 *   inert는 포커스와 접근성 트리를 동시에 끊으므로 aria-hidden을 따로 걸지 않는다.
 */
import { useEffect, useRef } from 'react';

/**
 * 포커스를 받을 수 있는 요소들. `[inert]` 안에 든 것과 `disabled`는 제외한다.
 * tabindex="-1"은 프로그램으로만 포커스되므로 Tab 순환 대상이 아니다.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
    // 숨겨진 컨트롤은 Tab을 받지 않는다. 순환에 넣으면 포커스가 사라진 것처럼 보인다.
    .filter((element) => element.offsetParent !== null || element === document.activeElement);
}

/** 모달에서 body까지 올라가며 각 층의 형제를 inert로 만든다. 되돌리는 함수를 준다. */
function inertOutside(container: HTMLElement): () => void {
  const touched: HTMLElement[] = [];
  let node: HTMLElement = container;

  while (node !== document.body && node.parentElement) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling === node || !(sibling instanceof HTMLElement)) continue;
      // 남이 이미 걸어둔 inert는 우리 것이 아니다. 되돌릴 때 지우면 안 된다.
      if (sibling.hasAttribute('inert')) continue;
      sibling.setAttribute('inert', '');
      touched.push(sibling);
    }
    node = node.parentElement;
  }

  return () => touched.forEach((element) => element.removeAttribute('inert'));
}

/**
 * @param isActive 모달이 열려 있는가. false면 아무것도 하지 않는다.
 * @returns 모달 컨테이너에 붙일 ref. 컨테이너에는 `tabIndex={-1}`이 있어야 한다 —
 *          안에 포커스 가능한 컨트롤이 하나도 없을 때 포커스가 갈 자리다.
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!isActive || !container) return;

    // 복원 대상은 "열기 직전에 포커스를 갖고 있던 요소"다. 열린 뒤 바뀐 값이
    // 아니라 이 시점의 값이어야 닫았을 때 원래 누른 카드로 돌아간다.
    const restoreTarget = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const releaseInert = inertOutside(container);
    container.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = focusableWithin(container);
      if (focusable.length === 0) {
        // 가둘 컨트롤이 없으면 컨테이너에 묶어둔다. 놓아주면 뒤로 샌다.
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // 컨테이너 자신에 포커스가 있는 상태(막 열린 직후)에서도 순환이 성립해야 한다.
      // 그 상태의 Shift+Tab은 놓아두면 모달 앞의 배경으로 나가므로 마지막으로 감는다.
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);

    return () => {
      container.removeEventListener('keydown', onKeyDown);
      releaseInert();
      // 사라진 노드로는 포커스를 되돌릴 수 없다. 그 경우 브라우저 기본(body)에 맡긴다.
      if (restoreTarget && restoreTarget.isConnected) restoreTarget.focus();
    };
  }, [isActive]);

  return containerRef;
}
