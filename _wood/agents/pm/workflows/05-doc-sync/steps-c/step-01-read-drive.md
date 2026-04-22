---
step: 1
title: "Read feature specification from spreadsheet"
nextStep: "./step-02-diff.md"
---

# Step 01 — Read Feature Specification

READ THIS ENTIRE FILE before executing any action.

---

## 1-1. Locate the Specification File

Search Google Drive for the feature specification spreadsheet:

```
Search keywords: "기능명세서" AND mimeType = "application/vnd.google-apps.spreadsheet"
```

If multiple results found → display list and STOP. Wait for user to select one.

Record:
- `{spec_file_id}` — Drive file ID
- `{spec_modified_time}` — Drive file `modifiedTime`
- `{spec_title}` — file name

---

## 1-2. Read the Target Sheet

The specification is a spreadsheet with multiple sheets.
Default target sheet: **시트22** (confirmed template for BangCheck).

If the file cannot be read via MCP:
> "파일을 직접 공유해 주시면 바로 파싱할게요. 로컬 경로나 다운로드 파일을 알려주세요."

Parse using the following column mapping (1-indexed):

| Column | Field |
|--------|-------|
| B | 화면 ID (screen group) |
| C | 화면명 |
| D | 섹션 |
| E | 기능 ID (atomic unit — e.g. SCR-HOME-001) |
| F | 상태 |
| G | 필드명 (feature name) |
| H | 기능 설명 |
| N | 담당 (FE/BE) |
| O | 우선순위 |

---

## 1-3. Parse into Structured Data

Group by 화면 ID. Skip rows where both B and E are empty.

```python
screens = {}
current_screen_id = None
current_screen_name = None

for row in sheet.iter_rows(values_only=True):
    screen_id   = row[1]   # col B
    screen_name = row[2]   # col C
    feature_id  = row[4]   # col E
    feature_name = row[6]  # col G
    assignee    = row[13]  # col N
    priority    = row[14]  # col O

    if screen_id:
        current_screen_id = screen_id
        current_screen_name = screen_name
        screens[screen_id] = {
            "name": screen_name,
            "features": []
        }

    if feature_id and current_screen_id:
        screens[current_screen_id]["features"].append({
            "id": feature_id,
            "name": feature_name,
            "assignee": assignee,
            "priority": priority
        })
```

---

## 1-4. Output Parsing Summary

```
📄 기능명세서 파싱 완료
파일: {spec_title}
최종 수정: {spec_modified_time}
시트: 시트22

| 화면 ID | 화면명 | 기능 수 |
|---------|--------|--------|
| SCR-LANDING | 랜딩페이지 | {n} |
| SCR-HOME | 방 카드 관리 | {n} |
| ...     | ...    | ... |

총 {n}개 화면, {n}개 기능 항목
```

---

## Completion

Save as `{spec_screens}`, `{spec_modified_time}` → load `./step-02-diff.md`.
