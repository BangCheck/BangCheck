---
template: sub-issue-be
version: "1.0"
---

## 개요

{feature_description}

Parent: #{parent_issue_number}
Spec: `{feature_id}` / {screen_id} — {screen_name}
FE sub-issue: #{fe_sub_issue_number}

---

## API Contract

| 항목 | 내용 |
|------|------|
| Endpoint | `{method} {path}` |
| Auth | {auth_required} |
| Request | `{request_body}` |
| Response (성공) | `{response_success}` |
| Response (실패) | `{response_error}` |

> ⚠️ 스펙 변경 시 FE sub-issue에 코멘트 필수

---

## 구현 체크리스트

- [ ] API Endpoint 구현
- [ ] Request 유효성 검증
- [ ] DB 스키마 반영 (변경 있을 경우)
- [ ] 인증/권한 처리
- [ ] 에러 응답 정의 및 처리
- [ ] FE에 API Contract 공유 (#{fe_sub_issue_number} 코멘트)

---

## Done Criteria

- [ ] API 정상 동작 확인
- [ ] FE 연동 테스트 완료
- [ ] 예외/에러 케이스 처리
- [ ] API Contract FE에 공유 완료
- [ ] PR 리뷰 완료
