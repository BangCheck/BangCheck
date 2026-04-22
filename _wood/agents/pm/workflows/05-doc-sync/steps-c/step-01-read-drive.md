---
name: step-01-read-drive
description: "Read feature specification from Google Sheets (시트22)"
nextStepFile: "./step-02-diff.md"
---


# Step 01 — Read Feature Specification

READ THIS ENTIRE FILE before executing any action.

---

### 1-1. Access via Google Sheets MCP

Use `mcp__claude_ai_Google_Sheets` to read the spec directly.

Target:
- File: 매물 체크리스트 서비스_기능명세서 (search by name if ID unknown)
- Sheet: **시트22**

If MCP is not authenticated:
> "Google Sheets MCP 연결이 필요해요. claude.ai → 설정 → Integrations → Google Sheets에서 연동해주세요."

> ⚠️ STOP if auth fails.

---

### 1-2. Column Mapping (1-indexed)

| Column | Field |
|--------|-------|
| B | 화면 ID |
| C | 화면명 |
| E | 기능 ID (e.g. SCR-HOME-001) |
| G | 필드명 (feature name) |
| H | 기능 설명 |
| N | 담당 (FE/BE) |
| O | 우선순위 |

Skip rows where both B and E are empty.

---

### 1-3. Parse — Group by 화면 ID

```python
screens = {}
current_screen_id = None

for row in sheet_rows:
    if row[B]: current_screen_id = row[B]; screens[row[B]] = {"name": row[C], "features": []}
    if row[E] and current_screen_id:
        screens[current_screen_id]["features"].append({
            "id": row[E], "name": row[G], "assignee": row[N], "priority": row[O]
        })
```

---

### 1-4. Output Summary

```
📄 기능명세서 파싱 완료
파일: {spec_title}  |  시트: 시트22  |  최종 수정: {spec_modified_time}

| 화면 ID | 화면명 | 기능 수 |
|---------|--------|--------|
| ...     | ...    | ...    |

총 {n}개 화면, {n}개 기능
```

---

## Completion

Save as `{spec_screens}`, `{spec_modified_time}` → load `./step-02-diff.md`.
