# SWYP Team Conventions Guide

Team rules for the Jeotchabang (self-care checklist) frontend project.

---

## 1. Branch Strategy: GitHub Flow

```
main (always deployable)
  └── feat/12-login-page (feature development)
  └── fix/15-kakao-auth-error (bug fix)
  └── refactor/18-auth-hook (refactoring)
```

- No direct commits to `main`.
- Work on feature branches → merge via PR.
- Branch naming: `{type}/{issue-number}-{description}`

---

## 2. Commit Messages

```
type: Korean description

#issue-number
```

### Type Reference

| type | Purpose | Example |
|------|---------|---------|
| `feat` | New feature | feat: 로그인 폼 UI 구현 |
| `fix` | Bug fix | fix: 카카오 인증 토큰 만료 처리 |
| `docs` | Documentation | docs: README 설치 가이드 업데이트 |
| `refactor` | Refactoring | refactor: 인증 로직 커스텀 훅 분리 |
| `chore` | Config, packages | chore: eslint 규칙 추가 |
| `design` | UI/design changes | design: 로그인 버튼 스타일 변경 |
| `comment` | Comments | comment: API 호출 로직 주석 보강 |
| `remove` | File deletion only | remove: 미사용 컴포넌트 삭제 |

### Rules

- Type in lowercase English
- Description in Korean
- Use imperative form: "구현", "수정", "추가"
- No trailing period

### Commit Granularity

- One commit = one concern (never mix `feat`, `docs`, `chore`, etc. in a single commit)
- Documentation/AI infrastructure changes must be in a separate branch and PR from feature work
- When using squash merge, the PR title becomes the single commit message — keep the PR scope to a single type

---

## 3. Code Conventions

### Files & Folders

- Use **kebab-case**: `user-profile`, `login-form.tsx`

### JavaScript/TypeScript

- **Prettier**-based formatting
- Strings & imports: **double quotes ("")**
- Statement-ending: **semicolons (;)**
- Functions & variables: **camelCase** (`addFunction`, `handleSubmit`)
- Spaces around operators and after commas

### Components

```tsx
// named export
const LoginForm = () => {
  return <div></div>;
};

export default LoginForm;
```

### Multiple Exports

```tsx
export const addFunction = () => {
  return 1 + 2;
};

export const divFunction = () => {
  return 10 / 5;
};
```

---

## 4. Workflow

```
1. Check issue      → Find my issue on GitHub Issues
2. Create branch    → feat/{issue-number}-{description}
3. Write code       → Follow conventions
4. Commit           → type: Korean description + #issue-number
5. Create PR        → Closes #issue-number + assign reviewer
6. Code review      → Merge after reviewer approval
7. Delete branch    → Delete feature branch after merge
```

---

## 5. Issue Types

| Type | Label | Description |
|------|-------|-------------|
| Page issue | `page` | Per-page unit, includes task checklist |
| Task issue | `task` | Sub-task of a page, resolved by 1 PR |
| Bug | `bug` | Reproducible malfunction |
| Improvement | `improvement` | Feature/performance/UX enhancement |

---

## 6. Priority Levels

| Label | Meaning | Response |
|-------|---------|----------|
| `P0-critical` | Service down, data loss | Immediate |
| `P1-urgent` | Core feature blocked | Same day |
| `P2-normal` | Regular feature work | Within sprint |
| `P3-backlog` | Non-urgent improvement | When available |

---

## 7. Team Member Assignments

| GitHub Login | Name | Role | Primary Scope |
|---|---|---|---|
| Woo-JongHo | 우종호 | Admin / Developer | Architecture, infra, auth |
| yekhong | 홍예은 | PM | Spec, issues, milestones |
| dlwldP | 이지예 | Developer | Frontend pages |
| std-yong | 이진용 | Developer | Frontend pages |
| minwoo-l | 이민우 | Developer | Frontend pages |

---

## 8. Document Language Rules

All non-code documents in this repo MUST be written in **English**. This is a **security policy** — AI agents, workflows, and planning documents are part of the attack surface; keeping them in a single, auditable language reduces prompt-injection risk and ensures consistent AI behavior across tools.

### Scope

| Category | Path | Language | Notes |
|---|---|---|---|
| AI infrastructure | `_wood/**` (agents, workflows, protocols) | **English only** | Security-critical — AI instructions must not be ambiguous |
| Planning docs | `docs/` (epics, stories, specs) | **English only** | Copied from 00_bmad (Korean) with translation |
| AI governance | `AGENTS.md`, `CLAUDE.md`, `.cursorrules` | **English only** | Already English |
| Team config | `_wood/team-roles.yaml` | **English** | Korean names in `real_name` field are acceptable |
| Commit descriptions | — | Korean | Existing team convention |
| Code comments | — | Korean | Existing team convention |

### Rules

- The source of truth is managed in Korean at `00_bmad` (`_woo/projects/08_SWYP/`); documents are translated to English when copied to this repo.
- Identifiers (filenames, slugs, command IDs, branch names) always use English/ASCII.
- `_wood/` agents and workflows must be fully English — Korean inline comments or labels are prohibited.

### §8.1 AI Co-authorship Policy (Security)

Commits touching AI infrastructure paths **must not** include `Co-Authored-By:` AI tool attribution.

**Affected paths:** `_wood/`, `.claude/`, `.swyp/`, `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`

**Rationale:** AI attribution on security-critical instruction files exposes AI behavior patterns. All commits to these paths must appear as sole human authorship.

---

## 9. Prohibited Actions

- Never commit `.env` or secret keys
- No `git push --force`
- No direct commits to main
- No merge without review

---

## 10. Claude Code Usage (Optional)

Claude Code automates the following:

| Command | Function |
|---------|----------|
| `/swyp-entry` | Check today's tasks + create branch |
| `/swyp-issue` | Register issue (page/task/bug) |
| `/swyp-commit` | Convention-compliant commit |
| `/swyp-pr` | Issue-linked PR creation |
| `/swyp-project` | Project board management |
