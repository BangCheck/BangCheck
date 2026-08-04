# claude critical-review artifact

- Provider: claude
- Model: claude-fable-5
- Reasoning effort: high
- Target dir: /Users/jonghoPro/woo/00_project/08_BangCheck
- Exit code: 0
- Resolved CLI: /Users/jonghoPro/.local/bin/claude
- Started at (UTC): 2026-07-29T10:54:32.605346+00:00
- Finished at (UTC): 2026-07-29T10:58:39.565959+00:00

## Original task / label

project-atlas-mvp-architecture

## Final prompt

```text
당신은 Project Atlas MVP의 반대 관점 설계 리뷰어다. 현재 Codex가 만든 구현은 frontend/src/features/research/ResearchPage.tsx, research-data.ts, research.css, frontend/src/features/project-dashboard/**에 있다. 배경: 이 화면은 단순 뷰가 아니라 프로젝트 운영 정본 UI가 된다. canonical DB + append-only event log가 정본이며 01_www 문서, GitHub Issue/PR/Check, Discord는 투영 및 협업 표면이다. 목표 계층은 Project Map → Page Canvas(실제 live View + Front/Back node) → Node Detail(API, request/response, auth, exception, log, metric, trace, linked issue)이다. 첫 walking skeleton은 첫 진입·랜딩 카드 → live View → 로그인 버튼 hotspot → Front interaction node → Back OAuth/API node → 예외·로그·Issue 상세 → GitHub Issue 생성 → action 상태(REQUESTED/PROCESSING/SUCCEEDED/FAILED/RETRYING/DEAD_LETTER) → Discord 알림 이벤트 기록이다. 현 코드를 직접 읽고 MVP를 통과시키지 말고 REVISE 관점으로 검토하라. 특히 1) 정본 엔티티와 불변식 누락, 2) webhook idempotency/outbox/audit/conflict 모델, 3) 권한·secret·GitHub/Discord 외부 쓰기 안전성, 4) live View와 hotspot의 구현 가능성, 5) MVP가 과도하거나 세로 경로가 끊기는 지점, 6) Page/Front/Back/Node Detail 정보 구조, 7) 실제 구현을 1세션 단위로 쪼갠 권장 순서를 제시하라. 결과는 MAJOR/MINOR, 반드시 고칠 것과 MVP 이후로 미룰 것을 구분하고 파일은 수정하지 마라.

```

## Raw output

```text
# Project Atlas MVP 리뷰 — 판정: REVISE

전체 리뷰를 `~/.claude/plans/project-atlas-mvp-polished-turtle.md`에 작성했습니다. 코드 4,299줄(ResearchPage 516 + research-data 245 + research.css 2,475 + dashboard 1,021)을 직접 읽은 결과입니다. 요약:

**총평: 현재 구현은 "정본 UI의 스킨"이지 정본 UI가 아닙니다.** walking skeleton 9단계 중 구현된 단계는 **0개**이고, live View·hotspot·이벤트 모델·외부 연동은 grep 수준에서도 존재하지 않습니다. 스킨 품질은 높지만, 노력이 가로(테마 4종, presence, 공유 버튼)에 전부 쏠렸고 세로 경로는 첫 삽도 안 떴습니다.

## MAJOR — 반드시 고칠 것

1. **[최우선·보안] 내부 취약점 목록이 공개 라우트에 실림** — `router.tsx`에서 `/project-map`, `/project-dashboard`가 가드 없이 등록됐습니다. 이 앱은 S3+CloudFront로 배포되는 소비자 서비스라, 지금 배포하면 미해결 IDOR 4건의 ID·담당자 실명·silent-500 결함이 공개 URL에서 열립니다. 최소 `import.meta.env.DEV` 가드가 첫 수정이어야 합니다.
2. **정본 엔티티 부재** — `types/research.ts`는 뷰모델 4개뿐. Event(append-only), Action(상태 머신), NodeDetail, IssueLink, Outbox가 타입 수준에서도 없습니다.
3. **지표 전부 조작** — `progress: 88…`은 수기 숫자, readiness는 그 평균. "LIVE DATA · 18:56", "54/54 SHA-256 검증 완료", 참여자 아바타가 전부 하드코딩입니다. 정본 UI에서 출처 없는 숫자는 불변식 위반이고, "가짜 완료 금지" 원칙의 UI 버전 위반입니다. `MOCK` 배지로 정직화하거나 제거해야 합니다.
4. **webhook idempotency/outbox/conflict 모델 전무** — 구현이 아니라 모델링 자체가 없습니다. GitHub 쓰기를 프런트에서 직접 부르는 구조로 시작하면 못 뜯어고치므로, outbox 경유·dedupe key·상태 전이표를 코드 전에 스키마로 고정해야 합니다.
5. **live View 0줄** — 현재 Page Canvas는 고정 좌표 버튼 그리드입니다. iframe(같은 origin) + `data-atlas-node` 마커 + postMessage rect 보고가 유일하게 유지 가능한 hotspot 설계이며, 이 스파이크가 실패하면 계층 2 전체가 바뀌므로 리스크 소거를 앞당겨야 합니다.
6. **Node Detail이 다른 물건** — 현재 상세 패널은 팀 렌즈 문서 목록(기획/디자인/FE/BE/QA)으로, 목표인 운영 관점(API request/response, PATH A/B/C, 예외, log/trace, linked issue)과 스키마가 다릅니다. Front/Back node 구분도 없습니다.
7. **경계 위반 + 죽은 데이터** — project-dashboard가 `features/research/`를 직접 import(frontend CLAUDE.md 위반), `RESEARCH_CONNECTIONS`는 정의만 되고 미사용이라 SVG "FLOW BUS"는 실제 엣지가 아닌 장식, P1 목록은 `current.yaml`을 손으로 복제해 표류 위험이 있습니다.

## MINOR / MVP 이후로 미룰 것

테마 시스템(localStorage 포함), presence·공유, 핸들러 없는 `⌘K` 표기, no-op 버튼들(자료 아카이브·타임라인·새로고침·artifact 클릭), 줌의 `transform: scale` 스크롤 어긋남, 테마 메뉴 Escape/outside-click 부재, `ResearchPage.tsx`가 `ProjectMapPage`를 export하는 명명 표류.

## 권장 세션 순서 (1세션 단위)

S1 접근 차단 + MOCK 정직화 + 경계 정리 → S2 정본 스키마 고정(Event/Action/Outbox 타입 + 전이표 문서) → S3 live View iframe 스파이크(마커 2개 + hotspot 1개) → S4 로그인 Front/Back node Detail 읽기 전용 → S5 백엔드 최소 정본(event/outbox 테이블 + API) → S6 GitHub Issue 생성(idempotency 검증: 같은 요청 2번 → 이슈 1개) → S7 Discord 알림 + webhook dedupe. 여기까지가 skeleton 전 구간이고, 테마·지표 자동화는 S8 이후입니다.

파일은 요청대로 일절 수정하지 않았습니다. 참고로 이 세션에서 claude.ai Notion·Slack 커넥터는 미인증 상태라 사용 불가합니다(claude.ai 커넥터 설정에서 인증 필요).
```

## Concise summary

claude 실행 완료. raw output에서 verdict와 finding을 확인할 것.
