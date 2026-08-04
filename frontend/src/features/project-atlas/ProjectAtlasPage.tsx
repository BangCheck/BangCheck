import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { createMvpSeed, transitionAction } from './atlas-machine';
import { ATLAS_PAGES, findAtlasPage } from './atlas-pages';
import type { ActionState as CanonicalActionState, AtlasMvpState } from '@/types/project-atlas';
import type { AtlasCard } from '@/types/atlas-card';
import './project-atlas.css';

type AtlasTheme = 'vscode-light' | 'vscode-dark' | 'circuit' | 'blueprint' | 'terminal' | 'amber';
type ActionKind = 'github' | 'discord';
type UiActionState = CanonicalActionState | 'IDLE';

interface NodeRect { x: number; y: number; width: number; height: number }

/**
 * 미리보기의 논리 폭. 실제 패널 크기와 무관하게 이 폭으로 렌더한 뒤 배율만 바꾼다.
 * 폭을 고정해야 카드가 가리키는 좌표가 패널 크기에 따라 흔들리지 않는다.
 */
const PREVIEW_BASE_WIDTH = 1280;

/** 수동 배율의 경계. 아래로는 전체 조망, 위로는 글자를 읽을 수 있는 수준까지. */
const MIN_ZOOM = 0.08;
const MAX_ZOOM = 2;

/** 측정이 어긋났을 때의 상한. 이보다 큰 페이지는 실재하지 않는다고 본다. */
const MAX_DOC_HEIGHT = 20000;
/** 문서 높이를 재는 기준 뷰포트 높이. 이 높이에서 재야 scrollHeight가 전체 문서를 말한다. */
const MEASURE_VIEWPORT_HEIGHT = 900;
/** 이 시간 동안 커진 값을 받아들이고, 지나면 잠근다. */
const MEASURE_SETTLE_MS = 900;

const THEMES: ReadonlyArray<{
  id: AtlasTheme;
  label: string;
  description: string;
  accent: string;
  background: string;
}> = [
  { id: 'vscode-light', label: 'LIGHT', description: 'VS Code Light+', accent: '#005fb8', background: '#ffffff' },
  { id: 'vscode-dark', label: 'DARK', description: 'VS Code Dark+', accent: '#3794ff', background: '#1e1e1e' },
  { id: 'circuit', label: 'CIRCUIT', description: 'Tokyo Night', accent: '#58c3ad', background: '#071012' },
  { id: 'blueprint', label: 'BLUEPRINT', description: 'Nord', accent: '#48bfff', background: '#061426' },
  { id: 'terminal', label: 'TERMINAL', description: 'Dracula', accent: '#63f58b', background: '#050906' },
  { id: 'amber', label: 'AMBER', description: 'Solarized', accent: '#ffad4a', background: '#120d07' },
];

const RELATION_LABEL: Record<AtlasCard['related'][number]['relation'], string> = {
  USES: '이 기능이 부른다',
  USED_BY: '이 기능을 부른다',
  SHARES_CODE: '같은 코드를 쓴다',
  SAME_DEFECT: '같은 결함을 공유한다',
  INCONSISTENT_WITH: '동작이 어긋난다',
};

const ACTOR_LABEL: Record<AtlasCard['behaviour'][number]['actor'], string> = {
  USER: '사용자',
  FRONT: '화면',
  BACK: '서버',
};

function getInitialTheme(): AtlasTheme {
  const savedTheme = window.localStorage.getItem('bangcheck-project-map-theme');
  return THEMES.some((theme) => theme.id === savedTheme)
    ? savedTheme as AtlasTheme
    : 'vscode-light';
}

function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export default function ProjectAtlasPage() {
  const { pageId = 'landing' } = useParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const eventSequenceRef = useRef(4);
  const atlasStateRef = useRef<AtlasMvpState>(createMvpSeed());
  const docLockedRef = useRef(false);
  const lockTimerRef = useRef<number | null>(null);
  const pendingHeightRef = useRef(0);

  const [theme, setTheme] = useState<AtlasTheme>(getInitialTheme);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [rects, setRects] = useState<Record<string, NodeRect>>({});
  const [docHeight, setDocHeight] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState<number | null>(null);
  const [pageState, setPageState] = useState('default');
  const [atlasState, setAtlasState] = useState<AtlasMvpState>(atlasStateRef.current);
  const [events, setEvents] = useState(() => [
    { id: 'EVT-0001', time: formatTime(), source: 'CANONICAL', state: 'RECORDED', detail: 'page.view.opened · landing' },
    { id: 'EVT-0002', time: formatTime(), source: 'VIEW', state: 'BOUND', detail: 'full-page preview requested' },
    { id: 'EVT-0003', time: formatTime(), source: 'REGION', state: 'WAITING', detail: 'section rects pending' },
  ]);

  const resolvedPage = findAtlasPage(pageId);
  const isSupportedPage = resolvedPage !== null;
  // 등재되지 않은 pageId여도 화면은 그린다 — 첫 등재 페이지를 보여주고 안내를 얹는다
  const page = resolvedPage ?? ATLAS_PAGES[0];
  const activeTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0];
  const selectedCard = page.cards.find((card) => card.id === selectedCardId) ?? null;
  const highlightId = hoveredCardId ?? selectedCardId;
  const activeState = page.states.find((state) => state.id === pageState) ?? page.states[0] ?? null;
  // 상태가 바뀌면 URL이 바뀌고, key가 바뀌면 iframe이 새로 뜬다
  const previewSrc = pageState === 'default'
    ? page.previewSrc
    : `${page.previewSrc}&atlasState=${encodeURIComponent(pageState)}`;

  const actionState: Record<ActionKind, UiActionState> = {
    github: [...atlasState.actions].reverse().find((action) => action.integration === 'GITHUB')?.state ?? 'IDLE',
    discord: [...atlasState.actions].reverse().find((action) => action.integration === 'DISCORD')?.state ?? 'IDLE',
  };

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

  const appendEventOnce = useCallback((source: string, state: string, detail: string) => {
    setEvents((current) => (current.some((item) => item.detail === detail)
      ? current
      : [...current, {
          id: `EVT-${String(eventSequenceRef.current++).padStart(4, '0')}`,
          time: formatTime(),
          source,
          state,
          detail,
        }]));
  }, []);

  /**
   * 미리보기 문서의 실제 높이. same-origin이라 직접 잴 수 있다.
   *
   * 한 번만 재고 잠근다. iframe 높이를 측정값으로 바꾸는데 제품 페이지 안에
   * min-h-screen(=iframe 높이)이 있으면 그만큼 다시 자라서 측정이 발산한다.
   * (/custom이 실제로 36005px까지 부풀었다. 기준 높이에서 한 번 잰 값이 정답이다.)
   */
  const measureDocument = useCallback(() => {
    if (docLockedRef.current) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.documentElement) return;
    const height = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight ?? 0);
    if (height <= 0) return;

    // 측정값을 바로 적용하지 않고 모아둔다.
    // 적용하면 iframe이 그 높이로 커지고, 제품 페이지의 min-h-screen이 iframe 높이를
    // 따라 자라서 다음 측정이 더 커진다 — 그렇게 /custom이 1463px에서 10184px까지 부풀었다.
    // 창이 닫힐 때까지 iframe은 기준 높이에 머문다.
    pendingHeightRef.current = Math.max(pendingHeightRef.current, Math.min(height, MAX_DOC_HEIGHT));

    if (lockTimerRef.current) return;
    lockTimerRef.current = window.setTimeout(() => {
      docLockedRef.current = true;
      lockTimerRef.current = null;
      setDocHeight(pendingHeightRef.current);
    }, MEASURE_SETTLE_MS);
    timersRef.current.push(lockTimerRef.current);
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

  /**
   * 휠로 배율을 바꾼다.
   * passive 리스너에서는 preventDefault가 무시되므로 addEventListener로 직접 단다
   * (JSX의 onWheel은 React가 passive로 붙일 수 있다).
   */
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
      appendEventOnce('REGION', 'SYNCED', `${Object.keys(next).length} section rects synchronized`);
    };

    window.addEventListener('message', receivePreviewMessage);
    return () => window.removeEventListener('message', receivePreviewMessage);
  }, [appendEventOnce, measureDocument]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // 상태를 바꾸면 화면이 달라지므로 좌표와 높이를 다시 잰다
  useEffect(() => {
    setRects({});
    setDocHeight(0);
    docLockedRef.current = false;
    pendingHeightRef.current = 0;
    if (lockTimerRef.current) { window.clearTimeout(lockTimerRef.current); lockTimerRef.current = null; }
  }, [pageState]);

  // 페이지를 옮기면 이전 페이지의 선택과 좌표가 남으면 안 된다
  useEffect(() => {
    setSelectedCardId(null);
    setHoveredCardId(null);
    setRects({});
    setDocHeight(0);
    docLockedRef.current = false;
    pendingHeightRef.current = 0;
    if (lockTimerRef.current) { window.clearTimeout(lockTimerRef.current); lockTimerRef.current = null; }
    setZoom(null);
    setPageState('default');
  }, [pageId]);

  const selectTheme = (nextTheme: AtlasTheme) => {
    setTheme(nextTheme);
    window.localStorage.setItem('bangcheck-project-map-theme', nextTheme);
  };

  const runLocalAction = (kind: ActionKind) => {
    if (
      actionState[kind] === 'REQUESTED'
      || actionState[kind] === 'PROCESSING'
      || actionState[kind] === 'RETRYING'
    ) return;

    const integration = kind === 'github' ? 'GITHUB' : 'DISCORD';
    const operation = kind === 'github' ? 'CREATE_ISSUE' : 'NOTIFY_CHANNEL';
    const projectionId = kind === 'github'
      ? 'projection-github-local'
      : 'projection-discord-local';
    const sourceCardId = selectedCardId ?? page.cards[0].id;
    const request = transitionAction(atlasStateRef.current, {
      type: 'REQUEST_ACTION',
      integration,
      operation,
      idempotencyKey: `atlas-${kind}-${page.pageId}-v1`,
      aggregateRef: { type: 'PAGE', id: `page-${page.pageId}` },
      projectionId,
      input: kind === 'github'
        ? { title: `[Atlas] ${page.title} 점검`, sourceNodeId: sourceCardId }
        : { channel: 'project-atlas-local', sourceNodeId: sourceCardId },
      at: new Date().toISOString(),
    });

    atlasStateRef.current = request.state;
    setAtlasState(request.state);
    if (request.duplicate) return;

    timersRef.current.push(window.setTimeout(() => {
      const processing = transitionAction(atlasStateRef.current, {
        type: 'MOVE_ACTION',
        actionId: request.action.id,
        to: 'PROCESSING',
        at: new Date().toISOString(),
      });
      atlasStateRef.current = processing.state;
      setAtlasState(processing.state);
    }, 420));

    timersRef.current.push(window.setTimeout(() => {
      const succeeded = transitionAction(atlasStateRef.current, {
        type: 'MOVE_ACTION',
        actionId: request.action.id,
        to: 'SUCCEEDED',
        at: new Date().toISOString(),
        result: kind === 'github'
          ? { issue: 'LOCAL-014', externalWrites: false }
          : { message: 'LOCAL-MSG-001', externalWrites: false },
      });
      atlasStateRef.current = succeeded.state;
      setAtlasState(succeeded.state);
    }, 1180));
  };

  const eventRows = useMemo(() => [
    ...events,
    ...atlasState.events.map((event) => ({
      id: event.id.toUpperCase(),
      time: formatTime(new Date(event.occurredAt)),
      source: String(event.payload.integration ?? event.provenance.source),
      state: String(event.payload.to ?? 'REQUESTED'),
      detail: event.type === 'INTEGRATION_ACTION_REQUESTED'
        ? `${String(event.payload.operation)} · ${event.dedupeKey}`
        : `${String(event.payload.from)} → ${String(event.payload.to)} · externalWrites=false`,
    })),
  ], [atlasState.events, events]);

  const boundCount = page.cards.filter((card) => rects[card.id]).length;

  return (
    <main className={`project-atlas project-map-theme-${theme}`}>
      <header className="atlas-topbar">
        <div className="atlas-brand">
          <span className="atlas-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>
            <strong>BANGCHECK</strong>
            <small>PROJECT ATLAS</small>
          </span>
        </div>

        <div className="atlas-title">
          <span>Workspace / Product map / {pageId}</span>
          <strong>{page.title} / PAGE CANVAS</strong>
        </div>

        <div className="atlas-topbar-actions">
          <span className="atlas-adapter-badge"><i /> MOCK / LOCAL ADAPTER</span>
          <Link className="atlas-back-link" to={ROUTES.PROJECT_MAP}>
            <Icon icon="solar:arrow-left-outline" width={15} />
            PAGE MAP
          </Link>
        </div>
      </header>

      <section className="atlas-controlbar">
        <div className="atlas-canonical-status">
          <span>CANONICAL RECORD</span>
          <strong>PAGE::{pageId.toUpperCase()}</strong>
          <i />
          <em>{page.route}</em>
        </div>

        <div className="atlas-theme-switcher" role="group" aria-label="Atlas theme">
          {THEMES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={theme === item.id ? 'is-active' : ''}
              onClick={() => selectTheme(item.id)}
              title={`${item.label} · ${item.description}`}
              aria-pressed={theme === item.id}
            >
              <span style={{ background: item.background, borderColor: item.accent }}>
                <i style={{ background: item.accent }} />
              </span>
              <small>0{index + 1}</small>
              {item.label}
            </button>
          ))}
        </div>

        <div className="atlas-live-state">
          <span className="is-live"><i /> FULL PAGE</span>
          <span><i /> REGION {boundCount}/{page.cards.length}</span>
          <strong>{activeTheme.description}</strong>
        </div>
      </section>

      {!isSupportedPage && (
        <div className="atlas-unsupported">
          <Icon icon="solar:construction-outline" width={19} />
          <span>
            <strong>{pageId}</strong> 캔버스는 아직 카드가 없습니다. 등재된 페이지:{' '}
            {ATLAS_PAGES.map((item) => item.route).join(' · ')}
          </span>
          {ATLAS_PAGES.map((item) => (
            <Link key={item.pageId} to={ROUTES.PROJECT_PAGE(item.pageId)}>
              {item.pageId.toUpperCase()} 열기
            </Link>
          ))}
        </div>
      )}

      <div className="atlas-canvas">
        {/* 왼쪽 — 페이지 전체가 한 화면에 들어간다 */}
        <section className="atlas-page-panel">
          <div className="atlas-page-head">
            <div>
              <span>PAGE VIEW / 전체</span>
              <strong>{page.route}</strong>
            </div>
            <div className="atlas-page-meta">
              <div className="atlas-zoom" role="group" aria-label="미리보기 배율">
                <button
                  type="button"
                  onClick={() => changeZoom(-1)}
                  disabled={!fitScale || previewScale <= MIN_ZOOM}
                  title="축소"
                  aria-label="축소"
                >
                  <Icon icon="solar:minus-square-outline" width={14} />
                </button>
                <span>{previewScale ? `${Math.round(previewScale * 100)}%` : '측정 중'}</span>
                <button
                  type="button"
                  onClick={() => changeZoom(1)}
                  disabled={!fitScale || previewScale >= MAX_ZOOM}
                  title="확대"
                  aria-label="확대"
                >
                  <Icon icon="solar:add-square-outline" width={14} />
                </button>
                <button
                  type="button"
                  className={isFit ? 'is-active' : ''}
                  onClick={() => setZoom(null)}
                  title="전체 맞춤 — 스크롤 없이 페이지 전체"
                  aria-pressed={isFit}
                >
                  FIT
                </button>
              </div>
              <button
                type="button"
                onClick={() => { docLockedRef.current = false; pendingHeightRef.current = 0; setDocHeight(0); iframeRef.current?.contentWindow?.location.reload(); }}
                title="미리보기 새로고침"
              >
                <Icon icon="solar:refresh-outline" width={13} />
              </button>
            </div>
          </div>

          {page.states.length > 0 && (
            <div className="atlas-state-bar">
              <div className="atlas-state-tabs" role="group" aria-label="화면 상태">
                {page.states.map((state) => (
                  <button
                    key={state.id}
                    type="button"
                    className={pageState === state.id ? 'is-active' : ''}
                    onClick={() => setPageState(state.id)}
                    aria-pressed={pageState === state.id}
                  >
                    {state.label}
                  </button>
                ))}
              </div>
              {activeState && (
                <div className="atlas-state-note">
                  <p>{activeState.note}</p>
                  {activeState.caveat && <p className="is-caveat">{activeState.caveat}</p>}
                </div>
              )}
            </div>
          )}

          <div className="atlas-page-stage" ref={stageRef} data-fit={isFit ? 'true' : 'false'}>
            {/* 배율이 반영된 실제 크기. transform은 레이아웃 크기를 바꾸지 않으므로
                이 래퍼가 스크롤 영역을 만든다. */}
            <div
              className="atlas-page-canvas"
              style={{
                width: PREVIEW_BASE_WIDTH * (previewScale || 0.01),
                height: (docHeight || MEASURE_VIEWPORT_HEIGHT) * (previewScale || 0.01),
              }}
            >
            <div
              className="atlas-page-scaler"
              style={{
                width: PREVIEW_BASE_WIDTH,
                height: docHeight || undefined,
                transform: `scale(${previewScale || 0.01})`,
              }}
            >
              <iframe
                ref={iframeRef}
                key={`${page.pageId}-${pageState}`}
                title={`${page.title} 전체 미리보기 (${activeState?.label ?? '기본'})`}
                src={previewSrc}
                style={{ width: PREVIEW_BASE_WIDTH, height: docHeight || MEASURE_VIEWPORT_HEIGHT }}
                onLoad={() => {
                  measureDocument();
                  appendEventOnce('VIEW', 'LOADED', 'same-origin full-page iframe loaded');
                }}
              />

              {page.cards.map((card) => {
                const rect = rects[card.id];
                if (!rect) return null;
                return (
                  <button
                    type="button"
                    key={card.id}
                    className={`atlas-region ${highlightId === card.id ? 'is-active' : ''} ${selectedCardId === card.id ? 'is-selected' : ''}`}
                    style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
                    onClick={() => setSelectedCardId(card.id)}
                    onMouseEnter={() => setHoveredCardId(card.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    aria-label={`${card.title} 영역`}
                  >
                    <span style={{ transform: `scale(${previewScale ? 1 / previewScale : 1})` }}>
                      {card.code}
                    </span>
                  </button>
                );
              })}
            </div>
            </div>

            {!docHeight && (
              <div className="atlas-page-waiting">
                <Icon icon="solar:radar-2-outline" width={20} />
                DOCUMENT MEASURING
              </div>
            )}
          </div>

          <div className="atlas-page-foot">
            <span><i className="is-green" /> SAME ORIGIN</span>
            <span><i /> NO SCROLL · 전체 {docHeight || '—'}px</span>
          </div>
        </section>

        {/* 오른쪽 — 카드. Front/Back을 나누지 않는다 */}
        <aside className="atlas-card-rail">
          <div className="atlas-card-rail-head">
            <span>SECTION CARDS</span>
            <strong>{page.cards.length.toString().padStart(2, '0')}</strong>
          </div>

          <div className="atlas-card-list">
            {page.cards.map((card) => {
              const bound = Boolean(rects[card.id]);
              return (
                <button
                  type="button"
                  key={card.id}
                  className={`atlas-card ${selectedCardId === card.id ? 'is-selected' : ''}`}
                  onClick={() => setSelectedCardId(selectedCardId === card.id ? null : card.id)}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  <span className="atlas-card-top">
                    <small>{card.code}</small>
                    <em data-state={card.status}>{card.status}</em>
                  </span>
                  <strong className="atlas-card-title">{card.title}</strong>
                  <span className="atlas-card-headline">{card.headline}</span>
                  <span className="atlas-card-facts">
                    <span>API {card.api.length}</span>
                    <span>연관 {card.related.length}</span>
                    <span>결함 {card.defects.length}</span>
                    <span className={bound ? 'is-bound' : ''}>{bound ? '영역 연결' : '영역 없음'}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="atlas-local-actions">
            <div>
              <span>ACTION ADAPTER</span>
              <strong>EXTERNAL WRITE DISABLED</strong>
            </div>
            <p>실제 GitHub·Discord 호출 없이 동일한 상태 전이와 감사 이벤트만 기록합니다.</p>
            <button
              type="button"
              data-action-state={actionState.github}
              disabled={actionState.github === 'REQUESTED' || actionState.github === 'PROCESSING'}
              onClick={() => runLocalAction('github')}
            >
              <Icon icon="mdi:github" width={16} />
              <span>CREATE ISSUE / LOCAL</span>
              <em>{actionState.github}</em>
            </button>
            <button
              type="button"
              data-action-state={actionState.discord}
              disabled={actionState.discord === 'REQUESTED' || actionState.discord === 'PROCESSING'}
              onClick={() => runLocalAction('discord')}
            >
              <Icon icon="ic:baseline-discord" width={16} />
              <span>NOTIFY / LOCAL</span>
              <em>{actionState.discord}</em>
            </button>
          </div>
        </aside>
      </div>

      {/* 카드 상세 — 개요 / 기능 설명 / API 규칙 / 연관된 기능 */}
      {selectedCard && (
        <section className="atlas-detail">
          <header className="atlas-detail-head">
            <div>
              <span>{selectedCard.code} / CARD DETAIL</span>
              <h2>{selectedCard.title}</h2>
            </div>
            <button type="button" onClick={() => setSelectedCardId(null)} aria-label="상세 닫기">
              <Icon icon="solar:close-circle-outline" width={18} />
            </button>
          </header>

          <div className="atlas-detail-grid">
            <article className="atlas-detail-block">
              <h3><span>01</span> 개요</h3>
              <p>{selectedCard.overview.what}</p>
              <p className="is-muted">{selectedCard.overview.where}</p>
              <dl className="atlas-detail-sources">
                {selectedCard.sources.map((source) => (
                  <div key={source.path}>
                    <dt>{source.layer}</dt>
                    <dd>{source.path}{source.symbol ? ` · ${source.symbol}` : ''}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article className="atlas-detail-block">
              <h3><span>02</span> 기능 설명</h3>
              <ol className="atlas-detail-steps">
                {selectedCard.behaviour.map((step, index) => (
                  <li key={`${step.actor}-${index}`}>
                    <em data-actor={step.actor}>{ACTOR_LABEL[step.actor]}</em>
                    <div>
                      <p>{step.step}</p>
                      {step.source && <code>{step.source}</code>}
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <article className="atlas-detail-block">
              <h3><span>03</span> API 규칙</h3>
              {selectedCard.api.length === 0 && (
                <p className="is-muted">호출이 없다. 정적 렌더만 하는 영역이다.</p>
              )}
              {selectedCard.api.map((rule) => (
                <div className="atlas-api-rule" key={rule.operationId}>
                  <div className="atlas-api-line">
                    <strong>{rule.method}</strong>
                    <code>{rule.path}</code>
                  </div>
                  <p>{rule.summary}</p>
                  <dl>
                    <div><dt>operationId</dt><dd>{rule.operationId}</dd></div>
                    <div><dt>security</dt><dd>{rule.security}</dd></div>
                    <div><dt>request</dt><dd>{rule.request ?? '없음'}</dd></div>
                    <div>
                      <dt>responses</dt>
                      <dd>
                        {rule.responses.map((response) => (
                          <span key={response.code}>
                            <b>{response.code}</b> — {response.when}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt>safety</dt>
                      <dd>
                        <span><b>{rule.safety.sideEffect}</b> — 부수효과</span>
                        <span><b>{rule.safety.writes.length ? rule.safety.writes.join(', ') : '없음'}</b> — 쓰기 대상</span>
                        <span><b>{rule.safety.rerunSafe ? '재실행 안전' : '재실행 위험'}</b> — 같은 요청 반복</span>
                        <span><b>{rule.safety.abortOnFail}</b> — 실패 시</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </article>

            <article className="atlas-detail-block">
              <h3><span>04</span> 연관된 기능</h3>
              {selectedCard.related.length === 0 && <p className="is-muted">연관이 기록되지 않았다.</p>}
              <ul className="atlas-detail-links">
                {selectedCard.related.map((link) => (
                  <li key={`${link.relation}-${link.label}`}>
                    <span className="atlas-relation" data-relation={link.relation}>
                      {RELATION_LABEL[link.relation]}
                    </span>
                    {link.targetId ? (
                      <button type="button" onClick={() => setSelectedCardId(link.targetId)}>
                        {link.label}
                      </button>
                    ) : (
                      <strong>{link.label}</strong>
                    )}
                    <p>{link.note}</p>
                  </li>
                ))}
              </ul>
              {selectedCard.defects.length > 0 && (
                <p className="atlas-detail-defects">
                  결함 {selectedCard.defects.join(', ')}
                </p>
              )}
            </article>
          </div>
        </section>
      )}

      <section className="atlas-event-panel">
        <header>
          <div>
            <span>APPEND-ONLY EVENT / ACTION JOURNAL</span>
            <strong>{eventRows.length.toString().padStart(2, '0')} RECORDS</strong>
          </div>
          <p><i /> IMMUTABLE ORDER <i /> LOCAL SESSION <i /> NO EXTERNAL SIDE EFFECT</p>
        </header>
        <div className="atlas-event-stream">
          {eventRows.map((event, index) => (
            <article key={event.id}>
              <span className="atlas-event-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="atlas-event-track" aria-hidden="true"><i /></div>
              <div className="atlas-event-card">
                <div>
                  <small>{event.id}</small>
                  <time>{event.time}</time>
                </div>
                <strong>{event.source}</strong>
                <span data-event-state={event.state}>{event.state}</span>
                <p>{event.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
