#!/usr/bin/env python3
"""2단(analyzer)의 실패 경로가 실제로 다뤄지는지 검사한다.

LLM 을 부르는 자리라 "잘 될 때"보다 "안 될 때"가 많다.
JSON 이 아닌 답, 코드펜스에 감싼 답, 지어낸 경로, 타임아웃, hermes 부재 —
전부 교차검증이 재현한 것이고, 그때는 traceback 으로 죽거나 성공으로 보고했다.

실행: python3 .project-atlas/tools/hermes/test_atlas_issue_analyzer.py
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

# 이 저장소를 대상으로 돌린다. 스크립트가 절대경로를 박고 있으면
# 테스트가 Hermes 머신에서만 돌게 된다 — 그러면 아무도 안 돌린다.
REPO_ROOT = Path(__file__).resolve().parents[3]
os.environ.setdefault("BANGCHECK_REPO", str(REPO_ROOT))

sys.path.insert(0, str(Path(__file__).resolve().parent))
import atlas_issue_analyzer as az  # noqa: E402

failures: list[str] = []


def check(name: str, got, want) -> None:
    if got == want:
        print(f"ok    {name}")
    else:
        failures.append(f"{name}: 기대 {want!r}, 실제 {got!r}")
        print(f"FAIL  {name}  기대 {want!r} 실제 {got!r}")


# ── LLM 출력 파싱 ────────────────────────────────────────────
check("평범한 JSON",
      az.parse_llm_output('{"paths": ["frontend/a.tsx"], "reason": "x"}'),
      {"paths": ["frontend/a.tsx"], "reason": "x"})

check("코드펜스로 감싼 JSON",
      az.parse_llm_output('```json\n{"paths": ["frontend/a.tsx"], "reason": "x"}\n```'),
      {"paths": ["frontend/a.tsx"], "reason": "x"})

# greedy `\{.*\}` 는 두 JSON 을 하나로 붙여 읽어 파싱이 깨진다.
check("JSON 이 둘이면 첫 번째를 쓴다",
      az.parse_llm_output('{"paths": [], "reason": "a"}\n뒷말\n{"paths": ["x"], "reason": "b"}'),
      {"paths": [], "reason": "a"})

check("산문 속 중괄호에 속지 않는다",
      az.parse_llm_output('결과는 {이렇습니다}\n{"paths": ["frontend/a.tsx"], "reason": "y"}'),
      {"paths": ["frontend/a.tsx"], "reason": "y"})

check("JSON 이 아예 없으면 None", az.parse_llm_output("못 찾겠습니다"), None)
check("빈 출력도 None", az.parse_llm_output(""), None)

# 스키마를 안 지킨 답. list[str] 이 아니면 뒤에서 터진다.
check("paths 가 문자열이면 거부",
      az.parse_llm_output('{"paths": "frontend/a.tsx", "reason": "x"}'), None)
check("paths 원소가 문자열이 아니면 거부",
      az.parse_llm_output('{"paths": [123], "reason": "x"}'), None)
check("paths 키가 없으면 거부", az.parse_llm_output('{"reason": "x"}'), None)

check("경로는 최대 3개까지만 쓴다",
      az.parse_llm_output('{"paths": ["a.tsx","b.tsx","c.tsx","d.tsx"], "reason": "x"}')["paths"],
      ["a.tsx", "b.tsx", "c.tsx"])


# ── 외부 프로세스 실패 ───────────────────────────────────────
def fake_run(exc):
    def _run(*a, **k):
        raise exc
    return _run


original = subprocess.run
try:
    subprocess.run = fake_run(subprocess.TimeoutExpired("hermes", 60))
    check("타임아웃은 traceback 이 아니라 실패값", az.ask_llm(1, "t", "b"), None)

    subprocess.run = fake_run(FileNotFoundError("hermes 없음"))
    check("hermes 부재도 실패값", az.ask_llm(1, "t", "b"), None)

    subprocess.run = fake_run(OSError("무슨 일이든"))
    check("그 밖의 OSError 도 실패값", az.ask_llm(1, "t", "b"), None)
finally:
    subprocess.run = original


# ── 2단을 건너뛰는 조건 ──────────────────────────────────────
# 본문에 경로 '표기'가 있어도 실재하지 않으면 1단은 미분류를 냈다.
# 그때 2단까지 건너뛰면 그 이슈는 영영 분류되지 않는다.
check("실재하지 않는 경로만 있으면 건너뛰지 않는다",
      az.should_skip("frontend/not-real.tsx 문제"), False)
check("실재하는 경로가 있으면 1단 소관이라 건너뛴다",
      az.should_skip("frontend/src/app/router.tsx 문제"), True)
check("경로가 아예 없으면 건너뛰지 않는다",
      az.should_skip("체크리스트가 안 돼요"), False)


if failures:
    print(f"\n실패 {len(failures)}건")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("\n통과 — 실패 경로가 값으로 돌아온다")
