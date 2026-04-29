<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Workflow 06 — Developer Docs Update

> **Purpose:** Keep `docs/` in sync with actual code (ERD, API spec) and team input (setup, architecture, deploy).
> **Docs location:** `docs/00_index.md` ~ `docs/05_deploy.md`
> **Strategy:** Latest-only (no patch versioning) — git log tracks history.

---

## Step 1 — Status Check

Scan docs vs code to find stale docs:

```bash
# Last update time per doc
for f in docs/0*.md; do
  echo "$(git log -1 --format="%ar" -- $f) — $f"
done

# Entity changes since doc last updated
git log --oneline -- backend/src/main/java/**/entity/**/*.java | head -5
git log --oneline -- backend/src/main/java/**/controller/**/*.java | head -5
```

Display:

```
📄 Docs Status — {date}

| Doc | Last Updated | Code Changed Since? |
|---|---|---|
| 00_index.md | {date} | — |
| 01_setup.md | {date} | package.json: {yes/no} |
| 02_architecture.md | {date} | dir structure: {yes/no} |
| 03_erd.md | {date} | entity files: {yes/no} ⚠️ |
| 04_api-spec.md | {date} | controllers: {yes/no} ⚠️ |
| 05_deploy.md | {date} | application.yaml: {yes/no} |
```

---

## Step 2 — Menu

```
📚 Developer Docs Update

[1] ERD 업데이트    — entity 파일 스캔 → 03_erd.md 재생성
[2] API 업데이트    — controller 스캔 → 04_api-spec.md 업데이트
[3] Setup 편집      — 01_setup.md 대화형 수정
[4] Architecture 편집 — 02_architecture.md 수정
[5] Deploy 편집     — 05_deploy.md 수정
[6] Index 편집      — 00_index.md 수정

[B] 돌아가기
```

→ 선택에 따라 해당 step 파일 로드.

---

## Input Mapping

| Input | Action |
|---|---|
| `1`, `erd` | → load `steps-c/step-01-erd.md` |
| `2`, `api` | → load `steps-c/step-02-api.md` |
| `3`, `setup` | → load `steps-c/step-03-manual.md` (target: 01_setup.md) |
| `4`, `arch`, `architecture` | → load `steps-c/step-03-manual.md` (target: 02_architecture.md) |
| `5`, `deploy` | → load `steps-c/step-03-manual.md` (target: 05_deploy.md) |
| `6`, `index` | → load `steps-c/step-03-manual.md` (target: 00_index.md) |
| `B` | Return to agent dashboard |

---

## ✅ Success Criteria

- Updated doc reflects current code state
- `_Last updated` date refreshed
- No secrets or credentials written to docs

## ❌ Failure Criteria

- Writing OAuth secrets / DB passwords into docs
- Skipping preview before overwriting
- Modifying `docs/spec/` xlsx files (Drive-managed)
