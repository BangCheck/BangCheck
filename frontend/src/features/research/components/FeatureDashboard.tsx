/**
 * 기능 대시보드 — 이 페이지가 무엇으로 이루어졌고 각 조각이 어디까지 왔는지.
 *
 * 한 줄에 기능 하나. 프론트와 백엔드를 나란히 두는 이유는 PM이 가장 먼저 묻는
 * 것이 "어느 쪽이 막혀 있나"이기 때문이다.
 */
import { Icon } from '@iconify/react';
import type { AtlasLayerState, AtlasSnapshotFeature } from '@/types/atlas-snapshot';

/**
 * 레이어 배지 문구.
 *
 * 스냅샷 생성기가 실제로 본 것은 "registry가 가리킨 경로에 파일이 있는가" 하나뿐이다.
 * 그 파일이 비어 있는지, 아무도 안 쓰는 legacy인지, 실행되는지는 보지 않았다.
 * 그래서 예전의 '구현됨'은 관측하지 않은 것을 주장하는 문구였다 — '파일 있음'으로 낮춘다.
 */
const LAYER_META: Record<AtlasLayerState, { label: string; icon: string; note: string }> = {
  built: {
    label: '파일 있음',
    icon: 'solar:check-circle-bold',
    note: '이 경로에 파일이 있다는 것만 확인했어요. 동작 여부는 확인하지 않았어요.',
  },
  defect: {
    label: 'P1 결함',
    icon: 'solar:danger-triangle-bold',
    note: '파일은 있고, 이 레이어에서 관측된 P1 결함이 있어요.',
  },
  absent: {
    label: '파일 확인 안 됨',
    icon: 'solar:minus-circle-outline',
    note: 'registry에 경로가 없거나, 그 경로에 파일이 없어요.',
  },
};

function LayerBadge({ layer, state, path }: { layer: string; state: AtlasLayerState; path: string | null }) {
  const meta = LAYER_META[state];
  return (
    <span className={`feature-layer is-${state}`} title={path ? `${path}\n${meta.note}` : meta.note}>
      <small>{layer}</small>
      <Icon icon={meta.icon} width={13} />
      {meta.label}
    </span>
  );
}

export function FeatureDashboard({ features }: { features: AtlasSnapshotFeature[] }) {
  // 예전 문구는 "화면만 있고 기능은 아직 붙지 않았다"였다. 그건 추론이고,
  // 랜딩(/)이나 /login-error처럼 화면 안에서만 도는 페이지에는 거짓이다.
  // 관측한 사실은 "API 호출을 찾지 못했다" 하나뿐이므로 거기까지만 말한다.
  if (features.length === 0) {
    return (
      <div className="feature-dashboard-empty">
        <Icon icon="solar:inbox-outline" width={17} />
        이 페이지에서 부르는 API 호출을 찾지 못했어요. 화면 안에서만 도는 페이지일 수도 있어요.
      </div>
    );
  }

  return (
    <div className="feature-dashboard">
      {/* 범례. 배지 하나하나가 무엇을 근거로 한 말인지 밝히지 않으면
          '파일 있음'조차 "다 됐다"로 읽힌다. */}
      <p className="feature-dashboard-legend">
        <Icon icon="solar:info-circle-outline" width={12} />
        FRONT · BACK은 registry가 가리킨 경로에 <b>파일이 있는지</b>만 본 것이에요.
        코드가 도는지, 그 파일이 실제로 쓰이는지는 확인하지 않았어요.
      </p>

      {features.map((feature, index) => {
        const isUnmapped = feature.featureId === null;
        const p1 = feature.defects.filter((defect) => defect.severity === 'P1').length;

        return (
          <div
            className={`feature-row ${isUnmapped ? 'is-unmapped' : ''}`}
            key={feature.featureId ?? `unmapped-${index}`}
          >
            <div className="feature-row-head">
              <span className="feature-row-id">{feature.featureId ?? 'UNMAPPED'}</span>
              <strong>{feature.title}</strong>
              {/* 담당은 "누구에게 물어야 하나"의 답이라 흐린 회색으로 두면 쓸모가 없다.
                  칩으로 묶고 아이콘을 붙여 제목 옆에서도 눈에 걸리게 한다. */}
              {feature.owner && (
                <em className="feature-owner">
                  <Icon icon="solar:user-rounded-bold" width={11} />
                  {feature.owner}
                </em>
              )}
            </div>

            <div className="feature-row-layers">
              {isUnmapped ? (
                <span className="feature-layer is-absent">
                  <Icon icon="solar:question-circle-outline" width={13} />
                  registry에 등재되지 않아 담당과 상태를 알 수 없어요
                </span>
              ) : (
                <>
                  <LayerBadge layer="FRONT" state={feature.front.state} path={feature.front.path} />
                  <LayerBadge layer="BACK" state={feature.back.state} path={feature.back.path} />
                  <span className={`feature-chip ${feature.tests.length ? '' : 'is-warn'}`}>
                    <Icon icon="solar:shield-check-outline" width={12} />
                    테스트 {feature.tests.length}
                  </span>
                  {p1 > 0 && (
                    <span className="feature-chip is-danger">
                      <Icon icon="solar:danger-triangle-bold" width={12} />
                      P1 {p1}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="feature-row-ops">
              {feature.operations.map((operation) => (
                <span key={`${operation.operationId ?? ''}${operation.route}`}>
                  {operation.route}
                  {operation.auth && <i>{operation.auth}</i>}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
