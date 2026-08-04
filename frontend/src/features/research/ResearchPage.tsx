import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { RESEARCH_NODES, STATUS_META } from './research-data';
import { findSnapshotPage, rollupPage } from './atlas-snapshot';
import { useMapViewport } from './use-map-viewport';
import { FeatureDashboard } from './components/FeatureDashboard';
import { PageBriefBody } from './components/PageBriefBody';
import './research.css';

const CANVAS_WIDTH = 1480;
const CANVAS_HEIGHT = 900;
const FLOW_COLUMNS = [219, 561, 903, 1245];
type MapTheme = 'vscode-light' | 'vscode-dark' | 'circuit' | 'blueprint' | 'terminal' | 'amber';

const MAP_THEMES: Array<{
  id: MapTheme;
  label: string;
  description: string;
  background: string;
  accent: string;
}> = [
  { id: 'vscode-light', label: 'LIGHT', description: 'VS Code Light+', background: '#ffffff', accent: '#005fb8' },
  { id: 'vscode-dark', label: 'DARK', description: 'VS Code Dark+', background: '#1e1e1e', accent: '#3794ff' },
  { id: 'circuit', label: 'CIRCUIT', description: '청록 회로', background: '#071012', accent: '#58c3ad' },
  { id: 'blueprint', label: 'BLUEPRINT', description: '청색 설계도', background: '#061426', accent: '#48bfff' },
  { id: 'terminal', label: 'TERMINAL', description: '인광 터미널', background: '#050906', accent: '#63f58b' },
  { id: 'amber', label: 'AMBER', description: '주황 계측기', background: '#120d07', accent: '#ffad4a' },
];

function getInitialTheme(): MapTheme {
  const savedTheme = window.localStorage.getItem('bangcheck-project-map-theme');
  return MAP_THEMES.some((theme) => theme.id === savedTheme)
    ? savedTheme as MapTheme
    : 'vscode-light';
}

export default function ProjectMapPage() {
  const [selectedId, setSelectedId] = useState('landing');
  const [theme, setTheme] = useState<MapTheme>(getInitialTheme);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const viewport = useMapViewport(CANVAS_WIDTH, CANVAS_HEIGHT);
  // aria-modal="true"를 선언한 이상 포커스도 실제로 갇혀야 한다.
  // 트랩 로직은 캔버스의 카드 상세(AtlasCardDetail)와 같은 것을 쓴다.
  const detailRef = useFocusTrap<HTMLDivElement>(isDetailOpen);

  const selectedNode = RESEARCH_NODES.find((node) => node.id === selectedId) ?? RESEARCH_NODES[0];
  // 노드가 든 route로 스냅샷을 찾는다. 스냅샷은 생성물이라 없을 수 있다.
  const snapshotFeatures = findSnapshotPage(selectedNode.route)?.features ?? [];
  const rollup = rollupPage(snapshotFeatures);

  /**
   * 노드를 누르면 그 자리에서 카드로 펼친다. 예전에는 landing만 곧장 캔버스
   * URL로 튕겼는데, 지도를 보다가 화면이 통째로 바뀌어 맥락이 끊겼다.
   * 캔버스로 가는 길은 카드 안의 링크로만 남긴다.
   */
  const selectNode = (id: string) => {
    if (viewport.didDrag()) return;
    setSelectedId(id);
    setIsDetailOpen(true);
  };

  const closeDetail = () => setIsDetailOpen(false);

  useEffect(() => {
    if (!isDetailOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDetailOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen]);

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
        <section className="research-main">
          <div
            ref={viewport.viewportRef}
            className={`research-canvas-viewport ${viewport.isPanning ? 'is-panning' : ''}`}
            onPointerDown={viewport.beginPan}
            style={{
              // 바탕 격자가 캔버스와 같이 움직이고 같이 커져야 끌고 있다는 게 보인다.
              '--atlas-grid-scale': viewport.view.zoom,
              '--atlas-grid-x': `${viewport.view.x}px`,
              '--atlas-grid-y': `${viewport.view.y}px`,
            } as React.CSSProperties}
          >
            <div className="research-canvas-corner">
              <Icon icon="solar:map-arrow-square-outline" width={16} />
              사용자 여정 기준
            </div>

            <div
              className={`research-canvas ${viewport.isSmooth ? 'is-smooth' : ''}`}
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                transform: `translate(${viewport.view.x}px, ${viewport.view.y}px) scale(${viewport.view.zoom})`,
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
                const isSelected = selectedNode.id === node.id;
                const readyCount = node.artifacts.filter((artifact) => artifact.status === 'ready').length;

                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`research-node ${isSelected ? 'is-selected' : ''}`}
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
              <button type="button" onClick={viewport.zoomIn} aria-label="확대">
                <Icon icon="solar:add-square-outline" width={19} />
              </button>
              <span>{Math.round(viewport.view.zoom * 100)}%</span>
              <button type="button" onClick={viewport.zoomOut} aria-label="축소">
                <Icon icon="solar:minus-square-outline" width={19} />
              </button>
              <button type="button" onClick={() => viewport.fitToScreen()} aria-label="화면에 맞추기">
                <Icon icon="solar:maximize-square-minimalistic-outline" width={19} />
              </button>
              <em className="research-zoom-hint">휠 확대 · 끌어서 이동</em>
            </div>
          </div>
        </section>

        {isDetailOpen && (
        <div
          className="research-modal-scrim"
          onClick={closeDetail}
          onPointerDown={(event) => event.stopPropagation()}
        >
        <div
          className="research-detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby="research-detail-title"
          // 안에 포커스 가능한 컨트롤이 없을 때 포커스가 갈 자리. 트랩의 전제다.
          tabIndex={-1}
          ref={detailRef}
          onClick={(event) => event.stopPropagation()}
        >
          {/* 카드 직속이라야 sticky가 카드 스크롤을 기준으로 붙는다 — head 안에 두면 head와 함께 밀려난다. */}
          <button type="button" className="research-detail-close" onClick={closeDetail} aria-label="상세 카드 닫기">
            <Icon icon="solar:close-circle-outline" width={21} />
          </button>

          <div className="research-detail-head">
            <div className="research-detail-kicker">
              <span>{selectedNode.sequence}</span>
              PAGE BRIEF
            </div>
            <h1 id="research-detail-title">{selectedNode.title}</h1>
            <p>{selectedNode.description}</p>
            <div className="research-detail-meta">
              <span><Icon icon="solar:user-circle-outline" width={15} /> {selectedNode.owner}</span>
              <span><Icon icon="solar:calendar-outline" width={15} /> {selectedNode.updatedAt}</span>
              <span><Icon icon="solar:link-circle-outline" width={15} /> {selectedNode.route}</span>
            </div>
            {/* 캔버스로 나가는 유일한 문. 노드 id는 캔버스의 pageId와 같은 이름을 쓴다 —
                아직 등재되지 않은 페이지로 가도 캔버스가 안내 문구를 대신 띄운다. */}
            <Link className="research-open-canvas" to={ROUTES.PROJECT_PAGE(selectedNode.id)}>
              LIVE CANVAS 열기
              <Icon icon="solar:arrow-right-up-outline" width={16} />
            </Link>
            <div className="research-detail-tags">
              {selectedNode.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
          </div>

          {/* 대시보드는 고정, 그 아래만 스크롤한다 — 진행 상황은 스크롤로 밀려나면 안 된다. */}
          <div className="research-detail-summary">
            <div className="research-rollup">
              <span><strong>{rollup.featureCount}</strong> 기능</span>
              {/* '프론트/백엔드'는 파일이 관측된 기능 수다. 구현 완료 수가 아니다 —
                  숫자만 보면 진척률로 읽히므로 근거를 툴팁으로 붙여둔다. */}
              <span title="registry가 가리킨 프론트 경로에 파일이 있는 기능 수예요.">
                <strong>{rollup.frontBuilt}</strong> 프론트
              </span>
              <span title="registry가 가리킨 백엔드 경로에 파일이 있는 기능 수예요.">
                <strong>{rollup.backBuilt}</strong> 백엔드
              </span>
              {/* 결함은 ID 기준 dedupe 값이다(rollupPage). 본문 목록과 반드시 같은 수여야 한다. */}
              <span className={rollup.p1Count ? 'is-danger' : ''}>
                <strong>{rollup.defectCount}</strong> 결함{rollup.p1Count > 0 && ` · P1 ${rollup.p1Count}`}
              </span>
              <span className={rollup.testedCount ? '' : 'is-warn'}>
                <strong>{rollup.testedCount}</strong> 테스트 보유
              </span>
            </div>
            <FeatureDashboard features={snapshotFeatures} />
          </div>

          <PageBriefBody decisions={selectedNode.decisions} features={snapshotFeatures} />
        </div>
        </div>
        )}
      </div>
    </main>
  );
}
