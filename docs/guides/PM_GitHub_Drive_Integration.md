# PM 가이드: 기능명세서 → GitHub 자동 동기화

> **목적:** Google Sheets 기능명세서에서 GitHub Issues를 자동으로 생성하고 관리하기  
> **소요 시간:** 초기 설정 10분 + 반복 사용 2분/회

---

## 🎯 핵심 개선 효과

| 항목 | Before | After |
|------|--------|-------|
| **이슈 생성 시간** | 30분 (수동 입력) | 2분 (자동) |
| **오류율** | 높음 (수동 입력 오류) | 0% (자동화) |
| **동기화** | 수동 (잊기 쉬움) | 자동 (항상 최신) |
| **반복성** | 매번 처음부터 | 한 번 설정 후 반복 |

---

## 📋 1단계: 기능명세서 표준화 (1회만)

### 필수 컬럼 (Google Sheets)

기능명세서를 이렇게 구조화합니다:

| 화면ID | 기능명 | 설명 | 유형 | 우선순위 | 담당 |
|--------|--------|------|------|---------|------|
| SCR-HOME | 방 카드 관리 | 저장된 방 목록 표시 | page | P2 | Backend |
| SCR-HOME-01 | 카드 UI 렌더링 | 각 방의 정보를 카드로 표시 | task | P2 | Frontend |
| SCR-HOME-02 | 삭제 기능 | 방 카드 삭제 버튼 | task | P2 | Backend |

**주의:**
- 화면ID: `SCR-{NAME}` 형식 (반드시)
- 유형: `page` / `task` / `api` 중 선택
- 우선순위: `P0` ~ `P3` (또는 비워두면 자동 결정)

---

## 🚀 2단계: /swyp-sync 명령 실행

### 언제 실행?
- 🗓️ **스프린트 시작 전** (이슈 대량 생성)
- 📝 **기능명세서 대폭 수정 후** (이슈 동기화)
- 🔄 **주 1회** (정기 동기화)

### 어떻게 실행?

```bash
# Claude Code / Terminal에서:
/swyp-sync

# 또는 수동으로:
1. Claude Code 시작
2. /swyp-sync 입력
3. Enter
```

### 자동으로 일어나는 것
✅ Google Sheets 기능명세서 읽기  
✅ 행별로 Issue로 변환  
✅ GitHub에 자동 생성  
✅ 프로젝트 보드에 추가  
✅ 라벨/마일스톤 자동 설정

---

## ✅ 3단계: 생성된 이슈 확인

### GitHub에서 확인

```
https://github.com/SWYP-Backend/BangCheck/issues
```

1. **Project Board 탭** 확인
   - "SWYP Studio Checklist" 보드
   - 새 이슈들이 자동으로 추가됨

2. **라벨 확인**
   - `유형:페이지` / `유형:작업` (자동)
   - `순위:P2` 등 (명세서에서 읽음)

3. **할당 확인** (필요 시 수정)
   - 자동 할당 안 됨 (PM이 수동 할당)
   - Issue 클릭 → Assignees 추가

---

## 🔄 4단계: 반복 사용 (매 스프린트)

### 정기 동기화 (주 1회)

```
월요일 아침 (스프린트 시작)
  ↓
1. 기능명세서 확인 (변경사항?)
  ↓
2. /swyp-sync 실행
  ↓
3. GitHub Issues 확인
  ↓
4. 팀에 알림 ("스프린트 이슈 준비됨!")
```

### 명세서 수정 후 동기화

```
기능명세서에서 컬럼 추가/수정
  ↓
/swyp-sync 재실행
  ↓
GitHub에서 자동 업데이트
  ↓
기존 이슈는 유지, 신규만 생성
```

---

## ❓ FAQ

### Q: 이미 만들어진 이슈는?
**A:** 중복 생성 안 됨. 화면ID 기반으로 이미 있는 이슈는 스킵합니다.

### Q: Issue 수정하면?
**A:** GitHub에서 수정한 내용은 유지됩니다. 명세서에서만 수정하면 다음 sync 때 반영됩니다.

### Q: 특정 이슈는 생성 안 하고 싶으면?
**A:** 기능명세서에서 해당 행 삭제 후 `/swyp-sync` 실행.

### Q: 에러 나면?
**A:** 
- 기능명서 형식 확인 (필수 컬럼 다 있나?)
- 화면ID 중복 확인
- Claude Code 재시작

---

## 📞 개발팀 협력

### 기능명세서 → 이슈 → 개발 흐름

```
PM: /swyp-sync 실행
  ↓
GitHub Issue 생성됨 (#123, #124 ...)
  ↓
개발자: 이슈 페이지에서 구현 시작
  ↓
브랜치: feat/123-room-card (자동 생성)
  ↓
PR → 리뷰 → Merge → Issue 자동 Close
```

---

## 🛠️ 기술 상세 (참고)

- **데이터 소스:** Google Sheets (ID: `1vTLuLzBPOPAkLDLsoAfBedFt_v6LjfMtN-aEotUKocI`)
- **동기화 도구:** Claude + Google Drive MCP + GitHub API
- **프로젝트:** SWYP Studio Checklist (Board #2)
- **워크플로우:** `/swyp-sync` 스킬

---

**문의:** @std-yong (Backend) / @Woo-JongHo (Admin)
