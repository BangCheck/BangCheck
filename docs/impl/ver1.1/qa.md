# BangCheck QA Impl Note — ver1.1

> 사용성 + API 핸들링 교차 검증 시나리오. PM 점검 + BE 테스트 결과 수렴.
> last_updated: 2026-06-14 · owner: (미정)

## 인풋 소스

| Source | File |
|--------|------|
| PM 점검 결과 | `impl/ver1.1/pm.md` |
| BE 단위테스트 | `impl/ver1.1/be.md` |
| FE 구현 명세 | `impl/ver1.1/fe.md` |
| 시나리오 뱅크 | `qa/scenarios-be-api-handling-bank.md` |

---

## 교차 검증 매트릭스

| Screen | PM Check | BE Ref | QA Cross | Status |
|--------|----------|--------|----------|--------|
| 방 목록 | 빈상태 CTA | RoomController not-found | 빈방 목록 → UI 빈상태 + API 200·data:[] | - |
| 체크리스트 | 커스텀 3개 제한 안내 | CHK 도메인 에러 | 4번째 추가 시도 → API 에러 + UI 메시지 | - |
| 비교 리포트 | 타인 접근 UX | IDOR-RPT-13/14 | 타인 리포트 URL 직접 접근 → 403 + UI 에러 페이지 | - |
| 방 상세 | 타인 접근 UX | IDOR-ROOM-27/31 | 타인 방 URL 직접 접근 → 403 + UI 에러 페이지 | - |
| 주소 자동완성 | API 오류 폴백 메시지 | silent-500-juso | juso API 다운 → 500 + UI 폴백 메시지 노출 | - |
| 지도 | 마커 없음 안내 | MapController not-found | 빈지도 → API 200·data:[] + UI 빈상태 | - |

---

## 유저플로우 교차 시나리오

> 온보딩 → 방 체크 → 리포트 → 지도 전체 흐름 끊김 없음 검증.

- [ ] 신규 유저 온보딩 → 소셜 로그인 → 방 목록(빈상태) → 방 추가 → 체크리스트 작성 → 리포트 생성 → 지도 탐색 (전체 골든패스)
- [ ] 재진입 유저 → 기존 방 목록 유지 확인
- [ ] 로그인 만료 → refresh 동작 → 재진입 자연스러움

---

## 완료 기준
- 교차 매트릭스 전항목 통과
- 골든패스 유저플로우 끊김·되돌이 지점 0
- PM 발견 이슈 → FE 수정 → QA 재검증 사이클 완료
