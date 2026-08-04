/**
 * 왼쪽 패널 — 제품 페이지 전체가 한 화면에 들어간다.
 *
 * iframe은 same-origin이라 문서를 직접 잴 수 있고, 제품이 심어둔
 * data-atlas-node 좌표가 postMessage로 넘어와 카드 영역이 그 위에 얹힌다.
 * 측정과 배율은 usePreviewStage가 소유한다 — 여기는 그리기만 한다.
 */
import { Icon } from '@iconify/react';
import { MAX_ZOOM, MEASURE_VIEWPORT_HEIGHT, MIN_ZOOM, PREVIEW_BASE_WIDTH, usePreviewStage } from '../use-preview-stage';
import type { AtlasPageCards } from '@/types/atlas-card';

interface Props {
  page: AtlasPageCards;
  pageState: string;
  onPageStateChange: (stateId: string) => void;
  // 훅의 반환값을 그대로 받는다. 손으로 다시 적으면 ref의 null 허용 여부처럼
  // 사소한 차이가 갈라져서, 훅을 고칠 때 여기가 조용히 어긋난다.
  stage: ReturnType<typeof usePreviewStage>;
  selectedCardId: string | null;
  highlightId: string | null;
  onSelectCard: (cardId: string) => void;
  onHoverCard: (cardId: string | null) => void;
}

export function AtlasPagePanel({
  page,
  pageState,
  onPageStateChange,
  stage,
  selectedCardId,
  highlightId,
  onSelectCard,
  onHoverCard,
}: Props) {
  const {
    iframeRef, stageRef, rects, docHeight,
    fitScale, previewScale, isFit,
    changeZoom, fitZoom, reloadPreview, onPreviewLoad,
  } = stage;

  const activeState = page.states.find((state) => state.id === pageState) ?? page.states[0] ?? null;
  // 상태가 바뀌면 URL이 바뀌고, key가 바뀌면 iframe이 새로 뜬다
  const previewSrc = pageState === 'default'
    ? page.previewSrc
    : `${page.previewSrc}&atlasState=${encodeURIComponent(pageState)}`;

  return (
    <section className="atlas-page-panel">
      <div className="atlas-page-head">
        <div>
          <span>PAGE VIEW / 전체</span>
          <strong>{page.route}</strong>
        </div>
        <div className="atlas-page-meta">
          <div className="atlas-zoom" role="group" aria-label="미리보기 배율">
            <button
              type="button"
              onClick={() => changeZoom(-1)}
              disabled={!fitScale || previewScale <= MIN_ZOOM}
              title="축소"
              aria-label="축소"
            >
              <Icon icon="solar:minus-square-outline" width={14} />
            </button>
            <span>{previewScale ? `${Math.round(previewScale * 100)}%` : '측정 중'}</span>
            <button
              type="button"
              onClick={() => changeZoom(1)}
              disabled={!fitScale || previewScale >= MAX_ZOOM}
              title="확대"
              aria-label="확대"
            >
              <Icon icon="solar:add-square-outline" width={14} />
            </button>
            <button
              type="button"
              className={isFit ? 'is-active' : ''}
              onClick={fitZoom}
              title="전체 맞춤 — 스크롤 없이 페이지 전체"
              aria-pressed={isFit}
            >
              FIT
            </button>
          </div>
          <button type="button" onClick={reloadPreview} title="미리보기 새로고침">
            <Icon icon="solar:refresh-outline" width={13} />
          </button>
        </div>
      </div>

      {page.states.length > 0 && (
        <div className="atlas-state-bar">
          <div className="atlas-state-tabs" role="group" aria-label="화면 상태">
            {page.states.map((state) => (
              <button
                key={state.id}
                type="button"
                className={pageState === state.id ? 'is-active' : ''}
                onClick={() => onPageStateChange(state.id)}
                aria-pressed={pageState === state.id}
              >
                {state.label}
              </button>
            ))}
          </div>
          {activeState && (
            <div className="atlas-state-note">
              <p>{activeState.note}</p>
              {activeState.caveat && <p className="is-caveat">{activeState.caveat}</p>}
            </div>
          )}
        </div>
      )}

      <div className="atlas-page-stage" ref={stageRef} data-fit={isFit ? 'true' : 'false'}>
        {/* 배율이 반영된 실제 크기. transform은 레이아웃 크기를 바꾸지 않으므로
            이 래퍼가 스크롤 영역을 만든다. */}
        <div
          className="atlas-page-canvas"
          style={{
            width: PREVIEW_BASE_WIDTH * (previewScale || 0.01),
            height: (docHeight || MEASURE_VIEWPORT_HEIGHT) * (previewScale || 0.01),
          }}
        >
          <div
            className="atlas-page-scaler"
            style={{
              width: PREVIEW_BASE_WIDTH,
              height: docHeight || undefined,
              transform: `scale(${previewScale || 0.01})`,
            }}
          >
            <iframe
              ref={iframeRef}
              key={`${page.pageId}-${pageState}`}
              title={`${page.title} 전체 미리보기 (${activeState?.label ?? '기본'})`}
              src={previewSrc}
              style={{ width: PREVIEW_BASE_WIDTH, height: docHeight || MEASURE_VIEWPORT_HEIGHT }}
              onLoad={onPreviewLoad}
            />

            {page.cards.map((card) => {
              const rect = rects[card.id];
              if (!rect) return null;
              return (
                <button
                  type="button"
                  key={card.id}
                  className={`atlas-region ${highlightId === card.id ? 'is-active' : ''} ${selectedCardId === card.id ? 'is-selected' : ''}`}
                  style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
                  onClick={() => onSelectCard(card.id)}
                  onMouseEnter={() => onHoverCard(card.id)}
                  onMouseLeave={() => onHoverCard(null)}
                  aria-label={`${card.title} 영역`}
                >
                  <span style={{ transform: `scale(${previewScale ? 1 / previewScale : 1})` }}>
                    {card.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!docHeight && (
          <div className="atlas-page-waiting">
            <Icon icon="solar:radar-2-outline" width={20} />
            DOCUMENT MEASURING
          </div>
        )}
      </div>

      <div className="atlas-page-foot">
        <span><i className="is-green" /> SAME ORIGIN</span>
        <span><i /> NO SCROLL · 전체 {docHeight || '—'}px</span>
      </div>
    </section>
  );
}
