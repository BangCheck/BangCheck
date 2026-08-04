# 삭제한 브랜치 기록

> **쉽게**: 지운 브랜치가 무엇을 했고 왜 지웠는지 적어 둔 자리.
> 언제 보나: "그 작업 어디 갔지"를 물을 때, 또는 되살릴지 판단할 때.

브랜치를 남겨 두면 목록이 자라고, 자란 목록은 아무도 안 읽는다.
그래서 브랜치 대신 여기 기록만 남긴다.

되살리려면 아래 commit SHA로 되짚는다.
단 **원격까지 삭제한 브랜치의 SHA는 GitHub가 영구 보관하지 않는다** —
내용이 다른 브랜치에 흡수된 것만 여기서 지웠다.

---

## atlas/page-canvas (2026-08-04 삭제)

- tip: `28356e7588ed4c17e4ee48455b5e7b856febd4d4`
- parent: `dce3d8321b674bc26bdf30b8ef278f774ffa63be`
- 규모: 27파일 +9057 / -15

무엇을 했나 — Project Atlas 상세 캔버스의 첫 판이다.
운영 캔버스 MVP를 저장한 뒤(`dce3d83`), 화면 구성을 Front/Back 분할에서
페이지+기능 카드로 바꿨다(`28356e7`).

담긴 것: `features/project-atlas` 6파일, `features/project-dashboard` 2,
`features/research` 3, 타입 3종(`atlas-card`·`project-atlas`·`research`),
`lib/use-atlas-preview.ts`, 그리고 제품 컴포넌트에 심은 `data-atlas-node` 마커.

**삭제 사유 — 내용이 `atlas/baseline`에 완전히 흡수됐다.**
27파일 전부를 파일 단위로 대조해 차이 0을 확인한 뒤 지웠다.
따라서 이 브랜치를 되살릴 이유는 이력 자체가 필요할 때뿐이다.

## chore/compliance-minimal (2026-08-04 삭제)

- tip: `5f7842a92c71d1d4e09a06c5e351d1a1985b4562`
- 규모: 2파일 +72 / -210

무엇을 했나 — PR 자동 검사를 "되돌릴 수 없는 것만 막게" 줄였다.

형식 규칙 7개(`branch_naming`·`issue_linkage`·`commit_type`·
`commit_issue_ref`·`pr_template`·`issue_labels`·`pr_size`)를 걷어내고
`forbidden_files`(error) 하나만 남겼다.
근거는 커밋 메시지에 적혀 있다 — 화면 하나 고친 PR도 브랜치명에 이슈번호가
없다는 이유로 빨간불이 됐고, **형식은 리뷰가 볼 수 있지만 비밀 파일 커밋은
리뷰가 잡아도 늦다**는 것이다.

대신 `atlas_scope`(warning)를 신설해 PR이 어느 화면을 건드리는지
`Atlas: {pageId 또는 route}`로 밝히게 했다.

부수 발견: 판정은 워크플로의 인라인 정규식이 하는데 SPEC 파일은 자기가
정본이라고 적어 두어, **SPEC만 고치면 아무 일도 일어나지 않았다.**

**삭제 사유 — 이 변경은 `_wood/` 체계에 속한다.**
`_wood`는 SWYP 팀 방법론의 잔여 배선이고 정리 여부가 아직 결정되지 않았다.
그 결정 전에 브랜치로 떠 있으면 두 번 판단하게 된다.
`_wood` 정리를 착수할 때 이 기록에서 다시 꺼낸다.

미이행으로 남은 것: 커밋의 `Next:`가 "첫 PR에서 atlas_scope가 의도대로
경고만 내는지 확인한다"였는데 확인되지 않았다.

---

## 남긴 브랜치와 그 이유

| 브랜치 | 남긴 이유 |
|---|---|
| `main` | 제품 본류. 배포 대상 |
| `atlas/baseline` | 현재 작업 브랜치. Atlas + main 백엔드 |
| `feat/atlas-page-canvas` | room operation 7개의 vertical slice 이관이 여기에만 있다. 되살릴 수 없는 내용이라 기록으로 대체 불가 |
| `v0.2.0` | 스파인 3곳(`project.yaml`, `s01-0`)이 참조 중 |
