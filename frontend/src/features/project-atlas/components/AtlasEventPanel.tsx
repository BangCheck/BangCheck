/**
 * 추가만 되는 이벤트 저널. 지우거나 고치는 경로가 없다 —
 * 그것이 이 패널이 감사 기록으로 읽히는 근거다.
 */
import type { EventRow } from '../use-local-actions';

export function AtlasEventPanel({ rows }: { rows: readonly EventRow[] }) {
  return (
    <section className="atlas-event-panel">
      <header>
        <div>
          <span>APPEND-ONLY EVENT / ACTION JOURNAL</span>
          <strong>{rows.length.toString().padStart(2, '0')} RECORDS</strong>
        </div>
        <p><i /> IMMUTABLE ORDER <i /> LOCAL SESSION <i /> NO EXTERNAL SIDE EFFECT</p>
      </header>
      <div className="atlas-event-stream">
        {rows.map((event, index) => (
          <article key={event.id}>
            <span className="atlas-event-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="atlas-event-track" aria-hidden="true"><i /></div>
            <div className="atlas-event-card">
              <div>
                <small>{event.id}</small>
                <time>{event.time}</time>
              </div>
              <strong>{event.source}</strong>
              <span data-event-state={event.state}>{event.state}</span>
              <p>{event.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
