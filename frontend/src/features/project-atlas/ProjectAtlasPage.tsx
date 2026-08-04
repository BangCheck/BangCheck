/**
 * 페이지 캔버스 — 제품 화면 하나를 통째로 띄우고 그 위에 기능 카드를 얹는다.
 *
 * 이 파일은 배선만 한다. 실제 일은 넷이 나눠 갖는다.
 *   usePreviewStage  — iframe 측정, 배율, 카드 영역 좌표
 *   useLocalActions  — 로컬 액션 어댑터와 감사 저널
 *   components/*     — 그리기
 *   atlas-theme      — 테마와 이름표
 */
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { ATLAS_PAGES, findAtlasPage } from './atlas-pages';
import { THEME_STORAGE_KEY, getInitialTheme } from './atlas-theme';
import { useLocalActions } from './use-local-actions';
import { usePreviewStage } from './use-preview-stage';
import { AtlasCardDetail } from './components/AtlasCardDetail';
import { AtlasCardRail } from './components/AtlasCardRail';
import { AtlasEventPanel } from './components/AtlasEventPanel';
import { AtlasPagePanel } from './components/AtlasPagePanel';
import { AtlasTopbar } from './components/AtlasTopbar';
import type { AtlasTheme } from './atlas-theme';
import './project-atlas.css';

export default function ProjectAtlasPage() {
  const { pageId = 'landing' } = useParams();

  const [theme, setTheme] = useState<AtlasTheme>(getInitialTheme);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [pageState, setPageState] = useState('default');

  const resolvedPage = findAtlasPage(pageId);
  const isSupportedPage = resolvedPage !== null;
  // 등재되지 않은 pageId여도 화면은 그린다 — 첫 등재 페이지를 보여주고 안내를 얹는다
  const page = resolvedPage ?? ATLAS_PAGES[0];

  const { actionState, runLocalAction, appendEventOnce, eventRows } =
    useLocalActions(page, selectedCardId);
  const stage = usePreviewStage({ pageId, pageState, onEvent: appendEventOnce });

  // 페이지를 옮기면 이전 페이지의 선택이 남으면 안 된다.
  // 측정값은 usePreviewStage가 같은 pageId를 보고 스스로 버린다.
  useEffect(() => {
    setSelectedCardId(null);
    setHoveredCardId(null);
    setPageState('default');
  }, [pageId]);

  const selectTheme = (nextTheme: AtlasTheme) => {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const selectedCard = page.cards.find((card) => card.id === selectedCardId) ?? null;
  const highlightId = hoveredCardId ?? selectedCardId;
  const boundCount = page.cards.filter((card) => stage.rects[card.id]).length;

  return (
    <main className={`project-atlas project-map-theme-${theme}`}>
      <AtlasTopbar
        pageId={pageId}
        page={page}
        theme={theme}
        onThemeChange={selectTheme}
        boundCount={boundCount}
      />

      {!isSupportedPage && (
        <div className="atlas-unsupported">
          <Icon icon="solar:construction-outline" width={19} />
          <span>
            <strong>{pageId}</strong> 캔버스는 아직 카드가 없습니다. 등재된 페이지:{' '}
            {ATLAS_PAGES.map((item) => item.route).join(' · ')}
          </span>
          {ATLAS_PAGES.map((item) => (
            <Link key={item.pageId} to={ROUTES.PROJECT_PAGE(item.pageId)}>
              {item.pageId.toUpperCase()} 열기
            </Link>
          ))}
        </div>
      )}

      <div className="atlas-canvas">
        <AtlasPagePanel
          page={page}
          pageState={pageState}
          onPageStateChange={setPageState}
          stage={stage}
          selectedCardId={selectedCardId}
          highlightId={highlightId}
          onSelectCard={setSelectedCardId}
          onHoverCard={setHoveredCardId}
        />

        <AtlasCardRail
          page={page}
          rects={stage.rects}
          selectedCardId={selectedCardId}
          onToggleCard={(cardId) => setSelectedCardId(selectedCardId === cardId ? null : cardId)}
          onHoverCard={setHoveredCardId}
          actionState={actionState}
          onRunAction={runLocalAction}
        />
      </div>

      {selectedCard && (
        <AtlasCardDetail
          card={selectedCard}
          onClose={() => setSelectedCardId(null)}
          onJumpToCard={setSelectedCardId}
        />
      )}

      <AtlasEventPanel rows={eventRows} />
    </main>
  );
}
