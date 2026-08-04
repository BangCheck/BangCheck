/**
 * 페이지 맵 뷰포트 — 캔버스를 스크롤이 아니라 확대·축소와 끌기로 다룬다.
 *
 * 스크롤 캔버스는 두 가지를 못 했다. 전체를 한 화면에 담을 수 없고,
 * 보고 있는 지점을 기준으로 확대할 수 없었다. 그래서 위치(x, y)와 배율(zoom)을
 * 이 훅이 직접 들고, 캔버스에는 transform 하나로 넘긴다.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.4;
const FIT_MARGIN = 0.94;
const STEP = 1.18;
/** 이만큼 못 움직인 포인터는 끌기가 아니라 클릭이다 — 노드 선택을 잡아먹지 않게 한다. */
const DRAG_THRESHOLD = 4;
/** 버튼 조작만 부드럽게 한다. 휠과 끌기는 손을 따라와야 하므로 즉시 반영. */
const SMOOTH_MS = 200;

export type MapView = { zoom: number; x: number; y: number };

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

export function useMapViewport(canvasWidth: number, canvasHeight: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView>({ zoom: 0.86, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSmooth, setIsSmooth] = useState(false);

  // 포인터 핸들러는 이벤트 시점의 최신 view가 필요하다 — 클로저에 갇히면 끌기가 튄다.
  const viewRef = useRef(view);
  viewRef.current = view;
  const draggedRef = useRef(false);
  const smoothTimerRef = useRef<number | undefined>(undefined);

  const runSmooth = useCallback(() => {
    setIsSmooth(true);
    window.clearTimeout(smoothTimerRef.current);
    smoothTimerRef.current = window.setTimeout(() => setIsSmooth(false), SMOOTH_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(smoothTimerRef.current), []);

  /** 앵커(뷰포트 안 좌표)에 놓인 캔버스 지점이 제자리에 남도록 배율을 바꾼다. */
  const zoomAt = useCallback((nextZoom: number, anchorX: number, anchorY: number) => {
    setView((current) => {
      const zoom = clampZoom(nextZoom);
      if (zoom === current.zoom) return current;
      const ratio = zoom / current.zoom;
      return {
        zoom,
        x: anchorX - (anchorX - current.x) * ratio,
        y: anchorY - (anchorY - current.y) * ratio,
      };
    });
  }, []);

  const zoomAtCenter = useCallback((factor: number) => {
    const element = viewportRef.current;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    runSmooth();
    zoomAt(viewRef.current.zoom * factor, width / 2, height / 2);
  }, [runSmooth, zoomAt]);

  const zoomIn = useCallback(() => zoomAtCenter(STEP), [zoomAtCenter]);
  const zoomOut = useCallback(() => zoomAtCenter(1 / STEP), [zoomAtCenter]);

  /** 캔버스 전체가 들어오도록 배율과 위치를 다시 잡는다. */
  const fitToScreen = useCallback((smooth = true) => {
    const element = viewportRef.current;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    if (!width || !height) return;
    const zoom = clampZoom(Math.min(width / canvasWidth, height / canvasHeight) * FIT_MARGIN);
    if (smooth) runSmooth();
    setView({
      zoom,
      x: (width - canvasWidth * zoom) / 2,
      y: (height - canvasHeight * zoom) / 2,
    });
  }, [canvasWidth, canvasHeight, runSmooth]);

  // 첫 진입에는 전체가 보이는 데서 시작한다. 애니메이션 없이 — 열자마자 미끄러지면 안 되니까.
  useEffect(() => {
    fitToScreen(false);
    // fitToScreen은 캔버스 크기에만 의존한다. 크기가 바뀌면 다시 맞추는 게 맞다.
  }, [fitToScreen]);

  // 휠 줌. React의 onWheel은 passive라 preventDefault가 안 먹어서 직접 건다.
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      // 트랙패드 핀치는 ctrlKey를 달고 오고 델타가 크다 — 계수를 따로 준다.
      const intensity = event.ctrlKey ? 0.01 : 0.0018;
      const factor = Math.exp(-event.deltaY * intensity);
      setIsSmooth(false);
      zoomAt(
        viewRef.current.zoom * factor,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [zoomAt]);

  /**
   * 끌어서 이동. 포인터 캡처를 쓰지 않는 이유 — 캡처하면 뒤이은 click이
   * 캡처한 요소로 가버려서 캔버스 위 노드 버튼이 눌리지 않는다.
   */
  const beginPan = useCallback((event: React.PointerEvent) => {
    if (event.button !== 0) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const origin = viewRef.current;
    draggedRef.current = false;
    let panning = false;

    const handleMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (!panning) {
        if (Math.hypot(dx, dy) <= DRAG_THRESHOLD) return;
        panning = true;
        draggedRef.current = true;
        setIsSmooth(false);
        setIsPanning(true);
      }
      setView((current) => ({ ...current, x: origin.x + dx, y: origin.y + dy }));
    };

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      setIsPanning(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  }, []);

  /**
   * 직전 포인터 조작이 끌기였는지. click은 pointerup 다음에 오므로 이 시점까지
   * 값이 살아 있다 — 다음 pointerdown이 초기화한다.
   */
  const didDrag = useCallback(() => draggedRef.current, []);

  return { viewportRef, view, isPanning, isSmooth, beginPan, didDrag, zoomIn, zoomOut, fitToScreen };
}
