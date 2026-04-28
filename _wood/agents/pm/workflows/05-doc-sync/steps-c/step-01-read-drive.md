---
step: 1
title: "Read feature specification from Google Drive (with cache)"
nextStep: "./step-02-diff.md"
---

# Step 01 — Read from Google Drive (Cache-First)

READ THIS ENTIRE FILE before executing any action.

---

## 1-0. Cache Check (ALWAYS run first)

Before any MCP call, check local cache:

```bash
CACHE_FILE="_wood/cache/spec-snapshot.json"
if [ -f "$CACHE_FILE" ]; then
  cat "$CACHE_FILE" | jq '{drive_file_id, drive_modified_time, cached_at, screen_count: (.screens | length)}'
fi
```

If cache exists → extract `drive_file_id` and `drive_modified_time`.

Then check Drive metadata **only** (lightweight — no content read):

```
MCP google-drive: get_file_metadata(fileId = {drive_file_id})
→ compare .modifiedTime with cache.drive_modified_time
```

**Decision:**

| Condition | Action |
|-----------|--------|
| Cache missing | → Go to 1-1 (full fetch) |
| `modifiedTime` unchanged | → Skip to 1-3 using cached `screens` (NO Drive read) |
| `modifiedTime` newer | → Go to 1-2 (re-fetch + update cache) |

Print result:
```
📦 Cache: {HIT|MISS|STALE}  ({cached_at} / Drive: {drive_modified_time})
```

---

## 1-1. Document Search (cache MISS only)

Search for the feature specification using MCP `google-drive` tools:

```
Search keywords: "기능명세서" OR "매물 체크리스트 서비스"
Drive scope: Include shared drives
Prefer: most recently modified spreadsheet
```

If multiple results → show list and STOP for user selection.

Store result as `{drive_file_id}` and `{drive_modified_time}`.

---

## 1-2. Read Document (cache MISS or STALE only)

Read full content via MCP google-drive `read_file_content(fileId)`.

Parse all screen sections → build `{spec_sections}` (see 1-3 format).

Write cache:

```bash
mkdir -p _wood/cache
cat > _wood/cache/spec-snapshot.json << 'EOF'
{
  "drive_file_id": "{drive_file_id}",
  "drive_modified_time": "{drive_modified_time}",
  "cached_at": "{ISO8601_now}",
  "screens": {spec_sections_json}
}
EOF
```

---

## 1-3. Parse / Load Screen List

**If cache HIT** → load `screens` directly from `_wood/cache/spec-snapshot.json`.

**If freshly fetched** → parse from Drive content:

```python
# Extract per-screen sections
# Screen ID pattern: SCR-[A-Z]+ (no trailing digits = parent screen)
# For each parent screen: collect all sub-feature rows
sections = [
  {
    "id": "SCR-HOME",
    "name": "방 카드 관리(Home)",
    "priority": "높음",
    "fe": true,
    "be": true,
    "feature_count": 12
  },
  ...
]
```

Output:

```
📄 Spec loaded ({source: cache|drive})

| 화면 ID     | 화면명             | 우선순위 | FE | BE | 기능수 |
|------------|------------------|------|----|----|----|
| SCR-HOME   | 방 카드 관리(Home)  | 높음  | ●  | ●  | 12 |
| SCR-MAP    | 지도               | 최상  | ●  |    |  8 |
| ...        | ...              | ...  | ...| ...|... |

총: {n}개 화면
```

---

## Completion

Save as `{spec_sections}` → load `./step-02-diff.md`.
