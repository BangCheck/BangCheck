---
name: step-01-load
description: "Collect GitHub Data"
nextStepFile: "./step-02-build.md"
---


# Step 01 — Collect GitHub Data

READ THIS ENTIRE FILE before executing any action.

---

### 1-1. Open Milestones

```bash
gh api "repos/$REPO/milestones?state=open&per_page=30" \
  --jq '.[] | {number, title, description, due_on, open_issues, closed_issues}'
```

If there are 0 open milestones:
```
⚠️ No active sprints found.
[5] Create a sprint in Issue Management.
[B] Return to PM Dashboard
```
Wait for user input, then STOP.

---

### 1-2. Page Issues (유형:페이지)

For each milestone:
```bash
gh issue list --repo $REPO \
  --milestone "{milestone_number}" \
  --label "유형:페이지" --state all \
  --json number,title,state,labels,assignees,updatedAt,body \
  --limit 50
```

---

### 1-3. Task Issues (유형:작업)

```bash
gh issue list --repo $REPO \
  --milestone "{milestone_number}" \
  --label "유형:작업" --state all \
  --json number,title,state,labels,assignees,updatedAt,body \
  --limit 200
```

---

### 1-4. Parent-Child Relationships

Priority:
1. GitHub sub-issues API
   ```bash
   gh api "repos/$REPO/issues/{page_num}/sub_issues" --jq '.[].number'
   ```
2. Fallback: Parse `Parent: #N` from each task body

---

### 1-5. Bug Issues (유형:버그)

```bash
gh issue list --repo $REPO \
  --milestone "{milestone_number}" \
  --label "유형:버그" --state open \
  --json number,title,labels,assignees --limit 50
```

---

### 1-6. Milestone Meta

```bash
cat _wood/milestone-meta.yaml
```

Save `global_defaults.on_track_threshold` and `caution_threshold`.

---

## Completion

After all data collection is complete → load `./step-02-build.md` and follow all instructions.
