/**
 * 대시보드 아래 — PM이 이어서 묻는 것들.
 *
 *   왜 이렇게 지었나   의사결정 기록
 *   무엇이 위험한가   결함 (registry 실측)
 *   무엇이 지켜지나   테스트 (registry의 tests가 정본)
 *   누가 무엇을 했나   GitHub 이슈·PR
 *
 * 마지막 칸은 아직 연결 규약이 없어 비어 있다. 채워진 척하지 않고 비어 있다고
 * 말한다 — 없는 것을 있는 것처럼 그리면 그 화면을 근거로 잘못된 결정이 나온다.
 *
 * 펼침은 아코디언이다. 결함 상세를 모달로 띄우지 않는 이유는 이 카드 자체가 이미
 * 모달이기 때문이다. 모달 위 모달은 닫기 동선이 겹쳐 Esc가 무엇을 닫는지 모르게 된다.
 * 같은 이유로 이 안에 두 번째 스크롤 컨테이너를 두지 않는다 — Y 스크롤은
 * .research-detail 하나뿐이고, 펼친 내용은 그 스크롤을 늘린다.
 */
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { hasLinkSource } from '../atlas-snapshot';
import type {
  AtlasDefectLifecycle,
  AtlasSnapshotDefect,
  AtlasSnapshotFeature,
} from '@/types/atlas-snapshot';
import type { ResearchDecision } from '@/types/research';

const DISPOSITION_LABEL: Record<string, string> = {
  UNDECIDED: '결정 필요',
  FIX_PLANNED: '수정 예정',
  RECORD_ONLY: '기록만',
  NEEDS_PRODUCT_DECISION: '제품 결정 필요',
  FIX_WHEN_SLICE_MIGRATED: '이관 시 수정',
};

/**
 * 생애주기 배지 문구. note는 "왜 이 상태인가"를 적는다 —
 * OBSERVED는 나쁜 상태가 아니라 아직 아무도 이슈로 올리지 않았다는 사실일 뿐이다.
 */
const LIFECYCLE_META: Record<AtlasDefectLifecycle, { label: string; note: string; icon: string }> = {
  OBSERVED: { label: '관측됨', note: '이슈 미등록', icon: 'solar:eye-outline' },
  TRACKED: { label: '추적 중', note: '이슈 등록됨', icon: 'solar:bookmark-outline' },
  IN_PROGRESS: { label: '수정 중', note: 'PR 열림', icon: 'solar:hammer-outline' },
  RESOLVED: { label: '해결됨', note: 'PR 머지됨', icon: 'solar:check-circle-bold' },
};

/** 결함 하나에 기능 제목을 얹은 것. 결함은 여러 기능에 걸릴 수 있어 한 번만 보여준다. */
type BriefDefect = AtlasSnapshotDefect & { featureTitle: string };

function collectDefects(features: AtlasSnapshotFeature[]): BriefDefect[] {
  return features
    .flatMap((feature) =>
      feature.defects.map((defect) => ({ ...defect, featureTitle: feature.title })),
    )
    .filter((defect, index, all) => all.findIndex((item) => item.id === defect.id) === index)
    .sort((a, b) => a.severity.localeCompare(b.severity));
}

function DefectCard({
  defect,
  isOpen,
  onToggle,
}: {
  defect: BriefDefect;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const lifecycle = LIFECYCLE_META[defect.lifecycle];
  const panelId = `defect-panel-${defect.id}`;

  return (
    <article data-severity={defect.severity} className={isOpen ? 'is-open' : ''}>
      <button
        type="button"
        className="brief-defect-summary"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="brief-defect-head">
          <span className={`brief-severity is-${defect.severity}`}>{defect.severity}</span>
          <code>{defect.id}</code>
          <span className={`brief-lifecycle is-${defect.lifecycle}`}>
            <Icon icon={lifecycle.icon} width={11} />
            {lifecycle.label}
          </span>
          <em>{DISPOSITION_LABEL[defect.disposition] ?? defect.disposition}</em>
          <Icon
            className="brief-defect-caret"
            icon="solar:alt-arrow-down-outline"
            width={13}
            aria-hidden="true"
          />
        </span>
        <strong>{defect.title}</strong>
        <small>{defect.featureTitle}</small>
      </button>

      {isOpen && (
        <div className="brief-defect-detail" id={panelId}>
          {defect.detail && <p>{defect.detail}</p>}

          {/* 측정 내용 — 어디서 봤는지가 없으면 확인하러 갈 수 없다. */}
          {defect.evidence ? (
            <dl className="brief-evidence">
              <div>
                <dt>파일</dt>
                <dd><code>{defect.evidence.path}</code></dd>
              </div>
              {defect.evidence.symbol && (
                <div>
                  <dt>심볼</dt>
                  <dd><code>{defect.evidence.symbol}</code></dd>
                </div>
              )}
              {defect.evidence.line !== null && (
                <div>
                  <dt>줄</dt>
                  <dd><code>{defect.evidence.line}</code></dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="brief-defect-noevidence">관측 위치가 registry에 적혀 있지 않아요.</p>
          )}

          <div className="brief-defect-facts">
            <span>
              <small>상태</small>
              {lifecycle.label} · {defect.issue ? `이슈 #${defect.issue}` : lifecycle.note}
            </span>
            <span>
              <small>처리 방침</small>
              {DISPOSITION_LABEL[defect.disposition] ?? defect.disposition}
            </span>
            {defect.relatedFeature && (
              <span>
                <small>연관 기능</small>
                <code>{defect.relatedFeature}</code>
              </span>
            )}
            {defect.relatedStory && (
              <span>
                <small>연관 스토리</small>
                <code>{defect.relatedStory}</code>
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export function PageBriefBody({
  decisions,
  features,
}: {
  decisions: ResearchDecision[];
  features: AtlasSnapshotFeature[];
}) {
  const [openDefectId, setOpenDefectId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const defects = collectDefects(features);
  // 해결된 결함은 기본으로 접는다 — 지금 봐야 하는 것은 아직 열려 있는 것이다.
  // 현재 RESOLVED가 0건이라 토글이 안 보이는 게 정상이며, 그건 데이터의 사실이지 미구현이 아니다.
  const openDefects = defects.filter((defect) => defect.lifecycle !== 'RESOLVED');
  const resolvedDefects = defects.filter((defect) => defect.lifecycle === 'RESOLVED');

  const toggleDefect = (id: string) => setOpenDefectId((current) => (current === id ? null : id));

  // 테스트는 registry의 tests가 정본이다. backend/src/test에 무엇이 있는지로 추측하지 않는다 —
  // 파일이 있다고 그 기능을 덮는다는 보장이 없고, 추측한 커버리지는 없는 것보다 나쁘다.
  const registeredFeatures = features.filter((feature) => feature.featureId !== null);
  const coveredFeatures = registeredFeatures.filter((feature) => feature.tests.length > 0);

  return (
    <div className="research-detail-body">
      <section className="brief-section">
        <div className="brief-section-title">
          <div>
            <span>WHY WE BUILT IT</span>
            <h2>의사결정</h2>
          </div>
          <Icon icon="solar:lightbulb-bolt-outline" width={19} />
        </div>

        {decisions.length > 0 ? (
          <div className="brief-decisions">
            {decisions.map((decision) => (
              <article key={`${decision.date}-${decision.title}`}>
                <time>{decision.date}</time>
                <div>
                  <strong>{decision.title}</strong>
                  <p>{decision.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="brief-empty">이 페이지에 남긴 결정 기록이 아직 없어요.</p>
        )}
      </section>

      <section className="brief-section">
        <div className="brief-section-title">
          <div>
            <span>OBSERVED RISK</span>
            <h2>결함</h2>
          </div>
          <strong>{defects.length}</strong>
        </div>

        {defects.length > 0 ? (
          <div className="brief-defects">
            {openDefects.map((defect) => (
              <DefectCard
                key={defect.id}
                defect={defect}
                isOpen={openDefectId === defect.id}
                onToggle={() => toggleDefect(defect.id)}
              />
            ))}

            {resolvedDefects.length > 0 && (
              <>
                <button
                  type="button"
                  className="brief-resolved-toggle"
                  onClick={() => setShowResolved((open) => !open)}
                  aria-expanded={showResolved}
                >
                  <Icon
                    icon={showResolved ? 'solar:alt-arrow-up-outline' : 'solar:alt-arrow-down-outline'}
                    width={13}
                  />
                  해결됨 {resolvedDefects.length}건
                </button>
                {showResolved &&
                  resolvedDefects.map((defect) => (
                    <DefectCard
                      key={defect.id}
                      defect={defect}
                      isOpen={openDefectId === defect.id}
                      onToggle={() => toggleDefect(defect.id)}
                    />
                  ))}
              </>
            )}
          </div>
        ) : (
          <p className="brief-empty">이 페이지의 기능에 등록된 결함이 없어요.</p>
        )}
      </section>

      <section className="brief-section">
        <div className="brief-section-title">
          <div>
            <span>TEST COVERAGE</span>
            <h2>테스트</h2>
          </div>
          <strong>
            {coveredFeatures.length}/{registeredFeatures.length}
          </strong>
        </div>

        {registeredFeatures.length === 0 ? (
          <p className="brief-empty">registry에 등재된 기능이 없어 덮을 대상도 없어요.</p>
        ) : (
          <>
            {/* 덮이지 않은 기능이 있다는 사실을 목록보다 먼저 말한다. 여기서 눈에 안 띄면
                "테스트 0"이라는 칩 하나로 끝났던 예전과 다를 게 없다. */}
            {coveredFeatures.length === 0 && (
              <div className="brief-uncovered">
                <Icon icon="solar:shield-cross-outline" width={17} />
                <div>
                  <strong>이 페이지의 기능을 덮는 테스트가 하나도 없어요</strong>
                  {/* "지금 코드가 도는 것은 확인됐지만"이라고 쓰여 있었다. 확인한 적 없다 —
                      스냅샷이 본 것은 registry가 가리킨 경로에 파일이 있다는 것뿐이다.
                      실행을 확인한 것처럼 말하면 이 화면 자체가 거짓 근거가 된다. */}
                  <p>
                    registry의 <code>tests</code>가 전부 비어 있어요. 코드가 있다는 것만
                    확인했을 뿐, 무엇이 깨지면 알 수 있는지는 아무도 답하지 못해요.
                  </p>
                </div>
              </div>
            )}

            <ul className="brief-tests">
              {registeredFeatures.map((feature) => (
                <li key={feature.featureId} className={feature.tests.length ? '' : 'is-uncovered'}>
                  <div className="brief-test-head">
                    <code>{feature.featureId}</code>
                    <strong>{feature.title}</strong>
                    <em>{feature.tests.length ? `${feature.tests.length}개` : '없음'}</em>
                  </div>
                  {feature.tests.length > 0 && (
                    <div className="brief-test-paths">
                      {feature.tests.map((path) => (
                        <code key={path}>{path}</code>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="brief-section">
        <div className="brief-section-title">
          <div>
            <span>GITHUB</span>
            <h2>이슈 · PR</h2>
          </div>
          <Icon icon="solar:code-square-outline" width={19} />
        </div>

        {/* 연결 원천이 생기면 이 자리가 목록으로 바뀐다. 그때까지는 왜 비었는지를 적는다. */}
        {hasLinkSource ? (
          <p className="brief-empty">이 페이지의 기능에 연결된 이슈·PR이 없어요.</p>
        ) : (
          <div className="brief-pending">
            <Icon icon="solar:link-broken-minimalistic-outline" width={17} />
            <div>
              <strong>아직 기능과 이어져 있지 않아요</strong>
              <p>
                지금 이슈·PR에는 기능 ID가 없어요. 라벨은 우선순위와 담당 영역만 말하고,
                <code>[MAP]</code> 같은 제목 접두는 어느 기능인지 가리지 못해요.
                연결 규약이 생기면 이 자리에 목록이 들어와요.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
