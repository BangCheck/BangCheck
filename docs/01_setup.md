# 01 — Local Dev Setup

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| pnpm / npm | latest | `npm i -g pnpm` |
| Java | 17 | `brew install openjdk@17` |
| MySQL | 8.x | `brew install mysql` or Docker |
| Docker (optional) | latest | [docker.com](https://docker.com) |

---

## Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local   # 아직 없으면 아래 환경변수 직접 작성
npm run dev
```

개발 서버: `http://localhost:3000`

### FE 환경변수 (`.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

---

## Backend (Spring Boot)

```bash
cd backend

# MySQL 실행 (Docker 사용 시)
docker run -d \
  --name bangcheck-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=room \
  -p 3307:3306 \
  mysql:8

# 빌드 & 실행
./gradlew bootRun
```

서버 기동: `http://localhost:8080`  
Swagger: `http://localhost:8080/swagger-ui.html`

### BE 환경변수 (`application.yaml` 오버라이드)

로컬 개발 시 `application-local.yaml` 생성 또는 환경변수로 주입:

```env
OAUTH_NAVER_REDIRECT_URI=http://localhost:3000/auth/callback/naver
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback/google
FRONTEND_ORIGIN_3000=http://localhost:3000
```

> JWT secret, OAuth client-id/secret은 팀 내 공유 채널 참고.

### DB 마이그레이션

Flyway 자동 적용 (`bootRun` 시 자동 실행).  
마이그레이션 파일: `backend/src/main/resources/db/migration/V*.sql`

---

## 전체 흐름 확인

1. MySQL 실행 → 2. BE `bootRun` → 3. FE `npm run dev`
2. `http://localhost:3000` 접속 → 소셜 로그인 테스트

---

_Last updated: 2026-04-29_
