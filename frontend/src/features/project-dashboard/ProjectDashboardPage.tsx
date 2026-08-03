import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import {
  ARTIFACT_META,
  RESEARCH_NODES,
  RESEARCH_STATS,
  STATUS_META,
} from '@/features/research/research-data';
import type { ResearchArtifactKind } from '@/types/research';
import '@/features/research/research.css';
import './project-dashboard.css';

// 테마 정본은 research.css / project-atlas.css의 .project-map-theme-* 블록이다.
// 이 페이지는 선택 UI 없이 다른 Atlas 페이지가 저장한 값을 따라간다.
const THEME_IDS = ['vscode-light', 'vscode-dark', 'circuit', 'blueprint', 'terminal', 'amber'] as const;
type DashboardTheme = (typeof THEME_IDS)[number];

function getInitialTheme(): DashboardTheme {
  const savedTheme = window.localStorage.getItem('bangcheck-project-map-theme');
  return THEME_IDS.some((id) => id === savedTheme)
    ? savedTheme as DashboardTheme
    : 'vscode-light';
}

const P1_ITEMS = [
  { id: 'IDOR-RPT-13', label: '타인 리포트 조회', owner: '하지명', area: 'REPORT' },
  { id: 'IDOR-RPT-14', label: '타인 리포트 수정', owner: '하지명', area: 'REPORT' },
  { id: 'IDOR-ROOM-27', label: '타인 방 조회', owner: '하지명', area: 'ROOM' },
  { id: 'IDOR-ROOM-31', label: '타인 방 수정·삭제', owner: '하지명', area: 'ROOM' },
  { id: 'silent-500-juso', label: '주소검색 응답 미래핑', owner: '이민우', area: 'API' },
  { id: 'silent-500-geocoding', label: '지오코딩 응답 미래핑', owner: '이민우', area: 'API' },
];

const RELEASE_PHASES = [
  { label: '사용성 개선', value: 82, code: 'UX' },
  { label: 'API 핸들링 단위테스트', value: 64, code: 'QA' },
  { label: 'IDOR 보안 경계', value: 48, code: 'SEC' },
  { label: '문서 정본 이관', value: 35, code: 'DOC' },
];

const RECENT_ACTIVITY = [
  { time: '오늘 18:56', type: 'DESIGN', title: '프로젝트 페이지 맵 1차안 생성', actor: 'Woo Jong-Ho' },
  { time: '오늘 18:42', type: 'DOCS', title: '01_woo 원본 54개 무손실 이관', actor: 'Codex' },
  { time: '07.28 16:10', type: 'FRONTEND', title: '방 목록 필터·빈 상태 개선', actor: 'Frontend' },
  { time: '07.27 11:25', type: 'DECISION', title: '직선거리와 도보시간 의미 분리', actor: 'Product' },
];

function WorkspaceBrand() {
  return (
    <div className="research-brand">
      <div className="research-brand-mark" aria-hidden="true"><span /><span /><span /></div>
      <div><p>BANGCHECK</p><span>PROJECT ATLAS</span></div>
    </div>
  );
}

function WorkspaceSidebar() {
  return (
    <aside className="research-sidebar dashboard-sidebar">
      <div className="research-project-card">
        <div className="research-project-icon"><Icon icon="solar:home-2-bold-duotone" width={24} /></div>
        <div><strong>BangCheck</strong><span>ver 1.1 · Pilot</span></div>
        <button type="button" aria-label="프로젝트 메뉴" disabled title="MVP 이후 연결 예정"><Icon icon="solar:menu-dots-bold" width={18} /></button>
      </div>

      <nav className="research-navigation" aria-label="프로젝트 아카이브">
        <p className="research-section-label">PROJECT VIEW</p>
        <Link to={ROUTES.PROJECT_DASHBOARD} className="is-active">
          <Icon icon="solar:chart-square-outline" width={19} />
          대시보드
        </Link>
        <Link to={ROUTES.PROJECT_MAP}>
          <Icon icon="solar:widget-5-outline" width={19} />
          페이지 맵
          <span>{RESEARCH_STATS.pages}</span>
        </Link>
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
        <button type="button" disabled title="MVP 이후 연결 예정"><Icon icon="solar:calendar-mark-outline" width={19} />타임라인</button>
      </nav>

      <div className="dashboard-version-block">
        <div><span>ACTIVE VERSION</span><strong>ver 1.1</strong></div>
        <p>사용성 개선 + API 핸들링 단위테스트</p>
        <div className="dashboard-version-meta"><span>MAIN</span><span>PAUSED</span></div>
      </div>

      <div className="research-health-card">
        <div className="research-health-head"><span>MOCK 준비도</span><strong>{RESEARCH_STATS.readiness}%</strong></div>
        <div className="research-health-track"><span style={{ width: `${RESEARCH_STATS.readiness}%` }} /></div>
        <p><span /> SNAPSHOT · P1 6건</p>
      </div>
    </aside>
  );
}

export default function ProjectDashboardPage() {
  const theme = getInitialTheme();
  const coverage = (Object.keys(ARTIFACT_META) as ResearchArtifactKind[]).map((kind) => {
    const artifacts = RESEARCH_NODES.flatMap((node) => node.artifacts).filter((item) => item.kind === kind);
    const ready = artifacts.filter((item) => item.status === 'ready').length;
    return {
      kind,
      total: artifacts.length,
      ready,
      value: artifacts.length === 0 ? 0 : Math.round((ready / artifacts.length) * 100),
    };
  });

  return (
    <main className={`research-shell dashboard-shell project-map-theme-${theme}`}>
      <header className="research-topbar">
        <WorkspaceBrand />
        <div className="research-topbar-title">
          <span className="research-breadcrumb">Workspace / Control room</span>
          <strong>프로젝트 대시보드</strong>
        </div>
        <div className="research-topbar-actions">
          <span className="dashboard-sync-state"><i /> MOCK SNAPSHOT · DEV ONLY</span>
          <button type="button" className="research-share-button" disabled title="MVP 이후 연결 예정"><Icon icon="solar:share-outline" width={17} />공유</button>
        </div>
      </header>

      <div className="research-workspace">
        <WorkspaceSidebar />

        <section className="dashboard-main">
          <div className="dashboard-heading">
            <div>
              <div className="dashboard-heading-code"><span>CTRL / 01</span><i /> PILOT WORKSPACE</div>
              <h1>오늘의 BangCheck</h1>
              <p>지금 어디까지 왔고, 무엇을 먼저 해결해야 하는지 확인하세요.</p>
            </div>
            <div className="dashboard-heading-actions">
              <button type="button"><Icon icon="solar:refresh-outline" width={16} />새로고침</button>
              <Link to={ROUTES.PROJECT_MAP}><Icon icon="solar:map-arrow-square-outline" width={16} />페이지 맵 열기</Link>
            </div>
          </div>

          <section className="dashboard-metrics" aria-label="핵심 프로젝트 지표">
            <article>
              <span className="dashboard-metric-code">K-01</span>
              <Icon icon="solar:radar-2-outline" width={20} />
              <p>전체 준비도</p>
              <strong>{RESEARCH_STATS.readiness}<small>%</small></strong>
              <div><span style={{ width: `${RESEARCH_STATS.readiness}%` }} /></div>
            </article>
            <article>
              <span className="dashboard-metric-code">K-02</span>
              <Icon icon="solar:widget-5-outline" width={20} />
              <p>연결된 페이지</p>
              <strong>{RESEARCH_STATS.pages}<small> pages</small></strong>
              <em>4개 사용자 여정</em>
            </article>
            <article className="is-alert">
              <span className="dashboard-metric-code">K-03</span>
              <Icon icon="solar:shield-warning-outline" width={20} />
              <p>P1 해결 필요</p>
              <strong>6<small> issues</small></strong>
              <em>보안 4 · API 2</em>
            </article>
            <article>
              <span className="dashboard-metric-code">K-04</span>
              <Icon icon="solar:folder-with-files-outline" width={20} />
              <p>연결된 자료</p>
              <strong>{RESEARCH_STATS.resources}<small> items</small></strong>
              <em>결정 기록 {RESEARCH_STATS.decisions}개</em>
            </article>
          </section>

          <div className="dashboard-grid">
            <section className="dashboard-panel dashboard-release">
              <div className="dashboard-panel-head">
                <div><span>RELEASE CONTROL</span><h2>ver 1.1 진행 상태</h2></div>
                <strong>2026.06.14 — NOW</strong>
              </div>
              <div className="dashboard-release-summary">
                <div>
                  <span>ACTIVE SCOPE</span>
                  <strong>4 / 4</strong>
                  <p>핵심 작업축이 모두 진행 중입니다.</p>
                </div>
                <div className="dashboard-release-scale">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
              </div>
              <div className="dashboard-phase-list">
                {RELEASE_PHASES.map((phase) => (
                  <div className="dashboard-phase" key={phase.code}>
                    <code>{phase.code}</code>
                    <span>{phase.label}</span>
                    <div><i style={{ width: `${phase.value}%` }} /></div>
                    <strong>{phase.value}%</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-panel dashboard-risk">
              <div className="dashboard-panel-head">
                <div><span>PRIORITY QUEUE</span><h2>P1 위험 신호</h2></div>
                <strong className="is-danger">06 OPEN</strong>
              </div>
              <div className="dashboard-risk-list">
                {P1_ITEMS.map((item, index) => (
                  <article key={item.id}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div><strong>{item.id}</strong><p>{item.label}</p></div>
                    <code>{item.area}</code>
                    <em>{item.owner}</em>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel dashboard-pages">
              <div className="dashboard-panel-head">
                <div><span>PAGE MATRIX</span><h2>페이지 준비도</h2></div>
                <Link to={ROUTES.PROJECT_MAP}>전체 맵 보기 <Icon icon="solar:arrow-right-outline" width={15} /></Link>
              </div>
              <div className="dashboard-page-matrix">
                {RESEARCH_NODES.map((node) => {
                  const meta = STATUS_META[node.status];
                  return (
                    <Link to={ROUTES.PROJECT_MAP} key={node.id}>
                      <div className="dashboard-page-index">{node.sequence}</div>
                      <span className="dashboard-page-icon"><Icon icon={node.icon} width={19} /></span>
                      <div className="dashboard-page-copy">
                        <strong>{node.title}</strong>
                        <span>{node.route}</span>
                      </div>
                      <div className="dashboard-page-value">
                        <strong>{node.progress}%</strong>
                        <span style={{ color: meta.color }}><i style={{ background: meta.color }} />{meta.label}</span>
                      </div>
                      <div className="dashboard-page-bar"><span style={{ width: `${node.progress}%` }} /></div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="dashboard-panel dashboard-coverage">
              <div className="dashboard-panel-head">
                <div><span>ARCHIVE COVERAGE</span><h2>팀별 자료 연결</h2></div>
                <strong>{RESEARCH_STATS.resources} TOTAL</strong>
              </div>
              <div className="dashboard-coverage-list">
                {coverage.map((item) => {
                  const meta = ARTIFACT_META[item.kind];
                  return (
                    <div key={item.kind}>
                      <span style={{ color: meta.color }}><Icon icon={meta.icon} width={17} /></span>
                      <div>
                        <p><strong>{meta.label}</strong><em>{item.ready}/{item.total}</em></p>
                        <div><i style={{ width: `${item.value}%`, background: meta.color }} /></div>
                      </div>
                      <strong>{item.value}%</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="dashboard-panel dashboard-activity">
              <div className="dashboard-panel-head">
                <div><span>CHANGE FEED</span><h2>최근 움직임</h2></div>
                <button type="button">모두 보기</button>
              </div>
              <div className="dashboard-activity-list">
                {RECENT_ACTIVITY.map((activity, index) => (
                  <article key={activity.title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <time>{activity.time}</time>
                    <code>{activity.type}</code>
                    <div><strong>{activity.title}</strong><p>{activity.actor}</p></div>
                  </article>
                ))}
              </div>
            </section>

            <section className="dashboard-panel dashboard-migration">
              <div className="dashboard-panel-head">
                <div><span>DOCUMENT SYSTEM</span><h2>01_www 이관 상태</h2></div>
                <strong className="is-ok">STAGE 1 OK</strong>
              </div>
              <div className="dashboard-migration-body">
                <div className="dashboard-migration-count"><strong>54</strong><span>/ 54 FILES</span><p>SHA-256 원본 검증 완료</p></div>
                <div className="dashboard-migration-flow">
                  <div><span>01_WOO</span><strong>LEGACY</strong></div>
                  <i /><i /><i />
                  <div><span>01_WWW</span><strong>ARCHIVE</strong></div>
                </div>
                <p><Icon icon="solar:info-circle-outline" width={14} />Epic·Story ID 충돌 정리 후 정본화 단계로 이동합니다.</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
