import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { createMvpSeed, transitionAction } from './atlas-machine';
import type { ActionState as CanonicalActionState, AtlasMvpState } from '@/types/project-atlas';
import './project-atlas.css';

type AtlasTheme = 'circuit' | 'blueprint' | 'terminal' | 'amber';
type NodeId =
  | 'landing-view'
  | 'landing-login-cta'
  | 'client-router'
  | 'auth-store'
  | 'oauth-entry'
  | 'security-filter'
  | 'issue-projection';
type ActionKind = 'github' | 'discord';
type UiActionState = CanonicalActionState | 'IDLE';

const THEMES: ReadonlyArray<{
  id: AtlasTheme;
  label: string;
  description: string;
  accent: string;
  background: string;
}> = [
  { id: 'circuit', label: 'CIRCUIT', description: 'Tokyo Night', accent: '#58c3ad', background: '#071012' },
  { id: 'blueprint', label: 'BLUEPRINT', description: 'Nord', accent: '#48bfff', background: '#061426' },
  { id: 'terminal', label: 'TERMINAL', description: 'Dracula', accent: '#63f58b', background: '#050906' },
  { id: 'amber', label: 'AMBER', description: 'Solarized', accent: '#ffad4a', background: '#120d07' },
];

const NODE_DETAILS: Record<NodeId, {
  sequence: string;
  lane: 'VIEW' | 'FRONT' | 'BACK' | 'SYNC';
  title: string;
  subtitle: string;
  icon: string;
  state: 'LIVE' | 'BOUND' | 'MOCK';
  endpoint: string;
  method: string;
  auth: string;
  exception: string;
  log: string;
  metric: string;
  trace: string;
  issue: string;
}> = {
  'landing-view': {
    sequence: 'V.00',
    lane: 'VIEW',
    title: '첫 진입 · 랜딩',
    subtitle: '실제 실행 중인 페이지 View',
    icon: 'solar:monitor-camera-outline',
    state: 'LIVE',
    endpoint: 'GET /?atlasPreview=1',
    method: 'VIEW',
    auth: 'Preview bypass / DEV only',
    exception: 'Preview frame unavailable',
    log: 'atlas.preview.ready',
    metric: 'view_ready_ms',
    trace: 'atlas-view → landing',
    issue: 'BC-PAGE-LANDING',
  },
  'landing-login-cta': {
    sequence: 'F.01',
    lane: 'FRONT',
    title: '체크리스트 시작하기',
    subtitle: 'View 위에서 추적되는 CTA hotspot',
    icon: 'solar:cursor-square-outline',
    state: 'BOUND',
    endpoint: 'navigate(ROUTES.HOME)',
    method: 'CLICK',
    auth: 'useAuthStore.isLoggedIn',
    exception: 'route navigation rejected',
    log: 'ui.landing.cta.clicked',
    metric: 'landing_cta_click_total',
    trace: 'hotspot → router → /rooms',
    issue: 'BC-FE-CTA-01',
  },
  'client-router': {
    sequence: 'F.02',
    lane: 'FRONT',
    title: 'Client Router',
    subtitle: '로그인 상태에 따라 화면 경로 결정',
    icon: 'solar:routing-3-outline',
    state: 'LIVE',
    endpoint: 'ROUTES.HOME / ROUTES.LOGIN',
    method: 'ROUTE',
    auth: 'Protected route gate',
    exception: 'loginRedirect(reason)',
    log: 'router.transition',
    metric: 'route_transition_ms',
    trace: 'CTA → router → auth gate',
    issue: 'BC-FE-ROUTER-02',
  },
  'auth-store': {
    sequence: 'F.03',
    lane: 'FRONT',
    title: 'Auth Store',
    subtitle: '클라이언트 세션의 로그인 상태',
    icon: 'solar:key-square-2-outline',
    state: 'LIVE',
    endpoint: 'useAuthStore()',
    method: 'STATE',
    auth: 'Access token / session',
    exception: 'expired session → logout',
    log: 'auth.session.changed',
    metric: 'active_session_total',
    trace: 'store → route guard',
    issue: 'BC-FE-AUTH-03',
  },
  'oauth-entry': {
    sequence: 'B.01',
    lane: 'BACK',
    title: 'OAuth Entry',
    subtitle: 'Kakao · Naver 인증 진입점',
    icon: 'solar:login-3-outline',
    state: 'LIVE',
    endpoint: 'GET /api/v1/oauth2/authorization/:provider',
    method: 'GET',
    auth: 'Kakao / Naver OAuth',
    exception: 'AUTH_401 / provider_denied',
    log: 'oauth.authorization.requested',
    metric: 'oauth_request_total',
    trace: 'frontend → security filter → provider',
    issue: 'BC-BE-OAUTH-01',
  },
  'security-filter': {
    sequence: 'B.02',
    lane: 'BACK',
    title: 'Security Filter',
    subtitle: 'PATH C · advice를 우회하는 인증 예외',
    icon: 'solar:shield-warning-outline',
    state: 'LIVE',
    endpoint: 'SecurityFilterChain',
    method: 'FILTER',
    auth: 'Bearer / OAuth callback',
    exception: 'AUTH_401 (advice bypass)',
    log: 'security.filter.rejected',
    metric: 'auth_rejection_total',
    trace: 'request → filter → entry point',
    issue: 'P1 / PATH-C',
  },
  'issue-projection': {
    sequence: 'S.01',
    lane: 'SYNC',
    title: 'Issue Projection',
    subtitle: '정본 이벤트를 GitHub·Discord로 투영',
    icon: 'solar:branching-paths-up-outline',
    state: 'MOCK',
    endpoint: 'LOCAL_ADAPTER://integration/action',
    method: 'EVENT',
    auth: 'No external credential',
    exception: 'FAILED → RETRYING → DEAD_LETTER',
    log: 'integration.action.transitioned',
    metric: 'projection_delivery_total',
    trace: 'event log → outbox → adapter',
    issue: 'LOCAL-ONLY',
  },
};

const FRONT_NODES: NodeId[] = ['landing-login-cta', 'client-router', 'auth-store'];
const BACK_NODES: NodeId[] = ['oauth-entry', 'security-filter', 'issue-projection'];

function getInitialTheme(): AtlasTheme {
  const savedTheme = window.localStorage.getItem('bangcheck-project-map-theme');
  return THEMES.some((theme) => theme.id === savedTheme)
    ? savedTheme as AtlasTheme
    : 'circuit';
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
  const timersRef = useRef<number[]>([]);
  const eventSequenceRef = useRef(4);
  const atlasStateRef = useRef<AtlasMvpState>(createMvpSeed());
  const [theme, setTheme] = useState<AtlasTheme>(getInitialTheme);
  const [selectedNodeId, setSelectedNodeId] = useState<NodeId>('landing-login-cta');
  const [hotspot, setHotspot] = useState({ x: 0, y: 0, width: 0, height: 0, ready: false });
  const [atlasState, setAtlasState] = useState<AtlasMvpState>(atlasStateRef.current);
  const [events, setEvents] = useState(() => [
    { id: 'EVT-0001', time: formatTime(), source: 'CANONICAL', state: 'RECORDED', detail: 'page.view.opened · landing' },
    { id: 'EVT-0002', time: formatTime(), source: 'VIEW', state: 'BOUND', detail: 'live preview adapter requested' },
    { id: 'EVT-0003', time: formatTime(), source: 'HOTSPOT', state: 'WAITING', detail: 'landing-login-cta rect pending' },
  ]);

  const selectedNode = NODE_DETAILS[selectedNodeId];
  const isSupportedPage = pageId === 'landing';
  const activeTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0];
  const actionState: Record<ActionKind, UiActionState> = {
    github: [...atlasState.actions].reverse().find((action) => action.integration === 'GITHUB')?.state ?? 'IDLE',
    discord: [...atlasState.actions].reverse().find((action) => action.integration === 'DISCORD')?.state ?? 'IDLE',
  };

  const appendEvent = (source: string, state: string, detail: string) => {
    const nextSequence = eventSequenceRef.current;
    eventSequenceRef.current += 1;
    setEvents((current) => [
      ...current,
      {
        id: `EVT-${String(nextSequence).padStart(4, '0')}`,
        time: formatTime(),
        source,
        state,
        detail,
      },
    ]);
  };

  useEffect(() => {
    const receivePreviewMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!event.data || event.data.source !== 'bangcheck-atlas-preview') return;
      if (event.data.type !== 'ATLAS_NODE_RECTS' || !Array.isArray(event.data.nodes)) return;

      const loginCta = event.data.nodes.find(
        (node: { id?: string }) => node.id === 'landing-login-cta',
      );
      if (!loginCta?.rect) return;

      const nextRect = {
        x: Number(loginCta.rect.x),
        y: Number(loginCta.rect.y),
        width: Number(loginCta.rect.width),
        height: Number(loginCta.rect.height),
        ready: true,
      };
      setHotspot(nextRect);
      setEvents((current) => current.some((item) => item.detail === 'landing-login-cta rect synchronized')
        ? current
        : [
            ...current,
            {
              id: `EVT-${String(eventSequenceRef.current++).padStart(4, '0')}`,
              time: formatTime(),
              source: 'HOTSPOT',
              state: 'SYNCED',
              detail: 'landing-login-cta rect synchronized',
            },
          ]);
    };

    window.addEventListener('message', receivePreviewMessage);
    return () => window.removeEventListener('message', receivePreviewMessage);
  }, []);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

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
    const request = transitionAction(atlasStateRef.current, {
      type: 'REQUEST_ACTION',
      integration,
      operation,
      idempotencyKey: `atlas-${kind}-landing-v1`,
      aggregateRef: { type: 'PAGE', id: 'page-landing' },
      projectionId,
      input: kind === 'github'
        ? { title: '[Atlas] 랜딩 인증 경로 점검', sourceNodeId: selectedNodeId }
        : { channel: 'project-atlas-local', sourceNodeId: selectedNodeId },
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

  const inspectorRows = useMemo(() => [
    { label: 'API / TARGET', value: selectedNode.endpoint, icon: 'solar:server-path-outline' },
    { label: 'AUTH', value: selectedNode.auth, icon: 'solar:key-minimalistic-square-outline' },
    { label: 'EXCEPTION', value: selectedNode.exception, icon: 'solar:danger-triangle-outline' },
    { label: 'LOG', value: selectedNode.log, icon: 'solar:document-text-outline' },
    { label: 'METRIC', value: selectedNode.metric, icon: 'solar:chart-square-outline' },
    { label: 'TRACE', value: selectedNode.trace, icon: 'solar:routing-outline' },
    { label: 'LINKED ISSUE', value: selectedNode.issue, icon: 'solar:link-square-outline' },
  ], [selectedNode]);

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
          <strong>첫 진입 · 랜딩 / DETAIL CANVAS</strong>
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
          <em>REV 0007</em>
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
          <span className="is-live"><i /> VIEW LIVE</span>
          <span><i /> HOTSPOT {hotspot.ready ? 'SYNCED' : 'WAITING'}</span>
          <strong>{activeTheme.description}</strong>
        </div>
      </section>

      {!isSupportedPage && (
        <div className="atlas-unsupported">
          <Icon icon="solar:construction-outline" width={19} />
          <span><strong>{pageId}</strong> 상세 캔버스는 다음 walking skeleton에서 연결됩니다.</span>
          <Link to={ROUTES.PROJECT_PAGE('landing')}>LANDING 열기</Link>
        </div>
      )}

      <div className="atlas-workspace">
        <section className="atlas-canvas-panel">
          <div className="atlas-canvas-heading">
            <div>
              <span>PAGE SYSTEM / WALKING SKELETON 01</span>
              <h1>VIEW → FRONT → BACK → PROJECTION</h1>
            </div>
            <div className="atlas-coordinate">
              <span>X {Math.round(hotspot.x).toString().padStart(4, '0')}</span>
              <span>Y {Math.round(hotspot.y).toString().padStart(4, '0')}</span>
              <span>W {Math.round(hotspot.width).toString().padStart(4, '0')}</span>
              <span>H {Math.round(hotspot.height).toString().padStart(4, '0')}</span>
            </div>
          </div>

          <div className="atlas-system-grid">
            <div className="atlas-lane atlas-front-lane">
              <div className="atlas-lane-heading">
                <span>01 / FRONT</span>
                <strong>INTERACTION</strong>
                <small>DOM · ROUTER · STATE</small>
              </div>
              <div className="atlas-lane-bus" aria-hidden="true"><i /></div>
              <div className="atlas-node-list">
                {FRONT_NODES.map((nodeId) => {
                  const node = NODE_DETAILS[nodeId];
                  return (
                    <button
                      type="button"
                      key={nodeId}
                      className={`atlas-node ${selectedNodeId === nodeId ? 'is-selected' : ''}`}
                      onClick={() => setSelectedNodeId(nodeId)}
                    >
                      <span className="atlas-node-port" />
                      <span className="atlas-node-topline">
                        <small>{node.sequence}</small>
                        <em data-state={node.state}>{node.state}</em>
                      </span>
                      <span className="atlas-node-title">
                        <Icon icon={node.icon} width={18} />
                        <strong>{node.title}</strong>
                      </span>
                      <span className="atlas-node-subtitle">{node.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="atlas-view-column">
              <div className="atlas-flow-marker">
                <span>FLOW BUS</span><i />SIGNAL / BI-DIRECTIONAL
              </div>
              <div className="atlas-view-frame">
                <div className="atlas-view-frame-head">
                  <div>
                    <i /><i /><i />
                    <span>LIVE VIEW / {window.location.origin}/?atlasPreview=1</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => iframeRef.current?.contentWindow?.location.reload()}
                    title="Preview reload"
                  >
                    <Icon icon="solar:refresh-outline" width={14} />
                    RELOAD
                  </button>
                </div>
                <div className="atlas-preview-stage">
                  <iframe
                    ref={iframeRef}
                    title="BangCheck landing live preview"
                    src="/?atlasPreview=1"
                    onLoad={() => {
                      setHotspot((current) => ({ ...current, ready: false }));
                      appendEvent('VIEW', 'LOADED', 'same-origin landing iframe loaded');
                    }}
                  />
                  {hotspot.ready && (
                    <button
                      type="button"
                      className={`atlas-hotspot ${selectedNodeId === 'landing-login-cta' ? 'is-selected' : ''}`}
                      style={{
                        left: hotspot.x,
                        top: hotspot.y,
                        width: hotspot.width,
                        height: hotspot.height,
                      }}
                      onClick={() => setSelectedNodeId('landing-login-cta')}
                      aria-label="체크리스트 시작하기 hotspot inspect"
                    >
                      <span>F.01 / HOTSPOT</span>
                      <i /><i /><i /><i />
                    </button>
                  )}
                  {!hotspot.ready && (
                    <div className="atlas-hotspot-waiting">
                      <Icon icon="solar:radar-2-outline" width={22} />
                      DOM RECT WAITING
                    </div>
                  )}
                </div>
                <div className="atlas-view-frame-foot">
                  <span><i className="is-green" /> SAME ORIGIN</span>
                  <span><i /> RESPONSIVE VIEWPORT</span>
                  <strong>{hotspot.ready ? '1 BOUND ELEMENT' : 'SCANNING DOM'}</strong>
                </div>
              </div>
            </div>

            <div className="atlas-lane atlas-back-lane">
              <div className="atlas-lane-heading">
                <span>02 / BACK</span>
                <strong>EXECUTION</strong>
                <small>API · FILTER · OUTBOX</small>
              </div>
              <div className="atlas-lane-bus" aria-hidden="true"><i /></div>
              <div className="atlas-node-list">
                {BACK_NODES.map((nodeId) => {
                  const node = NODE_DETAILS[nodeId];
                  return (
                    <button
                      type="button"
                      key={nodeId}
                      className={`atlas-node ${selectedNodeId === nodeId ? 'is-selected' : ''}`}
                      onClick={() => setSelectedNodeId(nodeId)}
                    >
                      <span className="atlas-node-port" />
                      <span className="atlas-node-topline">
                        <small>{node.sequence}</small>
                        <em data-state={node.state}>{node.state}</em>
                      </span>
                      <span className="atlas-node-title">
                        <Icon icon={node.icon} width={18} />
                        <strong>{node.title}</strong>
                      </span>
                      <span className="atlas-node-subtitle">{node.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <aside className="atlas-inspector">
          <div className="atlas-inspector-head">
            <span>NODE INSPECTOR / {selectedNode.sequence}</span>
            <div>
              <i data-state={selectedNode.state} />
              {selectedNode.state}
            </div>
          </div>
          <div className="atlas-inspector-title">
            <span><Icon icon={selectedNode.icon} width={24} /></span>
            <div>
              <small>{selectedNode.lane} NODE</small>
              <h2>{selectedNode.title}</h2>
              <p>{selectedNode.subtitle}</p>
            </div>
          </div>
          <div className="atlas-method-line">
            <strong>{selectedNode.method}</strong>
            <span>{selectedNode.endpoint}</span>
          </div>

          <div className="atlas-inspector-rows">
            {inspectorRows.map((row, index) => (
              <div key={row.label}>
                <span><Icon icon={row.icon} width={14} /> {String(index + 1).padStart(2, '0')} / {row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>

          <div className="atlas-local-actions">
            <div>
              <span>ACTION ADAPTER</span>
              <strong>EXTERNAL WRITE DISABLED</strong>
            </div>
            <p>실제 GitHub·Discord 호출 없이 동일한 상태 전이와 감사 이벤트만 기록합니다.</p>
            <p>
              OUTBOX {atlasState.outbox.length.toString().padStart(2, '0')}
              {' · '}
              APPLIED {atlasState.projections.filter((projection) => projection.state === 'APPLIED').length.toString().padStart(2, '0')}
            </p>
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
