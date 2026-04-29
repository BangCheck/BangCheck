# 04 — API Spec

> Auto-generated from `backend/api/**/controller/*.java`  
> Full interactive docs: `http://localhost:8080/swagger-ui.html`  
> Update via `/swyp-docs api` when controller changes.

---

## Base URL

| 환경 | URL |
|---|---|
| Local | `http://localhost:8080` |
| Production | TBD |

---

## 공통 응답 형식

```json
{
  "success": true,
  "data": { ... }
}
```

오류 시:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "..."
  }
}
```

---

## Auth API — `/api/v1/auth`

### `GET /api/v1/auth/oauth2/{provider}`

OAuth 인가 URL 조회.

| | |
|---|---|
| **Path param** | `provider` — `naver` \| `google` |
| **Auth** | 불필요 |
| **Response** | `{ authorizeUrl: string }` |

---

### `GET /api/v1/auth/oauth2/{provider}/callback`

OAuth 콜백 처리 (소셜 로그인 완료).

| | |
|---|---|
| **Path param** | `provider` — `naver` \| `google` |
| **Query param** | `code`, `state` (필수) / `error` (오류 시) |
| **Auth** | 불필요 |
| **Response header** | `Authorization: Bearer {accessToken}` |
| **Response cookie** | `refresh_token` (HttpOnly, Secure) |
| **Response body** | `OAuthCallbackResponseDTO` |

---

### `POST /api/v1/auth/jwt/refresh`

Access Token 재발급.

| | |
|---|---|
| **Cookie** | `refresh_token` (required) |
| **Auth** | 불필요 |
| **Response header** | `Authorization: Bearer {newAccessToken}` |
| **Response cookie** | `refresh_token` (갱신) |

---

### `POST /api/v1/auth/logout`

로그아웃 (Refresh Token 삭제).

| | |
|---|---|
| **Auth** | Bearer Token (required) |
| **Response cookie** | `refresh_token` (만료 처리) |

---

## 미구현 API (이슈 기준)

> 아래 API는 GitHub 이슈로 등록됨. 구현 완료 시 위에 추가.

| 이슈 | 도메인 | 설명 |
|---|---|---|
| #31 | Map | 주소-좌표 변환 (Geocoding) |
| #32 | Map | 지도용 매물 목록 조회 |
| #33 | Map | 기준점 저장 및 조회 |
| #34 | Map | 거리 및 이동시간 계산 |
| #35 | Room | 방 체크리스트 CRUD |
| #36 | Custom | 맞춤 체크리스트 설정 |
| #29 | Home | 방 카드 관리 |

---

_Last updated: 2026-04-29_
