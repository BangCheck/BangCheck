/**
 * 미리보기 무대 — iframe 문서를 재고, 배율을 잡고, 카드 영역 좌표를 받는다.
 *
 * 이 훅이 혼자 다루는 함정이 둘 있다.
 *
 * 하나 — 측정이 발산한다. 잰 높이를 iframe에 곧바로 적용하면 제품 페이지의
 * min-h-screen이 그 높이를 따라 자라고, 다음 측정은 더 큰 값을 낸다.
 * (/custom이 1463px에서 10184px까지 부풀었다.) 그래서 값을 모았다가 한 번만
 * 적용하고 잠근다.
 *
 * 둘 — 휠 확대가 안 먹는다. React의 onWheel은 passive로 붙을 수 있어
 * preventDefault가 무시된다. addEventListener로 직접 단다.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface NodeRect { x: number; y: number; width: number; height: number }

/**
 * 미리보기의 논리 폭. 실제 패널 크기와 무관하게 이 폭으로 렌더한 뒤 배율만 바꾼다.
 * 폭을 고정해야 카드가 가리키는 좌표가 패널 크기에 따라 흔들리지 않는다.
 */
export const PREVIEW_BASE_WIDTH = 1280;

/** 수동 배율의 경계. 아래로는 전체 조망, 위로는 글자를 읽을 수 있는 수준까지. */
export const MIN_ZOOM = 0.08;
export const MAX_ZOOM = 2;

/** 측정이 어긋났을 때의 상한. 이보다 큰 페이지는 실재하지 않는다고 본다. */
const MAX_DOC_HEIGHT = 20000;
/** 문서 높이를 재는 기준 뷰포트 높이. 이 높이에서 재야 scrollHeight가 전체 문서를 말한다. */
export const MEASURE_VIEWPORT_HEIGHT = 900;
/** 이 시간 동안 커진 값을 받아들이고, 지나면 잠근다. */
const MEASURE_SETTLE_MS = 900;

interface Options {
  /** 페이지가 바뀌면 측정을 통째로 버린다. */
  pageId: string;
  /** 상태 탭이 바뀌면 화면이 달라지므로 좌표와 높이를 다시 잰다. */
  pageState: string;
  /** 좌표 수신·로드를 감사 기록에 남긴다. */
  onEvent: (source: string, state: string, detail: string) => void;
}

export function usePreviewStage({ pageId, pageState, onEvent }: Options) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const docLockedRef = useRef(false);
  const lockTimerRef = useRef<number | null>(null);
  const pendingHeightRef = useRef(0);

  const [rects, setRects] = useState<Record<string, NodeRect>>({});
  const [docHeight, setDocHeight] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState<number | null>(null);

  /** 전체가 한 화면에 들어가는 배율. 폭과 높이 중 더 빡빡한 쪽을 따른다. */
  const fitScale = useMemo(() => {
    if (!stageSize.width || !stageSize.height || !docHeight) return 0;
    return Math.min(stageSize.width / PREVIEW_BASE_WIDTH, stageSize.height / docHeight);
  }, [stageSize, docHeight]);

  /** zoom이 null이면 fit을 따라간다. 숫자면 사용자가 직접 고른 배율이다. */
  const previewScale = zoom ?? fitScale;
  const isFit = zoom === null;

  const changeZoom = useCallback((direction: 1 | -1) => {
    setZoom((current) => {
      const base = current ?? fitScale;
      if (!base) return current;
      const next = base * (direction === 1 ? 1.25 : 1 / 1.25);
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    });
  }, [fitScale]);

  const fitZoom = useCallback(() => setZoom(null), []);

  /** 잰 값을 버리고 처음부터 다시 잰다. 새로고침 버튼과 페이지 전환이 함께 쓴다. */
  const resetMeasurement = useCallback(() => {
    setRects({});
    setDocHeight(0);
    docLockedRef.current = false;
    pendingHeightRef.current = 0;
    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  }, []);

  const reloadPreview = useCallback(() => {
    resetMeasurement();
    iframeRef.current?.contentWindow?.location.reload();
  }, [resetMeasurement]);

  /** 미리보기 문서의 실제 높이. same-origin이라 직접 잴 수 있다. */
  const measureDocument = useCallback(() => {
    if (docLockedRef.current) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.documentElement) return;
    const height = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0);
    if (height <= 0) return;

    // 측정값을 바로 적용하지 않고 모아둔다 — 이유는 파일 머리말의 "함정 하나".
    pendingHeightRef.current = Math.max(pendingHeightRef.current, Math.min(height, MAX_DOC_HEIGHT));

    if (lockTimerRef.current) return;
    lockTimerRef.current = window.setTimeout(() => {
      docLockedRef.current = true;
      lockTimerRef.current = null;
      setDocHeight(pendingHeightRef.current);
    }, MEASURE_SETTLE_MS);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const onWheel = (event: WheelEvent) => {
      if (!fitScale) return;
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      setZoom((current) => {
        const base = current ?? fitScale;
        return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, base * factor));
      });
    };

    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [fitScale]);

  useEffect(() => {
    const receivePreviewMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!event.data || event.data.source !== 'bangcheck-atlas-preview') return;
      if (event.data.type !== 'ATLAS_NODE_RECTS' || !Array.isArray(event.data.nodes)) return;

      const next: Record<string, NodeRect> = {};
      for (const node of event.data.nodes as Array<{ id?: string; rect?: NodeRect }>) {
        if (!node.id || !node.rect) continue;
        const rect = {
          x: Number(node.rect.x),
          y: Number(node.rect.y),
          width: Number(node.rect.width),
          height: Number(node.rect.height),
        };
        // 같은 id가 두 번 올 수 있다 — 제품이 모바일/데스크톱용으로 두 벌 렌더하는 경우다
        // (/custom의 비로그인 배너가 그렇다). 화면에 실제로 보이는 큰 쪽을 남긴다.
        const seen = next[node.id];
        if (seen && seen.width * seen.height >= rect.width * rect.height) continue;
        next[node.id] = rect;
      }
      setRects(next);
      measureDocument();
      onEvent('REGION', 'SYNCED', `${Object.keys(next).length} section rects synchronized`);
    };

    window.addEventListener('message', receivePreviewMessage);
    return () => window.removeEventListener('message', receivePreviewMessage);
  }, [measureDocument, onEvent]);

  /** 남은 잠금 타이머가 언마운트 뒤에 setState를 부르지 않게 한다. */
  useEffect(() => () => {
    if (lockTimerRef.current) window.clearTimeout(lockTimerRef.current);
  }, []);

  useEffect(() => {
    resetMeasurement();
  }, [pageState, resetMeasurement]);

  useEffect(() => {
    resetMeasurement();
    setZoom(null);
  }, [pageId, resetMeasurement]);

  const onPreviewLoad = useCallback(() => {
    measureDocument();
    onEvent('VIEW', 'LOADED', 'same-origin full-page iframe loaded');
  }, [measureDocument, onEvent]);

  return {
    iframeRef,
    stageRef,
    rects,
    docHeight,
    fitScale,
    previewScale,
    isFit,
    changeZoom,
    fitZoom,
    reloadPreview,
    onPreviewLoad,
  };
}
