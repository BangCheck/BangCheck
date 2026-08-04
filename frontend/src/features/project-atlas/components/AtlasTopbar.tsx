/** 상단 머리띠 — 정본 식별자, 테마 선택, 영역 결합 수. */
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { THEMES } from '../atlas-theme';
import type { AtlasTheme } from '../atlas-theme';
import type { AtlasPageCards } from '@/types/atlas-card';

interface Props {
  pageId: string;
  page: AtlasPageCards;
  theme: AtlasTheme;
  onThemeChange: (theme: AtlasTheme) => void;
  /** 카드 중 화면 좌표가 실제로 잡힌 수. 선언이 아니라 측정값이다. */
  boundCount: number;
}

export function AtlasTopbar({ pageId, page, theme, onThemeChange, boundCount }: Props) {
  const activeTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  return (
    <>
      <header className="atlas-topbar">
        <div className="atlas-brand">
          <span className="atlas-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>
            <strong>BANGCHECK</strong>
            <small>PROJECT ATLAS</small>
          </span>
        </div>

        <div className="atlas-title">
          <span>Workspace / Product map / {pageId}</span>
          <strong>{page.title} / PAGE CANVAS</strong>
        </div>

        <div className="atlas-topbar-actions">
          <span className="atlas-adapter-badge"><i /> MOCK / LOCAL ADAPTER</span>
          <Link className="atlas-back-link" to={ROUTES.PROJECT_MAP}>
            <Icon icon="solar:arrow-left-outline" width={15} />
            PAGE MAP
          </Link>
        </div>
      </header>

      <section className="atlas-controlbar">
        <div className="atlas-canonical-status">
          <span>CANONICAL RECORD</span>
          <strong>PAGE::{pageId.toUpperCase()}</strong>
          <i />
          <em>{page.route}</em>
        </div>

        <div className="atlas-theme-switcher" role="group" aria-label="Atlas theme">
          {THEMES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={theme === item.id ? 'is-active' : ''}
              onClick={() => onThemeChange(item.id)}
              title={`${item.label} · ${item.description}`}
              aria-pressed={theme === item.id}
            >
              <span style={{ background: item.background, borderColor: item.accent }}>
                <i style={{ background: item.accent }} />
              </span>
              <small>0{index + 1}</small>
              {item.label}
            </button>
          ))}
        </div>

        <div className="atlas-live-state">
          <span className="is-live"><i /> FULL PAGE</span>
          <span><i /> REGION {boundCount}/{page.cards.length}</span>
          <strong>{activeTheme.description}</strong>
        </div>
      </section>
    </>
  );
}
