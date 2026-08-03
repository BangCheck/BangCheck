import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Atlas 상세 캔버스가 이 페이지를 iframe으로 띄웠을 때, [data-atlas-node]가 붙은
 * 요소의 좌표를 부모 프레임으로 보고한다. Atlas는 그 좌표로 카드와 화면 영역을 잇는다.
 *
 * 원래 LandingPage 안에 있던 것을 그대로 옮겼다. 페이지가 둘 이상이 되면서
 * 같은 코드가 복제될 자리였기 때문이다.
 *
 * DEV에서만 동작하고, 부모 프레임이 없으면 아무것도 하지 않는다.
 * 반환값은 "지금 Atlas 미리보기로 열렸는가" — 페이지가 인증 리다이렉트 같은
 * 자기 동작을 건너뛸지 판단하는 데 쓴다.
 */
export interface AtlasPreview {
  /** 지금 Atlas 미리보기로 열렸는가 */
  isPreview: boolean;
  /**
   * Atlas가 요청한 화면 상태. 기본은 'default'.
   * 페이지는 이 값을 보고 평소엔 숨어 있는 상태(로그인 후 화면 등)를 강제로 그린다.
   * DEV 미리보기에서만 유효하다 — 운영에서는 늘 'default'다.
   */
  state: string;
}

export function useAtlasPreview(route: string): AtlasPreview {
  const [searchParams] = useSearchParams();
  const isAtlasPreview = import.meta.env.DEV && searchParams.get('atlasPreview') === '1';
  const state = isAtlasPreview ? (searchParams.get('atlasState') ?? 'default') : 'default';

  useEffect(() => {
    if (!isAtlasPreview || window.parent === window) return undefined;

    const reportRects = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-atlas-node]'))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            id: element.dataset.atlasNode,
            label: element.dataset.atlasLabel ?? element.textContent?.trim() ?? '',
            rect: {
              // 화면에 보이는 위치가 아니라 문서 기준 위치여야 한다.
              // Atlas는 문서 전체를 한 화면에 펼쳐 놓고 그 위에 영역을 얹는다.
              x: rect.x + window.scrollX,
              y: rect.y + window.scrollY,
              width: rect.width,
              height: rect.height,
            },
          };
        });

      window.parent.postMessage({
        source: 'bangcheck-atlas-preview',
        type: 'ATLAS_NODE_RECTS',
        route,
        nodes,
      }, window.location.origin);
    };

    const observer = new ResizeObserver(reportRects);
    observer.observe(document.documentElement);
    window.addEventListener('resize', reportRects);
    window.addEventListener('scroll', reportRects, true);
    const initialReport = window.requestAnimationFrame(reportRects);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(initialReport);
      window.removeEventListener('resize', reportRects);
      window.removeEventListener('scroll', reportRects, true);
    };
  }, [isAtlasPreview, route]);

  return { isPreview: isAtlasPreview, state };
}
