#!/usr/bin/env python3
"""이슈의 파트·담당자를 판정한다. 판정만 하고 아무것도 바꾸지 않는다.

두 곳에서 쓰인다
  1단 (GitHub Actions)  이슈 본문에 경로가 있으면 그것으로 판정
  2단 (Hermes)          LLM 이 찾아온 경로를 --path 로 받아 같은 규칙으로 판정

같은 규칙을 두 곳이 쓰는 것이 핵심이다. LLM 은 **경로를 찾을 뿐** 배정하지
않는다. 배정을 LLM 이 하면 규칙이 두 벌이 되고, 둘이 어긋나도 아무도 모른다.

왜 LLM 출력을 경로로 받는가
  경로는 실재하거나 안 하거나다 — 검증할 수 있다.
  "이건 프론트야"는 검증할 방법이 없다. 틀려도 짚을 자리가 없다.

사용:
  python3 .project-atlas/tools/triage_route.py --issue 241
  python3 .project-atlas/tools/triage_route.py --issue 241 --path frontend/src/x.tsx
  python3 .project-atlas/tools/triage_route.py --issue 241 --json
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import re
import subprocess
import sys
from pathlib import Path, PurePosixPath

import yaml

ATLAS_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ATLAS_DIR.parent
ROUTING = ATLAS_DIR / "triage-routing.yaml"

ROOTS = ("frontend", "backend", ".github", ".project-atlas", "_wood", ".claude")
# 확장자로 끝나는 것만 경로로 본다. 디렉터리만으로는 배정하지 않는다 —
# `frontend/src/` 는 어느 파트인지 좁혀주지 않으면서 실재하기 때문에
# "찾았다"로 오인된다.
PATH_RE = re.compile(
    r"(?<![\w/.-])(?:" + "|".join(re.escape(r) for r in ROOTS) + r")/[\w./-]*\w\.[A-Za-z]{2,4}\b"
)
# 코드펜스와 URL 은 근거가 아니다. 이슈 본문의 예시·링크를 실제 관측으로 읽으면
# 판정이 남의 문장 위에 선다.
#
# 인라인 백틱은 걷어내지 않는다. 사람이 이슈에 경로를 적는 **정상적인 표기**가
# `frontend/src/...` 이기 때문이다.
# 2026-08-06 실측: 인라인 코드까지 걷었더니 열린 이슈 23건이 전부 미분류로
# 나왔다. 봇은 초록불로 돌면서 아무 말도 못 하고 있었다 — 오탐을 막으려다
# 유일한 신호를 껐다. 여러 줄 펜스는 대개 샘플이라 그대로 걷는다.
FENCE_RE = re.compile(r"```.*?```", re.S)
URL_RE = re.compile(r"https?://\S+")


def extract_paths(text: str) -> list[str]:
    """본문에서 근거가 될 수 있는 경로만 뽑는다.

    걸러내는 것 — 전부 교차검증이 실제로 재현한 오탐이다.
      코드펜스 안의 예시   여러 줄 블록은 대개 "이런 게 있다"이지 관측이 아니다
      URL 안의 경로       외부 링크는 이 저장소의 사실이 아니다
      디렉터리만          `frontend/src/` 는 파트를 안 좁히는데 실재해서 통과한다
      glob 표기           `frontend/**` 는 경로가 아니라 패턴이다

    걸러내지 않는 것
      인라인 백틱 안의 경로   사람이 경로를 적는 정상 표기다. 이것을 걷으면
                             봇이 볼 수 있는 신호가 사실상 남지 않는다.
    """
    cleaned = FENCE_RE.sub(" ", text or "")
    cleaned = URL_RE.sub(" ", cleaned)
    return sorted(set(PATH_RE.findall(cleaned)))


def is_wellformed(rel: str) -> bool:
    """저장소 안을 가리키는 **형태**인가. 실재 여부는 보지 않는다.

    `..` 를 정규화하기 전에 fnmatch 를 돌리면
    `frontend/../.project-atlas/tools/x.py` 가 frontend 로 배정된다 —
    실재 검사는 통과하는데 파트가 틀린다. 정규화를 먼저 한다.

    왜 `is_safe` 에서 갈라 냈는가
      파트 판정은 실재하는 파일만 근거로 삼아야 한다(지어낸 경로 위에 배정이
      서면 안 된다). 그런데 열린 PR 과의 변경 파일 교집합에서는 실재 검사가
      정반대로 작동한다 — PR 이 **새로 만드는** 파일은 지금 체크아웃에 없다.
      두 쓰임이 형태 검사는 공유하고 실재 검사만 갈라져야 해서 여기서 나눈다.
      다시 합치면 하드닝이 두 벌이 되고, 한쪽만 고쳐지는 날이 온다.
    """
    if rel.startswith("/") or "\\" in rel:
        return False
    normalized = PurePosixPath(rel)
    if any(part == ".." for part in normalized.parts):
        return False
    if not normalized.parts or normalized.parts[0] not in ROOTS:
        return False
    try:
        resolved = (REPO_ROOT / normalized).resolve()
        resolved.relative_to(REPO_ROOT.resolve())
    except (OSError, ValueError):
        return False
    return True


def is_safe(rel: str) -> bool:
    """저장소 안의 실재하는 **파일**인가. 파트 판정의 근거는 이것만 쓴다."""
    if not is_wellformed(rel):
        return False
    try:
        return (REPO_ROOT / PurePosixPath(rel)).resolve().is_file()
    except OSError:
        return False


def gh(args: list[str], *, optional: bool = False) -> str:
    proc = subprocess.run(["gh", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"gh 실패: {' '.join(args[:4])}\n{proc.stderr.strip()}", file=sys.stderr)
        if optional:
            return ""
        raise SystemExit(1)
    return proc.stdout


def is_ignored(path: str, routing: dict) -> bool:
    """근거로 세지 않는 경로인가. 규칙 매칭보다 **먼저** 본다."""
    return any(fnmatch.fnmatch(path, pat) for pat in routing.get("ignore") or [])


def match_rule(path: str, routing: dict) -> dict | None:
    """첫 매칭이 이긴다. 좁은 규칙이 위에 있다는 전제다."""
    for rule in routing["rules"]:
        if any(fnmatch.fnmatch(path, pattern) for pattern in rule["paths"]):
            return rule
    return None


def decide(paths: list[str], routing: dict) -> dict:
    """경로들에서 파트·담당자를 정한다.

    경로가 여러 파트에 걸리면 하나를 고르지 않는다. 임의 선택은 엉뚱한 사람을
    부르고, 그 코멘트는 봇이 낼 수 없는 권위를 주장하게 된다.
    """
    if not paths:
        fb = routing["fallback"]
        return {"part": None, "assignee": None, "basis": "no-path", "note": fb["note"],
                "matched": []}

    considered = [p for p in paths if not is_ignored(p, routing)]
    if not considered:
        # registry 인용만 있는 경우. "경로가 없다"와 다르다 — Atlas 기록은
        # 있는데 코드 위치가 없는 것이고, 그 차이를 사람이 봐야 한다.
        #
        # 이때 Atlas 파트로 보내지 않는다. 2026-08-06 실측: registry 만 인용한
        # 이슈 6건(#226·227·228·229·243·244)이 전부 제품 결함이었다.
        # registry 를 근거로 세면 6건 모두 하네스 담당에게 간다.
        # registry **도구** 결함은 .project-atlas/tools/*.py 를 지목하지
        # 데이터 파일만 지목하지 않는다.
        return {"part": None, "assignee": None, "basis": "registry-only",
                "note": "Atlas registry 기록은 인용돼 있으나 결함이 나는 코드 위치가 "
                        "없습니다. registry 는 결함이 기록된 곳이지 나는 곳이 아닙니다.",
                "matched": []}

    matched = []
    for p in considered:
        rule = match_rule(p, routing)
        if rule:
            matched.append({"path": p, "part": rule["part"], "assignee": rule["assignee"]})

    if not matched:
        return {"part": None, "assignee": None, "basis": "no-rule",
                "note": "본문의 경로가 어떤 라우팅 규칙에도 걸리지 않습니다.",
                "matched": []}

    parts = {m["part"] for m in matched}
    if len(parts) > 1:
        # 파트가 갈려도 담당이 한 사람이면 부를 사람은 정해져 있다.
        # 그때까지 미배정으로 넘기면 봇이 아는 것을 말하지 않는 셈이 된다.
        # 충돌이 막으려는 것은 **틀린 사람을 부르는 것**이지 파트 이름의 모호함이 아니다.
        assignees = {m["assignee"] for m in matched}
        if len(assignees) == 1:
            return {"part": None, "assignee": matched[0]["assignee"],
                    "basis": "multi-part-same-owner",
                    "note": "여러 파트에 걸쳐 있으나 담당은 한 사람입니다. "
                            "파트는 사람이 정해 주세요.",
                    "matched": matched}
        cf = routing["conflict"]
        return {"part": None, "assignee": None, "basis": "conflict", "note": cf["note"],
                "matched": matched}

    first = matched[0]
    return {"part": first["part"], "assignee": first["assignee"], "basis": "path",
            "note": None, "matched": matched}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--issue", type=int, required=True)
    ap.add_argument("--path", action="append", default=[],
                    help="LLM 이 찾은 경로. 여러 번 줄 수 있다. 주면 본문 대신 이것을 쓴다")
    ap.add_argument("--json", action="store_true", dest="as_json")
    args = ap.parse_args()

    routing = yaml.safe_load(ROUTING.read_text(encoding="utf-8"))
    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    slug = project["repo"]

    raw = json.loads(gh(["issue", "view", str(args.issue), "-R", slug,
                         "--json", "number,title,body"]))

    if args.path:
        paths, source = args.path, "provided"
    else:
        paths = extract_paths(f"{raw['title']}\n{raw.get('body') or ''}")
        source = "issue-body"

    # 실재하지 않거나 저장소 밖을 가리키는 경로는 근거가 못 된다.
    # LLM 이 지어낸 경로나 `..` 위장을 그대로 쓰면 판정이 허구 위에 선다.
    existing = [p for p in paths if is_safe(p)]
    missing = [p for p in paths if p not in existing]

    verdict = decide(existing, routing)
    verdict.update({
        "issue": args.issue,
        "routingVersion": routing["routingVersion"],
        "pathSource": source,
        "pathsSeen": paths,
        "pathsMissing": missing,
    })

    if args.as_json:
        print(json.dumps(verdict, ensure_ascii=False, indent=2))
        return 0

    print(f"#{args.issue}  파트={verdict['part'] or '미분류'}  "
          f"담당={verdict['assignee'] or '미배정'}  근거={verdict['basis']}")
    for m in verdict["matched"]:
        print(f"    {m['path']}  →  {m['part']}")
    if missing:
        print(f"    실재하지 않는 경로 {len(missing)}건: {', '.join(missing[:3])}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
