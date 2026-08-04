/**
 * MVP 씨앗 상태 — 랜딩 walking skeleton 한 장과 그 노드들.
 *
 * 상태 기계가 시작점으로 삼는 데이터일 뿐, 전이 규칙은 여기 없다.
 * 규칙은 atlas-machine.ts가 소유한다.
 */
import type {
  AtlasMvpState,
  BackNode,
  FrontNode,
  Page,
  Projection,
} from '@/types/project-atlas';

const MVP_SEED_AT = '2026-07-29T09:00:00.000Z';

const EMPTY_OBSERVABILITY = {
  logs: [],
  metrics: [],
  traces: [],
} as const;

const LANDING_PAGE: Page = {
  id: 'page-landing',
  slug: 'landing',
  title: '첫 진입 · 랜딩',
  description: '로그인 진입부터 OAuth 콜백까지의 첫 번째 Project Atlas walking skeleton',
  route: '/login',
  status: 'WORKING',
  view: {
    mode: 'LIVE_ROUTE',
    route: '/login',
    previewLabel: 'BangCheck LoginPage live route',
    hotspotNodeIds: ['front-login-provider'],
  },
  frontNodeIds: ['front-login-provider', 'front-auth-callback'],
  backNodeIds: ['back-oauth-authorize', 'back-oauth-callback'],
};

const FRONT_NODES: readonly FrontNode[] = [
  {
    id: 'front-login-provider',
    pageId: LANDING_PAGE.id,
    layer: 'FRONT',
    title: 'OAuth provider button',
    description: '사용자가 Kakao 또는 Naver 로그인을 선택하고 authorize URL을 요청한다.',
    status: 'READY',
    position: { column: 1, row: 1 },
    componentPath: 'src/features/login/LoginPage.tsx',
    trigger: 'CLICK',
    emits: ['auth.authorize.requested'],
    connectsTo: ['back-oauth-authorize'],
    detail: {
      api: [
        {
          id: 'api-oauth-authorize',
          method: 'GET',
          path: '/api/v1/auth/oauth2/{provider}',
          summary: 'Kakao 또는 Naver authorize URL 조회',
          requestShape: { path: { provider: "'kakao' | 'naver'" } },
          responseShape: { data: { authorizeUrl: 'string' } },
          errorCodes: ['AUTH_PROVIDER_UNSUPPORTED', 'INTERNAL_SERVER_ERROR'],
        },
      ],
      auth: {
        required: false,
        strategy: 'PUBLIC',
        providers: ['kakao', 'naver'],
        securityPath: null,
        notes: ['외부 OAuth 페이지로 이동하기 전의 공개 진입점'],
      },
      exceptions: [
        {
          code: 'OAUTH_AUTHORIZE_URL_FAILED',
          httpStatus: 500,
          source: 'INTEGRATION',
          handling: '로그인 카드에 오류를 표시하고 동일 provider 재시도를 허용한다.',
          retryable: true,
        },
      ],
      observability: {
        logs: [{ name: 'oauth_authorize_requested', level: 'INFO', fields: ['provider', 'correlationId'] }],
        metrics: [
          {
            name: 'oauth_authorize_request_total',
            unit: 'COUNT',
            description: 'provider별 authorize URL 요청 수',
          },
        ],
        traces: [
          {
            name: 'oauth-authorize',
            propagation: 'LOCAL_CORRELATION_ID',
            spans: ['LoginPage.login', 'auth-service.getOAuthAuthorizeUrl'],
          },
        ],
      },
      issue: {
        primary: null,
        related: [],
        createActionEnabled: true,
      },
    },
  },
  {
    id: 'front-auth-callback',
    pageId: LANDING_PAGE.id,
    layer: 'FRONT',
    title: 'Auth callback route',
    description: 'OAuth code와 state를 서버 콜백 API로 전달하고 로그인 결과를 반영한다.',
    status: 'READY',
    position: { column: 1, row: 2 },
    componentPath: 'src/features/auth/AuthCallbackPage.tsx',
    trigger: 'CALLBACK',
    emits: ['auth.callback.received'],
    connectsTo: ['back-oauth-callback'],
    detail: {
      api: [
        {
          id: 'api-oauth-callback',
          method: 'GET',
          path: '/api/v1/auth/oauth2/{provider}/callback',
          summary: 'OAuth code 교환 및 사용자 정보 반환',
          requestShape: { query: { code: 'string', state: 'string' } },
          responseShape: { data: { accessToken: 'string', refreshToken: 'string', user: 'User' } },
          errorCodes: ['AUTH_401', 'OAUTH_STATE_INVALID', 'OAUTH_PROVIDER_FAILED'],
        },
      ],
      auth: {
        required: false,
        strategy: 'OAUTH2',
        providers: ['kakao', 'naver'],
        securityPath: 'PATH_C',
        notes: ['Security filter 예외는 advice를 우회하므로 AUTH_401 형태를 별도 확인한다.'],
      },
      exceptions: [
        {
          code: 'OAUTH_STATE_INVALID',
          httpStatus: 401,
          source: 'SECURITY_FILTER',
          handling: '로그인 화면으로 복귀시키고 state 재발급을 요구한다.',
          retryable: true,
        },
      ],
      observability: EMPTY_OBSERVABILITY,
      issue: {
        primary: null,
        related: [],
        createActionEnabled: true,
      },
    },
  },
];

const BACK_NODES: readonly BackNode[] = [
  {
    id: 'back-oauth-authorize',
    pageId: LANDING_PAGE.id,
    layer: 'BACK',
    title: 'OAuth authorize URL',
    description: 'provider 설정과 nonce를 사용해 외부 인증 URL을 조립한다.',
    status: 'READY',
    position: { column: 3, row: 1 },
    operation: 'OAuthService.buildAuthorizeUrl',
    controllerPath: 'global/auth/oauth',
    consumes: ['auth.authorize.requested'],
    connectsFrom: ['front-login-provider'],
    detail: FRONT_NODES[0].detail,
  },
  {
    id: 'back-oauth-callback',
    pageId: LANDING_PAGE.id,
    layer: 'BACK',
    title: 'OAuth callback exchange',
    description: 'code를 provider token 및 user info로 교환하고 BangCheck 로그인 결과를 반환한다.',
    status: 'WORKING',
    position: { column: 3, row: 2 },
    operation: 'OAuthService.handleCallback',
    controllerPath: 'global/auth/oauth',
    consumes: ['auth.callback.received'],
    connectsFrom: ['front-auth-callback'],
    detail: FRONT_NODES[1].detail,
  },
];

const LOCAL_PROJECTIONS: readonly Projection[] = [
  {
    id: 'projection-github-local',
    kind: 'GITHUB_ISSUE',
    mode: 'LOCAL_SIMULATION',
    state: 'IDLE',
    sourceAggregateRef: { type: 'PAGE', id: LANDING_PAGE.id },
    remoteId: null,
    remoteUrl: null,
    lastEventSeq: null,
    metadata: {
      adapter: 'local-simulation',
      externalWrites: false,
      target: 'BangCheck/BangCheck issues',
      note: 'MVP에서는 GitHub API를 호출하지 않고 projection 상태만 변경한다.',
    },
  },
  {
    id: 'projection-discord-local',
    kind: 'DISCORD_MESSAGE',
    mode: 'LOCAL_SIMULATION',
    state: 'IDLE',
    sourceAggregateRef: { type: 'PAGE', id: LANDING_PAGE.id },
    remoteId: null,
    remoteUrl: null,
    lastEventSeq: null,
    metadata: {
      adapter: 'local-simulation',
      externalWrites: false,
      target: 'BangCheck project notification channel',
      note: 'MVP에서는 Discord webhook을 호출하지 않고 projection 상태만 변경한다.',
    },
  },
];

export function createMvpSeed(_createdAt = MVP_SEED_AT): AtlasMvpState {
  return {
    pages: [LANDING_PAGE],
    frontNodes: FRONT_NODES,
    backNodes: BACK_NODES,
    actions: [],
    outbox: [],
    projections: LOCAL_PROJECTIONS,
    events: [],
    nextSequence: 1,
  };
}
