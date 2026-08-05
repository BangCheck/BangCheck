#!/usr/bin/env python3
"""이슈 하나를 Atlas registry에 비추어 보고 코멘트를 남긴다.

무엇을 하는가
  이슈가 열리면 그것이 Atlas의 무엇에 해당하는지 판정해 코멘트로 알린다.
  registry에서 투영된 이슈는 연결을 확인해 주고, 사람이 직접 연 이슈는
  후보를 제안한다.

무엇을 하지 않는가
  **registry를 고치지 않는다.** defects.yaml 항목은 evidence 경로·심볼·severity·
  disposition을 요구하는데, 자유 서술 이슈에서 그것을 기계가 만들 수 없다.
  지어내면 그 순간 registry가 거짓을 담고, 그것을 근거로 도는 아래 검사들이
  전부 무의미해진다. 봇은 제안하고 사람이 확정한다.

판정이 약하다는 것을 숨기지 않는다
  2026-08-05 실측: registry가 가리키는 경로 29개 중 17개가 여러 feature에 걸린다.
  RoomController.java 하나가 7개 feature의 implementedBy에 등장한다.
  그래서 경로 매칭은 "정답"이 아니라 "후보 좁히기"다. 코멘트도 그렇게 말한다.
  단일 매칭일 때만 강한 신호로 표시하고, 나머지는 후보 목록으로 낸다.

사용:
  python3 .project-atlas/tools/triage_issue.py --issue 241
  python3 .project-atlas/tools/triage_issue.py --issue 241 --dry-run
종료 코드: 0 (판정 실패는 코멘트로 말하고 job을 죽이지 않는다 —
          분류가 안 된다고 이슈 등록을 막을 이유가 없다)
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

import yaml

ATLAS_DIR = Path(__file__).resolve().parent.parent
REGISTRY = ATLAS_DIR / "registry"
COMMENT_MARKER = "<!-- atlas-triage -->"
DEFECT_MARKER = re.compile(r"<!--\s*atlas-defect:\s*([A-Z0-9-]+)\s*-->")
PATH_RE = re.compile(r"(?:frontend|backend)/[A-Za-z0-9_./-]+\.[A-Za-z]{2,4}")


def gh(args: list[str]) -> str:
    proc = subprocess.run(["gh", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"gh 실패: {' '.join(args)}\n{proc.stderr.strip()}", file=sys.stderr)
        raise SystemExit(0)  # 판정 실패로 job을 죽이지 않는다
    return proc.stdout


def load_registry():
    features, path_owners = {}, defaultdict(set)
    for f in sorted(REGISTRY.glob("FT-*.yaml")):
        d = yaml.safe_load(f.read_text(encoding="utf-8"))
        fid = d["featureId"]
        features[fid] = d
        impl = d.get("implementedBy") or {}
        slice_path = impl.get("slice")
        for key in ("slice", "legacyPath", "frontendEntry"):
            v = impl.get(key)
            if v:
                path_owners[v.split("#")[0]].add(fid)
        if slice_path and impl.get("useCase"):
            path_owners[f"{slice_path}/{impl['useCase']}"].add(fid)

    defects = yaml.safe_load((REGISTRY / "defects.yaml").read_text(encoding="utf-8"))["defects"]
    for d in defects:
        p = (d.get("evidence") or {}).get("path")
        if p and d.get("relatedFeature"):
            path_owners[p].add(d["relatedFeature"])
    return features, path_owners, defects


def tokens(text: str) -> set[str]:
    """제목 비교용 토큰. 한국어 조사를 다루지 않으므로 2자 이상 덩어리만 쓴다 —
    정확한 형태소 분석이 아니라 '비슷한 게 있다'를 알리는 용도다."""
    return {t for t in re.split(r"[^0-9A-Za-z가-힣]+", text.lower()) if len(t) >= 2}


def build_comment(issue: dict, features: dict, path_owners: dict, defects: list) -> str:
    body = issue.get("body") or ""
    title = issue.get("title") or ""
    number = issue["number"]

    marker = DEFECT_MARKER.search(body)
    lines = [COMMENT_MARKER, "", "## Atlas 귀속", ""]

    # ── registry에서 투영된 이슈 ─────────────────────────────
    if marker:
        did = marker.group(1)
        defect = next((d for d in defects if d["id"] == did), None)
        if defect is None:
            lines += [
                f"이 이슈는 `{did}` 에서 투영됐다고 표시돼 있으나 **registry에 그 결함이 없습니다.**",
                "",
                "registry에서 지워졌거나 ID가 바뀐 것입니다. 확인이 필요합니다.",
            ]
            return "\n".join(lines)

        ev = defect.get("evidence") or {}
        loc = f"`{ev.get('path')}`" if ev.get("path") else "기록 없음"
        if ev.get("symbol"):
            loc += f" — `{ev['symbol']}`"
        recorded = defect.get("issue")
        lines += [
            f"registry의 **`{did}`** 에서 투영된 이슈입니다. 정본은 `.project-atlas/registry/defects.yaml` 입니다.",
            "",
            f"- 기능: `{defect.get('relatedFeature', '귀속 없음')}`",
            f"- severity: `{defect.get('severity')}` · disposition: `{defect.get('disposition')}`",
            f"- 근거: {loc}",
        ]
        if recorded != number:
            lines += [
                "",
                f"**주의** — registry는 이 결함의 이슈를 `{recorded or '없음'}` 으로 기록하고 있습니다. "
                f"이 이슈 번호(`{number}`)와 다릅니다.",
            ]
        lines += [
            "",
            "고치는 PR 본문에 `closes #%d` 를 넣으면 결함 생애주기가 파생됩니다. "
            "생애주기를 손으로 적지 마십시오 — 사람이 적는 값은 이슈 번호 하나입니다." % number,
        ]
        return "\n".join(lines)

    # ── 사람이 직접 연 이슈 ──────────────────────────────────
    lines += ["이 이슈는 registry에서 투영되지 않았습니다. 아래는 **자동 추정이며 확정이 아닙니다.**", ""]

    found_paths = sorted(set(PATH_RE.findall(f"{title}\n{body}")))
    candidates: dict[str, list[str]] = defaultdict(list)
    for p in found_paths:
        for owner_path, fids in path_owners.items():
            if p == owner_path or p.startswith(owner_path.rstrip("/") + "/"):
                for fid in fids:
                    candidates[fid].append(p)

    if candidates:
        lines += ["### 후보 기능", ""]
        for fid, why in sorted(candidates.items(), key=lambda kv: (-len(kv[1]), kv[0])):
            title_of = features.get(fid, {}).get("title", "")
            hit = why[0].split("/")[-1]
            lines.append(f"- `{fid}` — {title_of}  \n  근거: 본문의 `{hit}` 가 이 기능의 구현 경로와 일치")
        if len(candidates) > 1:
            lines += [
                "",
                "후보가 여럿인 것은 정상입니다. registry가 가리키는 경로 29개 중 17개가 "
                "여러 기능에 걸쳐 있어, 경로만으로는 하나로 좁혀지지 않습니다.",
            ]
    elif found_paths:
        lines += [
            "### 후보 기능",
            "",
            "본문에서 경로를 찾았으나 registry의 어떤 기능도 그 경로를 가리키지 않습니다.",
            "",
            *[f"- `{p}`" for p in found_paths[:5]],
            "",
            "공용 파일이거나 registry가 아직 덮지 않은 영역일 수 있습니다.",
        ]
    else:
        lines += [
            "### 후보 기능",
            "",
            "본문에 소스 경로가 없어 자동 판정을 할 수 없습니다. "
            "`frontend/...` 또는 `backend/...` 형태의 경로를 본문에 적으면 다음 실행에서 후보를 제안합니다.",
        ]

    # ── 유사 결함 ────────────────────────────────────────────
    t = tokens(title)
    similar = []
    for d in defects:
        overlap = t & tokens(d["title"])
        if len(overlap) >= 2:
            similar.append((len(overlap), d))
    similar.sort(key=lambda x: -x[0])
    # 이미 등재됐는데 이슈만 안 이어진 결함이 있으면 그것이 첫 번째 행동이다.
    # 새로 등록하라고 안내하면 같은 결함이 registry에 둘이 되고, 그때부터
    # 어느 쪽이 정본인지 아무도 모른다.
    unlinked = [d for _, d in similar if not d.get("issue")]

    if similar:
        lines += ["", "### 이미 등재된 비슷한 결함", ""]
        for _, d in similar[:3]:
            issue_ref = f"#{d['issue']}" if d.get("issue") else "**아직 이슈와 연결 안 됨**"
            lines.append(f"- `{d['id']}` ({issue_ref}) — {d['title']}")

    if unlinked:
        first = unlinked[0]
        lines += [
            "",
            "### 이 이슈를 기존 결함에 연결하십시오",
            "",
            f"`{first['id']}` 가 registry에 이미 있고 아직 어떤 이슈와도 이어져 있지 않습니다. "
            "같은 결함이라면 새로 등록하지 말고 이 이슈를 그 결함에 연결하는 것이 맞습니다.",
            "",
            "```bash",
            "# 1. 이 이슈 본문 맨 위에 마커를 넣는다",
            f"#    <!-- atlas-defect: {first['id']} -->",
            "# 2. registry에 이 이슈 번호를 기록한다 (새 이슈를 만들지 않고 회수한다)",
            f"python3 .project-atlas/tools/project_defects.py --id {first['id']} --apply",
            "```",
            "",
            "같은 결함이 아니라면 아래대로 새로 등록하십시오.",
        ]

    lines += [
        "",
        "### 새 결함으로 등록하려면",
        "",
        "```bash",
        "# 1. .project-atlas/registry/defects.yaml 에 항목을 추가한다",
        "#    (id · severity · title · detail · evidence · disposition · relatedFeature)",
        "# 2. 이 이슈 본문 맨 위에 <!-- atlas-defect: <새 ID> --> 를 넣는다",
        "# 3. 검사가 통과하는지 확인한다",
        "python3 .project-atlas/tools/resolve.py",
        "# 4. 이 이슈 번호를 registry에 기록한다",
        "python3 .project-atlas/tools/project_defects.py --id <새 ID> --apply",
        "```",
        "",
        "4번은 마커로 이 이슈를 찾아 번호만 기록합니다 — 새 이슈를 만들지 않습니다.",
    ]
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--issue", type=int, required=True)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    slug = project.get("repo")
    features, path_owners, defects = load_registry()

    issue = json.loads(gh([
        "issue", "view", str(args.issue), "-R", slug,
        "--json", "number,title,body",
    ]))
    comment = build_comment(issue, features, path_owners, defects)

    if args.dry_run:
        print(comment)
        return 0

    # 코멘트는 REST 로 읽는다. `gh issue view --json comments` 는 GraphQL 노드
    # ID(IC_kwDO...)를 주는데 REST PATCH 는 숫자 ID 를 요구해 404 가 난다.
    # 2026-08-05 두 번째 실행에서 실제로 그렇게 실패했다.
    comments = json.loads(gh([
        "api", "--paginate", f"repos/{slug}/issues/{args.issue}/comments",
    ]))
    existing = next(
        (c for c in comments if COMMENT_MARKER in (c.get("body") or "")),
        None,
    )
    if existing:
        # gh 에 코멘트 수정 명령이 없어 API 를 직접 쓴다. 같은 코멘트를 갱신해야
        # 이슈가 봇 코멘트로 도배되지 않는다.
        gh([
            "api", "-X", "PATCH", f"repos/{slug}/issues/comments/{existing['id']}",
            "-f", f"body={comment}",
        ])
        print(f"#{args.issue} 코멘트 갱신")
    else:
        gh(["issue", "comment", str(args.issue), "-R", slug, "--body", comment])
        print(f"#{args.issue} 코멘트 생성")
    return 0


if __name__ == "__main__":
    sys.exit(main())
