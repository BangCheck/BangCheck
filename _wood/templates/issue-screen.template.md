---
template: screen-issue
version: "1.0"
---

## 개요

{screen_description}

---

### Tracking Info

| Field | Value |
|-------|-------|
| 화면 ID | {screen_id} |
| 화면명 | {screen_name} |
| Spec Reference | 시트22 / {screen_id} |
| 담당 | {role} |
| Linked Issue | {linked_issue} |

---

## 기능 체크리스트

<!-- D열(섹션) 기준으로 그룹핑. 각 항목은 E열(기능ID) + G열(필드명) + H~M열(상세) -->

{sections}

<!--
섹션 반복 블록:
### {section_name}  ← D열

- [ ] `{feature_id}` **{feature_name}** — {description}
      > {detail}   ← H~M열 내용이 있을 경우
-->

---

## Done Criteria

- [ ] 체크리스트 항목 전체 완료
- [ ] 에러/예외 케이스 처리
- [ ] 코드 컨벤션 준수
- [ ] 담당자 리뷰 완료

---

## PM Notes

<!-- PM이 이슈 생성 시 추가한 컨텍스트 -->
