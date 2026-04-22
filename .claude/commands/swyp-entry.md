# /swyp-entry — Session Entry Point

Assesses current state and starts work.

> **응답 언어: 한국어** — 모든 응답은 한국어로 합니다.

---

## IMPORTANT: Placeholder Resolution Rule

**NEVER execute a bash command while any `{placeholder}` remains unresolved.**
Resolve `{repo}` from `git remote get-url origin` before any `gh` command. Collect all other values through conversation first, then run the final command with real values.

---

## Pre-checks

1. `git remote get-url origin` — verify repo and resolve `{repo}`
2. `git branch --show-current` — current branch
3. `git status --short` — check for uncommitted changes
4. `gh auth status` — show local info only if not authenticated

If uncommitted changes exist:
> 1. Stash and continue
> 2. Continue working on current branch
> 3. Commit with /swyp-commit

---

## Cases

- `/swyp-entry` — Daily status (default)
- `/swyp-entry pick #12` — Select issue + create branch
- `/swyp-entry resume` — Resume existing branch
- `/swyp-entry backlog` — Unassigned issue list

---

## daily — Daily Status (default)

### Current Work Status

```bash
git branch --show-current
git log --oneline -3
```

### My Issues (by priority)

```bash
gh issue list --repo {repo} --assignee @me --state open --json number,title,labels,milestone --limit 20
```

```
| # | Priority | Type | Title | Milestone |
|---|----------|------|-------|-----------|
```

### My PR Status

```bash
gh pr list --repo {repo} --author @me --state open --json number,title,reviewDecision
```

### Auto-recommended Next Action (Guided Q&A)

After assessing the situation, guide through template-based questions instead of a simple yes/no.

#### Step 0 — Project Init Check (FIRST, before all other steps)

Before assessing individual work status, check whether the project itself has started:

```bash
gh api repos/{repo}/milestones --jq 'length'
gh issue list --repo {repo} --state open --json number --limit 1 | jq length
```

| Condition | Flow |
|-----------|------|
| milestone = 0 AND open issues = 0 | → Step E (project init flow) |
| milestone = 0 AND open issues > 0 | → Step E (sprint scope flow) |
| milestone > 0 | → Step 1 (normal situation assessment) |

#### Step E — Project Init Flow

Do NOT display a fixed script or numbered list. Assess the situation and speak naturally.

**Conditions and judgment basis:**

| Condition | What to convey | Available actions |
|-----------|---------------|-------------------|
| milestone = 0 AND issue = 0 | Project hasn't started — nothing is set up yet | doc-sync, manual issue creation, milestone creation |
| milestone = 0 AND issue > 0 | Issues exist but no sprint structure yet | milestone creation, issue grouping |

**How to respond:**
- Describe the current state in one natural sentence
- Recommend the single most logical next step based on context
- Ask conversationally — do not list all options upfront
- Let the conversation guide what comes next

→ Route based on user's reply, not a preset menu.

#### Step 1 — Situation Assessment

| Situation | Flow |
|-----------|------|
| PR APPROVED | → Step A (PR merge flow) |
| Feature branch exists | → Step B (branch resume flow) |
| On main + assigned issue | → Step C (issue start flow) |
| No assigned issue | → Step D (new issue flow) |

#### Step A — PR Merge Flow

```
PR #{n}: {title}
- Status: APPROVED  Reviewers: {reviewers}
- Checklist:
  □ CI passing?
  □ No conflicts?

Merge now? (y / n)
```
→ On y: `gh pr merge {n} --squash --delete-branch`

#### Step B — Branch Resume Flow

```
Existing branch found: {branch}
- Last commit: {last_commit_message} ({date})
- Remote: {ahead}↑ {behind}↓

Resume this branch?
  [1] Resume (checkout + pull)
  [2] View linked issue first
  [3] Select a different branch
```

#### Step C — Issue Start Flow (Guided Q&A)

Display issue info, then **auto-infer work type. Do NOT ask Q1 if type is clear.**

```
Issue #{n}: {title}
- Priority: {priority}  Milestone: {milestone}
- Description: {first 2 lines of body}
```

Type inference rules:

| Signal in title/body | Inferred type |
|---------------------|--------------|
| `[bug]`, `error`, `failure`, `500` | bug |
| `[page]`, `page`, `screen` | page |
| `[task]`, `task`, `connect`, `deploy` | task |
| `[refactor]`, `refactor`, `improve`, `cleanup` | refactor |
| Unclear | Ask in one sentence: "Is this a bug fix, new feature, or refactoring?" |

After type is confirmed, ask conversationally:

> "What files or areas do you expect to touch? Just a rough idea is fine."

If the issue body has a checklist, display it. If not:

> "Any specific completion criteria? If not, I'll go ahead and create the branch."

After answers: create branch → set `status:progress` label → start work

#### Step D — New Issue Flow (Guided Q&A)

Ask conversationally — do NOT show a numbered list:

> "No assigned issue found. What would you like to work on today — a new feature, bug fix, refactoring, or would you like to pick something from the backlog?"

Detect intent from the reply and route:
- New feature / page → run `/swyp-issue page` flow inline
- Bug fix → run `/swyp-issue bug` flow inline
- Refactoring → run `/swyp-issue improvement` flow inline
- Backlog → run backlog flow

**Do NOT tell the user to type any slash command.**
Ask the question, wait for the answer, then act.

### Navigation

After displaying the recommendation, always add one conversational line:

> "If you'd like to switch spaces or do something else — PM space, FE space, BE space, register a new issue, or view the backlog — just let me know."

Detect intent from free-form reply and route accordingly:

| User says | Action |
|-----------|--------|
| PM / project / sprint | Load `/swyp-pm` agent |
| FE / frontend | Load `/swyp-fe` agent |
| BE / backend / server | Load `/swyp-be` agent |
| issue / new issue / register | Run `/swyp-issue` flow inline |
| backlog / list | Run backlog flow |
| Enter / nothing | Execute recommended action |

---

## pick — Select Issue + Create Branch

1. Verify issue: `gh issue view {number} --repo {repo}`
2. Display issue info + **test scenarios**:
   ```
   Issue #{number}: {title}
   - Priority: {priority}
   - Milestone: {milestone}

   Test scenarios (what to verify in this task):
     □ {test_1}
     □ {test_2}
     □ {test_3}
   ```
   If no test section: "Add with /swyp-test add #{n}"
3. Self-assign (suggest if not already assigned)
4. Generate branch name:
   - Label-based type: task/page → `feat`, bug → `fix`, improvement → `refactor`
   - Format: `{type}/{number}-{short-description}`
   - Create after user confirmation
5. **Auto status label change**: → `status:progress`

```bash
git checkout main && git pull origin main && git checkout -b {branch}
gh issue edit {number} --remove-label "status:backlog,status:todo" --add-label "status:progress" --repo {repo}
```

If branch already exists → checkout only

---

## resume — Resume Existing Work

```bash
git branch --list "feat/*" --list "fix/*" --list "refactor/*"
```

Display local feature branch list → select by number → checkout
Check remote sync (show behind/ahead)

---

## backlog — Unassigned Issues

```bash
gh issue list --repo {repo} --no-assignee --state open --json number,title,labels,milestone --limit 20
```

Display by priority → entering a number auto-switches to pick

---

## Safety Guards

- uncommitted changes → choose stash/commit/ignore
- Attempting to work directly on main → guide to create feature branch
- Picking a closed issue → block
- gh not authenticated → show local info only (degraded mode)
