#!/usr/bin/env python3
"""sync_check.py 의 규칙이 실제로 잡는지 검사한다.

무엇을 확인하는가
  test_resolve.py 와 같은 계약이다 — "위반을 잡았다"가 아니라 "의도한 규칙이
  잡았다"를 본다. SYN-03 위반을 SYN-01 이 잡아도 exit code 는 똑같이 1이다.
  그러면 규칙을 하나 추가할 때마다 "통과했으니 맞겠지"가 쌓이고, 어느 규칙이
  죽었는지 아무도 모른다. 그래서 각 케이스는 기대 규칙 ID 를 명시하고,
  그것 말고 다른 규칙이 함께 울면 그것도 실패로 본다.

왜 실제 registry 변형이 아니라 fixture 인가 (test_resolve.py 와 다른 선택)
  resolve.py 는 backend/·frontend/ 의 실제 소스를 검사하므로 fixture 저장소를
  만들면 제품이 바뀔 때마다 따라가야 한다. 그래서 그쪽은 실제 registry 를
  변형했다 되돌린다.

  sync_check.py 는 다르다. 검사 대상의 절반이 **GitHub 이슈**라 변형해 되돌릴
  수가 없다. 실제 이슈를 건드리는 테스트는 팀원에게 알림을 보내고 되돌려도
  이력이 남는다. 그리고 네트워크에 의존하면 API 장애가 "규칙이 죽었다"로
  보고된다 — 이 도구가 resolve.py 와 분리된 이유와 정확히 같은 문제다.

  그래서 evaluate() 를 순수 함수로 떼어냈다. 이 테스트는 registry 스냅샷과
  이슈 스냅샷을 손으로 만들어 그 함수만 부른다. 네트워크도 파일도 없다.

왜 마커 케이스가 이렇게 많은가 (2026-08-07)
  마커 파서의 오탐이 하루에 두 번 CI 를 깼다. 규약을 문서화하는 이슈가
  그 규약 때문에 깨졌고, 고치는 과정에서 한 번 더 깨졌다.
  잡는 자리가 없었기 때문이다 — sync_check.py 에는 테스트가 아예 없었다.

사용: python3 .project-atlas/tools/test_sync_check.py [-v]
종료 코드: 전부 통과 0, 실패 1
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from atlas_marker import marker_of, render  # noqa: E402
from sync_check import changed_ids, evaluate  # noqa: E402

failures: list[str] = []
verbose = "-v" in sys.argv


def check(name: str, actual, expected) -> None:
    if actual == expected:
        print(f"ok    {name}")
        if verbose:
            print(f"        {actual!r}")
    else:
        failures.append(f"{name} — 기대 {expected!r}, 실제 {actual!r}")
        print(f"FAIL  {name}")
        print(f"        기대 {expected!r}")
        print(f"        실제 {actual!r}")


# ══════════════════════════════════════════════════════════════
# 1. 마커 계약 — atlas_marker.marker_of
# ══════════════════════════════════════════════════════════════
print("── 마커 계약 ──")

check("정식 마커", marker_of("<!-- atlas-defect: BC-AUTH-01 -->\n\n## 문제\n..."), "BC-AUTH-01")
check("생성기 출력과 왕복", marker_of(render("BC-CHK-07") + "\n\n본문"), "BC-CHK-07")

# 2026-08-07 실측 사고 — 이 셋이 CI 를 깼다
check("인라인 코드 스팬 안의 인용",
      marker_of("이슈 본문에 `<!-- atlas-defect: BC-ID -->` 마커를 넣으십시오."), None)
check("인용문 안의 인용",
      marker_of("> 본문에 `<!-- atlas-defect: BC-ID -->` 를 넣으십시오."), None)
check("코드펜스 안의 파서 코드",
      marker_of('```python\nMARKER_PREFIX = "<!-- atlas-defect: "\n```'), None)

# 미탐 쪽 — 오탐을 잡으려다 정상 투영을 못 읽으면 안 된다
check("BOM 선행", marker_of("﻿<!-- atlas-defect: BC-AUTH-90 -->\n본문"), "BC-AUTH-90")
check("선행 빈 줄", marker_of("\n\n<!-- atlas-defect: BC-LIST-01 -->\n본문"), "BC-LIST-01")
check("줄 앞뒤 공백", marker_of("   <!-- atlas-defect: BC-CHK-02 -->  \n본문"), "BC-CHK-02")
check("CRLF 개행", marker_of("<!-- atlas-defect: BC-ROOM-06 -->\r\n본문"), "BC-ROOM-06")
check("마커 내부 공백 여유", marker_of("<!--  atlas-defect:   BC-DEPLOY-01  -->"), "BC-DEPLOY-01")

# 경계
check("두 번째 줄로 밀린 마커",
      marker_of("제목입니다\n<!-- atlas-defect: BC-X-01 -->"), None)
check("같은 줄에 다른 글자가 있음",
      marker_of("<!-- atlas-defect: BC-X-01 --> 추가 설명"), None)
check("닫히지 않은 마커", marker_of("<!-- atlas-defect: BC-X-01"), None)
check("빈 본문", marker_of(""), None)
check("None 본문", marker_of(None), None)
check("마커 없는 본문", marker_of("그냥 이슈입니다\n경로: frontend/src/a.ts"), None)


# ══════════════════════════════════════════════════════════════
# 2. 규칙 — evaluate()
# ══════════════════════════════════════════════════════════════
print("\n── 규칙 ──")


def issue(number: int, defect_id: str | None = None, state: str = "OPEN") -> dict:
    body = f"{render(defect_id)}\n\n본문" if defect_id else "마커 없는 이슈"
    return {"number": number, "title": f"이슈 {number}", "body": body, "state": state}


def rules_of(defects, issues, scope_ids=None) -> list[str]:
    return sorted(v["rule"] for v in evaluate(defects, issues, scope_ids).violations)


BASELINE_DEFECTS = [
    {"id": "BC-A-01", "issue": 10},
    {"id": "BC-B-02", "issue": 20},
    {"id": "BC-C-03"},  # 아직 투영되지 않음 — 위반이 아니다
]
BASELINE_ISSUES = [issue(10, "BC-A-01"), issue(20, "BC-B-02"), issue(30)]

check("기준선 — 위반 0건", rules_of(BASELINE_DEFECTS, BASELINE_ISSUES), [])

check("SYN-01 — registry 가 없는 이슈를 가리킨다",
      rules_of([{"id": "BC-A-01", "issue": 999}], [issue(10, "BC-A-01")]),
      ["SYN-01", "SYN-03"])  # 10번이 고아가 되는 것은 이 변형의 필연적 동반

check("SYN-02 — 그 이슈에 마커가 없다",
      rules_of([{"id": "BC-A-01", "issue": 10}], [issue(10)]),
      ["SYN-02"])

check("SYN-02 — 그 이슈의 마커가 다른 결함이다",
      rules_of([{"id": "BC-A-01", "issue": 10}, {"id": "BC-B-02", "issue": 20}],
               [issue(10, "BC-B-02"), issue(20, "BC-B-02")]),
      ["SYN-02", "SYN-03"])  # 10번이 BC-B-02 를 주장하나 registry 는 20 을 가리킨다

check("SYN-03 — 고아 투영 (registry 에 없는 결함)",
      rules_of(BASELINE_DEFECTS, BASELINE_ISSUES + [issue(40, "BC-NOPE-99")]),
      ["SYN-03"])

check("SYN-03 — registry 가 다른 번호를 가리킨다",
      rules_of([{"id": "BC-A-01", "issue": 10}], [issue(10, "BC-A-01"), issue(11, "BC-A-01")]),
      ["SYN-03"])

# 이것이 #262 를 깨뜨렸던 자리다. 인용은 마커가 아니므로 고아가 아니다.
quoted = {"number": 262, "title": "게이트 이슈", "state": "OPEN",
          "body": "> 본문에 `<!-- atlas-defect: BC-ID -->` 마커를 넣으십시오."}
check("인용을 마커로 읽지 않는다 (#262 재현)",
      rules_of(BASELINE_DEFECTS, BASELINE_ISSUES + [quoted]), [])


# ══════════════════════════════════════════════════════════════
# 3. 범위 — changed_ids() + scope_ids
# ══════════════════════════════════════════════════════════════
print("\n── 범위 ──")

BASE = [{"id": "BC-A-01", "issue": 10}, {"id": "BC-B-02"}]
check("변경 없음", changed_ids(BASE, BASE), set())
check("결함 추가", changed_ids(BASE, BASE + [{"id": "BC-C-03", "issue": 30}]), {"BC-C-03"})
check("결함 삭제", changed_ids(BASE, [{"id": "BC-A-01", "issue": 10}]), {"BC-B-02"})
check("issue 번호 backfill",
      changed_ids(BASE, [{"id": "BC-A-01", "issue": 10}, {"id": "BC-B-02", "issue": 20}]),
      {"BC-B-02"})
check("issue 번호 재매핑",
      changed_ids(BASE, [{"id": "BC-A-01", "issue": 11}, {"id": "BC-B-02"}]),
      {"BC-A-01"})

# 오늘의 사고 재현 — 무관한 PR 은 전역 드리프트를 갚지 않는다
DRIFTED_ISSUES = BASELINE_ISSUES + [issue(40, "BC-ORPHAN-99")]
check("전역 범위 — 남의 드리프트가 잡힌다",
      rules_of(BASELINE_DEFECTS, DRIFTED_ISSUES, None), ["SYN-03"])
check("PR 범위 · 건드린 결함 없음 — 통과한다 (#258 사례)",
      rules_of(BASELINE_DEFECTS, DRIFTED_ISSUES, set()), [])
check("PR 범위 · 무관한 결함만 건드림 — 통과한다",
      rules_of(BASELINE_DEFECTS, DRIFTED_ISSUES, {"BC-A-01"}), [])

# 그러나 그 PR 이 직접 만든 어긋남은 범위 안이므로 반드시 잡힌다
check("PR 범위 · 자기가 만든 고아는 잡는다",
      rules_of(BASELINE_DEFECTS, DRIFTED_ISSUES, {"BC-ORPHAN-99"}), ["SYN-03"])
check("PR 범위 · 자기가 만든 SYN-01 은 잡는다",
      rules_of([{"id": "BC-A-01", "issue": 999}], [], {"BC-A-01"}), ["SYN-01"])
check("PR 범위 · 결함을 지워 고아를 만들면 잡는다",
      rules_of([{"id": "BC-B-02", "issue": 20}],
               [issue(10, "BC-A-01"), issue(20, "BC-B-02")],
               changed_ids(BASELINE_DEFECTS, [{"id": "BC-B-02", "issue": 20}])),
      ["SYN-03"])


# ══════════════════════════════════════════════════════════════
print()
if failures:
    print(f"실패 {len(failures)}건")
    for line in failures:
        print(f"  - {line}")
    sys.exit(1)
print("전부 통과")
sys.exit(0)
