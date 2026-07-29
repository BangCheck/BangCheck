export type AtlasNodeStatus = 'READY' | 'WORKING' | 'BLOCKED' | 'MISSING';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiContract {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  requestShape: Readonly<Record<string, unknown>>;
  responseShape: Readonly<Record<string, unknown>>;
  errorCodes: readonly string[];
}

export interface AuthContract {
  required: boolean;
  strategy: 'PUBLIC' | 'JWT' | 'OAUTH2' | 'SESSION';
  providers: readonly ('kakao' | 'naver')[];
  securityPath: 'PATH_A' | 'PATH_B' | 'PATH_C' | null;
  notes: readonly string[];
}

export interface ExceptionContract {
  code: string;
  httpStatus: number;
  source: 'FRONTEND' | 'APPLICATION' | 'FRAMEWORK' | 'SECURITY_FILTER' | 'INTEGRATION';
  handling: string;
  retryable: boolean;
}

export interface LogSignal {
  name: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  fields: readonly string[];
}

export interface MetricSignal {
  name: string;
  unit: 'COUNT' | 'MILLISECONDS' | 'PERCENT';
  description: string;
}

export interface TraceSignal {
  name: string;
  propagation: 'W3C_TRACE_CONTEXT' | 'LOCAL_CORRELATION_ID';
  spans: readonly string[];
}

export interface ObservabilityContract {
  logs: readonly LogSignal[];
  metrics: readonly MetricSignal[];
  traces: readonly TraceSignal[];
}

export interface IssueReference {
  provider: 'GITHUB';
  repository: 'BangCheck/BangCheck';
  number: number | null;
  title: string;
  url: string | null;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'LOCAL_SIMULATION';
}

export interface IssueContract {
  primary: IssueReference | null;
  related: readonly IssueReference[];
  createActionEnabled: boolean;
}

export interface NodeDetail {
  api: readonly ApiContract[];
  auth: AuthContract;
  exceptions: readonly ExceptionContract[];
  observability: ObservabilityContract;
  issue: IssueContract;
}

export interface AtlasNodePosition {
  column: number;
  row: number;
}

interface AtlasNodeBase {
  id: string;
  pageId: string;
  title: string;
  description: string;
  status: AtlasNodeStatus;
  position: AtlasNodePosition;
  detail: NodeDetail;
}

export interface FrontNode extends AtlasNodeBase {
  layer: 'FRONT';
  componentPath: string;
  trigger: 'CLICK' | 'SUBMIT' | 'ROUTE_ENTER' | 'CALLBACK';
  emits: readonly string[];
  connectsTo: readonly string[];
}

export interface BackNode extends AtlasNodeBase {
  layer: 'BACK';
  operation: string;
  controllerPath: string;
  consumes: readonly string[];
  connectsFrom: readonly string[];
}

export interface PageView {
  mode: 'LIVE_ROUTE';
  route: string;
  previewLabel: string;
  hotspotNodeIds: readonly string[];
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  description: string;
  route: string;
  status: AtlasNodeStatus;
  view: PageView;
  frontNodeIds: readonly string[];
  backNodeIds: readonly string[];
}

export type ActionState =
  | 'REQUESTED'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'RETRYING'
  | 'DEAD_LETTER';

export type IntegrationKind = 'GITHUB' | 'DISCORD';

export type IntegrationOperation = 'CREATE_ISSUE' | 'NOTIFY_CHANNEL';

export interface AggregateReference {
  type: 'PAGE' | 'FRONT_NODE' | 'BACK_NODE' | 'ISSUE';
  id: string;
}

export interface IntegrationAction {
  id: string;
  integration: IntegrationKind;
  operation: IntegrationOperation;
  state: ActionState;
  idempotencyKey: string;
  aggregateRef: AggregateReference;
  projectionId: string;
  input: Readonly<Record<string, unknown>>;
  result: Readonly<Record<string, unknown>> | null;
  error: string | null;
  attempt: number;
  maxAttempts: number;
  requestedAt: string;
  updatedAt: string;
}

export type OutboxState = 'PENDING' | 'CLAIMED' | 'DELIVERED' | 'FAILED' | 'DEAD_LETTER';

export interface OutboxRecord {
  id: string;
  actionId: string;
  sourceEventId: string;
  destination: IntegrationKind;
  state: OutboxState;
  dedupeKey: string;
  payload: Readonly<Record<string, unknown>>;
  attemptCount: number;
  nextAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectionState = 'IDLE' | 'PENDING' | 'APPLIED' | 'ERROR';

export interface Projection {
  id: string;
  kind: 'GITHUB_ISSUE' | 'DISCORD_MESSAGE';
  mode: 'LOCAL_SIMULATION';
  state: ProjectionState;
  sourceAggregateRef: AggregateReference;
  remoteId: null;
  remoteUrl: null;
  lastEventSeq: number | null;
  metadata: Readonly<{
    adapter: 'local-simulation';
    externalWrites: false;
    target: string;
    note: string;
  }>;
}

export interface EventProvenance {
  source: 'ATLAS_UI' | 'SYSTEM' | 'LOCAL_GITHUB_SIMULATOR' | 'LOCAL_DISCORD_SIMULATOR';
  actorType: 'USER' | 'SYSTEM' | 'SIMULATOR';
  actorId: string;
  correlationId: string;
  causationEventId: string | null;
  external: false;
}

export interface AtlasEvent {
  id: string;
  seq: number;
  type: 'INTEGRATION_ACTION_REQUESTED' | 'INTEGRATION_ACTION_STATE_CHANGED';
  aggregateRef: AggregateReference;
  actionId: string;
  dedupeKey: string;
  occurredAt: string;
  provenance: EventProvenance;
  payload: Readonly<Record<string, unknown>>;
}

export interface AtlasMvpState {
  pages: readonly Page[];
  frontNodes: readonly FrontNode[];
  backNodes: readonly BackNode[];
  actions: readonly IntegrationAction[];
  outbox: readonly OutboxRecord[];
  projections: readonly Projection[];
  events: readonly AtlasEvent[];
  nextSequence: number;
}

export interface RequestActionCommand {
  type: 'REQUEST_ACTION';
  integration: IntegrationKind;
  operation: IntegrationOperation;
  idempotencyKey: string;
  aggregateRef: AggregateReference;
  projectionId: string;
  input: Readonly<Record<string, unknown>>;
  at: string;
  maxAttempts?: number;
  provenance?: EventProvenance;
}

export interface MoveActionCommand {
  type: 'MOVE_ACTION';
  actionId: string;
  to: Exclude<ActionState, 'REQUESTED'>;
  at: string;
  dedupeKey?: string;
  result?: Readonly<Record<string, unknown>>;
  error?: string;
  provenance?: EventProvenance;
}

export type ActionCommand = RequestActionCommand | MoveActionCommand;

export interface ActionTransitionResult {
  state: AtlasMvpState;
  action: IntegrationAction;
  appendedEvent: AtlasEvent | null;
  duplicate: boolean;
}
