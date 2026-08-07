#!/usr/bin/env python3
"""코멘트 갱신이 남의 글을 덮거나 자기 글을 못 찾는지 검사한다.

이 파일이 붙드는 세 가지 — 전부 교차검증이 지목한 자리다.
  1. 갱신 대상 고르기   토큰과 작성자를 함께 봐야 한다
  2. 망가진 토큰        사람이 코멘트를 손대도 봇이 죽지 않아야 한다
  3. v1 공존            옛 판정을 v2 로 착각해 덮어쓰지 않아야 한다

그리고 하나 더 — 판정 하드닝이 코멘트 경로에도 걸리는가.
`triage_route.py` 에만 걸고 여기는 `PATH_RE`+`.exists()` 로 두었더니
실제로 도는 코드가 약한 쪽이 되어 있었다.

실행: python3 .project-atlas/tools/test_triage_comment.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
import triage_comment as tc  # noqa: E402

ATLAS_DIR = Path(__file__).resolve().parent.parent
ROUTING = yaml.safe_load((ATLAS_DIR / "triage-routing.yaml").read_text(encoding="utf-8"))

failures: list[str] = []


def check(name: str, got, want) -> None:
    if got == want:
        print(f"ok    {name}")
    else:
        failures.append(f"{name}: 기대 {want!r}, 실제 {got!r}")
        print(f"FAIL  {name}  기대 {want!r} 실제 {got!r}")


def comment(cid: int, login: str, body: str) -> dict:
    return {"id": cid, "user": {"login": login}, "body": body}


V2 = tc.TOKEN_OPEN + '{"fingerprint": "sha256:aaaa", "part": "frontend"} -->\n본문'
V1 = tc.LEGACY_TOKEN_OPEN + '{"fingerprint": "sha256:bbbb", "state": "UNMATCHED"} -->\n옛 판정'

BOT = "github-actions[bot]"
ALLOWED = set(ROUTING["triageAuthors"])


# ── 1. 갱신 대상 고르기 ──────────────────────────────────────
check("자기 코멘트를 고른다",
      (tc.pick_mine([comment(1, BOT, V2)], ALLOWED) or {}).get("id"), 1)

# 토큰만 보고 고르면 남이 복사해 붙인 글을 덮어쓴다.
check("남이 쓴 코멘트는 토큰이 있어도 고르지 않는다",
      tc.pick_mine([comment(9, "somebody-else", V2)], ALLOWED), None)

# 작성자만 보고 고르면 그 사람의 일반 코멘트를 덮어쓴다.
check("허용 작성자의 일반 코멘트는 고르지 않는다",
      tc.pick_mine([comment(9, BOT, "그냥 코멘트입니다")], ALLOWED), None)

check("여러 개면 마지막 것을 고른다",
      (tc.pick_mine([comment(1, BOT, V2), comment(2, BOT, V2)], ALLOWED) or {}).get("id"), 2)

check("없으면 None — 새로 만든다", tc.pick_mine([], ALLOWED), None)

# 2단은 Hermes 머신에서 사람 계정으로 돈다. 1단이 봇 계정만 인정하면
# 2단이 단 코멘트를 못 찾아 같은 이슈에 두 번째 코멘트를 만든다.
check("2단이 사람 계정으로 단 코멘트도 1단이 갱신한다",
      (tc.pick_mine([comment(7, "Woo-JongHo", V2)], ALLOWED) or {}).get("id"), 7)


# ── 2. 망가진 토큰 ───────────────────────────────────────────
check("정상 토큰을 읽는다", tc.parse_token(V2).get("fingerprint"), "sha256:aaaa")
check("JSON 이 깨져도 죽지 않는다",
      tc.parse_token(tc.TOKEN_OPEN + '{"fingerprint": -->'), {})
check("토큰이 없으면 빈 dict", tc.parse_token("평범한 코멘트"), {})
check("토큰이 dict 가 아니면 빈 dict",
      tc.parse_token(tc.TOKEN_OPEN + '{"a": 1} -->').get("a"), 1)
check("본문이 None 이어도 죽지 않는다", tc.parse_token(None), {})

# 토큰이 깨지면 이전 지문을 모른다. 그때 "안 바뀌었다"로 흘리면
# 실제로 바뀐 판정이 정정 기록 없이 조용히 덮인다.
broken = tc.parse_token(tc.TOKEN_OPEN + "{망가짐 -->")
check("토큰이 깨졌으면 이전 지문을 모른다", broken.get("fingerprint"), None)


# ── 3. v1 공존 ──────────────────────────────────────────────
# v1 은 registry 연결 판정, v2 는 파트 배정 — 다른 것을 말한다.
# 덮어쓰면 2026-08-05 의 관측 기록이 사라진다.
check("v1 코멘트만 있으면 갱신하지 않고 v2 를 새로 만든다",
      tc.pick_mine([comment(3, BOT, V1)], ALLOWED), None)

check("v1 과 v2 가 함께 있으면 v2 만 고른다",
      (tc.pick_mine([comment(3, BOT, V1), comment(4, BOT, V2)], ALLOWED) or {}).get("id"), 4)


# ── 4. 경로 하드닝이 코멘트 경로에도 걸리는가 ────────────────
def paths_of(title: str, body: str, provided: list[str] | None = None) -> list[str]:
    found, _ = tc.resolve_paths(title, body, provided or [])
    return [p for p in found if tc.is_safe(p)]


check("코드펜스 안의 예시는 근거가 아니다",
      paths_of("", "```\nfrontend/src/app/router.tsx\n```"), [])
check("URL 안의 경로는 근거가 아니다",
      paths_of("", "https://x.dev/frontend/src/app/router.tsx"), [])
check("경로 탈출은 근거가 아니다",
      paths_of("", "frontend/../.project-atlas/tools/triage_route.py"), [])
check("실재하지 않는 경로는 근거가 아니다",
      paths_of("", "frontend/src/nonexistent/Fake.tsx"), [])
check("실재하는 경로는 근거가 된다",
      paths_of("", "frontend/src/app/router.tsx 문제"), ["frontend/src/app/router.tsx"])

# 2단이 넘기는 경로도 같은 검사를 지난다 — LLM 이 지어낸 경로를 그대로 쓰면
# 판정이 허구 위에 선다.
check("2단이 준 경로도 실재 검사를 지난다",
      paths_of("", "", ["frontend/src/nonexistent/Fake.tsx"]), [])
check("2단이 준 실재 경로는 쓴다",
      paths_of("", "", ["frontend/src/app/router.tsx"]), ["frontend/src/app/router.tsx"])


# ── 5. 지문 ─────────────────────────────────────────────────
base = {"part": "frontend", "assignee": "@Woo-JongHo", "basis": "path",
        "matched": [{"path": "frontend/src/app/router.tsx", "part": "frontend"}],
        "routingVersion": ROUTING["routingVersion"]}
check("같은 판정은 같은 지문 — 재실행이 정정으로 기록되지 않는다",
      tc.fingerprint(dict(base)), tc.fingerprint(dict(base)))
check("파트가 바뀌면 지문도 바뀐다",
      tc.fingerprint({**base, "part": "backend"}) != tc.fingerprint(base), True)


if failures:
    print(f"\n실패 {len(failures)}건")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("\n통과 — 코멘트 갱신이 자기 글만 고치고 옛 판정을 덮지 않는다")
