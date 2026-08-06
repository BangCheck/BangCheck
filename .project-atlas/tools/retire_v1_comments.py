#!/usr/bin/env python3
"""옛 트리아지 코멘트(v1)에 은퇴 표시를 덧붙인다. 지우지 않는다.

왜 지우지 않는가
  v1 은 2026-08-05 에 registry 와 이슈를 대조한 **관측 기록**이다.
  그 시점에 무엇이 안 이어져 있었는지는 지금 다시 만들 수 없다.

왜 v2 로 고쳐 쓰지 않는가
  둘은 다른 것을 말한다 — v1 은 registry 연결(LINKED·NEEDS_LINK·BROKEN_LINK),
  v2 는 파트·담당자 배정이다. 같은 판정의 두 판본이 아니다.
  본문을 v2 로 바꾸면 하지도 않은 관측을 그 날짜에 한 것처럼 만든다.

왜 그냥 두지도 않는가
  봇 코멘트가 둘인데 어느 것이 살아있는 판정인지 사람이 구별할 수 없다.
  한 줄로 말한다 — 이 판정은 은퇴했고, 그 일은 지금 누가 하는가.

v1 이 하던 일은 어디로 갔는가
  registry ↔ 이슈 정합은 sync_check.py 가 CI 에서 결정론으로 검사한다
  (SYN-01/02/03/05). 코멘트로 추정하던 것을 게이트가 판정하게 됐다.

멱등이다 — 이미 붙은 코멘트는 건너뛴다. 몇 번 돌려도 같다.

사용:
  python3 .project-atlas/tools/retire_v1_comments.py --dry-run
  python3 .project-atlas/tools/retire_v1_comments.py
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from triage_route import gh  # noqa: E402

ATLAS_DIR = Path(__file__).resolve().parent.parent

V1_TOKEN = "<!-- atlas-triage:v1 "
RETIRED_MARK = "<!-- atlas-triage:v1-retired -->"

FOOTER = f"""

{RETIRED_MARK}
> **이 판정은 은퇴했습니다.** 위 내용은 2026-08-05 시점의 registry 대조 기록이며
> 갱신되지 않습니다. registry ↔ 이슈 정합은 이제 CI 의 `sync_check.py` 가
> 검사하고, 파트·담당자 배정은 아래 `분류·배정 제안` 코멘트가 소유합니다."""


def targets(slug: str) -> list[dict]:
    """v1 토큰이 있고 아직 은퇴 표시가 없는 코멘트."""
    raw = json.loads(gh(["api", "--paginate",
                         f"repos/{slug}/issues/comments?per_page=100"]))
    return [c for c in raw
            if V1_TOKEN in (c.get("body") or "")
            and RETIRED_MARK not in (c.get("body") or "")]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    slug = project["repo"]

    found = targets(slug)
    if not found:
        print("은퇴 표시가 필요한 v1 코멘트가 없다 — 이미 다 붙었거나 애초에 없다")
        return 0

    print(f"대상 {len(found)}건")
    for c in found:
        issue = (c.get("issue_url") or "").rsplit("/", 1)[-1]
        who = (c.get("user") or {}).get("login")
        if args.dry_run:
            print(f"  [dry-run] #{issue} 코멘트 {c['id']} ({who})")
            continue
        gh(["api", "-X", "PATCH", f"repos/{slug}/issues/comments/{c['id']}",
            "-f", f"body={c['body']}{FOOTER}"])
        print(f"  #{issue} 코멘트 {c['id']} — 은퇴 표시")

    if args.dry_run:
        print("\ndry-run — 아무것도 바꾸지 않았다")
    return 0


if __name__ == "__main__":
    sys.exit(main())
