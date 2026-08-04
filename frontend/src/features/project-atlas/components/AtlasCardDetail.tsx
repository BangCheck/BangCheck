/**
 * 카드 상세 4절 — 개요 / 기능 설명 / API 규칙 / 연관된 기능.
 *
 * 네 절의 순서가 곧 기능명세서의 순서다. 무엇인가(개요) → 어떻게 도는가(설명)
 * → 어떤 계약인가(API) → 무엇과 얽혀 있는가(연관).
 */
import { Icon } from '@iconify/react';
import { ACTOR_LABEL, RELATION_LABEL } from '../atlas-theme';
import type { AtlasCard } from '@/types/atlas-card';

interface Props {
  card: AtlasCard;
  onClose: () => void;
  /** 연관 카드로 건너뛴다. targetId가 있는 링크에만 붙는다. */
  onJumpToCard: (cardId: string) => void;
}

export function AtlasCardDetail({ card, onClose, onJumpToCard }: Props) {
  return (
    <section className="atlas-detail">
      <header className="atlas-detail-head">
        <div>
          <span>{card.code} / CARD DETAIL</span>
          <h2>{card.title}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="상세 닫기">
          <Icon icon="solar:close-circle-outline" width={18} />
        </button>
      </header>

      <div className="atlas-detail-grid">
        <article className="atlas-detail-block">
          <h3><span>01</span> 개요</h3>
          <p>{card.overview.what}</p>
          <p className="is-muted">{card.overview.where}</p>
          <dl className="atlas-detail-sources">
            {card.sources.map((source) => (
              <div key={source.path}>
                <dt>{source.layer}</dt>
                <dd>{source.path}{source.symbol ? ` · ${source.symbol}` : ''}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="atlas-detail-block">
          <h3><span>02</span> 기능 설명</h3>
          <ol className="atlas-detail-steps">
            {card.behaviour.map((step, index) => (
              <li key={`${step.actor}-${index}`}>
                <em data-actor={step.actor}>{ACTOR_LABEL[step.actor]}</em>
                <div>
                  <p>{step.step}</p>
                  {step.source && <code>{step.source}</code>}
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="atlas-detail-block">
          <h3><span>03</span> API 규칙</h3>
          {card.api.length === 0 && (
            <p className="is-muted">호출이 없다. 정적 렌더만 하는 영역이다.</p>
          )}
          {card.api.map((rule) => (
            <div className="atlas-api-rule" key={rule.operationId}>
              <div className="atlas-api-line">
                <strong>{rule.method}</strong>
                <code>{rule.path}</code>
              </div>
              <p>{rule.summary}</p>
              <dl>
                <div><dt>operationId</dt><dd>{rule.operationId}</dd></div>
                <div><dt>security</dt><dd>{rule.security}</dd></div>
                <div><dt>request</dt><dd>{rule.request ?? '없음'}</dd></div>
                <div>
                  <dt>responses</dt>
                  <dd>
                    {rule.responses.map((response) => (
                      <span key={response.code}>
                        <b>{response.code}</b> — {response.when}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt>safety</dt>
                  <dd>
                    <span><b>{rule.safety.sideEffect}</b> — 부수효과</span>
                    <span><b>{rule.safety.writes.length ? rule.safety.writes.join(', ') : '없음'}</b> — 쓰기 대상</span>
                    <span><b>{rule.safety.rerunSafe ? '재실행 안전' : '재실행 위험'}</b> — 같은 요청 반복</span>
                    <span><b>{rule.safety.abortOnFail}</b> — 실패 시</span>
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </article>

        <article className="atlas-detail-block">
          <h3><span>04</span> 연관된 기능</h3>
          {card.related.length === 0 && <p className="is-muted">연관이 기록되지 않았다.</p>}
          <ul className="atlas-detail-links">
            {card.related.map((link) => {
              // 지역 상수로 받아야 콜백 안에서도 좁혀진 타입이 유지된다.
              const { targetId } = link;
              return (
                <li key={`${link.relation}-${link.label}`}>
                  <span className="atlas-relation" data-relation={link.relation}>
                    {RELATION_LABEL[link.relation]}
                  </span>
                  {targetId ? (
                    <button type="button" onClick={() => onJumpToCard(targetId)}>
                      {link.label}
                    </button>
                  ) : (
                    <strong>{link.label}</strong>
                  )}
                  <p>{link.note}</p>
                </li>
              );
            })}
          </ul>
          {card.defects.length > 0 && (
            <p className="atlas-detail-defects">
              결함 {card.defects.join(', ')}
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
