# BangCheck Design System

## 1. Atmosphere & Identity

BangCheck is a quiet engineering control room: dense evidence is made legible through
small labels, hard edges, and layered terminal-like surfaces. The signature is a
measured connection between a live product preview and the evidence that explains it.
Project Atlas keeps that language while letting conversation state move visibly through
the interface.

## 2. Color

### Palette

Atlas themes provide the semantic values. Components must consume the `--map-*` tokens
from `frontend/src/features/project-atlas/atlas-base.css`; no component-local raw color
is permitted.

| Role | Token | Usage |
|------|-------|-------|
| Surface/base | `--map-bg` | Canvas and page background |
| Surface/top | `--map-top` | Top bar and control bar |
| Surface/panel | `--map-panel` | Cards and evidence surfaces |
| Surface/raised | `--map-panel-raised` | Selected or sticky surfaces |
| Text/primary | `--map-text` | Main labels and content |
| Text/muted | `--map-muted` | Metadata and secondary content |
| Border/default | `--map-border` | Structural separators |
| Border/strong | `--map-border-strong` | Focus and active boundaries |
| Accent/primary | `--map-accent` | Current selection and input role |
| Accent/secondary | `--map-secondary` | Assistant output role |
| Status/live | `--map-live` | Synchronized or verified state |
| Status/warning | `--map-warning` | Thinking, loading, or caution |
| Status/danger | `--map-danger` | Failure or destructive state |
| Status/info | `--map-info` | Tool and informational state |

### Rules

- Theme switching changes semantic slots, not component markup.
- Conversation roles always have a non-color cue: label, border, or icon.
- Accent color is reserved for selection, focus, and active evidence paths.

## 3. Typography

### Scale

Atlas is intentionally compact. Product copy uses 11–13px; metadata uses the mono
face at 6–9px. Body text in the new session evidence surface is at least 11px and has
line-height 1.6 for scanability.

### Font Stack

- Primary: `"Pretendard", "Noto Sans KR", system-ui, sans-serif`
- Mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### Rules

- Mono is for identifiers, timestamps, counts, and machine states.
- Primary is for Korean explanatory copy and transcript content.
- Labels are uppercase only when they describe a machine boundary.

## 4. Spacing & Layout

### Base Unit

Spacing follows a 4px base. Existing Atlas surfaces use compact 6–18px gaps to keep the
page-map density intact.

| Token | Value | Usage |
|------|-------|-------|
| `--space-1` | 4px | Icon and label gap |
| `--space-2` | 8px | Compact list gap |
| `--space-3` | 12px | Card inner padding |
| `--space-4` | 16px | Section padding |
| `--space-6` | 24px | Major surface separation |

### Grid

- Atlas minimum desktop width: 1180px.
- Canvas: flexible preview column plus a 380px evidence rail.
- Session evidence: 280px conversation rail plus a flexible detail column.
- The only scrolling owner inside a session surface is the session stream itself.

## 5. Components

### Atlas card

- **Structure**: button → machine code/status → title → headline → facts.
- **Variants**: default, hovered, selected, unbound.
- **Spacing**: 12px inner padding, 8px list gap.
- **States**: default, hover, active, focus-visible, selected, disabled action.
- **Accessibility**: native button, visible focus, selected state is not color-only.
- **Motion**: border and surface transition only; no layout movement.

### Conversation box

- **Structure**: one input header followed by an output stack; one box per user input.
- **Variants**: input, assistant output, thinking, tool, system/meta.
- **Spacing**: 12px surface padding, 8px entry gap.
- **States**: loading, ready, error, selected conversation, collapsed payload.
- **Accessibility**: role label is text, timeline entries remain keyboard-readable, long
  payloads use disclosure instead of clipping.
- **Motion**: signal rail pulse on live/imported state and opacity/transform entry only.

### Evidence rail

- **Structure**: indexed buttons with input preview, timestamp, and output counts.
- **Variants**: active, hovered, focused, unavailable.
- **States**: default, selected, focus-visible, loading, empty, error.
- **Accessibility**: `aria-pressed`, labelled navigation, reduced-motion fallback.
- **Motion**: nearest-item emphasis follows the preview-rail mechanism; this first pass
  uses CSS transitions because the project has no shared motion library.

## 6. Motion & Interaction

| Token | Duration | Easing | Usage |
|------|----------|--------|-------|
| `--atlas-motion-micro` | 120ms | ease-out | Focus and border feedback |
| `--atlas-motion-standard` | 200ms | cubic-bezier(0.16, 1, 0.3, 1) | Rail selection and panel entry |
| `--atlas-motion-signal` | 2.2s loop | ease-in-out | Imported session signal pulse |

Motion has a job: the signal shows that a session is present, rail emphasis shows
which conversation owns the detail, and panel entry shows a change of context. Only
`transform`, `opacity`, `filter`, and color-like paint properties are animated. The
`prefers-reduced-motion: reduce` path removes looping and transform motion while
retaining state changes and labels.

## 7. Depth & Surface

### Strategy

Mixed, with borders as the primary structure and a small hard offset shadow for cards.
Atlas surfaces should feel like instrument panels, not floating glass. Raised surfaces
use `--map-panel-raised`; elevation is `3px 3px 0 rgba(0, 0, 0, 0.17)` for compact cards
and the existing modal shadow for focused details.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- WCAG 2.2 AA target for interactive text and focus indicators.
- Keyboard reachability and `focus-visible` are required for cards, rail entries,
  disclosure controls, and modal controls.
- Status and conversation role are expressed by label plus color.
- `prefers-reduced-motion` disables non-essential looping, transform, and blur motion.

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
|------|----------|--------------|--------------|
| Atlas keeps a desktop minimum width | `atlas-base.css` | Existing canvas is a desktop inspection tool | Revisit when mobile canvas contract exists |
| Local Claude evidence is a generated asset | `public/atlas/claude-session.json` | The current product has no session API contract | Replace with authenticated source adapter before shared deployment |
