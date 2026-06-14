# BangCheck Release Note — v1.0 (MVP / first ship)

> First shipped version. A room-hunting checklist service: inspect rooms with checklists, compare them, and see them on a map.
> Scope: Seodaemun-gu / Yonsei-area MVP · 392 commits (2026-04-21 → 2026-06-02) · HEAD `f8d0bc5`
> ⚠️ Version labels differ — product **v1.0 / MVP** · QA cycle **v2.1.2** · FE package **0.1.0** (stale scaffold) · git tag **none**

## Summary
Members and guests can both use it. Ships social login + guest mode, room CRUD, an 8-category checklist, per-user-type customization, a comparison report, map exploration, walking-distance, and address autocomplete. Deployed on AWS (S3+CloudFront / EC2). **Dev-complete; QA still in verification** (see QA Status).

## New Features
- **Social login (OAuth2) + guest mode** — Naver login + guest JWT so members and non-members can both use it (`AuthController`)
- **Room CRUD** — create/list/detail/update/delete (soft-delete), 6-room-per-user cap (`RoomController`)
- **Room checklist** — 8 categories: basic info, building, options, interior, problem signs, safety, convenience, surroundings (`ChecklistCategory`)
- **Checklist customization** — 6 user types (bug-averse, noise-sensitive, clean-freak, value, first-timer, essentials-only) + custom items (`UserType`)
- **Comparison report** — side-by-side category table + rent/problem scoring (`ReportController`)
- **Map exploration** — Naver Map (NCP) price-bubble markers + room-card InfoWindow + filter/sort (`MapController`)
- **Reference-point distance / walking time** — save station/university points, Haversine distance & walk time (500m filter) (`MapController /points`)
- **Address autocomplete + geocoding** — juso.go.kr search + Naver coordinate auto-save (null fallback on failure) (`AddressController`)
- **Home listing** — rent-type filter, sort, problem-count badges (`RoomsPage`)
- **Landing page** — hero/features/testimonials SPA + redirect to home when logged in (`LandingPage`)
- **Item inspection guide** — photo guide modal/panel per checklist item (`GuidePanel`)

## Improvements
- **Next.js → Vite + React 19 SPA migration** (E09) · SPA fallback rewrite prevents refresh-404
- **Mobile / responsive overhaul** — fluid typography, custom 2-col grid, BottomNav hidden on desktop
- **Design-token migration** — hardcoded hex → tokens, rating color system
- **Structure refactor** — mappers / TanStack Query layers split, service dependency inversion
- **Exception / validation / security hardening** — Room validation errors 500→4xx, null-coord defense, OAuth 401 fixes
- **Guest data persistence** — sessionStorage → localStorage (survives across sessions)
- **CI/CD** — GitHub Actions + EC2 systemd / S3+CloudFront

## Bug Fixes (16 notable)
- Custom-item add 409 unique-constraint (#180/#208) · settings-save 409 flush missing (#178)
- Checklist order drift — CUSTOM displayOrder NULL (#181) · seed misclassification & dup (#174/#187)
- Custom user-type switch leaked prior-type counts + single-select not applied (#182/#183)
- Naver Geocoding endpoint URL wrong (#111) · null-coordinate fallback on geocode failure (#156/#169)
- Room business-validation surfaced as 500 → now 4xx (#163) · RoomSummaryDTO Enum type mismatch (#124)
- Social login 401 / OAuth redirect mismatch blocked all login (#148/#149)
- Comparison report showed soft-deleted rooms (#151) · MapRoomResponseDTO name field missing
- Guest blocked from address-search / walking-directions (#202/#197) · CORS origin missing · bulk QA fixes

## Removed / Deactivated
- `frontend/vercel.json` (Vercel track dropped → AWS single-track) · `public/landing.html` (SPA single-route) — commit `789e256`
- Next.js / `npm run start` FE pipeline → Vite static build

## Deployment
| Item | Value |
|------|-------|
| FE | S3 + CloudFront · https://bangcheck.site · auto-deploy on push to main |
| BE | EC2(Ubuntu) + MySQL 8 + systemd `bangcheck-backend` · https://api.bangcheck.site (ACM) |
| Region | ap-northeast-2 · no staging |
| Stack | React 19 / Vite · Spring Boot 3.2.5 / Java 17 · Flyway |

## Known Issues / Incomplete (code-verified)
- **Guest data-merge API not implemented** (#170) — `/guest` issues a token but there is no merge endpoint/logic → ver1.1
- **Spring AOP logging not implemented** (#188) — no `@Aspect`, no aop dependency
- **juso / Naver-geocoding silent 500** — RestClient calls are unwrapped, so external 4xx/5xx falls through to COMMON_500; failed geocode saves lat/lon=null at HTTP 200 (GEOCODING_400 is dead code)

## ⚠️ QA Status (honest)
Per QA Dashboard (2026-05-26, cycle v2.1.2): **not release-ready** — all 5 ship-blocking conditions unchecked, scenario pass rate ~45% (57P / 29F / 106 not-run), Wave 1 UX in review, Wave 2 (24 items) deployed-but-awaiting-live-verify. So v1.0 is **dev-complete, not QA-passed**.

## Rollback
git revert (Big-Bang merge, no separate backup).
