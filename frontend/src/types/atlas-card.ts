/**
 * Atlas 상세 캔버스의 카드 모델.
 *
 * 카드는 Front와 Back을 구분하지 않는다. 한 장이 "이 화면의 이 부분이 무엇이고
 * 무엇을 부르는가"를 통째로 답한다. 이 경계는 .project-atlas/schema.yaml의
 * feature와 같다 — 거기서도 implementedBy가 frontendEntry와 slice를 한 항목에 둔다.
 *
 * API 절의 필드는 OpenAPI 3.1 Operation Object에서 골랐다.
 * 채택: operationId, summary, security, parameters/requestBody, responses
 * 제외: tags, externalDocs, callbacks, servers, deprecated
 *       — 이 규모에서 채울 근거가 없고, 비어 있는 칸은 "확인 안 함"과 구별되지 않는다.
 *
 * safety는 OpenAPI에 없다. "이 호출을 다시 해도 되나"에 답하려면 필요해서
 * schema.yaml의 safety 스키마를 그대로 가져왔다.
 */

export type CardStatus = 'LIVE' | 'BOUND' | 'MOCK' | 'PLANNED';

export type CardSideEffect = 'NONE' | 'READ' | 'WRITE' | 'EXTERNAL';

export type CardAbortPolicy = 'FULL_ROLLBACK' | 'PARTIAL' | 'NONE';

export interface CardSafety {
  sideEffect: CardSideEffect;
  /** 실제로 쓰는 저장소. 읽기 전용이면 빈 배열 */
  writes: readonly string[];
  /** 같은 요청을 두 번 보내도 결과가 같은가 */
  rerunSafe: boolean;
  abortOnFail: CardAbortPolicy;
}

export interface CardResponse {
  /** HTTP 상태 또는 클라이언트 결과 (예: '200', '401', 'navigate') */
  code: string;
  /** 언제 이 결과가 나오는가 */
  when: string;
}

export interface CardApiRule {
  operationId: string;
  summary: string;
  /** HTTP 메서드 또는 CLIENT (네트워크를 타지 않는 화면 내 동작) */
  method: string;
  /** route 또는 클라이언트 대상 */
  path: string;
  /** OpenAPI security requirement 요약. 인증이 없으면 'PUBLIC' */
  security: string;
  /** parameters + requestBody 요약. 없으면 null */
  request: string | null;
  responses: readonly CardResponse[];
  safety: CardSafety;
}

/** 기능 설명 절의 한 줄. 사용자 → 화면 → 서버가 한 흐름으로 읽히게 한다. */
export interface CardStep {
  actor: 'USER' | 'FRONT' | 'BACK';
  step: string;
  /** 근거가 되는 소스 위치. 없으면 null */
  source: string | null;
}

export type CardRelation = 'USES' | 'USED_BY' | 'SHARES_CODE' | 'SAME_DEFECT' | 'INCONSISTENT_WITH';

export interface CardLink {
  /** 같은 페이지의 카드면 그 id, 다른 페이지면 설명용 문자열 */
  targetId: string | null;
  label: string;
  relation: CardRelation;
  note: string;
}

export interface CardSource {
  layer: 'FRONT' | 'BACK';
  path: string;
  symbol: string | null;
}

export interface AtlasCard {
  /** 제품 DOM의 data-atlas-node 값과 같다. 이 값이 카드와 화면 영역을 잇는다. */
  id: string;
  /** 표시용 순번 */
  code: string;
  title: string;
  status: CardStatus;
  /** 겉면 한 줄 */
  headline: string;

  // --- 상세 4절 ---
  overview: {
    /** 이것이 무엇인가 */
    what: string;
    /** 화면 어디에 붙는가 */
    where: string;
  };
  behaviour: readonly CardStep[];
  api: readonly CardApiRule[];
  related: readonly CardLink[];

  // --- 근거 ---
  sources: readonly CardSource[];
  /**
   * .project-atlas/registry/defects.yaml의 결함 ID.
   *
   * 기준(2026-08-04 확정) — **이 영역을 쓰는 사용자에게 실제로 나타나는 결함만.**
   * 이 화면이 부르지 않는 API의 결함은 여기 적지 않는다. 그것은 관계이지
   * 이 영역의 결함이 아니므로 related의 INCONSISTENT_WITH로 적는다.
   * 이 구분이 없으면 "이 화면을 고치려면 무엇을 봐야 하나"에 답할 수 없다.
   */
  defects: readonly string[];
}

/**
 * 한 화면이 조건에 따라 다르게 보이는 경우(로그인 전/후 등)의 각 상태.
 * 정적 스크린샷이 아니라 실제 페이지를 그 상태로 띄운다.
 */
export interface AtlasPageState {
  /** URL의 atlasState 값. 'default'는 파라미터 없이 여는 기본 상태 */
  id: string;
  label: string;
  /** 이 상태에서 무엇이 달라지는가. 화면에 그대로 보여준다 */
  note: string;
  /** 확인하지 못한 전제가 있으면 적는다. 없으면 null */
  caveat: string | null;
}

export interface AtlasPageCards {
  pageId: string;
  title: string;
  route: string;
  /** 미리보기로 띄우는 실제 주소 */
  previewSrc: string;
  /** 상태가 하나뿐이면 빈 배열 — 그때는 상태 탭을 그리지 않는다 */
  states: readonly AtlasPageState[];
  cards: readonly AtlasCard[];
}
