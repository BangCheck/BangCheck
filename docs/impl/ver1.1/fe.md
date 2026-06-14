# BangCheck FE Impl Note — ver1.1

> 페이지별 FE 구현 명세. 피그마 연동 + 아키텍처 준비.
> last_updated: 2026-06-14 · owner: 우종호(Woo-JongHo)

## 아키텍처 준비

| Area | Detail | Status |
|------|--------|--------|
| 폴더 구조 | feature-based 재정비 (`features/{domain}/`) | - |
| 상태 관리 | 전역 상태 범위 확정 (auth·room·checklist) | - |
| 라우팅 | protected route + lazy import 점검 | - |
| 피그마 핸드오프 | 노드 → 컴포넌트 1:1 정합 기준 확정 | - |

---

## 페이지별 구현 명세

### 온보딩 / 로그인
| Item | Detail |
|------|--------|
| 피그마 노드 | - |
| 주요 컴포넌트 | SocialLoginButton, OnboardingScreen |
| 상태 표현 | 로딩(스피너) · 에러(메시지) |
| 라우팅 | `/` → 로그인 성공 시 `/home` |
| 완료 기준 | 소셜 로그인 성공 흐름 + 실패 에러 표시 |

### 홈 / 방 목록
| Item | Detail |
|------|--------|
| 피그마 노드 | - |
| 주요 컴포넌트 | RoomCard, EmptyState, LoadingSpinner |
| 상태 표현 | 로딩 · 빈상태(CTA) · 에러(재시도) |
| 라우팅 | `/home` |
| 완료 기준 | 방 목록 렌더 + 빈상태 화면 정상 노출 |

### 방 체크리스트
| Item | Detail |
|------|--------|
| 피그마 노드 | - |
| 주요 컴포넌트 | ChecklistItem, CustomItemInput, SaveButton |
| 상태 표현 | 로딩 · 저장중 · 에러 |
| 라우팅 | `/room/:id/checklist` |
| 완료 기준 | 항목 체크·저장 + 커스텀 항목 최대 3개 제한 동작 |

### 비교 리포트
| Item | Detail |
|------|--------|
| 피그마 노드 | - |
| 주요 컴포넌트 | ReportCard, CompareView, ErrorFallback |
| 상태 표현 | 로딩 · 빈상태 · 에러(폴백) |
| 라우팅 | `/report/:id` |
| 완료 기준 | 리포트 렌더 + IDOR 방어(타인 접근 차단 UX) |

### 지도 탐색
| Item | Detail |
|------|--------|
| 피그마 노드 | - |
| 주요 컴포넌트 | MapView, Marker, EmptyMarker |
| 상태 표현 | 초기 로딩 · 마커 없음 안내 |
| 라우팅 | `/map` |
| 완료 기준 | 지도 렌더 + 마커 정상 표시 + 빈결과 안내 |

### 주소 자동완성
| Item | Detail |
|------|--------|
| 피그마 노드 | - |
| 주요 컴포넌트 | AddressInput, SuggestionList, FallbackMessage |
| 상태 표현 | 로딩(debounce) · 빈결과 · API 오류 폴백 |
| 라우팅 | 인라인 컴포넌트 (방 등록 플로우 내) |
| 완료 기준 | 자동완성 동작 + 빈결과/에러 안내 노출 |

---

## 완료 기준
- 피그마 핸드오프 기준 확정 후 노드 연결
- 아키텍처 준비 완료 (폴더·상태·라우팅 구조 PR)
- PM 점검 이슈 수신 → 화면 수정
- QA 교차 검증 통과 → `impl/ver1.1/qa.md`
