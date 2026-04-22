---
template: sub-issue-fe
version: "1.0"
---

## 개요

{feature_description}

Parent: #{parent_issue_number}
Spec: `{feature_id}` / {screen_id} — {screen_name}

---

## 구현 체크리스트

- [ ] UI 컴포넌트 구현
- [ ] 상태 관리 (로딩 / 성공 / 에러)
- [ ] API 연동 — `{method} {endpoint}`
- [ ] 응답 데이터 바인딩
- [ ] 에러 케이스 처리

---

## API Contract (BE 확정 후 기입)

| 항목 | 내용 |
|------|------|
| Endpoint | `{method} {path}` |
| Request | `{request_summary}` |
| Response | `{response_summary}` |

> BE sub-issue: #{be_sub_issue_number}

---

## Done Criteria

- [ ] 화면 정상 동작 확인
- [ ] BE API Contract 맞춤 완료
- [ ] 에러/예외 UI 처리
- [ ] 코드 컨벤션 준수
- [ ] PR 리뷰 완료
