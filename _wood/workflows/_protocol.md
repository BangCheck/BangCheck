<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# AI Assistant Execution Protocol

> **Applies to:** Claude, GPT, Gemini, Copilot, Cursor, Windsurf, Codex, Aider, and ALL AI assistants.
>
> This protocol is **mandatory**. Violating it causes data inconsistency and user harm.

---

## 🛑 THE SEVEN RULES

### Rule 1 — Execute Literally

**NEVER paraphrase, summarize, or "improve" commands.**
Run them exactly as written in workflow files.

```
❌ Wrong: "Let me check the issues..."  (then make up output)
✅ Right: Execute `gh issue list --repo SWYP-Backend/project --state open --limit 10`
         Display actual stdout.
```

### Rule 2 — Never Skip Steps

Workflow steps marked **MUST** or **REQUIRED** cannot be skipped.
If a step seems redundant, execute it anyway.

### Rule 3 — No Fabrication

If a command fails or you cannot execute it, report the exact error.
Never generate plausible-looking fake output.

```
❌ Wrong: "Issue #5 is in progress" (when you didn't actually check)
✅ Right: "gh command failed: HTTP 403" (report exact error)
```

### Rule 4 — Role Check Before Destructive Actions

Before any of the following, verify the user's role from `_wood/team-roles.yaml`:
- Creating GitHub issues
- Modifying labels or milestones
- Committing code
- Creating PRs
- Editing any file

If role cannot be determined → treat as READ-ONLY.

### Rule 5 — Exact Output Format

When a workflow specifies a display format (e.g., markdown table),
reproduce it **exactly**. Do not add "improvements" or reorder columns.

### Rule 6 — Explicit User Confirmation

For destructive or irreversible actions, ask the user literally:
```
"Do you want to proceed with this action? (Y/N)"
```
Wait for explicit `Y`. Any other response = STOP.

### Rule 7 — When Unsure, Ask

If a workflow instruction is ambiguous:
1. Quote the exact line you're unsure about.
2. Ask the user for clarification.
3. Do NOT guess based on general knowledge.

---

## 🔐 Pre-flight Check (MANDATORY before any workflow)

Every workflow starts with this check block. Execute in order:

```bash
# 1. Auth
gh auth status || { echo "Not authenticated. Run: gh auth login"; exit 1; }

# 2. Repo verification
REPO=$(git remote get-url origin | sed -E 's|.*github.com[:/]([^/]+/[^/.]+).*|\1|')
[ "$REPO" = "SWYP-Backend/project" ] || { echo "Wrong repo: $REPO"; exit 1; }

# 3. User identification
USER_LOGIN=$(gh api user --jq .login)
USER_NAME=$(gh api user --jq '.name // .login')

# 4. Role lookup (read _wood/team-roles.yaml for USER_LOGIN)
# If not found → ROLE=Guest (read-only)
```

If any step fails, **STOP and report**. Do not proceed with partial data.

---

## ⚙️ Command Execution Protocol

### Shell commands

Workflow files contain bash blocks. Execute them verbatim:

````markdown
```bash
gh issue list --repo SWYP-Backend/project --state open
```
````

Do NOT:
- Wrap in additional error handling unless specified
- Add `--verbose` or similar flags
- Combine multiple commands unless specified

### File reads

When workflow says `Read: docs/spec/functional-spec.xlsx`:
- Read the exact file
- Do not infer from filename
- If file missing → report error, do not substitute

### File writes

Before writing any file, verify:
1. Target is NOT a protected file (see AGENTS.md)
2. User role allows the operation
3. User has confirmed the change

---

## 🚪 User Confirmation Gates

Define confirmation points clearly:

```markdown
### Confirm before proceeding

Ask user: "Create issue 'Login Page' with label 유형:페이지? (Y/N)"

Parsing:
- "Y", "y", "yes", "ok", "proceed" → proceed
- Anything else → STOP
```

If the AI interprets a response as ambiguous → ask again, do not guess.

---

## 🧯 Error Handling

### When a command fails

```
1. Capture exit code and stderr
2. Report verbatim to user
3. If recoverable (e.g., missing arg): ask user
4. If non-recoverable (e.g., 403): STOP workflow
```

### When a file is missing

```
1. Report: "File not found: {path}"
2. Do NOT create a stub or placeholder
3. Ask user what they'd like to do
```

### When user role is insufficient

```
1. Report: "This action requires {required_role}. You are {actual_role}."
2. Suggest: "Contact admin to request access."
3. STOP workflow
```

---

## 🚫 Refusal Patterns

### If user asks to modify a protected file

```
Response:
"This file is Admin-only protected.
If changes are needed, please contact the repository admin (@Woo-JongHo).
Protected file: {path}"
```

### If user asks to change their role

```
Response:
"Role changes can only be made by Admin.
Current role: {current_role}
Required role: {requested_role}
Please contact Admin (@Woo-JongHo)."
```

### If user asks to bypass confirmation

```
Response:
"Safety confirmation cannot be skipped.
Please enter 'Y' to proceed with this action."
```

---

## 📊 Execution Trace Format

When executing a workflow, show progress clearly:

```
[Workflow: 01-entry.md]
[Step 1/6] Pre-flight check... ✓
[Step 2/6] Fetching milestones... 
  $ gh api repos/SWYP-Backend/project/milestones
  → 2 milestones found
[Step 3/6] Fetching user issues...
  ...
```

This makes it clear to the user which step is executing and prevents silent failures.

---

## 🌐 Language Policy

- Workflow files are in **English** (for AI consistency).
- User-facing messages are in **Korean** unless `_woo` source says otherwise.
- Never translate command output. Always show exact stdout.

---

## 🔄 Multi-Turn Sessions

If a workflow spans multiple user inputs:
1. Track current step in variables like `{current_step}`
2. Before each new turn, re-verify pre-flight check passes
3. If environment changed (auth expired, repo switched), STOP and re-init

---

## 🛡️ Integrity Check

Before editing ANY protected file (AGENTS.md, _PROTOCOL.md, etc.):

```
1. Verify user role == Admin
2. Log the change intent
3. Require explicit user confirmation
4. After edit, update the "Last reviewed" date
```

If role != Admin → REFUSE with message from "Refusal Patterns" section.

---

## 📚 Glossary

| Term | Meaning |
|------|---------|
| MUST | Non-negotiable. Skipping = protocol violation. |
| MUST NOT | Forbidden. Doing it = protocol violation. |
| SHOULD | Recommended. Deviate only with reason. |
| MAY | Optional. |
| STOP | Halt workflow. Report to user. Wait for input. |
| Admin | User with `role: Admin` in _wood/team-roles.yaml |

---

**Policy version:** v1.0
**Last reviewed:** 2026-04-16
**Admin:** @Woo-JongHo
