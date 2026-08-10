#!/usr/bin/env python3
"""코멘트 갱신이 남의 글을 덮거나 자기 글을 못 찾는지 검사한다.

이 파일이 붙드는 세 가지 — 전부 교차검증이 지목한 자리다.
  1. 갱신 대상 고르기   토큰과 작성자를 함께 봐야 한다
  2. 망가진 토큰        사람이 코멘트를 손대도 봇이 죽지 않아야 한다
  3. v1 공존            옛 판정을 v2 로 착각해 덮어쓰지 않아야 한다

그리고 하나 더 — 판정 하드닝이 코멘트 경로에도 걸리는가.
`triage_route.py` 에만 걸고 여기는 `PATH_RE`+`.exists()` 로 두었더니
실제로 도는 코드가 약한 쪽이 되어 있었다.

관계 섹션(triage_relate.py)이 붙은 뒤로 하나 더 늘었다 —
**관계가 지문을 오염시키지 않는가.** 관계는 열린 PR 이 머지되면 바뀌는
휘발성 값이라, 지문에 섞이면 무관한 PR 하나가 머지될 때마다 열린 이슈 전부에
"분류 정정" 코멘트가 쏟아진다. 배정은 하나도 안 바뀌었는데.
관계 자체의 판정은 test_triage_relate.py 가 본다. 여기는 **코멘트와의 접합**만 본다.

실행: python3 .project-atlas/tools/test_triage_comment.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
import triage_comment as tc  # noqa: E402
import triage_relate as relate  # noqa: E402

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


# ── 6. 관계 섹션 ────────────────────────────────────────────
def relation(relations=(), errors=(), notes=(), status="ok") -> dict:
    return {"relations": list(relations), "errors": list(errors),
            "notes": list(notes), "status": status}


def rel_item(number, signals, *, kind=None, state=None):
    return {"number": number, "kind": kind, "state": state, "title": None,
            "signals": signals}


verdict = dict(base, note=None, pathSource="issue-body", pathsMissing=[])

# 관계가 없어도 코멘트는 나온다. 관계는 곁다리이지 판정의 전제가 아니다.
none_body = tc.render(verdict, ROUTING, relation())
check("관계 섹션이 코멘트에 붙는다", "## 연관 (자동 탐지)" in none_body, True)
check("관계 0건이면 0건이라고 적는다", "모두 0건입니다" in none_body, True)
check("관계 섹션이 배정 제안 아래에 온다",
      none_body.index("## 분류·배정 제안") < none_body.index("## 연관 (자동 탐지)"), True)

hit = tc.render(verdict, ROUTING,
                relation([rel_item(263, {"files": {"paths": [".github/workflows/atlas-resolve.yml"],
                                                   "shown": 3}}, kind="pr", state="open")]))
check("겹친 PR 이 코멘트에 적힌다", "#263 · PR(열림)" in hit, True)
check("겹친 경로가 코멘트에 적힌다", "`.github/workflows/atlas-resolve.yml`" in hit, True)

dead = tc.render(verdict, ROUTING, relation(errors=["열린 PR 조회"], status="failed"))
check("조회 실패는 '관계 없음'과 다른 문장이 된다",
      ("실패" in dead) and ("모두 0건입니다" not in dead), True)

# 관계 인자를 안 주면 섹션 자체가 없다 — 옛 호출부가 그대로 돈다.
check("관계를 안 넘기면 섹션이 없다",
      "## 연관" in tc.render(verdict, ROUTING), False)

# 봇은 관계도 제안만 한다. 링크를 걸지 않는다는 것이 코멘트에 적혀 있어야 한다.
check("링크를 걸지 않는다고 코멘트가 말한다", "이슈 링크를 실제로 바꾸지 않습니다" in hit, True)

# 지문 오염 — 이 파일이 새로 붙드는 자리.
check("관계가 달라져도 지문은 그대로다 (정정 코멘트가 쏟아지지 않는다)",
      tc.fingerprint(dict(base, related=[263])), tc.fingerprint(dict(base)))
check("관계 상태가 달라져도 지문은 그대로다",
      tc.fingerprint(dict(base, relatedStatus="failed")), tc.fingerprint(dict(base)))

# 그래도 기록은 남아야 한다 — 나중에 "그때 무엇과 이어져 있었나"를 되짚을 자리.
token = tc.parse_token(hit)
check("토큰에 관계 번호를 기록한다", token.get("related"), [263])
check("토큰에 관계 조회 상태를 기록한다", token.get("relatedStatus"), "ok")
check("토큰의 지문은 관계와 무관하다", token.get("fingerprint"), tc.fingerprint(verdict))


# ── 정정 코멘트도 봇의 글이다 ────────────────────────────────
#
# 정정은 이슈에 **새 코멘트로** 남는다. 그 글에 표식이 없으면 다음 실행에서
# 관계 신호 ①이 그 안의 `#N` 을 사람의 언급으로 센다. 러너에서는 작성자가
# `github-actions[bot]` 이라 걸리지만, 2단은 사람 토큰으로 달아 안 걸린다.
correction = tc.correction_body(["- 담당자: `미배정` → `std-yong`"], "2026-08-06.1")

check("정정 코멘트에 봇 표식이 있다",
      relate.is_bot_comment({"body": correction, "user": {"login": "Woo-JongHo"}}), True)
check("표식이 없으면 사람 글로 샌다 — 이 검사가 무엇을 막는지 못 박는다",
      relate.is_bot_comment({"body": correction.replace("<!-- atlas-triage:correction -->", ""),
                             "user": {"login": "Woo-JongHo"}}), False)

# 표식을 공유하되 갱신 대상은 갈라져 있어야 한다. 정정 글이 갱신 대상으로
# 뽑히면 다음 실행이 판정 코멘트 대신 정정 글을 덮어써 판정이 사라진다.
check("정정 코멘트는 갱신 대상으로 뽑히지 않는다",
      tc.pick_mine([comment(11, BOT, correction)], ALLOWED), None)
check("정정 글이 있어도 판정 코멘트를 제대로 고른다",
      (tc.pick_mine([comment(11, BOT, correction), comment(12, BOT, V2)], ALLOWED) or {}).get("id"),
      12)

# 내용도 지킨다 — diffs 가 비면 "무엇이 바뀌었는지 모른다"가 아니라
# "근거 경로가 달라졌다"고 말해야 한다.
check("변경 항목이 없으면 경로가 달라졌다고 적는다",
      "근거로 쓴 경로가 달라졌습니다" in tc.correction_body([], "2026-08-06.1"), True)
check("변경 항목을 그대로 싣는다",
      "- 담당자: `미배정` → `std-yong`" in correction, True)


if failures:
    print(f"\n실패 {len(failures)}건")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("\n통과 — 코멘트 갱신이 자기 글만 고치고 옛 판정을 덮지 않는다")
