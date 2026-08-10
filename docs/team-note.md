# BangCheck 팀노트

> 팀원 합류·복귀·인수인계 온보딩. "이 프로젝트 어떻게 돌아가냐" 빠른 전달.
> last_updated: 2026-06-14

## 프로젝트 한 줄
방 구할 때 체크리스트로 꼼꼼히 확인하고 비교·지도까지 보는 서비스.

## 팀 구성
| 역할 | 이름 | 담당 |
|------|------|------|
| Admin/FE | 우종호 (Woo-JongHo) | 전반·프론트·인프라 |
| PM | 홍예은 (yekhong) | 기획·사용성 |
| FE | 한장희 (leohan6540) | 프론트 |
| BE | 이지예 (dlwldP) | 백엔드 |
| BE | 이진용 (std-yong) | 백엔드 (체크리스트) |
| BE | 이민우 (minwoo-l) | 백엔드 (지도·주소) |
| BE | 하지명 (hajimeong) | 백엔드 |

## 코드 경로
| 파트 | 경로 |
|------|------|
| FE | `frontend/` (Vite + React 19) |
| BE | `backend/` (Spring Boot + Gradle) |
| 문서 | `docs/` |
| 팀 인프라 | `_wood/` (team-roles·AI 에이전트 — Admin 전용) |

## 로컬 실행
```bash
# FE
cd frontend && npm install && npm run dev
# BE
cd backend && ./gradlew bootRun
```

## 협업 채널
| 채널 | 용도 |
|------|------|
| Discord (daily brief) | 매일 08:00 팀 브리핑 |
| GitHub Issues (BangCheck/BangCheck) | 버그·이슈·PR |

## 브랜치 전략
- `main` — 배포 기준
- `feat/{issue}-{desc}` · `fix/{issue}-{desc}` — 작업 브랜치 (swyp-commit이 `#이슈` 자동 추출)

## 지금 진행 중인 것
- **버전**: ver1.1 (사용성·안정성)
- **활성**: 사용성 UI · 유저플로우 검토 · API 핸들링 테스트
- **블로커**: gh read:project 스코프 · Discord 토큰

## 합류 시 첫 3일
1. 이 문서 + `docs/개발자노트-ver1.1.md` 읽기
2. 로컬 환경 세팅 (위 명령)
3. `/swyp-entry` 로 내 담당 현황 확인
4. PM(홍예은)에게 첫 태스크 배정 요청

## 알아두면 좋은 것
- `/swyp-entry`(진입)·`/swyp-commit`(커밋)·`/swyp-pr`(PR) 흐름. 커밋 메시지 = `type: 설명` + `#이슈`.
- `_wood/**` 는 AI-PROTECTED (team-roles 등) — Admin(@Woo-JongHo) PR로만 수정.
- 매일 08:00 디스코드 브리핑 = 어제/오늘/남은 + 개발자노트 첨부.
