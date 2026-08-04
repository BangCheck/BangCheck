/**
 * 로컬 액션 어댑터와 감사 저널.
 *
 * GitHub·Discord를 실제로 부르지 않는다. 같은 상태 전이(REQUESTED → PROCESSING
 * → SUCCEEDED)와 같은 이벤트만 남긴다 — 바깥에 쓰기가 나가지 않는다는 것이
 * 이 어댑터의 전부다.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { transitionAction } from './atlas-machine';
import { createMvpSeed } from './atlas-seed';
import { formatTime } from './atlas-theme';
import type { ActionState as CanonicalActionState, AtlasMvpState } from '@/types/project-atlas';
import type { AtlasPageCards } from '@/types/atlas-card';

export type ActionKind = 'github' | 'discord';
export type UiActionState = CanonicalActionState | 'IDLE';

export interface EventRow {
  id: string;
  time: string;
  source: string;
  state: string;
  detail: string;
}

/** 전이 사이의 간격. 실제 어댑터의 왕복 시간을 흉내낸 값이다. */
const PROCESSING_DELAY_MS = 420;
const SUCCEEDED_DELAY_MS = 1180;

export function useLocalActions(page: AtlasPageCards, selectedCardId: string | null) {
  const timersRef = useRef<number[]>([]);
  const eventSequenceRef = useRef(4);
  const atlasStateRef = useRef<AtlasMvpState>(createMvpSeed());

  const [atlasState, setAtlasState] = useState<AtlasMvpState>(atlasStateRef.current);
  const [events, setEvents] = useState<EventRow[]>(() => [
    { id: 'EVT-0001', time: formatTime(), source: 'CANONICAL', state: 'RECORDED', detail: 'page.view.opened · landing' },
    { id: 'EVT-0002', time: formatTime(), source: 'VIEW', state: 'BOUND', detail: 'full-page preview requested' },
    { id: 'EVT-0003', time: formatTime(), source: 'REGION', state: 'WAITING', detail: 'section rects pending' },
  ]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  /** 같은 detail은 한 번만 남긴다 — 좌표 수신은 여러 번 오지만 사실은 하나다. */
  const appendEventOnce = useCallback((source: string, state: string, detail: string) => {
    setEvents((current) => (current.some((item) => item.detail === detail)
      ? current
      : [...current, {
          id: `EVT-${String(eventSequenceRef.current++).padStart(4, '0')}`,
          time: formatTime(),
          source,
          state,
          detail,
        }]));
  }, []);

  const actionState: Record<ActionKind, UiActionState> = {
    github: [...atlasState.actions].reverse().find((action) => action.integration === 'GITHUB')?.state ?? 'IDLE',
    discord: [...atlasState.actions].reverse().find((action) => action.integration === 'DISCORD')?.state ?? 'IDLE',
  };

  const runLocalAction = useCallback((kind: ActionKind) => {
    const current = [...atlasStateRef.current.actions].reverse()
      .find((action) => action.integration === (kind === 'github' ? 'GITHUB' : 'DISCORD'))?.state;
    if (current === 'REQUESTED' || current === 'PROCESSING' || current === 'RETRYING') return;

    const integration = kind === 'github' ? 'GITHUB' : 'DISCORD';
    const operation = kind === 'github' ? 'CREATE_ISSUE' : 'NOTIFY_CHANNEL';
    const projectionId = kind === 'github'
      ? 'projection-github-local'
      : 'projection-discord-local';
    const sourceCardId = selectedCardId ?? page.cards[0].id;
    const request = transitionAction(atlasStateRef.current, {
      type: 'REQUEST_ACTION',
      integration,
      operation,
      idempotencyKey: `atlas-${kind}-${page.pageId}-v1`,
      aggregateRef: { type: 'PAGE', id: `page-${page.pageId}` },
      projectionId,
      input: kind === 'github'
        ? { title: `[Atlas] ${page.title} 점검`, sourceNodeId: sourceCardId }
        : { channel: 'project-atlas-local', sourceNodeId: sourceCardId },
      at: new Date().toISOString(),
    });

    atlasStateRef.current = request.state;
    setAtlasState(request.state);
    if (request.duplicate) return;

    timersRef.current.push(window.setTimeout(() => {
      const processing = transitionAction(atlasStateRef.current, {
        type: 'MOVE_ACTION',
        actionId: request.action.id,
        to: 'PROCESSING',
        at: new Date().toISOString(),
      });
      atlasStateRef.current = processing.state;
      setAtlasState(processing.state);
    }, PROCESSING_DELAY_MS));

    timersRef.current.push(window.setTimeout(() => {
      const succeeded = transitionAction(atlasStateRef.current, {
        type: 'MOVE_ACTION',
        actionId: request.action.id,
        to: 'SUCCEEDED',
        at: new Date().toISOString(),
        result: kind === 'github'
          ? { issue: 'LOCAL-014', externalWrites: false }
          : { message: 'LOCAL-MSG-001', externalWrites: false },
      });
      atlasStateRef.current = succeeded.state;
      setAtlasState(succeeded.state);
    }, SUCCEEDED_DELAY_MS));
  }, [page, selectedCardId]);

  const eventRows = useMemo<EventRow[]>(() => [
    ...events,
    ...atlasState.events.map((event) => ({
      id: event.id.toUpperCase(),
      time: formatTime(new Date(event.occurredAt)),
      source: String(event.payload.integration ?? event.provenance.source),
      state: String(event.payload.to ?? 'REQUESTED'),
      detail: event.type === 'INTEGRATION_ACTION_REQUESTED'
        ? `${String(event.payload.operation)} · ${event.dedupeKey}`
        : `${String(event.payload.from)} → ${String(event.payload.to)} · externalWrites=false`,
    })),
  ], [atlasState.events, events]);

  return { actionState, runLocalAction, appendEventOnce, eventRows };
}
