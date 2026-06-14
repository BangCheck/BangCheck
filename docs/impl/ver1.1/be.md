# BangCheck BE Impl Note — ver1.1

> 컨트롤러별 단위테스트 구현 명세. 전체 시나리오 뱅크 → `docs/qa/scenarios-be-api-handling-bank.md`.
> 티어 구조: T0 공유 계약 스위트 1회 + T1 컨트롤러 델타(도메인·IDOR·결함).
> last_updated: 2026-06-14

## 담당자 배분

| Controller | Owner | Priority |
|------------|-------|----------|
| AuthController | 이지예(dlwldP) | P2 |
| RoomController | 하지명(hajimeong) | P1 (IDOR) |
| ChecklistController | 이진용(std-yong) | P2 |
| ReportController | 하지명(hajimeong) | P1 (IDOR) |
| MapController | 이민우(minwoo-l) | P2 |
| AddressController | 이민우(minwoo-l) | P1 (silent-500) |
| T0 공유 스위트 | 공통 | P2 |

---

## T0 — 공유 계약 스위트

> 프레임워크 매핑은 여기서 1회만 검증. 컨트롤러별 재증명 금지.

- [ ] T0-1 에러코드 계약 테이블 — enum별(Room/Checklist/Geocoding/Map/Auth) status·code·message 1:1 (parameterized)
- [ ] T0-2 PATH A 헬퍼 — `GeneralException(code)` → advice → `status==enum.status · body.code==enum.code` (flat ApiResponse)
- [ ] T0-3 PATH B 헬퍼 — 프레임워크: COMMON_400_VALIDATION / TYPE_MISMATCH / BODY_NOT_READABLE / 405 / 404 / 409 / 500 (code-only assert)
- [ ] T0-4 PATH C 헬퍼 — security 체인: AUTH_401(entrypoint) · AUTH_40102(만료) · AUTH_40103(위변조) — @WebMvcTest 단독 불가, security-aware 슬라이스 필요

---

## T1 — 컨트롤러별 델타

### AuthController (이지예)
> 8코드 고유 surface — 공유 팩터 금지.
- [ ] refresh token MISSING → AUTH_40101 PATH A
- [ ] refresh token INVALID → AUTH_40103 PATH A
- [ ] refresh token MISMATCH → AUTH_40102 PATH A
- [ ] OAuth state 단회용 재사용 → 거부
- [ ] provider 라우팅 정상 (kakao/naver)
- [ ] callback USER_DENIED → 처리
- [ ] callback EMAIL_NOT_PROVIDED → 처리
- [ ] 외부 OAuth 502 래핑 → COMMON_500 or 도메인 코드

### RoomController (하지명) — P1: IDOR
- [ ] 방 6개 상한 초과 → ROOM 도메인코드
- [ ] 임대유형 불변식: 전세(보증금 필수) · 월세(보증금+월세) · 대출(금액)
- [ ] **IDOR-ROOM-27** — 타인 방 조회 차단 (403)
- [ ] **IDOR-ROOM-31** — 타인 방 수정/삭제 차단 (403)

### ChecklistController (이진용)
> ⚠️ 경로 `api/checklist` (타 컨트롤러는 `api/v1`) — 정합 확인 필수.
- [ ] 커스텀 항목 최대 3개 초과 → 도메인 에러
- [ ] 타인 커스텀 항목 삭제 → 403 forbidden
- [ ] 알려진 결함 3건 — 시나리오 뱅크 CHK 항목 참조
- [ ] 무헤더 요청 → PATH C(AUTH_401) — controller-slice 재프레이밍 필요

### ReportController (하지명) — P1: IDOR
- [ ] **IDOR-RPT-13** — 타인 리포트 조회 차단 (403)
- [ ] **IDOR-RPT-14** — 타인 리포트 수정 차단 (403)

### MapController (이민우)
- [ ] 방/포인트 not-found (soft-delete 포함)
- [ ] IDOR — 타인 지도 포인트 접근 차단
- [ ] geocoding 연계 실패 → 도메인 에러

### AddressController (이민우) — P1: silent-500
- [ ] juso API 미래핑 → 현재 COMMON_500 동작 pin
- [ ] Naver geocoding 미래핑 → COMMON_500 동작 pin
- [ ] GEOCODING_400 dead-code 플래그 (현재 미도달 경로)
- [ ] 빈결과 응답 → success:true + data:[] vs 도메인 에러 명확화

---

## Must-fix (보안·운영급 — 최우선)

| ID | Description | Owner |
|----|-------------|-------|
| IDOR-RPT-13 | 타인 리포트 조회 차단 | 하지명 |
| IDOR-RPT-14 | 타인 리포트 수정 차단 | 하지명 |
| IDOR-ROOM-27 | 타인 방 조회 차단 | 하지명 |
| IDOR-ROOM-31 | 타인 방 수정/삭제 차단 | 하지명 |
| silent-500-juso | AddressSearchService 미래핑 | 이민우 |
| silent-500-geocoding | GeocodingService 미래핑 | 이민우 |

---

## 완료 기준
- T0 공유 스위트 통과
- T1 컨트롤러 델타 통과 (IDOR 4건 P1 선행)
- 커버리지 매트릭스 엔드포인트×카테고리 (~30셀) 채움
- happy-path 앵커 소수 — 결함 수정 후 성공경로 회귀 방지
