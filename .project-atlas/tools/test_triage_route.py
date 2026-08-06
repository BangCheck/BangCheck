#!/usr/bin/env python3
"""triage_route 의 판정이 깨뜨리는 입력에 버티는지 검사한다.

각 테스트는 교차검증이 실제로 재현한 결함 하나에 대응한다.
Python 에는 Result 타입이 없어 "실패를 안 다뤘다"를 컴파일러가 못 잡는다.
그 자리를 이 파일이 대신한다.

실행: python3 .project-atlas/tools/test_triage_route.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
import triage_route as tr  # noqa: E402

ATLAS_DIR = Path(__file__).resolve().parent.parent
ROUTING = yaml.safe_load((ATLAS_DIR / "triage-routing.yaml").read_text(encoding="utf-8"))

failures: list[str] = []


def check(name: str, got, want, note: str = "") -> None:
    if got == want:
        print(f"ok    {name}")
    else:
        failures.append(f"{name}: 기대 {want!r}, 실제 {got!r} {note}")
        print(f"FAIL  {name}  기대 {want!r} 실제 {got!r}")


def route_body(text: str):
    """본문에서 경로를 뽑아 판정까지 — 1단이 하는 일 전체.

    추출만 하고 실재 검사를 건너뛰면 이 헬퍼가 실제 경로와 달라진다.
    처음 이 파일을 쓸 때 그렇게 해서 경로 탈출 테스트가 통과하지 못했다.
    """
    paths = [p for p in tr.extract_paths(text) if tr.is_safe(p)]
    v = tr.decide(paths, ROUTING)
    return v["part"], v["assignee"]


# ── 경로 탈출 ────────────────────────────────────────────────
# frontend/../.project-atlas/... 는 실재하는 파일이라 존재 검사를 통과한다.
# 정규화 전에 fnmatch 를 돌리면 frontend/** 에 먼저 걸려 프론트로 오배정된다.
check("경로 탈출을 근거로 쓰지 않는다",
      route_body("frontend/../.project-atlas/tools/triage_route.py 를 보라"),
      (None, None))

check("백엔드 위장도 막는다",
      route_body("backend/../frontend/src/app/router.tsx 문제"),
      (None, None))

check("절대경로를 근거로 쓰지 않는다",
      route_body("/Users/x/frontend/src/app/router.tsx 에서 난다"),
      (None, None))

# ── 문맥 구별 ────────────────────────────────────────────────
check("외부 URL 은 근거가 아니다",
      route_body("https://github.com/BangCheck/BangCheck/blob/main/frontend/src/app/router.tsx"),
      (None, None))

check("마크다운 링크도 근거가 아니다",
      route_body("[라우터](https://x.dev/frontend/src/app/router.tsx) 참고"),
      (None, None))

check("코드블록 안의 예시는 근거가 아니다",
      route_body("예를 들면\n```\nfrontend/src/app/router.tsx\n```\n같은 것"),
      (None, None))

# 인라인 백틱은 걷지 않는다 — 사람이 이슈에 경로를 적는 정상 표기다.
# 이것을 걷었더니 열린 이슈 23건이 전부 미분류로 나왔다(2026-08-06 실측).
# 오탐 하나를 막으려다 봇의 유일한 신호를 껐고, job 은 초록불이라 아무도 몰랐다.
check("인라인 백틱 안의 경로는 근거다",
      route_body("`frontend/src/app/router.tsx` 에서 납니다"),
      ("frontend", "@Woo-JongHo"))

check("문장 속 백틱 경로도 근거다",
      route_body("확인해 보니 `backend/src/main/java/com/room/backend/"
                 "domain/checklist/service/ChecklistService.java` 가 원인입니다"),
      ("backend-checklist", "@std-yong"))

# ── 표기 오인 ────────────────────────────────────────────────
check("glob 표기는 경로가 아니다", route_body("frontend/** 전체가 문제"), (None, None))

# 한글 경로는 정규식이 frontend/src/ 까지만 뽑아 실재하는 디렉터리로 통과한다.
# "못 찾음"이 되어야 하는데 "프론트로 배정"이 됐다.
check("한글 경로를 부분 매치로 삼지 않는다",
      route_body("frontend/src/방목록/화면.tsx 가 깨진다"),
      (None, None))

check("디렉터리만으로는 배정하지 않는다",
      route_body("frontend/src/ 아래 어딘가"),
      (None, None))

# ── 정상 판정 ────────────────────────────────────────────────
check("프론트는 전부 한 사람",
      route_body("frontend/src/features/checklist/ChecklistNewPage.tsx 문제"),
      ("frontend", "@Woo-JongHo"))

check("백엔드 로그인",
      route_body("backend/src/main/java/com/room/backend/api/auth/controller/AuthController.java"),
      ("backend-auth", "@dlwldP"))

check("백엔드 체크리스트",
      route_body("backend/src/main/java/com/room/backend/domain/checklist/service/ChecklistService.java"),
      ("backend-checklist", "@std-yong"))

check("백엔드 나머지",
      route_body("backend/src/main/java/com/room/backend/api/room/controller/RoomController.java"),
      ("backend", "@minwoo-l"))

check("하네스는 별도 파트",
      route_body(".github/workflows/deploy-frontend.yml 이 깨진다"),
      ("atlas", "@Woo-JongHo"))

# ── registry 인용 ───────────────────────────────────────────
# registry 는 결함이 기록된 곳이지 나는 곳이 아니다. 이슈가 자기 Atlas 기록을
# 인용하는 것은 정상인데, 그것을 근거로 세면 인용한 이슈가 전부 Atlas 와 충돌한다.
# 2026-08-06 실측: 충돌 9건 중 8건이 이 한 줄 때문이었다.
check("registry 인용은 근거가 아니다 — 결함 위치를 가린다",
      route_body(".project-atlas/registry/defects.yaml 의 BC-42 이고 "
                 "backend/src/main/java/com/room/backend/domain/checklist/"
                 "service/ChecklistService.java 에서 난다"),
      ("backend-checklist", "@std-yong"))

check("registry 만 있으면 근거가 없는 것과 같다",
      route_body(".project-atlas/registry/defects.yaml 을 보라"),
      (None, None))


# ── 충돌 ────────────────────────────────────────────────────
check("여러 파트에 걸치고 담당이 다르면 하나를 고르지 않는다",
      route_body("frontend/src/app/router.tsx 와 "
                 "backend/src/main/java/com/room/backend/api/auth/controller/AuthController.java"),
      (None, None))

# 충돌이 막으려는 것은 틀린 사람을 부르는 것이지 파트 이름의 모호함이 아니다.
# 담당이 한 사람이면 봇이 아는 것을 말해야 한다.
check("파트가 갈려도 담당이 한 사람이면 그 사람을 부른다",
      route_body("frontend/src/app/router.tsx 와 .github/workflows/atlas-triage.yml"),
      (None, "@Woo-JongHo"))

# ── 없음 ────────────────────────────────────────────────────
check("경로가 없으면 미분류", route_body("체크리스트가 저장이 안 돼요"), (None, None))
check("실재하지 않는 경로는 근거가 아니다",
      route_body("frontend/src/nonexistent/Fake.tsx 문제"), (None, None))


if failures:
    print(f"\n실패 {len(failures)}건")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print(f"\n통과 — 깨뜨리는 입력에 판정이 버틴다")
