/**
 * 카드 상세 4절 — 개요 / 기능 통신 FLOW / API 규칙 / 연관된 기능.
 *
 * 네 절의 순서가 곧 기능명세서의 순서다. 무엇인가(개요) → 어떻게 도는가(FLOW)
 * → 어떤 계약인가(API) → 무엇과 얽혀 있는가(연관).
 *
 * 캔버스 아래에 붙이던 패널을 화면 한가운데 모달로 옮겼다. 아래에 붙으면
 * 카드를 누른 자리와 읽을 자리가 떨어져 매번 스크롤로 찾아 내려가야 했다.
 * 폭은 /project-map의 노드 카드와 같은 min(1320px, 94vw)로 맞춘다 — 같은
 * 저장소의 두 상세 표면이 서로 다른 폭이면 같은 것으로 읽히지 않는다.
 *
 * 산문을 줄이고 표로 바꿨다. 이 카드가 답해야 하는 것은 "무엇을 고치려면
 * 어디를 봐야 하나"이고, 그 답은 문단이 아니라 항목이다.
 */
import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { RELATION_LABEL } from '../atlas-theme';
import { AtlasCardFlow } from './AtlasCardFlow';
import { AtlasCodeRef } from './AtlasCodeRef';
import type { AtlasCard, CardApiRule } from '@/types/atlas-card';

interface Props {
  card: AtlasCard;
  onClose: () => void;
  /** 연관 카드로 건너뛴다. targetId가 있는 링크에만 붙는다. */
  onJumpToCard: (cardId: string) => void;
}

/**
 * operationId가 .project-atlas/registry의 ID 체계(OP-*)를 따르는지 본다.
 * 네트워크를 타는 호출인데 지역 ID를 쓰고 있으면 화면이 그렇다고 말해야 한다 —
 * registry와 카드가 갈라진 자리를 숨기면 이 캔버스는 코드와 이어지지 않는다.
 */
function describeOperationId(rule: CardApiRule) {
  if (rule.operationId.startsWith('OP-')) {
    return { tone: 'registry', text: 'registry ID 체계 (.project-atlas/registry)' };
  }
  if (rule.method === 'CLIENT') {
    return { tone: 'local', text: '카드 지역 ID — 네트워크를 타지 않아 registry 대상이 아니다' };
  }
  return { tone: 'warn', text: '네트워크 호출인데 registry ID 체계(OP-*)가 아니다' };
}

export function AtlasCardDetail({ card, onClose, onJumpToCard }: Props) {
  // 포커스 트랩. 이 컴포넌트는 열려 있을 때만 마운트되므로 항상 활성이다.
  // 트랩 로직은 /project-map의 페이지 브리프 카드와 같은 것을 쓴다 —
  // 두 모달이 다르게 동작하면 같은 저장소에서 접근성이 갈라진다.
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  // ESC로 닫는다. 카드를 바꿔도 리스너가 하나만 살아 있도록 카드 id에 묶는다.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 연관 카드로 건너뛰면 내용이 통째로 바뀐다. 포커스가 사라진 컨트롤에 남지 않도록
  // 모달 머리로 다시 옮긴다. 트랩 자체는 useFocusTrap이 이미 걸어두었다.
  useEffect(() => {
    dialogRef.current?.focus();
  }, [card.id, dialogRef]);

  return (
    <div
      className="atlas-modal-scrim"
      // 스크림 자체를 눌렀을 때만 닫는다. 내용 위에서 드래그해 끝난 클릭까지 닫히면 안 된다.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="atlas-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="atlas-modal-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <header className="atlas-detail-head">
          <div className="atlas-detail-head-main">
            <span className="atlas-detail-eyebrow">
              {card.code} / CARD SPEC
              <em data-state={card.status}>{card.status}</em>
            </span>
            <h2 id="atlas-modal-title">{card.title}</h2>
            <p>{card.headline}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="상세 닫기">
            <Icon icon="solar:close-circle-outline" width={20} />
          </button>
        </header>

        <div className="atlas-detail-grid">
          <div className="atlas-detail-col">
            <article className="atlas-detail-block">
              <h3><span>01</span> 개요</h3>
              <dl className="atlas-spec">
                <div>
                  <dt>정의</dt>
                  <dd>{card.overview.what}</dd>
                </div>
                <div>
                  <dt>위치</dt>
                  <dd>{card.overview.where}</dd>
                </div>
                <div>
                  <dt>DOM 노드</dt>
                  {/* 카드 id = 제품 DOM의 data-atlas-node. 이 등식이 카드와 화면 영역을 잇는다 */}
                  <dd>
                    <AtlasCodeRef
                      text={`data-atlas-node="${card.id}"`}
                      copyValue={card.id}
                    />
                  </dd>
                </div>
                <div>
                  <dt>구현 위치</dt>
                  <dd className="atlas-spec-stack">
                    {card.sources.length === 0 && <span className="is-muted">기록되지 않았다.</span>}
                    {card.sources.map((source) => (
                      <AtlasCodeRef
                        key={`${source.path}-${source.symbol ?? ''}`}
                        tag={source.layer}
                        text={source.symbol ? `${source.path} · ${source.symbol}` : source.path}
                        copyValue={source.path}
                      />
                    ))}
                  </dd>
                </div>
                <div>
                  <dt>결함</dt>
                  <dd>
                    {card.defects.length === 0
                      ? <span className="is-muted">없다.</span>
                      : (
                        <span className="atlas-spec-stack">
                          {card.defects.map((defect) => (
                            <AtlasCodeRef key={defect} text={defect} />
                          ))}
                        </span>
                      )}
                  </dd>
                </div>
              </dl>
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
            </article>
          </div>

          <div className="atlas-detail-col">
            <article className="atlas-detail-block">
              <h3><span>02</span> 기능 통신 FLOW</h3>
              <AtlasCardFlow steps={card.behaviour} />
            </article>

            <article className="atlas-detail-block">
              <h3><span>03</span> API 규칙</h3>
              {card.api.length === 0 && (
                <p className="is-muted">호출이 없다. 정적 렌더만 하는 영역이다.</p>
              )}
              {card.api.map((rule) => {
                const idNote = describeOperationId(rule);
                return (
                  <table className="atlas-api-spec" key={rule.operationId}>
                    <caption>{rule.summary}</caption>
                    <tbody>
                      <tr>
                        <th scope="row">operationId</th>
                        <td>
                          <AtlasCodeRef text={rule.operationId} />
                          <span className="atlas-id-note" data-tone={idNote.tone}>{idNote.text}</span>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">method · path</th>
                        <td>
                          <AtlasCodeRef tag={rule.method} tagAccent text={rule.path} />
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">security</th>
                        <td>{rule.security}</td>
                      </tr>
                      <tr>
                        <th scope="row">request</th>
                        <td>{rule.request ?? <span className="is-muted">없음</span>}</td>
                      </tr>
                      <tr>
                        <th scope="row">responses</th>
                        <td>
                          <ul className="atlas-api-responses">
                            {rule.responses.map((response) => (
                              <li key={response.code}>
                                <b>{response.code}</b>
                                <span>{response.when}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">safety</th>
                        <td>
                          <ul className="atlas-api-safety">
                            <li><i>부수효과</i><b>{rule.safety.sideEffect}</b></li>
                            <li>
                              <i>쓰기 대상</i>
                              <b>{rule.safety.writes.length ? rule.safety.writes.join(', ') : '없음'}</b>
                            </li>
                            <li>
                              <i>재실행</i>
                              <b data-risk={rule.safety.rerunSafe ? 'off' : 'on'}>
                                {rule.safety.rerunSafe ? '안전' : '위험'}
                              </b>
                            </li>
                            <li><i>실패 시</i><b>{rule.safety.abortOnFail}</b></li>
                          </ul>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                );
              })}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
