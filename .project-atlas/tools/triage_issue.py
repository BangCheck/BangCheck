#!/usr/bin/env python3
"""이슈 하나를 Atlas registry에 비추어 보고 판정을 코멘트로 남긴다.

판정은 다섯 상태 중 하나다.

    LINKED        본문 마커가 registry·이슈 번호와 정확히 맞는다
    NEEDS_LINK    registry에 있는 결함인데 아직 어떤 이슈와도 안 이어졌다
    UNMATCHED     확정 연결을 찾지 못했다 — 결함이 아니라는 뜻이 아니다
    BROKEN_LINK   마커는 있으나 registry에 없거나 번호가 어긋난다 (정합 오류)
    NOT_A_DEFECT  사람이 라벨로 명시한 경우에만. 봇이 스스로 판정하지 않는다

UNMATCHED 와 BROKEN_LINK 를 나눈 이유
  "못 찾았다"와 "잘못 이어졌다"는 전혀 다른 일이다. 하나로 묶으면 진짜 정합
  오류가 판정 불가 더미에 묻힌다.

무엇을 하지 않는가
  **registry도 이슈 본문도 고치지 않는다.**
  본문의 `<!-- atlas-defect: BC-ID -->` 는 sync_check 가 정합을 판정하는 조인 키다.
  봇이 그것을 쓰면 추정이 곧 데이터가 되고, 잘못된 추정이 SYN-02/03 의 실제
  오류로 굳는다. 조인 키는 사람이 소유한다.

판정 토큰을 조인 키와 분리하는 이유
  한 주석에 합치려다 확인해 보니 정규식 셋이 깨진다 — 이 파일의 DEFECT_MARKER,
  sync_check.marker_of(), project_defects 의 정확 문자열 검색.
  그래서 토큰은 봇 코멘트에만 두고 본문 마커는 그대로 둔다.

봇은 책임 주체가 아니다
  참고한 오픈소스의 코멘트는 저장소 owner 계정이 쓴 것이라 "확정"·"중복 아님"
  같은 단정을 쓴다. 이쪽은 Actions 봇이라 그 단정을 쓸 수 없다.
  관측 범위와 사람 확인 필요성을 형식에 고정한다.

사용:
  python3 .project-atlas/tools/triage_issue.py --issue 241
  python3 .project-atlas/tools/triage_issue.py --issue 241 --dry-run
종료 코드
  0  판정을 내고 코멘트를 남겼다
  1  gh 조회·게시가 실패해 판정을 남기지 못했다
  "판정 불가"는 정상 종료다 — UNMATCHED 로 코멘트에 적는다.
  "판정을 못 남겼다"는 실패다 — 초록불로 흘리면 아무도 모른다.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import yaml

ATLAS_DIR = Path(__file__).resolve().parent.parent
REGISTRY = ATLAS_DIR / "registry"

TOKEN_OPEN = "<!-- atlas-triage:v1 "
TOKEN_RE = re.compile(r"<!--\s*atlas-triage:v1\s*(\{.*?\})\s*-->", re.S)
DEFECT_MARKER = re.compile(r"<!--\s*atlas-defect:\s*([A-Z0-9-]+)\s*-->")
PATH_RE = re.compile(r"(?:frontend|backend)/[A-Za-z0-9_./-]+\.[A-Za-z]{2,4}")

# 사람이 이 라벨을 붙였을 때만 NOT_A_DEFECT 로 간다. 봇이 스스로 정하지 않는다.
NOT_A_DEFECT_LABEL = "atlas:not-a-defect"
BOT_LOGINS = {"github-actions[bot]", "github-actions"}


def gh(args: list[str], *, optional: bool = False) -> str:
    """gh 호출.

    optional=True 는 "없어도 판정을 낼 수 있는 조회"에만 쓴다. 그 외의 실패는
    exit 1 로 job 을 죽인다.
    2026-08-05: 모든 실패를 exit 0 으로 흘렸더니 러너에서 gh 가 403 을 냈는데
    job 은 success 였고 코멘트는 하나도 안 달렸다. 초록불이 "했다"와 "못 했다"를
    구별하지 못하는 상태를 스스로 만들었다.
    """
    proc = subprocess.run(["gh", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"gh 실패: {' '.join(args[:4])}\n{proc.stderr.strip()}", file=sys.stderr)
        if optional:
            return ""
        raise SystemExit(1)
    return proc.stdout


def load_registry():
    features, path_owners = {}, defaultdict(set)
    for f in sorted(REGISTRY.glob("FT-*.yaml")):
        d = yaml.safe_load(f.read_text(encoding="utf-8"))
        fid = d["featureId"]
        features[fid] = d
        impl = d.get("implementedBy") or {}
        for key in ("slice", "legacyPath", "frontendEntry"):
            if impl.get(key):
                path_owners[impl[key].split("#")[0]].add(fid)
        if impl.get("slice") and impl.get("useCase"):
            path_owners[f"{impl['slice']}/{impl['useCase']}"].add(fid)

    defects = yaml.safe_load((REGISTRY / "defects.yaml").read_text(encoding="utf-8"))["defects"]
    for d in defects:
        p = (d.get("evidence") or {}).get("path")
        if p and d.get("relatedFeature"):
            path_owners[p].add(d["relatedFeature"])
    return features, path_owners, defects


def tokens(text: str) -> set[str]:
    """제목 비교용. 형태소 분석이 아니라 '비슷한 게 있다'를 알리는 용도다."""
    return {t for t in re.split(r"[^0-9A-Za-z가-힣]+", text.lower()) if len(t) >= 2}


def judge(issue: dict, features: dict, path_owners: dict, defects: list) -> dict:
    """판정 하나를 낸다. 코멘트 문구와 토큰이 같은 값에서 나오게 여기서 다 정한다."""
    body, title, number = issue.get("body") or "", issue.get("title") or "", issue["number"]
    labels = {l.lower() for l in issue.get("labels", [])}
    by_id = {d["id"]: d for d in defects}
    empty = {"features": [], "paths": [], "candidates": []}

    if NOT_A_DEFECT_LABEL in labels:
        return {"state": "NOT_A_DEFECT", "defect": None, "duplicate": "NOT_APPLICABLE",
                "reason": f"사람이 `{NOT_A_DEFECT_LABEL}` 라벨로 명시했습니다.", **empty}

    marker = DEFECT_MARKER.search(body)
    if marker:
        did = marker.group(1)
        defect = by_id.get(did)
        if defect is None:
            return {"state": "BROKEN_LINK", "defect": did, "duplicate": "NOT_APPLICABLE",
                    "reason": f"본문이 `{did}` 를 가리키나 registry에 그 결함이 없습니다. "
                              "registry에서 지워졌거나 ID가 바뀐 것입니다.", **empty}
        if defect.get("issue") != number:
            return {"state": "BROKEN_LINK", "defect": did, "duplicate": "NOT_APPLICABLE",
                    "reason": f"registry는 `{did}` 의 이슈를 "
                              f"`{defect.get('issue') or '없음'}` 으로 기록하고 있습니다. "
                              f"이 이슈 번호({number})와 다릅니다.", **empty}
        rel = defect.get("relatedFeature")
        return {"state": "LINKED", "defect": did, "duplicate": "NOT_APPLICABLE",
                "reason": "본문 마커가 registry와 이슈 번호에 맞습니다.",
                "features": [rel] if rel else [], "paths": [], "candidates": []}

    # 마커 없음 — 경로로 기능 후보를 좁히고 제목으로 유사 결함을 찾는다
    paths = sorted(set(PATH_RE.findall(f"{title}\n{body}")))
    cands: dict[str, str] = {}
    for p in paths:
        for owner_path, fids in path_owners.items():
            if p == owner_path or p.startswith(owner_path.rstrip("/") + "/"):
                for fid in fids:
                    cands.setdefault(fid, p)

    t = tokens(title)
    similar = sorted(
        ((len(t & tokens(d["title"])), d) for d in defects if len(t & tokens(d["title"])) >= 2),
        key=lambda x: -x[0],
    )
    unlinked = [d for _, d in similar if not d.get("issue")]
    common = {"features": sorted(cands), "paths": paths,
              "candidates": [d["id"] for _, d in similar[:3]]}

    if unlinked:
        return {"state": "NEEDS_LINK", "defect": unlinked[0]["id"],
                "duplicate": "CANDIDATE_UNLINKED",
                "reason": f"`{unlinked[0]['id']}` 가 registry에 있고 아직 어떤 이슈와도 "
                          "이어져 있지 않습니다. 제목 토큰이 겹쳐 후보로 잡혔습니다.", **common}

    if paths and not cands:
        reason = ("본문에서 경로를 찾았으나 registry의 어떤 기능도 그 경로를 가리키지 않습니다. "
                  "공용 파일이거나 registry가 아직 덮지 않은 영역일 수 있습니다.")
    elif not paths:
        reason = "본문에 소스 경로가 없어 경로 기반 판정을 할 수 없습니다."
    else:
        reason = "경로로 기능 후보는 좁혔으나 대응하는 registry 결함을 찾지 못했습니다."
    return {"state": "UNMATCHED", "defect": None,
            "duplicate": "CANDIDATE_LINKED" if similar else "NO_CANDIDATE",
            "reason": reason, **common}


def fingerprint(verdict: dict) -> str:
    """판정이 실제로 달라졌는지 가리는 값. 시각은 넣지 않는다 —
    재실행마다 값이 바뀌면 모든 실행이 '정정'으로 기록된다."""
    payload = json.dumps(
        {k: verdict[k] for k in ("state", "defect", "duplicate", "features", "paths", "candidates")},
        sort_keys=True, ensure_ascii=False,
    )
    return "sha256:" + hashlib.sha256(payload.encode()).hexdigest()[:16]


DUP_NOTE = {
    "NOT_APPLICABLE": "이미 정본 결함에 연결됐거나 판정 대상이 아닙니다.",
    "NO_CANDIDATE": "현행 제목 토큰 규칙으로는 기존 결함 후보가 없습니다. "
                    "중복이 아니라는 판정은 아닙니다.",
    "CANDIDATE_UNLINKED": "후보 결함이 있으나 아직 이슈와 이어지지 않았습니다.",
    "CANDIDATE_LINKED": "후보 결함이 있고 이미 다른 이슈와 이어져 있습니다.",
}


def render(issue: dict, verdict: dict, features: dict, defects: list) -> str:
    number, state = issue["number"], verdict["state"]
    by_id = {d["id"]: d for d in defects}
    token = {
        "state": state,
        "defect": verdict["defect"],
        "duplicate": verdict["duplicate"],
        "evidence": {"pathsFound": len(verdict["paths"]),
                     "featureCandidates": verdict["features"],
                     "defectCandidates": verdict["candidates"]},
        "observedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "fingerprint": fingerprint(verdict),
    }
    out = [f"{TOKEN_OPEN}{json.dumps(token, ensure_ascii=False)} -->", "",
           f"## Atlas triage — {state}", "",
           f"**판정:** {verdict['reason']}", ""]

    if state == "UNMATCHED":
        out += ["이것은 **결함이 아니라는 뜻이 아닙니다.** 자동 관측 범위 안에서 "
                "확정 연결을 찾지 못했다는 뜻입니다.", ""]

    if verdict["defect"] in by_id and state in ("LINKED", "BROKEN_LINK"):
        d = by_id[verdict["defect"]]
        ev = d.get("evidence") or {}
        loc = f"`{ev.get('path')}`" + (f" — `{ev['symbol']}`" if ev.get("symbol") else "")
        out += [f"**근거:** registry의 evidence는 {loc} 이며 "
                f"disposition은 `{d.get('disposition')}` 입니다.", ""]

    out += [f"**중복 검토:** `{verdict['duplicate']}` — {DUP_NOTE[verdict['duplicate']]}", ""]

    if verdict["features"]:
        out += ["**기능 후보:**", ""]
        out += [f"- `{fid}` — {features.get(fid, {}).get('title', '')}" for fid in verdict["features"]]
        if len(verdict["features"]) > 1:
            out += ["", "후보가 여럿인 것은 정상입니다. registry가 가리키는 경로의 절반 이상이 "
                        "여러 기능에 걸쳐 있어 경로만으로는 하나로 좁혀지지 않습니다."]
        out.append("")

    # FT 의 owner 는 기능 담당이다. 결함 수정 담당은 registry 에 선언돼 있지 않다.
    owner_fid = next((f for f in verdict["features"] if features.get(f, {}).get("owner")), None)
    if owner_fid:
        out += [f"**담당 경로:** 기능 담당 {features[owner_fid]['owner']} (`{owner_fid}`). "
                "결함 수정 담당은 registry에 별도로 지정돼 있지 않습니다.", ""]

    if state == "LINKED":
        out += [f"**다음 조치:** 수정 PR 본문에 `closes #{number}` 를 넣으십시오. "
                "결함 생애주기는 이슈 번호에서 파생됩니다 — 손으로 적지 마십시오.", ""]
    elif state == "NEEDS_LINK":
        out += ["**다음 조치:** 같은 결함이라면 이 이슈 본문 맨 위에 "
                f"`<!-- atlas-defect: {verdict['defect']} -->` 를 넣고 아래를 실행하십시오. "
                "새 이슈를 만들지 않고 이 번호를 회수합니다.", "",
                "```bash",
                f"python3 .project-atlas/tools/project_defects.py --id {verdict['defect']} --apply",
                "```", "", "같은 결함이 아니라면 새 registry 항목을 만드십시오.", ""]
    elif state == "UNMATCHED":
        out += ["**다음 조치:** 결함이면 사람이 evidence·severity·disposition을 갖춘 registry "
                "항목을 만들고, 이슈 본문에 `<!-- atlas-defect: BC-ID -->` 마커를 넣으십시오. "
                "봇은 본문을 고치지 않습니다 — 그 마커는 정합 판정의 조인 키라 추정이 "
                "데이터가 되면 안 됩니다.", ""]
    elif state == "BROKEN_LINK":
        out += ["**다음 조치:** registry와 이 이슈 중 어느 쪽이 맞는지 사람이 확인해야 합니다. "
                "이 상태에서는 새 결함 등록이나 본문 수정을 안내하지 않습니다.", ""]

    out += ["—", "Atlas Issue Triage · `atlas-triage:v1` · 자동 관측이며 사람 확인이 필요합니다."]
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--issue", type=int, required=True)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    slug = project["repo"]
    features, path_owners, defects = load_registry()

    raw = json.loads(gh(["issue", "view", str(args.issue), "-R", slug,
                         "--json", "number,title,body,labels"]))
    issue = {"number": raw["number"], "title": raw["title"], "body": raw["body"],
             "labels": [l["name"] for l in raw.get("labels", [])]}

    verdict = judge(issue, features, path_owners, defects)
    comment = render(issue, verdict, features, defects)

    if args.dry_run:
        print(comment)
        return 0

    # 코멘트는 REST 로 읽는다 — `gh issue view --json comments` 는 GraphQL 노드 ID 를
    # 주는데 REST PATCH 는 숫자 ID 를 요구해 404 가 난다 (2026-08-05 실측).
    comments = json.loads(gh(["api", "--paginate", f"repos/{slug}/issues/{args.issue}/comments"]))
    # `gh api user` 는 GITHUB_TOKEN(앱 설치 토큰)으로는 403 이다 — 그 토큰에는
    # "현재 사용자"가 없다. 러너에서는 봇 계정만 인정하고, 로컬 실행일 때만
    # 실행자를 추가한다.
    me = gh(["api", "user", "--jq", ".login"], optional=True).strip()
    allowed = BOT_LOGINS | ({me} if me else set())

    # 작성자를 확인한다. 토큰만 보고 덮으면 사람이 판정을 인용한 코멘트를 갱신할 수 있다.
    mine = [c for c in comments
            if TOKEN_OPEN in (c.get("body") or "")
            and (c.get("user") or {}).get("login") in allowed]

    if not mine:
        gh(["issue", "comment", str(args.issue), "-R", slug, "--body", comment])
        print(f"#{args.issue} {verdict['state']} — 코멘트 생성")
        return 0

    latest = mine[-1]
    prev = TOKEN_RE.search(latest.get("body") or "")
    prev_token = json.loads(prev.group(1)) if prev else {}
    changed = prev_token.get("fingerprint") != fingerprint(verdict)

    gh(["api", "-X", "PATCH", f"repos/{slug}/issues/comments/{latest['id']}",
        "-f", f"body={comment}"])

    if changed and prev_token:
        # 정정 이력은 별도 코멘트로 남긴다. 최신 판정 코멘트를 덮어쓰기만 하면
        # "판정이 바뀌었다"는 사실 자체가 사라진다.
        gh(["issue", "comment", str(args.issue), "-R", slug, "--body",
            f"**Atlas triage 정정** — `{prev_token.get('state')}` → `{verdict['state']}`\n\n"
            "근거가 달라져 판정을 바꿨습니다. 최신 판정은 위 코멘트에 있습니다.\n\n"
            "—\nAtlas Issue Triage · `atlas-triage:v1`"])
        print(f"#{args.issue} {prev_token.get('state')} → {verdict['state']} — 정정 기록")
    else:
        print(f"#{args.issue} {verdict['state']} — 코멘트 갱신")
    return 0


if __name__ == "__main__":
    sys.exit(main())
