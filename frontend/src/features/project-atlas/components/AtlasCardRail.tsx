/**
 * 오른쪽 레일 — 이 페이지의 카드 목록과 로컬 액션 어댑터.
 *
 * 카드를 Front/Back으로 가르지 않는다. 한 카드가 화면 한 영역이고,
 * 그 영역이 부르는 API가 카드 안에 함께 있다.
 */
import { Icon } from '@iconify/react';
import type { ActionKind, UiActionState } from '../use-local-actions';
import type { NodeRect } from '../use-preview-stage';
import type { AtlasPageCards } from '@/types/atlas-card';

interface Props {
  page: AtlasPageCards;
  /** 좌표가 잡힌 카드만 미리보기 위에 영역으로 뜬다. */
  rects: Record<string, NodeRect>;
  selectedCardId: string | null;
  onToggleCard: (cardId: string) => void;
  onHoverCard: (cardId: string | null) => void;
  actionState: Record<ActionKind, UiActionState>;
  onRunAction: (kind: ActionKind) => void;
}

export function AtlasCardRail({
  page, rects, selectedCardId, onToggleCard, onHoverCard, actionState, onRunAction,
}: Props) {
  return (
    <aside className="atlas-card-rail">
      <div className="atlas-card-rail-head">
        <span>SECTION CARDS</span>
        <strong>{page.cards.length.toString().padStart(2, '0')}</strong>
      </div>

      <div className="atlas-card-list">
        {page.cards.map((card) => {
          const bound = Boolean(rects[card.id]);
          return (
            <button
              type="button"
              key={card.id}
              className={`atlas-card ${selectedCardId === card.id ? 'is-selected' : ''}`}
              onClick={() => onToggleCard(card.id)}
              onMouseEnter={() => onHoverCard(card.id)}
              onMouseLeave={() => onHoverCard(null)}
            >
              <span className="atlas-card-top">
                <small>{card.code}</small>
                <em data-state={card.status}>{card.status}</em>
              </span>
              <strong className="atlas-card-title">{card.title}</strong>
              <span className="atlas-card-headline">{card.headline}</span>
              <span className="atlas-card-facts">
                <span>API {card.api.length}</span>
                <span>연관 {card.related.length}</span>
                <span>결함 {card.defects.length}</span>
                <span className={bound ? 'is-bound' : ''}>{bound ? '영역 연결' : '영역 없음'}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="atlas-local-actions">
        <div>
          <span>ACTION ADAPTER</span>
          <strong>EXTERNAL WRITE DISABLED</strong>
        </div>
        <p>실제 GitHub·Discord 호출 없이 동일한 상태 전이와 감사 이벤트만 기록합니다.</p>
        <button
          type="button"
          data-action-state={actionState.github}
          disabled={actionState.github === 'REQUESTED' || actionState.github === 'PROCESSING'}
          onClick={() => onRunAction('github')}
        >
          <Icon icon="mdi:github" width={16} />
          <span>CREATE ISSUE / LOCAL</span>
          <em>{actionState.github}</em>
        </button>
        <button
          type="button"
          data-action-state={actionState.discord}
          disabled={actionState.discord === 'REQUESTED' || actionState.discord === 'PROCESSING'}
          onClick={() => onRunAction('discord')}
        >
          <Icon icon="ic:baseline-discord" width={16} />
          <span>NOTIFY / LOCAL</span>
          <em>{actionState.discord}</em>
        </button>
      </div>
    </aside>
  );
}
