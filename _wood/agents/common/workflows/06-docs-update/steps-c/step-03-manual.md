<!-- AI-PROTECTED-FILE v1.0 -->
<!-- DO NOT MODIFY: Admin-only. Contact @Woo-JongHo for changes. -->

# Step 03 — Manual Doc Edit

대화형으로 특정 문서를 편집합니다.

---

## 3-1. Load Current Content

```bash
cat docs/{target_file}
```

현재 내용 표시 후:

```
📄 {target_file} 현재 내용입니다.

무엇을 수정하시겠습니까?

[1] 섹션 추가
[2] 특정 섹션 수정
[3] 전체 재작성
[N] 취소
```

STOP and WAIT.

---

## 3-2. Edit

사용자 입력에 따라 해당 섹션만 수정.

수정 완료 후 미리보기:

```
📄 변경 내용 미리보기 (diff):

+ {added line}
- {removed line}

[Y] 저장  [E] 다시 편집  [N] 취소
```

STOP and WAIT.

---

## 3-3. Write + Update Date

저장 시 `_Last updated: {today}` 날짜 자동 갱신.

→ Return to `../workflow.md` Step 2.
