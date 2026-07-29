import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { ARTIFACT_META, RESEARCH_NODES, RESEARCH_STATS, STATUS_META } from './research-data';
import type { ResearchArtifactKind, ResearchNodeStatus } from '@/types/research';
import './research.css';

const CANVAS_WIDTH = 1480;
const CANVAS_HEIGHT = 900;
const FLOW_COLUMNS = [219, 561, 903, 1245];
type MapTheme = 'circuit' | 'blueprint' | 'terminal' | 'amber';

const MAP_THEMES: Array<{
  id: MapTheme;
  label: string;
  description: string;
  background: string;
  accent: string;
}> = [
  { id: 'circuit', label: 'CIRCUIT', description: '청록 회로', background: '#071012', accent: '#58c3ad' },
  { id: 'blueprint', label: 'BLUEPRINT', description: '청색 설계도', background: '#061426', accent: '#48bfff' },
  { id: 'terminal', label: 'TERMINAL', description: '인광 터미널', background: '#050906', accent: '#63f58b' },
  { id: 'amber', label: 'AMBER', description: '주황 계측기', background: '#120d07', accent: '#ffad4a' },
];

function getInitialTheme(): MapTheme {
  const savedTheme = window.localStorage.getItem('bangcheck-project-map-theme');
  return MAP_THEMES.some((theme) => theme.id === savedTheme)
    ? savedTheme as MapTheme
    : 'circuit';
}

const statusFilters: Array<{ value: 'all' | ResearchNodeStatus; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'building', label: '개발 중' },
  { value: 'review', label: '검토 필요' },
  { value: 'live', label: '운영 중' },
  { value: 'planned', label: '예정' },
];

function ArtifactStatus({ status }: { status: 'ready' | 'working' | 'missing' }) {
  const meta = {
    ready: { label: '연결됨', icon: 'solar:check-circle-bold', className: 'is-ready' },
    working: { label: '진행 중', icon: 'solar:clock-circle-bold', className: 'is-working' },
    missing: { label: '필요', icon: 'solar:add-circle-bold', className: 'is-missing' },
  }[status];

  return (
    <span className={`research-artifact-status ${meta.className}`}>
      <Icon icon={meta.icon} width={13} />
      {meta.label}
    </span>
  );
}

export default function ProjectMapPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('landing');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ResearchNodeStatus>('all');
  const [discipline, setDiscipline] = useState<'all' | ResearchArtifactKind>('all');
  const [zoom, setZoom] = useState(0.86);
  const [theme, setTheme] = useState<MapTheme>(getInitialTheme);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(
    () => window.matchMedia('(min-width: 901px)').matches,
  );

  const selectedNode = RESEARCH_NODES.find((node) => node.id === selectedId) ?? RESEARCH_NODES[0];
  const normalizedQuery = query.trim().toLowerCase();

  const visibleNodeIds = useMemo(() => {
    return new Set(
      RESEARCH_NODES.filter((node) => {
        const matchesStatus = status === 'all' || node.status === status;
        const haystack = [
          node.title,
          node.description,
          node.route,
          ...node.tags,
          ...node.artifacts.flatMap((artifact) => [artifact.title, artifact.detail]),
        ].join(' ').toLowerCase();
        return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery));
      }).map((node) => node.id),
    );
  }, [normalizedQuery, status]);

  const selectedArtifacts = selectedNode.artifacts.filter(
    (artifact) => discipline === 'all' || artifact.kind === discipline,
  );

  const selectNode = (id: string) => {
    if (id === 'landing') {
      navigate(ROUTES.PROJECT_PAGE(id));
      return;
    }
    setSelectedId(id);
    setIsDetailOpen(true);
  };

  const selectTheme = (nextTheme: MapTheme) => {
    setTheme(nextTheme);
    window.localStorage.setItem('bangcheck-project-map-theme', nextTheme);
    setIsThemeMenuOpen(false);
  };

  const activeTheme = MAP_THEMES.find((item) => item.id === theme) ?? MAP_THEMES[0];

  return (
    <main className={`research-shell project-map-shell project-map-theme-${theme}`}>
      <header className="research-topbar">
        <div className="research-brand">
          <div className="research-brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p>BANGCHECK</p>
            <span>PROJECT ATLAS</span>
          </div>
        </div>

        <div className="research-topbar-title">
          <span className="research-breadcrumb">Workspace / Product map</span>
          <strong>방체크 한눈에 보기</strong>
        </div>

        <div className="research-topbar-actions">
          <span className="research-data-badge">MOCK DATA / DEV ONLY</span>
          <div className="research-theme-control">
            <button
              type="button"
              className="research-theme-trigger"
              onClick={() => setIsThemeMenuOpen((open) => !open)}
              aria-expanded={isThemeMenuOpen}
              aria-haspopup="menu"
            >
              <span
                className="research-theme-trigger-swatch"
                style={{ background: activeTheme.background, borderColor: activeTheme.accent }}
              >
                <i style={{ background: activeTheme.accent }} />
              </span>
              <span className="research-theme-trigger-copy">
                <small>THEME</small>
                <strong>{activeTheme.label}</strong>
              </span>
              <Icon icon="solar:alt-arrow-down-outline" width={14} />
            </button>

            {isThemeMenuOpen && (
              <div className="research-theme-menu" role="menu" aria-label="페이지 맵 테마">
                <div className="research-theme-menu-head">
                  <span>DISPLAY PROFILE</span>
                  <strong>테마 선택</strong>
                </div>
                <div className="research-theme-options">
                  {MAP_THEMES.map((item, index) => (
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={theme === item.id}
                      className={theme === item.id ? 'is-active' : ''}
                      key={item.id}
                      onClick={() => selectTheme(item.id)}
                    >
                      <span
                        className="research-theme-preview"
                        style={{ background: item.background, borderColor: item.accent }}
                      >
                        <i style={{ background: item.accent }} />
                        <i style={{ background: item.accent }} />
                        <i style={{ background: item.accent }} />
                      </span>
                      <span>
                        <small>0{index + 1}</small>
                        <strong>{item.label}</strong>
                        <em>{item.description}</em>
                      </span>
                      {theme === item.id && <Icon icon="solar:check-square-bold" width={15} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button type="button" className="research-share-button" disabled title="MVP 이후 연결 예정">
            <Icon icon="solar:share-outline" width={17} />
            공유
          </button>
        </div>
      </header>

      <div className="research-workspace">
        <aside className="research-sidebar">
          <div className="research-project-card">
            <div className="research-project-icon">
              <Icon icon="solar:home-2-bold-duotone" width={24} />
            </div>
            <div>
              <strong>BangCheck</strong>
              <span>ver 1.1 · Pilot</span>
            </div>
            <button type="button" aria-label="프로젝트 메뉴" disabled title="MVP 이후 연결 예정">
              <Icon icon="solar:menu-dots-bold" width={18} />
            </button>
          </div>

          <nav className="research-navigation" aria-label="프로젝트 아카이브">
            <p className="research-section-label">PROJECT VIEW</p>
            <Link to={ROUTES.PROJECT_DASHBOARD}>
              <Icon icon="solar:chart-square-outline" width={19} />
              대시보드
            </Link>
            <button type="button" className="is-active">
              <Icon icon="solar:widget-5-outline" width={19} />
              페이지 맵
              <span>{RESEARCH_STATS.pages}</span>
            </button>
            <button type="button" disabled title="MVP 이후 연결 예정">
              <Icon icon="solar:folder-with-files-outline" width={19} />
              자료 아카이브
              <span>{RESEARCH_STATS.resources}</span>
            </button>
            <button type="button" disabled title="MVP 이후 연결 예정">
              <Icon icon="solar:lightbulb-minimalistic-outline" width={19} />
              고민과 결정
              <span>{RESEARCH_STATS.decisions}</span>
            </button>
            <button type="button" disabled title="MVP 이후 연결 예정">
              <Icon icon="solar:calendar-mark-outline" width={19} />
              타임라인
            </button>
          </nav>

          <div className="research-discipline-filter">
            <p className="research-section-label">TEAM LENS</p>
            <button
              type="button"
              className={discipline === 'all' ? 'is-active' : ''}
              onClick={() => setDiscipline('all')}
            >
              <span className="research-discipline-dot is-all" />
              모든 자료
            </button>
            {(Object.entries(ARTIFACT_META) as Array<[ResearchArtifactKind, typeof ARTIFACT_META[ResearchArtifactKind]]>).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                className={discipline === key ? 'is-active' : ''}
                onClick={() => setDiscipline(key)}
              >
                <span className={`research-discipline-dot is-${key}`} />
                {meta.label}
              </button>
            ))}
          </div>

          <div className="research-health-card">
            <div className="research-health-head">
              <span>MOCK 준비도</span>
              <strong>{RESEARCH_STATS.readiness}%</strong>
            </div>
            <div className="research-health-track">
              <span style={{ width: `${RESEARCH_STATS.readiness}%` }} />
            </div>
            <p><span /> SNAPSHOT · P1 6건</p>
          </div>
        </aside>

        <section className="research-main">
          <div className="research-toolbar">
            <label className="research-search">
              <Icon icon="solar:magnifer-linear" width={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="페이지, 기능, 파일 검색"
                aria-label="페이지와 자료 검색"
              />
              <kbd>FILTER</kbd>
            </label>
            <div className="research-status-filters" role="group" aria-label="진행 상태 필터">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={status === filter.value ? 'is-active' : ''}
                  onClick={() => setStatus(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="research-result-count">
              <strong>{visibleNodeIds.size}</strong> / {RESEARCH_NODES.length} pages
            </div>
          </div>

          <div className="research-canvas-viewport">
            <div className="research-canvas-corner">
              <Icon icon="solar:map-arrow-square-outline" width={16} />
              사용자 여정 기준
            </div>

            <div
              className="research-canvas"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `scale(${zoom})`,
              }}
            >
              <div className="research-lane research-lane-discover">
                <span>01 · ENTRY</span>
                <p>서비스 진입과 인증</p>
              </div>
              <div className="research-lane research-lane-organize">
                <span>02 · MANAGE</span>
                <p>방과 계정 기록 관리</p>
              </div>
              <div className="research-lane research-lane-capture">
                <span>03 · CAPTURE</span>
                <p>현장 점검과 개인화</p>
              </div>
              <div className="research-lane research-lane-decide">
                <span>04 · DECIDE</span>
                <p>거리·조건 비교와 결정</p>
              </div>

              <svg className="research-connections" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} aria-hidden="true">
                <path className="research-flow-bus-track" d="M 219 430 H 1245" />
                <path className="research-flow-bus-signal" d="M 219 430 H 1245" />
                {FLOW_COLUMNS.map((x, index) => (
                  <g key={x} className="research-flow-column">
                    <path className="research-flow-tap" d={`M ${x} 368 V 480`} />
                    <rect x={x - 4} y={426} width="8" height="8" />
                    <text x={x + 10} y={419}>{String(index + 1).padStart(2, '0')}</text>
                  </g>
                ))}
              </svg>
              <div className="research-flow-label">
                <span>FLOW BUS</span>
                <i />
                SIGNAL / LEFT_TO_RIGHT
              </div>

              {RESEARCH_NODES.map((node) => {
                const statusMeta = STATUS_META[node.status];
                const isVisible = visibleNodeIds.has(node.id);
                const isSelected = selectedNode.id === node.id;
                const readyCount = node.artifacts.filter((artifact) => artifact.status === 'ready').length;

                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`research-node ${isSelected ? 'is-selected' : ''} ${isVisible ? '' : 'is-muted'}`}
                    style={{ left: node.position.x, top: node.position.y }}
                    data-row={node.position.y < 400 ? 'top' : 'bottom'}
                    onClick={() => selectNode(node.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="research-node-topline">
                      <span className="research-node-sequence">{node.sequence}</span>
                      <span className={`research-node-status status-${node.status}`}>
                        <i />
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="research-node-title">
                      <span><Icon icon={node.icon} width={22} /></span>
                      <div>
                        <small>{node.eyebrow}</small>
                        <strong>{node.title}</strong>
                      </div>
                    </div>
                    <p>{node.description}</p>
                    <div className="research-node-progress">
                      <span><i style={{ width: `${node.progress}%` }} /></span>
                      <strong>SEED {node.progress}%</strong>
                    </div>
                    <div className="research-node-footer">
                      <span><Icon icon="solar:folder-open-outline" width={14} /> {readyCount}/{node.artifacts.length} 자료</span>
                      <span>{node.route}</span>
                    </div>
                  </button>
                );
              })}

              <div className="research-canvas-note">
                <Icon icon="solar:pin-bold" width={17} />
                <div>
                  <strong>이 지도는 살아있는 문서예요</strong>
                  <p>페이지를 누르면 기획부터 QA까지 한 묶음으로 볼 수 있어요.</p>
                </div>
              </div>
            </div>

            <div className="research-zoom-controls">
              <button type="button" onClick={() => setZoom((value) => Math.min(1.08, value + 0.08))} aria-label="확대">
                <Icon icon="solar:add-square-outline" width={19} />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.max(0.62, value - 0.08))} aria-label="축소">
                <Icon icon="solar:minus-square-outline" width={19} />
              </button>
              <button type="button" onClick={() => setZoom(0.86)} aria-label="화면에 맞추기">
                <Icon icon="solar:maximize-square-minimalistic-outline" width={19} />
              </button>
            </div>

            {visibleNodeIds.size === 0 && (
              <div className="research-empty-search">
                <Icon icon="solar:map-point-remove-outline" width={34} />
                <strong>조건에 맞는 페이지가 없어요</strong>
                <button type="button" onClick={() => { setQuery(''); setStatus('all'); }}>필터 초기화</button>
              </div>
            )}
          </div>
        </section>

        <aside className={`research-detail ${isDetailOpen ? 'is-open' : ''}`}>
          <div className="research-detail-head">
            <button type="button" className="research-detail-close" onClick={() => setIsDetailOpen(false)} aria-label="상세 패널 닫기">
              <Icon icon="solar:close-circle-outline" width={21} />
            </button>
            <div className="research-detail-kicker">
              <span>{selectedNode.sequence}</span>
              PAGE BRIEF
            </div>
            <h1>{selectedNode.title}</h1>
            <p>{selectedNode.description}</p>
            <div className="research-detail-meta">
              <span><Icon icon="solar:user-circle-outline" width={15} /> {selectedNode.owner}</span>
              <span><Icon icon="solar:calendar-outline" width={15} /> {selectedNode.updatedAt}</span>
              <span><Icon icon="solar:link-circle-outline" width={15} /> {selectedNode.route}</span>
            </div>
            {selectedNode.id === 'landing' && (
              <Link className="research-open-canvas" to={ROUTES.PROJECT_PAGE(selectedNode.id)}>
                LIVE CANVAS 열기
                <Icon icon="solar:arrow-right-up-outline" width={16} />
              </Link>
            )}
            <div className="research-detail-tags">
              {selectedNode.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
          </div>

          <div className="research-detail-body">
            <section className="research-readiness">
              <div>
                <span>PAGE READINESS</span>
                <strong>{selectedNode.progress}%</strong>
              </div>
              <div><span style={{ width: `${selectedNode.progress}%` }} /></div>
            </section>

            <section className="research-artifacts">
              <div className="research-detail-section-title">
                <div>
                  <span>CONNECTED WORK</span>
                  <h2>개발 자료</h2>
                </div>
                <strong>{selectedArtifacts.length}</strong>
              </div>

              {selectedArtifacts.length > 0 ? selectedArtifacts.map((artifact) => {
                const meta = ARTIFACT_META[artifact.kind];
                return (
                  <button type="button" className="research-artifact" data-kind={artifact.kind} key={artifact.id}>
                    <span className={`research-artifact-icon is-${artifact.kind}`}>
                      <Icon icon={meta.icon} width={19} />
                    </span>
                    <span className="research-artifact-copy">
                      <small>{meta.label}</small>
                      <strong>{artifact.title}</strong>
                      <span>{artifact.path ?? artifact.detail}</span>
                    </span>
                    <ArtifactStatus status={artifact.status} />
                  </button>
                );
              }) : (
                <div className="research-artifact-empty">선택한 팀에 연결된 자료가 아직 없어요.</div>
              )}
            </section>

            <section className="research-decisions">
              <div className="research-detail-section-title">
                <div>
                  <span>WHY WE BUILT IT</span>
                  <h2>고민과 결정</h2>
                </div>
                <Icon icon="solar:lightbulb-bolt-outline" width={21} />
              </div>
              {selectedNode.decisions.length > 0 ? selectedNode.decisions.map((decision) => (
                <article key={`${decision.date}-${decision.title}`}>
                  <time>{decision.date}</time>
                  <div>
                    <strong>{decision.title}</strong>
                    <p>{decision.description}</p>
                  </div>
                </article>
              )) : (
                <button type="button" className="research-add-decision" disabled title="MVP 이후 연결 예정">
                  <Icon icon="solar:add-circle-outline" width={18} />
                  첫 결정 기록 남기기
                </button>
              )}
            </section>
          </div>
        </aside>

        {!isDetailOpen && (
          <button type="button" className="research-detail-reopen" onClick={() => setIsDetailOpen(true)}>
            <Icon icon="solar:sidebar-minimalistic-outline" width={20} />
            상세 보기
          </button>
        )}
      </div>
    </main>
  );
}
