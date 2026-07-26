# BangCheck 개발자노트 — ver1.1

> 살아있는 TODO 체크리스트. 매일 08:00 알람에 첨부되어 뿌려진다.
> 해결 시 `- [ ]` → `- [x]`, 옆에 근거(커밋 `sha`/PR `#NN`/test). SSoT = 이 문서(08_BangCheck repo).
> 전체 시나리오 후보 165건 = `docs/qa/scenarios-be-api-handling-bank.md`. last_updated: 2026-06-13

## 목표 — ver1.1 : 사용성 · 안정성
1차 개발 완료. 세 축: ① 사용성 UI ② 유저플로우 검토 ③ API 핸들링 단위테스트(실유저 가정).
진척 — 사용성 __/__ · 피그마·아키텍처 __/__ · BE테스트 __/__

## 레인 배정 (2026-06-13 갱신)
- **PM 홍예은** — 사용성 UI 점검 (BE 성능 관리 아님)
- **FE 우종호** — 피그마 연동 + 아키텍처 준비
- **BE 이진용·이민우·이지예·하지명** — 컨트롤러별 단위테스트 (↓ §BE)

## 캐논 시나리오 템플릿 (기본형)
```
- [ ] {ID} · {제목}            ({CATEGORY})
      given  {전제}
      when   {METHOD} {endpoint} {payload}
      then   {status} · flat ApiResponse{success:false,code,message}   ({ErrorCode})
      check  {근거}            ← 통과 시 - [x]
```
체크 1개 = 시나리오 1개 → 대시보드 진척 = `[x]/전체`. 라벨 EN, 내용 KO.

---

## BE 단위테스트 — 티어 구조 (비판 반영: 165 → ~100 리팩터)

> 비판 결과(critic·code-reviewer, verdict=concerns): 분석은 고품질·소스검증·환각0. 단 91/165(55%)가
> 프레임워크 매핑 재증명. foundation이 이미 "공유 스위트"를 처방했으니 **재증명 대신 공유 1회 + 컨트롤러 델타**.

### Tier 0 — 공유 계약 스위트 (매핑은 여기서 1회만 검증)
- [ ] T0-1 에러코드 계약 테이블 — enum별(Room/Checklist/Geocoding/Map/Auth) status·code·message 1:1 (parameterized)
- [ ] T0-2 PATH A 헬퍼 — `GeneralException(code)` → advice → `status==enum.status · body.code==enum.code` (flat)
- [ ] T0-3 PATH B 헬퍼 — 프레임워크: COMMON_400_VALIDATION / TYPE_MISMATCH / BODY_NOT_READABLE / 405 / 404 / 409 / 500 (code-only assert)
- [ ] T0-4 PATH C 헬퍼 — security 체인: AUTH_401(entrypoint) · AUTH_40102(만료) · AUTH_40103(위변조) **security-aware 슬라이스 필요**(@WebMvcTest 단독은 필터 제외→미검증)

### Tier 1 — 컨트롤러별 델타 (도메인·IDOR·결함 + 인증 wiring smoke 1개)
- [ ] **room** — 6개 방 상한 경계 · 임대유형 불변식(전세 보증금/월세/대출) · IDOR(ROOM-27/31 타인 방)
- [ ] **checklist** — 커스텀 항목 max 3 · 삭제권한 forbidden · 알려진 결함 3건 · ⚠️경로 `api/checklist`(타 컨트롤러는 `api/v1`) 정합 확인
- [ ] **map** — not-found(방/포인트, soft-delete 포함) · IDOR · geocoding 연계
- [ ] **report** — IDOR(RPT-13/14 타인 리포트 접근)
- [ ] **auth** — refresh(MISSING/INVALID/MISMATCH) · OAuth state(단회용 재사용) · provider 라우팅 · callback(USER_DENIED/EMAIL_NOT_PROVIDED) · 502 래핑. **공유 팩터 금지**(8코드 고유 surface)
- [ ] **address** — juso/geocoding 미래핑 → 현재 COMMON_500·빈결과 동작 pin + GEOCODING_400 dead-code 플래그

### Must-fix (보안·운영급 — 우선)
- [ ] IDOR 4건: RPT-13 · RPT-14 · ROOM-27 · ROOM-31 (타인 리소스 접근 차단 검증)
- [ ] silent-500: juso(AddressSearchService)·Naver geocoding(GeocodingService) RestClient 미래핑 → 4xx/5xx/timeout가 COMMON_500으로 샘. 핸들링 보강 검토

### 적용된 수정 (code-reviewer 지적)
- [ ] AUTH-LO-04 정정 — GUEST 토큰 /logout은 `AUTH_40101 PATH A`가 아니라 **`AUTH_401 PATH C`**(필터 통과·entrypoint 거부). ADDR-04·CHK-32와 일치시킴
- [ ] no-token PATH 혼동 정정 — MAP-01/12/18/22, CHK-01/06/10/12/14/18/25/30: 무헤더 요청은 PATH C(AUTH_401). PATH A(40101)로 두려면 "필터 제외 컨트롤러 슬라이스"로 재프레이밍
- [ ] RPT-04 — non-Long principal은 실필터로 재현 불가 → "controller-slice unit-only" 태깅
- [ ] 메시지 assert — 프레임워크 에러(BODY_NOT_READABLE·405)는 **code-only**로 통일(메시지 텍스트 pin 제거)

### 갭 보강 (test-engineer 관점)
- [ ] 엔드포인트×카테고리 커버리지 매트릭스(~30셀) — 커버/의도적 skip 표기
- [ ] happy-path 앵커 소수 — 결함 수정이 성공경로 깨는 회귀 방지
- [ ] AUTH_403(accessDeniedHandler)·MaxUploadSize→COMMON_500 — 현재 미커버(역할제한 라우트 없음/10MB cap) 의식적 skip 기록

---

## 사용성 UI 점검 — PM 홍예은
- [ ] 로딩/빈 상태/에러 메시지 일관화
- [ ] 모바일 터치 타깃·스크롤·탭 동작
- [ ] (추가)

## 피그마 연동 + 아키텍처 준비 — FE 우종호
- [ ] 피그마 노드 → 컴포넌트 핸드오프 정합
- [ ] 아키텍처 준비(폴더/상태/라우팅 구조)
- [ ] (추가)

---

## 갭 & 운영 메모
- 귀속불가: 2026-05-25 FE 커밋 7건 author=null → `_wood/team-roles.yaml` 이메일 매핑(Admin)
- 매핑 가드: `_wood/workspace/_hajimyung` ≠ login `hajimeong`
- 코드대조 stale-open(닫음): #189 주소자동완성은 코드 구현됨이었음(1차 정리 시 close)
