#!/usr/bin/env python3
"""판정 결과를 이슈 코멘트로 남긴다.

봇이 하는 것
  파트·담당자를 **제안**한다.

봇이 하지 않는 것 (교차검증 확정)
  registry·이슈 제목·본문·assignee·label 을 고치지 않는다.
  BC ID 를 제안하지 않는다 — registry 를 쓰지 않는 코멘트는 번호를 예약할
  원자적 정본이 아니다. 두 이슈가 동시에 열리면 같은 번호를 제안하게 된다.
  즉시 식별자는 GitHub 이슈 번호로 충분하다.
  severity·disposition·중복 여부·"결함 아님"을 판정하지 않는다.
  PR 생성·`closes #N` 안내를 하지 않는다.

코멘트 하나만 유지한다
  같은 이슈에 봇 코멘트가 쌓이면 사람이 안 읽는다. 토큰으로 자기 코멘트를
  찾아 갱신하고, 판정이 실제로 바뀐 경우에만 정정을 따로 남긴다.

사용:
  python3 .project-atlas/tools/triage_comment.py --issue 241
  python3 .project-atlas/tools/triage_comment.py --issue 241 --path <LLM이 찾은 경로>
  python3 .project-atlas/tools/triage_comment.py --issue 241 --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from triage_route import PATH_RE, decide, gh  # noqa: E402

ATLAS_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ATLAS_DIR.parent
ROUTING = ATLAS_DIR / "triage-routing.yaml"

TOKEN_OPEN = "<!-- atlas-triage:v2 "
TOKEN_RE = re.compile(r"<!--\s*atlas-triage:v2\s*(\{.*?\})\s*-->", re.S)
BOT_LOGINS = {"github-actions[bot]", "github-actions"}


def fingerprint(v: dict) -> str:
    """판정이 실제로 달라졌는지 가리는 값. 시각은 넣지 않는다 —
    재실행마다 바뀌면 모든 실행이 '정정'으로 기록된다."""
    payload = json.dumps({k: v.get(k) for k in ("part", "assignee", "basis", "matched",
                                                "routingVersion")},
                         sort_keys=True, ensure_ascii=False)
    return "sha256:" + hashlib.sha256(payload.encode()).hexdigest()[:16]


def render(verdict: dict, routing: dict) -> str:
    parts = routing["parts"]
    part_label = parts.get(verdict["part"], verdict["part"]) if verdict["part"] else "미분류"
    token = {
        "routingVersion": verdict["routingVersion"],
        "part": verdict["part"],
        "assignee": verdict["assignee"],
        "basis": verdict["basis"],
        "pathSource": verdict["pathSource"],
        "observedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "fingerprint": fingerprint(verdict),
    }
    out = [f"{TOKEN_OPEN}{json.dumps(token, ensure_ascii=False)} -->", "",
           "## 분류·배정 제안", "",
           f"- 파트: {part_label}",
           f"- 담당자: {verdict['assignee'] or '미배정'}"]

    if verdict["basis"] == "path":
        m = verdict["matched"][0]
        src = "이슈 본문에" if verdict["pathSource"] == "issue-body" else "코드 탐색으로"
        out.append(f"- 근거: {src} `{m['path']}` 가 확인되었으며, "
                   f"라우팅 규칙 `{m['part']}` 와 일치합니다.")
        if len(verdict["matched"]) > 1:
            out.append(f"- 함께 확인된 경로: "
                       + ", ".join(f"`{x['path']}`" for x in verdict["matched"][1:4]))
    elif verdict["basis"] == "conflict":
        out.append(f"- 근거: {verdict['note']}")
        out.append("- 걸린 파트: "
                   + ", ".join(sorted({parts.get(x['part'], x['part'])
                                       for x in verdict["matched"]})))
        out.append("- 확인 필요: 어느 파트가 맡을지 사람이 정해 주세요.")
    else:
        out.append(f"- 근거: {verdict['note']}")
        out.append("- 확인 필요: `frontend/...` 또는 `backend/...` 형태의 소스 경로를 "
                   "이슈에 추가해 주세요. 그러면 다음 실행에서 파트와 담당자를 제안합니다.")

    if verdict.get("pathsMissing"):
        out.append(f"- 참고: 본문의 경로 {len(verdict['pathsMissing'])}건이 저장소에 "
                   "실재하지 않아 근거에서 제외했습니다.")

    out += ["", "—",
            f"Atlas Issue Triage · 규칙 `{verdict['routingVersion']}` · "
            "자동 제안이며 배정을 실제로 바꾸지 않습니다."]
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--issue", type=int, required=True)
    ap.add_argument("--path", action="append", default=[])
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    routing = yaml.safe_load(ROUTING.read_text(encoding="utf-8"))
    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    slug = project["repo"]

    raw = json.loads(gh(["issue", "view", str(args.issue), "-R", slug,
                         "--json", "number,title,body"]))
    if args.path:
        paths, source = args.path, "provided"
    else:
        paths = sorted(set(PATH_RE.findall(f"{raw['title']}\n{raw.get('body') or ''}")))
        source = "issue-body"

    existing = [p for p in paths if (REPO_ROOT / p).exists()]
    verdict = decide(existing, routing)
    verdict.update({"routingVersion": routing["routingVersion"], "pathSource": source,
                    "pathsMissing": [p for p in paths if p not in existing]})
    comment = render(verdict, routing)

    if args.dry_run:
        print(comment)
        return 0

    # 코멘트는 REST 로 읽는다 — `gh issue view --json comments` 는 GraphQL 노드 ID 를
    # 주는데 REST PATCH 는 숫자 ID 를 요구해 404 가 난다 (2026-08-05 실측).
    comments = json.loads(gh(["api", "--paginate", f"repos/{slug}/issues/{args.issue}/comments"]))
    # `gh api user` 는 GITHUB_TOKEN 으로 403 이다 — 앱 설치 토큰에 "현재 사용자"가 없다.
    me = gh(["api", "user", "--jq", ".login"], optional=True).strip()
    allowed = BOT_LOGINS | ({me} if me else set())

    mine = [c for c in comments
            if TOKEN_OPEN in (c.get("body") or "")
            and (c.get("user") or {}).get("login") in allowed]

    if not mine:
        gh(["issue", "comment", str(args.issue), "-R", slug, "--body", comment])
        print(f"#{args.issue} {verdict['part'] or '미분류'} → 코멘트 생성")
        return 0

    latest = mine[-1]
    prev = TOKEN_RE.search(latest.get("body") or "")
    prev_token = json.loads(prev.group(1)) if prev else {}
    changed = prev_token.get("fingerprint") != fingerprint(verdict)

    gh(["api", "-X", "PATCH", f"repos/{slug}/issues/comments/{latest['id']}",
        "-f", f"body={comment}"])

    if changed and prev_token:
        gh(["issue", "comment", str(args.issue), "-R", slug, "--body",
            f"**분류 정정** — `{prev_token.get('part') or '미분류'}` → "
            f"`{verdict['part'] or '미분류'}`\n\n"
            "근거가 달라져 제안을 바꿨습니다. 최신 제안은 위 코멘트에 있습니다.\n\n"
            f"—\nAtlas Issue Triage · 규칙 `{verdict['routingVersion']}`"])
        print(f"#{args.issue} {prev_token.get('part')} → {verdict['part']} — 정정 기록")
    else:
        print(f"#{args.issue} {verdict['part'] or '미분류'} → 코멘트 갱신")
    return 0


if __name__ == "__main__":
    sys.exit(main())
