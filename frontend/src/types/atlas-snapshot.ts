/**
 * PM 스냅샷의 형태. 원천은 .project-atlas/tools/pm_snapshot.py 이며
 * 이 타입은 그 출력 계약을 코드 쪽에서 다시 적은 것이다.
 *
 * 여기 없는 값은 화면에 없다 — 진행률처럼 사람이 정하는 수치는 스냅샷이
 * 답하지 못하므로 넣지 않는다.
 */

/** 한 레이어의 상태. 코드의 실재와 P1 결함만 본다. */
export type AtlasLayerState = 'built' | 'defect' | 'absent';

/**
 * 결함 생애주기. 사람이 적는 값은 defects.yaml의 issue 하나뿐이고
 * 나머지는 그 번호에서 파생된다 — 지금은 이슈↔PR 원천이 없어 OBSERVED/TRACKED까지만 나온다.
 */
export type AtlasDefectLifecycle = 'OBSERVED' | 'TRACKED' | 'IN_PROGRESS' | 'RESOLVED';

/** 결함이 어디서 관측됐는지. 이게 있어야 주장이 확인 가능한 관측이 된다. */
export interface AtlasDefectEvidence {
  path: string;
  symbol: string | null;
  line: number | null;
}

export interface AtlasSnapshotDefect {
  id: string;
  severity: 'P1' | 'P2' | 'P3';
  title: string;
  disposition: string;
  detail: string | null;
  evidence: AtlasDefectEvidence | null;
  relatedFeature: string | null;
  relatedStory: string | null;
  /** 사람이 defects.yaml에 적는 유일한 생애주기 입력. 없으면 아직 이슈로 올리지 않았다는 뜻. */
  issue: number | null;
  lifecycle: AtlasDefectLifecycle;
}

export interface AtlasSnapshotOperation {
  operationId: string | null;
  route: string;
  auth: string | null;
  safety: string | null;
  frontend: string | null;
}

export interface AtlasSnapshotLayer {
  path: string | null;
  state: AtlasLayerState;
}

export interface AtlasSnapshotFeature {
  /** null이면 registry 미등재 호출을 모아둔 자리다. */
  featureId: string | null;
  title: string;
  owner: string | null;
  capability: string | null;
  operations: AtlasSnapshotOperation[];
  defects: AtlasSnapshotDefect[];
  tests: string[];
  front: AtlasSnapshotLayer;
  back: AtlasSnapshotLayer;
}

export interface AtlasSnapshotPage {
  page: string;
  component: string;
  features: AtlasSnapshotFeature[];
}

/** 기능 ↔ GitHub 연결. 규약이 생기기 전까지 비어 있고, 화면은 그 사실을 그대로 말한다. */
export interface AtlasSnapshotLinks {
  source: string | null;
  byFeature: Record<string, { issues?: number[]; prs?: number[] }>;
}

export interface AtlasSnapshot {
  generator: string;
  note: string;
  /**
   * 이 스냅샷을 구울 때의 registry 내용 해시.
   * 빌드 앞의 scripts/check-atlas-snapshot.mjs가 이 값으로 스냅샷이 낡았는지 판정한다.
   * 화면은 쓰지 않는다 — 사람이 볼 사실이 아니라 빌드가 볼 사실이다.
   */
  sourceDigest: string;
  pages: AtlasSnapshotPage[];
  /**
   * 어느 feature 도 데려가지 않은 결함.
   *
   * 화면은 pages(=feature) 를 타고만 결함에 닿는다. 그래서 이 배열이 없던 동안
   * 배포·마이그레이션·아키텍처처럼 제품 feature 가 소유하지 않는 결함은 사이트에서
   * 통째로 사라져 있었다 — BC-DB-01·BC-ARCH-01/02 가 그 상태였고 아무도 몰랐다.
   * #289 에서 근거 없는 귀속을 지우자 P1 하나가 같은 자리로 떨어지며 드러났다.
   */
  unattachedDefects: AtlasSnapshotDefect[];
  links: AtlasSnapshotLinks;
}
