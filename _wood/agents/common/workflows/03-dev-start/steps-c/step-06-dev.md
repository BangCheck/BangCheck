---
name: step-06-dev
description: "Development guide + code analysis + specific recommendations"
nextStepFile: "./step-07-sync.md"
---


# Step 06 — Start Development

READ THIS ENTIRE FILE before executing any action.

---

### 6-1. Development Guide Based on Current Story

```
## Start Development

Branch: {branch_name}
Issue:  #{issue_number} → 상태:진행중

Current Story: {story_title} (S{n})
  AC: {acceptance_criteria_summary}
```

---

### 6-2. Deep Code Analysis (MANDATORY)

### 6-2a. Read All Related Code

**Actually read** the `{related_files}` collected in step-01:

```bash
# Read all related files (no offset/limit)
for file in {related_files}; do
  cat "$file"
done

# Explore dependencies
grep -rn "import.*{class_name}\|require.*{module}" $SEARCH_PATH | head -20
```

### 6-2b. Code Structure Analysis

Identify the following from the code read:

```
## Code Analysis — #{issue_number}

### Current Structure
  📁 {file_1}:{lines} — {role description}
    └── {class/function} — {what it does}
    └── {class/function} — {what it does}
  📁 {file_2}:{lines} — {role description}
    └── {relationship: calls X from file_1}

### Pattern Analysis
  ✅ Good: {e.g., consistent error handling}
  ⚠️ Caution: {e.g., same validation logic duplicated in 3 places}
  ❌ Issue: {e.g., potential N+1 query}

### Dependencies
  {file_1} → {file_2} → {file_3}
  {external dependency: {library} v{version}}
```

### 6-2c. Issue Checklist vs Code Gap

```
### Gap Analysis

| Checklist Item | Code Status | Location |
|----------------|-------------|----------|
{for each checklist item:}
| {item} | {✅ implemented / 🟡 partially implemented / ❌ not implemented} | {file:line or "none"} |
{/for}

{if api_contract:}
| API: {method} {path} | {exists in code? / not implemented} | {controller:line} |
{/if}
```

---

### 6-3. Specific Recommendations (A/B/C/D Pattern)

Propose **specific modification directions** based on code analysis results.

### Recommendation Generation Rules

1. Recommend only based on **evidence from actually reading the code** (no guessing)
2. Be specific down to **file:line** level
3. State the **effect** explicitly (line count change, maintainability improvement, etc.)
4. Provide **A/B/C/D** options for scope adjustment

### Output Format

```
## Implementation Recommendation

### Core Recommendation: {topic}

  {specific modification direction description}

  - {file_1}:{line} — {change content}
  - {file_2} new — {creation content}
  - {file_3}:{line} — {delete/modify}

  Effect:
  - {quantitative effect: e.g., ~30 lines deleted, duplication removed}
  - {qualitative effect: e.g., only single point to modify when policy changes}

---

  Proceed?

  A. {minimum scope} — {description} (safest)
  B. {recommended scope} — {description} (recommended)
  C. {broad scope} — {description} (maximum cleanliness)
  D. Hold — record analysis only, implement later

  Recommendation: B — {reason}

  Which direction?
```


> 🛑 **STOP** — Wait for user input before continuing.


### After Selection

| Selection | Action |
|-----------|--------|
| A/B/C | Start implementation guide for selected scope (file-by-file order + notes) |
| D | Record analysis results in Story Log → step-07-sync |
| **Free response** | **Enter §6-3b discussion mode** |

---

### 6-3b. Discussion Mode (when developer proposes a different direction)

When a free response (opinion, counterargument, alternative proposal) comes in instead of A/B/C/D:

Enter discussion **while maintaining context** (issue + code analysis + Story).

#### Step T1 — Accept Developer Opinion + Code-Based Verification

**Verify the developer's proposal by actually reading the code.** No guessing.

```
## Opinion Review — "{developer proposal summary}"

### Current Code Structure
  📁 {file}:{line} — {current structure description}
  {actual code snippet quote}

### Impact Analysis if Proposal Applied
  Changed files: {n}
  Impact scope: {specific}
  
  ✅ Pros: {benefits of proposal — code evidence}
  ⚠️ Caution: {risks or additional work — code evidence}
  {if issues found}
  ❌ Concern: {specific problem — code evidence}
  {/if}
```

#### Step T2 — Agreement or Counter-Proposal

```
{if agree}
  ✅ Good direction. Here's how to implement it:
  
  {specific file:line modification plan}

{elif partial agreement}
  💡 The core idea is good, but one adjustment would make it better:
  
  {counter-proposal + code evidence}

{elif risky}
  ⚠️ This direction needs caution:
  
  {specific problem + code evidence}
  
  Alternative: {different approach}
{/if}
```

#### Step T3 — Regenerate A/B/C/D

Reflect discussion results and **recreate the options:**

```
## Revised Implementation Recommendation

  {discussion reflection description}

  A. {based on developer proposal — minimum scope}
  B. {developer proposal + AI supplement — recommended}
  C. {maximum scope}
  D. {proceed with original AI recommendation}

  Recommendation: {letter} — {agreed reason}
  
  Which direction?
```

STOP and WAIT. → When A/B/C/D selected, start implementation.
→ If another free response, loop back to T1 (continue discussion).

#### Discussion Rules

- **Always read the code** before answering (no guessing)
- **Respect developer experience** — not "that won't work" but "here's something to consider"
- **Never end without a conclusion** — always present new A/B/C/D after discussion
- **Prevent context loss** — maintain issue number, Story, API contract, previous analysis results
- **Detect scope creep** — warn if discussion exceeds current issue scope:
  ```
  ⚠️ This change exceeds the scope of #{issue_number}.
  
  A. Split into separate issue (recommended) → proceed with original scope for now
  B. Include in this round → expand Story scope
  ```

### Example (BE: Social Login Finalization)

```
## Implementation Recommendation

### Core: Google OAuth Real Test + Port Unification

  Current state:
  - OAuthService.java:89 — Google callback null check added ✅
  - application.yaml:23 — Google scope URL encoding fixed ✅
  - OAuthService.java:112 — Google token exchange real account not verified ❌

  Changes needed:
  - application.yaml — Set Google OAuth redirect URI for deployment environment
  - OAuthServiceTest.java new — Google real account integration test
  - AuthController.java:67 — Missing Swagger @Operation description

  Effect:
  - Resolves PR #144 last unchecked item ☐
  - Ensures Google login works correctly in deployment environment

---

  Proceed?

  A. "Google test only" → application.yaml config + manual test
     (minimum — resolves PR #144 check only)
  B. "Test + Swagger" → A + AuthController Swagger enhancement
     (recommended — clean including documentation)
  C. "Test + Swagger + Integration test" → B + new OAuthServiceTest
     (maximum — automated verification in CI)
  D. Hold — record analysis only

  Recommendation: B — Swagger gap is quick to fix, and other team members need it when checking the API.

  Which direction?
```

---

### 6-4. Code Boundary Detection (real-time during development)

### Role Boundary (_safety.md §6)

```
if ROLE contains "Backend":
  ALLOWED: backend/src/**
  FORBIDDEN: frontend/src/**
  
if ROLE contains "Frontend":
  ALLOWED: frontend/src/**
  FORBIDDEN: backend/src/**
```

### When Discovering Code Outside Your Role (MANDATORY)

If a problem is found by **reading** another role's code during development:

```
⚠️ Issue found in code outside your role

  File: {file_path} (owner: {owner_role})
  Issue: {description}

  ❌ You cannot modify this directly.

  Instead:
  A. Create issue — request fix from the responsible party
     → 02-project/case-03-task.md (auto-assigns role label + assignee)
  B. Issue comment — add finding to existing related issue
  C. Ignore — not in scope for this task

  Recommendation: A — needs to be tracked as an issue.
```


> 🛑 **STOP** — Wait for user input before continuing.


### When Modifying Common Code (common/)

```
⚠️ Common code modification detected

  File: {common_file}
  
  A. Modify as-is (minimal change) → note "⚠️ common code change" in PR body
  B. Create issue and split into separate PR
  
  Recommendation: {A if 1-2 lines, B if structural change}
```

---

### 6-5. In-Development Menu

```
Development help:

[S] Move to next Story      → mark current Story done + next
[R] Re-analyze code         → re-run 6-2 (check structure after changes)
[A] API contract check      → be-dev/workflows/01-api-contract/workflow.md
[F] Re-check facts          → re-run step-03-fact.md
[D] Done — start sync       → step-07-sync.md
[X] Return to dashboard

Number:
```


> 🛑 **STOP** — Wait for user input before continuing.


### [S] Move to Next Story

Current Story Status → done, next Story Status → in-progress.
**Re-run 6-2 code analysis + 6-3 recommendation for the next Story.** (loop)

### [R] Re-analyze Code

If structure changed mid-implementation, re-run 6-2 to assess current state.

### [D] Done

→ load `./step-07-sync.md`

---

## ❌ Strictly Prohibited

- Committing directly to main without a branch
- Starting work without issue linkage
- **Modifying** code paths of another role (role boundary — _safety.md §6)
  (Reading is allowed. Create an issue if a problem is found)
- Recommending without reading code (guessing-based recommendations prohibited)
- Presenting only a single direction without A/B/C/D options

## 🚨 SUCCESS / FAILURE

### ✅ SUCCESS
- User input received at every STOP gate before proceeding
- User explicitly confirmed before commit/push
- Routed correctly to `./step-07-sync.md`

### ❌ FAILURE
- Skipping a STOP gate and proceeding without user confirmation
- Committing or pushing without explicit user confirmation
- Proceeding to next step before all sequence steps are complete

**Master Rule:** Skipping steps or fabricating output is FORBIDDEN.
