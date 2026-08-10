<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Step 02 — API Spec Auto-Update

---

## 2-1. Scan Controller Files

```bash
find backend/src/main/java -name "*Controller.java" | sort
```

---

## 2-2. Extract Endpoints

For each controller:
- `@RequestMapping` → base path
- `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping` → method + path
- `@PathVariable`, `@RequestParam`, `@RequestBody` → parameters
- `@CookieValue` → cookie params
- Response type from `ResponseEntity<ApiResponse<...>>`

Cross-reference `application.yaml` `app.paths.*` for actual resolved paths.

---

## 2-3. Generate API Table

```
### {Controller Domain} — `{base_path}`

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | {path} | {required/none} | {params} | {response_type} |
| POST | {path} | Bearer | {body_type} | {response_type} |
```

---

## 2-4. Sync Unimplemented API Section

```bash
# Issues with BE label and open state
gh issue list --repo BangCheck/BangCheck \
  --label "백엔드" --state open \
  --json number,title | jq '.[] | {number, title}'
```

Update "미구현 API" table in `04_api-spec.md`.

---

## 2-5. Preview + Confirm

```
📄 04_api-spec.md 업데이트 미리보기:

  구현된 엔드포인트: {n}개
  신규 감지: {added}
  미구현 이슈: {n}개

[Y] 저장  [E] 수동 편집  [N] 취소
```

STOP and WAIT.

→ Return to `../workflow.md` Step 2.
