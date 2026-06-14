# BangCheck 결정노트 (ver1.x)

> 주요 변경의 이유·옵션·근거 기록. 내부 공유 및 고객사 설명 겸용.
> last_updated: 2026-06-14 · project: BangCheck

---
## D1 — 프론트엔드 Vite SPA 전환 (Next.js →)
date: 2026-05 · 트랙: E09 INFRA-MIGRATION (main 머지 완료)

**배경**: Next.js 구조에서 SSR 불필요·빌드/배포 복잡. 정적 SPA로 단순화 필요.

| 옵션 | 장점 | 단점 |
|------|------|------|
| Next.js 유지 | SSR/SEO | 빌드·배포 무거움, 오버스펙 |
| Vite SPA (선택) | 빠른 빌드·정적 배포 단순 | SSR/SEO 포기 |

**결정**: Vite + React 19 SPA. **수용 트레이드오프**: SSR/SEO 포기(현 서비스 무관).

---
## D2 — 배포 라인 AWS S3 + CloudFront (Vercel 폐기)
date: 2026-05-09

**배경**: 배포 트랙 단일화 + 자체 도메인/HTTPS.

| 옵션 | 장점 | 단점 |
|------|------|------|
| Vercel | 간편 | 트랙 이원화, 자동빌드 충돌 |
| AWS S3+CloudFront (선택) | 단일 트랙·자체 도메인 | secrets 등록·롤백 수동 |

**결정**: S3 정적 호스팅 + CloudFront, `https://api.bangcheck.site`(ACM). **제거**: vercel.json · public/landing.html. **트레이드오프**: GHA secrets 필요, 롤백=git revert(백업 없음).

---
## D3 — 일일 브리핑 스케줄러: /schedule (GitHub Actions 기각)
date: 2026-06-13 · ※ brief 시스템(운영 도구) 소관 — 참고 기록

**배경**: 매일 08:00 디스코드 팀 브리핑을 무인 실행. 합성은 `claude -p`(Max 구독).

| 옵션 | 장점 | 단점 |
|------|------|------|
| GitHub Actions cron | 완전 무인 | 러너가 Max 구독 못 탐 → 합성에 API 키=과금 |
| /schedule·/loop (선택) | 구독 내 실행, 과금 0 | Claude Code 환경 의존 |

**결정**: `/schedule`(cron) 또는 `/loop`. **기각**: GHA(API 과금). **트레이드오프**: Claude Code 클라우드 환경 의존.
