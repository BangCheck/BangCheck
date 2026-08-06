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
from triage_route import decide, extract_paths, gh, is_safe  # noqa: E402

ATLAS_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ATLAS_DIR.parent
ROUTING = ATLAS_DIR / "triage-routing.yaml"

TOKEN_OPEN = "<!-- atlas-triage:v2 "
TOKEN_RE = re.compile(r"<!--\s*atlas-triage:v2\s*(\{.*?\})\s*-->", re.S)
# 옛 판정. 은퇴했지만 기록이라 지우지 않는다 — 다만 v2 코멘트로 착각해
# 갱신하지는 않는다. 토큰이 다르므로 서로 간섭하지 않는다.
LEGACY_TOKEN_OPEN = "<!-- atlas-triage:v1 "


def resolve_paths(title: str, body: str, provided: list[str]) -> tuple[list[str], str]:
    """근거로 쓸 경로를 정한다.

    1단(본문)과 2단(LLM 이 찾아온 경로) 모두 **같은 함수**를 지난다.
    처음에는 이 자리에서 `PATH_RE.findall` 과 `.exists()` 를 직접 썼는데,
    그러면 triage_route 에 붙인 하드닝(코드펜스·URL·경로 탈출·디렉터리)이
    코멘트 경로에만 빠진다 — 판정은 막았는데 코멘트는 통과하는 상태가 된다.
    """
    if provided:
        paths, source = sorted(set(provided)), "provided"
    else:
        paths, source = extract_paths(f"{title}\n{body}"), "issue-body"
    return paths, source


def parse_token(body: str) -> dict:
    """앞선 코멘트의 판정 토큰. 깨져 있으면 빈 dict —
    사람이 코멘트를 손대 JSON 이 망가졌다고 봇이 죽을 이유가 없다."""
    m = TOKEN_RE.search(body or "")
    if not m:
        return {}
    try:
        parsed = json.loads(m.group(1))
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def pick_mine(comments: list[dict], allowed: set[str]) -> dict | None:
    """갱신할 자기 코멘트. 없으면 None.

    조건 둘을 **함께** 본다 — v2 토큰이 있고, 작성자가 허용 목록에 있다.
    토큰만 보면 남이 복사해 붙인 글을 덮어쓰고,
    작성자만 보면 그 사람의 일반 코멘트를 덮어쓴다.
    v1 토큰만 있는 코멘트는 고르지 않는다 — 판정 종류가 다르다.
    """
    mine = [c for c in comments
            if TOKEN_OPEN in (c.get("body") or "")
            and (c.get("user") or {}).get("login") in allowed]
    return mine[-1] if mine else None


def fingerprint(v: dict) -> str:
    """판정이 실제로 달라졌는지 가리는 값. 시각은 넣지 않는다 —
    재실행마다 바뀌면 모든 실행이 '정정'으로 기록된다."""
    payload = json.dumps({k: v.get(k) for k in ("part", "assignee", "basis", "matched",
                                                "routingVersion")},
                         sort_keys=True, ensure_ascii=False)
    return "sha256:" + hashlib.sha256(payload.encode()).hexdigest()[:16]


def render(verdict: dict, routing: dict) -> str:
    parts = routing["parts"]
    if verdict["part"]:
        part_label = parts.get(verdict["part"], verdict["part"])
    elif verdict["basis"] in ("conflict", "multi-part-same-owner"):
        part_label = "여러 파트"
    else:
        part_label = "미분류"
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
    elif verdict["basis"] in ("conflict", "multi-part-same-owner"):
        out.append(f"- 근거: {verdict['note']}")
        out.append("- 걸린 파트: "
                   + ", ".join(sorted({parts.get(x['part'], x['part'])
                                       for x in verdict["matched"]})))
        out.append("- 확인된 경로: "
                   + ", ".join(f"`{x['path']}`" for x in verdict["matched"][:4]))
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
    paths, source = resolve_paths(raw["title"], raw.get("body") or "", args.path)
    existing = [p for p in paths if is_safe(p)]
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
    # 허용 작성자는 저장소가 선언한다. `gh api user` 는 GITHUB_TOKEN 으로 403 이라
    # (앱 설치 토큰에 "현재 사용자"가 없다) 그 값만으로는 1단에서 아무도 못 고른다.
    allowed = set(routing.get("triageAuthors") or [])
    me = gh(["api", "user", "--jq", ".login"], optional=True).strip()
    if me:
        allowed.add(me)

    latest = pick_mine(comments, allowed)

    if latest is None:
        gh(["issue", "comment", str(args.issue), "-R", slug, "--body", comment])
        print(f"#{args.issue} {verdict['part'] or '미분류'} → 코멘트 생성")
        return 0

    prev_token = parse_token(latest.get("body") or "")
    changed = prev_token.get("fingerprint") != fingerprint(verdict)

    gh(["api", "-X", "PATCH", f"repos/{slug}/issues/comments/{latest['id']}",
        "-f", f"body={comment}"])

    if changed and prev_token:
        # 지문은 part·assignee·basis·matched·routingVersion 을 함께 보는데
        # 정정 문구가 part 만 비교하면 "미분류 → 미분류"라고 적으면서
        # 실제 변화(담당자가 생겼다·사라졌다)를 숨긴다.
        diffs = []
        for label, key, blank in (("파트", "part", "미분류"),
                                  ("담당자", "assignee", "미배정"),
                                  ("근거", "basis", "없음"),
                                  ("규칙", "routingVersion", "없음")):
            before, after = prev_token.get(key) or blank, verdict.get(key) or blank
            if before != after:
                diffs.append(f"- {label}: `{before}` → `{after}`")
        body = "**분류 정정**\n\n" + ("\n".join(diffs) if diffs else
                                    "- 근거로 쓴 경로가 달라졌습니다.")
        gh(["issue", "comment", str(args.issue), "-R", slug, "--body",
            body + "\n\n최신 제안은 위 코멘트에 있습니다.\n\n"
            f"—\nAtlas Issue Triage · 규칙 `{verdict['routingVersion']}`"])
        print(f"#{args.issue} 정정 기록 — {len(diffs)}개 항목 변경")
    else:
        print(f"#{args.issue} {verdict['part'] or '미분류'} → 코멘트 갱신")
    return 0


if __name__ == "__main__":
    sys.exit(main())
