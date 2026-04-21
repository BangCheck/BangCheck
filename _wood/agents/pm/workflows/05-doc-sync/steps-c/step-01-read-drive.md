---
step: 1
title: "Read feature specification from Google Drive"
nextStep: "./step-02-diff.md"
---

# Step 01 — Read from Google Drive

READ THIS ENTIRE FILE before executing any action.

---

## 1-1. Document Search

Search for the feature specification using MCP `google-drive` tools:

```
Search keywords: "Property Checklist Feature Specification" OR "Feature Specification"
Drive scope: Include shared drives
```

If multiple results are found:
```
Multiple documents found:
  [1] {title} — {last_modified}
  [2] {title} — {last_modified}

Select document number:
```
STOP and WAIT for user input.

---

## 1-2. Read Document

Read the full content of the selected document (MCP google-drive readGoogleDoc / getGoogleDocContent).

---

## 1-3. Parse by Screen (Page) Unit

Extract per-screen sections from the feature specification:

```python
# Example parsing target structure
sections = [
    {screen: "SCR-HOME", features: ["Room card list", "Empty state", ...]},
    {screen: "SCR-AUTH", features: ["Email login", "Social login", ...]},
    ...
]
```

Output parsing results:
```
📄 Feature specification parsing complete

| Screen | Feature Count |
|--------|--------------|
| SCR-HOME | {n} |
| SCR-AUTH | {n} |
| ...      | ... |

Total: {n} screens, {n} feature items
```

---

## Completion

Save parsing results as `{spec_sections}` → load `./step-02-diff.md`.
