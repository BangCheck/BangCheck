# /swyp-commit — 팀 커밋 규칙으로 커밋 + 푸시

---

## 사전 점검

1. **브랜치 확인** — main/master면 차단:
   > "main에서는 직접 커밋할 수 없습니다. /swyp-entry pick으로 브랜치를 만드세요."

2. **변경 확인** — `git status --short`, `git diff --stat`
   - 변경 없음 → 중단

3. **위험 파일 검사** — `.env`, `*.pem`, `*.key`, `credentials.*`, `secret*`
   - 감지 → 즉시 차단 + staging에서 제거 + .gitignore 안내

---

## Step 1: 변경 범위 분석

```bash
git diff --stat
git diff --cached --stat
```

### 커밋 분리 판단

- 같은 기능의 코드 + 스타일 → 1 커밋
- 서로 다른 기능 → 분리 제안
- 코드 + 무관한 설정 → 분리 제안

분리 시:
```
Commit 1: feat: 로그인 폼 UI 구현
  - src/components/LoginForm.tsx
  - src/styles/login.module.css

Commit 2: chore: ESLint 설정 업데이트
  - .eslintrc.js

이대로 진행할까요? (Y / 합쳐서 1커밋 / 직접 수정)
```

---

## Step 2: 커밋 메시지 생성

### 형식

```
type: 한글 설명

#{이슈번호}
```

### type 목록

| type | 용도 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `refactor` | 코드 리팩토링 |
| `chore` | 패키지 매니저 수정, 기타 |
| `design` | UI 디자인 변경 |
| `comment` | 주석 추가 및 변경 |
| `remove` | 파일 삭제만 |

### type 자동 추천

- 새 컴포넌트/페이지 → `feat`
- 버그 키워드 → `fix`
- .md만 변경 → `docs`
- import/변수명 정리 → `refactor`
- package.json/config → `chore`
- .css/.module.css만 → `design`
- 삭제만 → `remove`

### 이슈 번호

1. 브랜치명에서 추출: `feat/12-login-page` → `#12`
2. 실패 시 사용자에게 질문 (없으면 생략 가능)

### 확인

```
커밋 메시지:
  feat: 로그인 폼 레이아웃 구현

  #12

이대로 할까요? (Y / 수정)
```

---

## Step 3: staging + commit + push

```bash
git add {files}
git commit -m "type: 설명" -m "#{issue}"
git push  # (또는 git push -u origin {branch})
```

`--no-push` 옵션 시 push 생략

---

## Step 4: 종료 보고

```
커밋 완료
- {hash} | feat: 로그인 폼 레이아웃 구현
- 브랜치: feat/12-login-page
- push: ✅
- 다음: /swyp-pr #12
```

---

## 안전 장치

| 규칙 | 처리 |
|------|------|
| main 직접 커밋 | 차단 |
| .env/secret 파일 | 차단 + .gitignore 안내 |
| staged 없음 | 전체 add 제안 |
| amend | 명시 요청 시에만 |
| force push | 절대 금지 |
| 이슈 번호 누락 | 경고 (허용) |
| 10개+ 파일 변경 | 분리 제안 |
