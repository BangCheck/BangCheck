# 05 — Deploy Guide

---

## 환경 구성

| 환경 | Frontend | Backend | DB |
|---|---|---|---|
| Local | localhost:3000 | localhost:8080 | localhost:3307 |
| Production | TBD | TBD | TBD |

---

## 필수 환경변수

### Frontend

| 변수 | 설명 | 예시 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | BE API base URL | `https://api.bangcheck.kr` |

### Backend

| 변수 | 설명 |
|---|---|
| `OAUTH_NAVER_REDIRECT_URI` | Naver OAuth redirect URI |
| `OAUTH_GOOGLE_REDIRECT_URI` | Google OAuth redirect URI |
| `FRONTEND_ORIGIN_3000` | CORS 허용 origin (FE URL) |
| `FRONTEND_ORIGIN_5173` | CORS 허용 origin (Vite dev, 필요 시) |
| `JWT_SECRET_KEY` | JWT 서명 키 (256bit 이상) |
| `SPRING_DATASOURCE_URL` | MySQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB 사용자 |
| `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호 |

> ⚠️ OAuth client-id / client-secret은 팀 내 보안 채널에서 공유.  
> `.env` 파일을 커밋하지 마세요 (`.gitignore` 적용됨).

---

## CI/CD

> 현재 수동 배포. CI/CD 파이프라인은 #55 이슈 참고.

### 수동 배포 순서 (BE)

```bash
./gradlew build -x test
# jar 파일을 서버에 전송 후 실행
java -jar build/libs/backend-*.jar \
  --spring.profiles.active=prod
```

### 수동 배포 순서 (FE)

> **⚠️ 2026-05-06 변경**: Next.js → Vite 마이그레이션(E09)으로 `npm run start` 폐기.
> Vite는 정적 빌드 산출물(`dist/`)을 S3 + CloudFront 또는 Vercel(Static)로 배포.

```bash
npm run build       # tsc --noEmit && vite build → dist/ 생성
npm run preview     # 로컬 정적 미리보기 (port 4173)
# 배포: dist/ 디렉토리를 S3 sync 또는 Vercel deploy
```

### Vercel 사용 시 — 대시보드 설정 변경 필수

마이그레이션 머지 전 Vercel 대시보드에서:
- **Framework Preset**: `Next.js` → `Vite`
- **Build Command**: `npm run build` (자동 인식 가능)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

설정 변경 없이 머지하면 Vercel 자동 빌드가 Next.js로 시도하다 실패함.

---

## DB 마이그레이션

Flyway 자동 적용 (앱 시작 시).  
신규 마이그레이션 파일 추가 시: `V{n+1}__{description}.sql`

---

## 포트 정리

| 서비스 | 포트 |
|---|---|
| Frontend (Next.js) | 3000 |
| Backend (Spring Boot) | 8080 |
| MySQL | 3307 (로컬) |
| Swagger UI | 8080/swagger-ui.html |

---

_Last updated: 2026-04-29_
