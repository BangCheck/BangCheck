---
step: 2
title: "Compare spec with GitHub Issues + Render Sync Status Table"
nextStep: "./step-03-create-issues.md"
---

# Step 02 — Spec ↔ GitHub Sync Status

READ THIS ENTIRE FILE before executing any action.

---

## 2-1. Check Spec Change Since Last Sync

Load last sync timestamp from `_wood/workspace/_shared/sprint-status.yaml` (key: `spec_last_synced`).

```python
last_synced = sprint_status.get("spec_last_synced")  # ISO 8601 string or null

if last_synced is None:
    spec_changed = True   # Never synced before
elif spec_modified_time > last_synced:
    spec_changed = True   # Spec updated since last sync
else:
    spec_changed = False
```

If `spec_changed == True` → surface this naturally before showing the table.
Do NOT alert mechanically. Example:

> "명세가 마지막 동기화 이후 업데이트된 것 같아요. 변경된 부분이 있는지 확인해볼게요."

---

## 2-2. Fetch GitHub Issues

```bash
gh issue list --repo $REPO --state all \
  --json number,title,labels,state,milestone --limit 500
```

Match spec features to issues by 기능 ID:
- Look for issue title or body containing the feature ID (e.g., `SCR-HOME-001`)
- Also match by feature name similarity as fallback

```python
for screen_id, screen in spec_screens.items():
    for feature in screen["features"]:
        match = find_issue(feature["id"], feature["name"], github_issues)
        feature["issue"] = match  # None if not found
        feature["status"] = "완료" if match and match.state == "closed" \
                          else "진행중" if match \
                          else "미생성"
```

---

## 2-3. Render Sync Status Table

**Always display this table before any action is taken.**

```
📊 기능명세서 연동 현황
명세 최종 수정: {spec_modified_time} | 마지막 동기화: {last_synced or "없음"}

| 화면 | 기능 수 | 이슈 연동 | 완료 | 커버리지 | 명세 변경 | 관리 |
|------|--------|---------|------|---------|---------|------|
| SCR-LANDING | 4 | 0 | 0 | 0% | {⚠️ 변경됨 / -} | 이슈 생성 |
| SCR-HOME | 18 | 12 | 3 | 67% | {⚠️ 변경됨 / -} | 동기화 |
| SCR-MAP | 11 | 11 | 11 | 100% | - | ✅ |

전체: 명세 {n}개 / 이슈 연동 {n}개 / 완료 {n}개 ({n}%)
```

**관리 열 의미:**

| 상태 | 표시 | 선택 시 동작 |
|------|------|------------|
| 이슈 없음 | `이슈 생성` | 해당 화면 기능 ID 기준 이슈 생성 플로우 진입 |
| 일부 연동 | `동기화` | 미생성 기능만 diff해서 추가 생성 제안 |
| 100% 완료 | `✅` | 액션 없음 |

**명세 변경 열 의미:**

| 조건 | 표시 |
|------|------|
| 명세 수정 > 마지막 동기화 | `⚠️ 변경됨` |
| 동기화 이후 수정 없음 | `-` |
| 동기화 이력 없음 | `⚠️ 최초 동기화` |

---

## 2-4. Recommendation (Always Show)

After the table, always offer one natural recommendation based on the situation.
Do NOT list all options. Assess and suggest the most logical next step:

```
Assess in order:
1. Any screen with spec_changed=True AND coverage < 100% → recommend syncing that screen first
2. Any screen with 0% coverage → recommend creating issues
3. All 100% → confirm all good, ask what's next
```

Example (do NOT copy verbatim — speak naturally based on actual data):
> "SCR-HOME 명세가 업데이트됐고 아직 67%만 연동됐어요. 변경된 기능부터 동기화할까요?"

STOP and WAIT for user input.

---

## Completion

Save results as `{sync_status}`, `{missing_by_screen}` → load `./step-03-create-issues.md`.
