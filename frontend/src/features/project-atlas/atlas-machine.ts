/**
 * 통합 액션의 상태 기계.
 *
 * 전이는 ALLOWED_TRANSITIONS가 정한 것만 통과한다 — 어긋난 전이는
 * 조용히 무시하지 않고 AtlasTransitionError로 던진다. 감사 저널이
 * 거짓말을 하지 않으려면 실패가 보여야 한다.
 *
 * 씨앗 데이터는 atlas-seed.ts에 있다.
 */
import type {
  ActionCommand,
  ActionState,
  ActionTransitionResult,
  AtlasEvent,
  AtlasMvpState,
  EventProvenance,
  IntegrationAction,
  MoveActionCommand,
  OutboxRecord,
  OutboxState,
  Projection,
  ProjectionState,
  RequestActionCommand,
} from '@/types/project-atlas';

const ALLOWED_TRANSITIONS: Readonly<Record<ActionState, readonly ActionState[]>> = {
  REQUESTED: ['PROCESSING'],
  PROCESSING: ['SUCCEEDED', 'FAILED'],
  SUCCEEDED: [],
  FAILED: ['RETRYING', 'DEAD_LETTER'],
  RETRYING: ['PROCESSING', 'DEAD_LETTER'],
  DEAD_LETTER: [],
};

const DEFAULT_PROVENANCE: EventProvenance = {
  source: 'ATLAS_UI',
  actorType: 'USER',
  actorId: 'local-mvp-user',
  correlationId: 'project-atlas-mvp',
  causationEventId: null,
  external: false,
};

export class AtlasTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtlasTransitionError';
  }
}


function eventId(sequence: number): string {
  return `atlas-event-${String(sequence).padStart(4, '0')}`;
}

function actionId(index: number): string {
  return `integration-action-${String(index).padStart(4, '0')}`;
}

function outboxId(index: number): string {
  return `outbox-${String(index).padStart(4, '0')}`;
}

function requestAction(state: AtlasMvpState, command: RequestActionCommand): ActionTransitionResult {
  const duplicate = state.actions.find((action) => action.idempotencyKey === command.idempotencyKey);

  if (duplicate) {
    return {
      state,
      action: duplicate,
      appendedEvent: null,
      duplicate: true,
    };
  }

  const projection = state.projections.find((item) => item.id === command.projectionId);
  if (!projection) {
    throw new AtlasTransitionError(`Projection not found: ${command.projectionId}`);
  }

  const expectedKind = command.integration === 'GITHUB' ? 'GITHUB_ISSUE' : 'DISCORD_MESSAGE';
  if (projection.kind !== expectedKind || projection.mode !== 'LOCAL_SIMULATION') {
    throw new AtlasTransitionError(
      `Projection ${projection.id} cannot handle ${command.integration} in local simulation mode.`,
    );
  }

  const sequence = state.nextSequence;
  const nextAction: IntegrationAction = {
    id: actionId(state.actions.length + 1),
    integration: command.integration,
    operation: command.operation,
    state: 'REQUESTED',
    idempotencyKey: command.idempotencyKey,
    aggregateRef: command.aggregateRef,
    projectionId: command.projectionId,
    input: command.input,
    result: null,
    error: null,
    attempt: 0,
    maxAttempts: Math.max(1, command.maxAttempts ?? 3),
    requestedAt: command.at,
    updatedAt: command.at,
  };
  const nextEvent: AtlasEvent = {
    id: eventId(sequence),
    seq: sequence,
    type: 'INTEGRATION_ACTION_REQUESTED',
    aggregateRef: command.aggregateRef,
    actionId: nextAction.id,
    dedupeKey: command.idempotencyKey,
    occurredAt: command.at,
    provenance: command.provenance ?? DEFAULT_PROVENANCE,
    payload: {
      integration: command.integration,
      operation: command.operation,
      projectionMode: 'LOCAL_SIMULATION',
    },
  };
  const nextOutbox: OutboxRecord = {
    id: outboxId(state.outbox.length + 1),
    actionId: nextAction.id,
    sourceEventId: nextEvent.id,
    destination: command.integration,
    state: 'PENDING',
    dedupeKey: command.idempotencyKey,
    payload: command.input,
    attemptCount: 0,
    nextAttemptAt: command.at,
    createdAt: command.at,
    updatedAt: command.at,
  };

  return {
    state: {
      ...state,
      actions: [...state.actions, nextAction],
      outbox: [...state.outbox, nextOutbox],
      projections: updateProjection(state.projections, command.projectionId, 'PENDING', sequence),
      events: [...state.events, nextEvent],
      nextSequence: sequence + 1,
    },
    action: nextAction,
    appendedEvent: nextEvent,
    duplicate: false,
  };
}

function projectionStateFor(actionState: ActionState): ProjectionState {
  switch (actionState) {
    case 'REQUESTED':
    case 'PROCESSING':
    case 'RETRYING':
      return 'PENDING';
    case 'SUCCEEDED':
      return 'APPLIED';
    case 'FAILED':
    case 'DEAD_LETTER':
      return 'ERROR';
  }
}

function outboxStateFor(actionState: ActionState): OutboxState {
  switch (actionState) {
    case 'REQUESTED':
    case 'RETRYING':
      return 'PENDING';
    case 'PROCESSING':
      return 'CLAIMED';
    case 'SUCCEEDED':
      return 'DELIVERED';
    case 'FAILED':
      return 'FAILED';
    case 'DEAD_LETTER':
      return 'DEAD_LETTER';
  }
}

function updateProjection(
  projections: readonly Projection[],
  projectionId: string,
  nextState: ProjectionState,
  lastEventSeq: number,
): readonly Projection[] {
  return projections.map((projection) =>
    projection.id === projectionId
      ? { ...projection, state: nextState, lastEventSeq }
      : projection,
  );
}

function moveAction(state: AtlasMvpState, command: MoveActionCommand): ActionTransitionResult {
  const current = state.actions.find((action) => action.id === command.actionId);
  if (!current) {
    throw new AtlasTransitionError(`Integration action not found: ${command.actionId}`);
  }

  if (!ALLOWED_TRANSITIONS[current.state].includes(command.to)) {
    throw new AtlasTransitionError(`Illegal action transition: ${current.state} -> ${command.to}`);
  }

  const nextAttempt = command.to === 'PROCESSING' ? current.attempt + 1 : current.attempt;
  if (command.to === 'RETRYING' && current.attempt >= current.maxAttempts) {
    throw new AtlasTransitionError(
      `Retry limit reached for ${current.id}: ${current.attempt}/${current.maxAttempts}`,
    );
  }

  const sequence = state.nextSequence;
  const nextAction: IntegrationAction = {
    ...current,
    state: command.to,
    attempt: nextAttempt,
    result: command.to === 'SUCCEEDED' ? (command.result ?? {}) : current.result,
    error:
      command.to === 'FAILED' || command.to === 'DEAD_LETTER'
        ? (command.error ?? 'Local simulation failed without an error message.')
        : null,
    updatedAt: command.at,
  };
  const nextEvent: AtlasEvent = {
    id: eventId(sequence),
    seq: sequence,
    type: 'INTEGRATION_ACTION_STATE_CHANGED',
    aggregateRef: current.aggregateRef,
    actionId: current.id,
    dedupeKey:
      command.dedupeKey ??
      `${current.id}:${current.state}:${command.to}:attempt-${nextAttempt}:seq-${sequence}`,
    occurredAt: command.at,
    provenance: command.provenance ?? {
      ...DEFAULT_PROVENANCE,
      source:
        current.integration === 'GITHUB'
          ? 'LOCAL_GITHUB_SIMULATOR'
          : 'LOCAL_DISCORD_SIMULATOR',
      actorType: 'SIMULATOR',
      actorId: `${current.integration.toLowerCase()}-local-simulator`,
    },
    payload: {
      from: current.state,
      to: command.to,
      attempt: nextAttempt,
      externalWrites: false,
    },
  };

  return {
    state: {
      ...state,
      actions: state.actions.map((action) => (action.id === current.id ? nextAction : action)),
      outbox: state.outbox.map((record) =>
        record.actionId === current.id
          ? {
              ...record,
              state: outboxStateFor(command.to),
              attemptCount: nextAttempt,
              nextAttemptAt: command.to === 'RETRYING' ? command.at : null,
              updatedAt: command.at,
            }
          : record,
      ),
      projections: updateProjection(
        state.projections,
        current.projectionId,
        projectionStateFor(command.to),
        sequence,
      ),
      events: [...state.events, nextEvent],
      nextSequence: sequence + 1,
    },
    action: nextAction,
    appendedEvent: nextEvent,
    duplicate: false,
  };
}

export function transitionAction(
  state: AtlasMvpState,
  command: ActionCommand,
): ActionTransitionResult {
  return command.type === 'REQUEST_ACTION'
    ? requestAction(state, command)
    : moveAction(state, command);
}
