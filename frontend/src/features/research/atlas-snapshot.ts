/**
 * 스냅샷 읽기 창구. 화면은 JSON을 직접 만지지 않는다.
 *
 * 스냅샷은 생성물이라 언제든 갈릴 수 있다 — 페이지가 사라지거나 기능이 빠져도
 * 화면은 죽지 않고 "관측 없음"을 말해야 한다. 그 방어를 여기 모아둔다.
 */
import snapshotJson from './atlas-snapshot.json';
import type {
  AtlasSnapshot,
  AtlasSnapshotFeature,
  AtlasSnapshotPage,
} from '@/types/atlas-snapshot';

const snapshot = snapshotJson as AtlasSnapshot;

export function findSnapshotPage(route: string): AtlasSnapshotPage | null {
  return snapshot.pages.find((page) => page.page === route) ?? null;
}

/** 기능에 붙은 GitHub 이슈·PR. 규약이 아직 없어 지금은 늘 비어 있다. */
export function findFeatureLinks(featureId: string | null) {
  if (!featureId) return { issues: [], prs: [] };
  const links = snapshot.links.byFeature[featureId];
  return { issues: links?.issues ?? [], prs: links?.prs ?? [] };
}

export const hasLinkSource = snapshot.links.source !== null;

/**
 * 어느 feature 도 데려가지 않은 결함.
 *
 * `findSnapshotPage` 는 페이지를 타고만 결함에 닿으므로 이 결함들은 어느 페이지에서도
 * 안 보인다. 별도 창구를 둬서 화면이 "없다"와 "못 본다"를 구별할 수 있게 한다.
 * `?? []` — 이 필드가 생기기 전에 구워진 스냅샷이 남아 있어도 화면은 죽지 않는다.
 */
export const unattachedDefects = snapshot.unattachedDefects ?? [];
export const unattachedP1Count = unattachedDefects.filter((d) => d.severity === 'P1').length;

export interface PageRollup {
  featureCount: number;
  frontBuilt: number;
  backBuilt: number;
  defectCount: number;
  p1Count: number;
  testedCount: number;
}

/**
 * 카드 머리에 얹을 집계. 세는 규칙을 화면마다 다시 쓰면 숫자가 갈라진다.
 *
 * 결함은 반드시 ID로 dedupe해서 센다. 하나의 결함이 여러 기능에 걸리기 때문이다 —
 * 예를 들어 BC-REG-04는 registry에서 세 기능의 knownDefects에 들어 있고,
 * 그중 둘이 같은 페이지에 놓이면 기능별 길이를 그냥 더할 때 두 번 세어진다.
 * 본문 목록(PageBriefBody의 collectDefects)은 ID로 한 번만 보여주므로,
 * 여기서 dedupe하지 않으면 머리 숫자와 본문 개수가 갈라진다.
 */
export function rollupPage(features: AtlasSnapshotFeature[]): PageRollup {
  const registered = features.filter((feature) => feature.featureId !== null);
  const uniqueDefects = new Map(
    registered.flatMap((feature) => feature.defects.map((defect) => [defect.id, defect] as const)),
  );
  return {
    featureCount: registered.length,
    frontBuilt: registered.filter((feature) => feature.front.state !== 'absent').length,
    backBuilt: registered.filter((feature) => feature.back.state !== 'absent').length,
    defectCount: uniqueDefects.size,
    p1Count: [...uniqueDefects.values()].filter((defect) => defect.severity === 'P1').length,
    testedCount: registered.filter((feature) => feature.tests.length > 0).length,
  };
}
