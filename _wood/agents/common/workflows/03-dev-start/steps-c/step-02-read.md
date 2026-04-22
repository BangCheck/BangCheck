---
name: step-02-read
description: "Code reading (FE/BE branch)"
nextStepFile: "./step-03-fact.md"
---


# Step 02 — Code Reading

READ THIS ENTIRE FILE before executing any action.

---

## 2-1. Determine Reading Path Based on Role

```python
if USER_ROLE in ["Frontend", "Admin"]:
    read_paths = ["frontend/src/"]
elif USER_ROLE in ["Backend", "Admin"]:
    read_paths = ["backend/src/"]
```

If Admin, determine by issue nature (FE/BE).

---

## 2-2. Read Related Files

Read the top 5 files from `{related_files}` in order:

Extract from each file:
- Current implementation state (whether functions/components exist)
- Patterns in use (API call methods, state management, etc.)
- TODO / FIXME comments
- Import dependencies

```bash
# Read each file
cat {file_path}

# Check for related test files
find . -name "*.test.*" -o -name "*.spec.*" | \
  xargs grep -l "{component_or_function_name}" 2>/dev/null | head -3
```

---

## 2-3. Branch Status

```bash
# Check if related branch exists
git branch -a | grep -i "{issue_number}\|{keyword}"

# Recent commits (related keywords)
git log --oneline --all | grep -i "{keyword}" | head -5
```

---

## 2-4. Implementation Gap Analysis

Assess based on code read:

```
Current implementation: {exists / none / partial}
  - Present: ...
  - Missing: ...
  - Needs modification: ...
```

Save as `{code_status}`.

---

## Completion

Code status assessment complete → load `./step-03-fact.md`.
