# design-sync NOTES — BangCheck frontend

이 repo는 표준 디자인 시스템 패키지가 아니라 **Vite 앱**이라 비표준 셋업이 필요하다. 재동기화 전에 반드시 읽을 것.

## Setup gotchas (재동기화 시 재현)

- **앱(라이브러리 아님) → synth-entry 모드.** dist 컴포넌트 엔트리가 없어 컨버터가 `src/`에서 엔트리를 합성한다. `cfg.srcDir = src/components/ui` 로 스코프를 코어 ui 프리미티브에 한정.
- **자기참조 심볼릭링크 필수.** 컨버터는 `PKG_DIR = node_modules/<pkg>` 를 찾는데 앱은 자기 패키지가 node_modules에 없다. 빌드 전에 매번(클론마다) 재생성:
  ```
  ln -sfn .. node_modules/frontend
  ```
  없으면 `ENOENT node_modules/frontend/package.json` 로 죽는다.
- **Tailwind v4 CSS는 빌드 전 컴파일.** `src/app/globals.css` 는 `@import "tailwindcss"` 소스라 유틸리티가 없다. 빌드 전에 컴파일해 `cfg.cssEntry` 가 가리키는 곳에 둔다(gitignored 캐시이므로 매 sync 재생성):
  ```
  npx --yes @tailwindcss/cli@4 -i src/app/globals.css -o .design-sync/.cache/ds_compiled.css
  ```
- **폰트 Pretendard/Phudu 는 런타임 로드.** `index.html` 에서 로드되므로 번들에 안 실린다 → `cfg.runtimeFontPrefixes` 로 `[FONT_MISSING]` 억제.

## Build/validate 명령

```
ln -sfn .. node_modules/frontend
npx --yes @tailwindcss/cli@4 -i src/app/globals.css -o .design-sync/.cache/ds_compiled.css
node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle
node .ds-sync/package-validate.mjs ./ds-bundle    # playwright+chromium 필요
```

## 현재 상태 (2026-06-23)

- 스코프: 코어 `src/components/ui` — 13 컴포넌트 (Modal·ConfirmModal·모달 6종·RoomChip·SectionIcon·Spinner·StatusBadge·ChevronRight).
- 빌드 OK, 컴파일된 Tailwind(77KB) 포함.
- Claude Design 프로젝트 생성됨: `BangCheck Design System` (projectId `11ccd2d5-08f3-47c3-adbd-5f67434f3b8b`).
- **아직 업로드 안 함. 프리뷰 미작성(전부 floor card). 렌더체크 미실행.**

## Re-sync risks (다음 run이 주의할 것)

- 컴파일된 CSS(`.cache/ds_compiled.css`)와 self-symlink은 **gitignored** — 클론 후 위 명령으로 재생성해야 한다.
- 렌더체크(playwright)를 이 기계에서 못 돌렸다 — 프리뷰는 **기계 검증 안 됨** 상태. chromium 설치 후 validate부터.
- 앱이 진화하면 ui 컴포넌트 클래스가 바뀌므로 Tailwind 재컴파일 필수(위 명령이 매번 최신 유틸 생성).
- feature 컴포넌트(rooms/checklist/report/customization)는 아직 스코프 밖.
