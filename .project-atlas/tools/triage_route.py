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
FENCE_RE = re.compile(r"```.*?```", re.S)
INLINE_CODE_RE = re.compile(r"`[^`]*`")
URL_RE = re.compile(r"https?://\S+")


def extract_paths(text: str) -> list[str]:
    """본문에서 근거가 될 수 있는 경로만 뽑는다.

    걸러내는 것 — 전부 교차검증이 실제로 재현한 오탐이다.
      코드펜스·인라인 코드 안의 예시   문맥상 "이런 게 있다"이지 관측이 아니다
      URL 안의 경로                   외부 링크는 이 저장소의 사실이 아니다
      디렉터리만 (`frontend/src/`)     파트를 좁혀주지 않는데 실재해서 통과한다
      glob 표기 (`frontend/**`)        경로가 아니라 패턴이다
    """
    cleaned = FENCE_RE.sub(" ", text or "")
    cleaned = INLINE_CODE_RE.sub(" ", cleaned)
    cleaned = URL_RE.sub(" ", cleaned)
    return sorted(set(PATH_RE.findall(cleaned)))


def is_safe(rel: str) -> bool:
    """저장소 안의 실재하는 **파일**인가.

    `..` 를 정규화하기 전에 fnmatch 를 돌리면
    `frontend/../.project-atlas/tools/x.py` 가 frontend 로 배정된다 —
    실재 검사는 통과하는데 파트가 틀린다. 정규화를 먼저 한다.
    """
    if rel.startswith("/") or "\\" in rel:
        return False
    normalized = PurePosixPath(rel)
    if any(part == ".." for part in normalized.parts):
        return False
    if not normalized.parts or normalized.parts[0] not in ROOTS:
        return False
    target = (REPO_ROOT / normalized)
    try:
        resolved = target.resolve()
        resolved.relative_to(REPO_ROOT.resolve())
    except (OSError, ValueError):
        return False
    return resolved.is_file()


def gh(args: list[str], *, optional: bool = False) -> str:
    proc = subprocess.run(["gh", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"gh 실패: {' '.join(args[:4])}\n{proc.stderr.strip()}", file=sys.stderr)
        if optional:
            return ""
        raise SystemExit(1)
    return proc.stdout


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

    matched = []
    for p in paths:
        rule = match_rule(p, routing)
        if rule:
            matched.append({"path": p, "part": rule["part"], "assignee": rule["assignee"]})

    if not matched:
        return {"part": None, "assignee": None, "basis": "no-rule",
                "note": "본문의 경로가 어떤 라우팅 규칙에도 걸리지 않습니다.",
                "matched": []}

    parts = {m["part"] for m in matched}
    if len(parts) > 1:
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
