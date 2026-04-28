---
step: 2
title: "Compare with GitHub Issues"
nextStep: "./step-03-create-issues.md"
---

# Step 02 — Specification vs GitHub Issues Comparison

READ THIS ENTIRE FILE before executing any action.

---

## 2-1. Fetch Current GitHub Issues

**라벨 없이 전체 이슈 제목 기반으로 조회한다. 라벨에 의존하지 않는다.**

```bash
gh issue list --repo $REPO --state all \
  --json number,title,state,milestone --limit 200
```

---

## 2-2. Screen ID Extraction from Issue Titles

각 이슈 제목에서 SCR- 패턴을 추출해 매핑한다:

```python
import re

SCR_PATTERN = re.compile(r'SCR-[A-Z0-9\-]+')

issue_map = {}  # scr_id → [issue_number, ...]

for issue in github_issues:
    matches = SCR_PATTERN.findall(issue['title'])
    for scr_id in matches:
        base = re.match(r'(SCR-[A-Z]+(?:-[A-Z]+)*)', scr_id)
        if base:
            key = base.group(1)
            issue_map.setdefault(key, []).append(issue['number'])

# Also match by keyword if no SCR- found
# e.g. "[page] 로그인" → try to match SCR-LOGIN from spec by name similarity
```

**제목 패턴 매칭 우선순위:**
1. 제목에 `SCR-XXX` 포함 → 직접 매핑
2. `[FE]`, `[BE]`, `[page]` prefix + 화면명 → 명세 화면명과 유사도 매핑
3. 매칭 불가 → `unmatched` 처리 (삭제하지 않음)

---

## 2-3. Comparison — Detect Missing / Mismatched

```python
for screen in spec_sections:
    scr_id = screen['id']      # e.g. SCR-HOME
    matched = issue_map.get(scr_id, [])

    if not matched:
        missing.append(screen)           # 이슈 없음 → 생성 필요
    else:
        # Check state of matched issues
        states = [github_issues[n]['state'] for n in matched]
        if all(s == 'closed' for s in states):
            completed.append(screen)
        else:
            in_progress.append(screen)
```

---

## 2-4. Output + Recommendation

```
## 📊 명세 ↔ GitHub 비교 결과

✅ 완료 (closed):     {n}개
🟢 진행 중 (open):   {n}개
🔴 이슈 없음 (누락): {n}개

### 🔴 누락 화면 — 이슈 생성 추천
| 우선순위 | 화면 ID | 화면명 | FE | BE |
|---------|--------|--------|----|----|
| 최상    | SCR-LOGIN | 로그인 | ● | ● |
| 높음    | SCR-LANDING | 랜딩페이지 | ● |   |
| ...     | ...    | ...    | ...| ...|

**추천 생성 순서: 우선순위(최상→높음→보통) + FE/BE 분리**
```

추천 후 STOP하고 사용자 확인 대기:
```
위 목록에서 생성할 화면을 선택하세요 (번호 입력, 전체는 'all'):
```

---

## Completion

Save as `{missing_items}`, `{completed_items}` → load `./step-03-create-issues.md`.
