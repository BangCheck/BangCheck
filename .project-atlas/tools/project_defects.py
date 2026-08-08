#!/usr/bin/env python3
"""defects.yaml → GitHub Issue 투영.

무엇을 하는가
  registry의 결함을 GitHub Issue로 올리고, 만들어진 번호를 defects.yaml의
  `issue` 필드에 적는다. defects.yaml 머리말이 예고한 그 작업이다 —
  "상태: Atlas 구축 후 GitHub Issue로 투영한다. 지금은 파일이 정본이다."

왜 `issue` 하나만 적는가
  schema.yaml:100-104 가 그렇게 선언한다.

      # 결함 생애주기에서 사람이 적는 값은 이것 하나다 (선택).
      # OBSERVED(이슈 없음) → TRACKED(이슈 등록) → IN_PROGRESS(PR 열림) → RESOLVED(머지됨)
      # 뒤의 셋은 이 번호에서 파생될 값이라 사람이 적지 않는다 — 두 곳에 적으면 갈라진다.

  그래서 이 스크립트도 번호 하나만 쓴다. lifecycle 은 pm_snapshot.py 가 파생한다.

되돌리기 어려운 작업이라 지키는 것
  - 기본은 dry-run 이다. --apply 를 줘야 실제로 만든다.
  - 이중 방어로 멱등성을 만든다.
      1) defects.yaml 에 issue 번호가 이미 있으면 건너뛴다
      2) 번호가 없어도 GitHub 에서 그 결함 ID 마커를 검색해 이미 있으면 그 번호를 회수한다
    (2)가 필요한 이유: 이슈는 만들어졌는데 파일 기록 직전에 죽으면, (1)만으로는
    다음 실행이 같은 결함으로 이슈를 하나 더 만든다.
  - YAML 을 파싱해 다시 쓰지 않는다. defects.yaml 은 주석이 근거의 절반이라
    round-trip 하면 그것이 통째로 사라진다. `- id: <ID>` 줄 뒤에 한 줄을 끼워 넣는다.

사용:
  python3 .project-atlas/tools/project_defects.py                    # dry-run 전체
  python3 .project-atlas/tools/project_defects.py --severity P1      # 대상 좁히기
  python3 .project-atlas/tools/project_defects.py --id BC-SEC-01     # 하나만
  python3 .project-atlas/tools/project_defects.py --apply --severity P1
종료 코드: 성공 0, 실패 1
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from atlas_marker import has_marker_for, render  # noqa: E402

ATLAS_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ATLAS_DIR.parent
DEFECTS = ATLAS_DIR / "registry" / "defects.yaml"

# 이슈 본문에 심는 조인 키. 사람이 지우지 않는 한 검색으로 되찾을 수 있다.
#
# 형식과 인식 규칙은 atlas_marker 가 단독으로 소유한다. 예전에는 이 파일이
# 문자열을 들고 만들고, sync_check.py 가 따로 들고 읽었다 — 둘이 각자 정의를
# 가지면 한쪽만 고칠 때 조용히 갈라지고, 그 순간 registry ↔ 이슈 대조 전체가
# 무의미해진다. 조인 키의 정본은 하나여야 한다.

# 이슈로 만들 이유가 없는 처분. RECORD_ONLY 는 "고치지 않기로 하고 기록만 한다"라
# registry 자신이 결론을 내린 것이라, 이슈로 올리면 열린 채 영원히 남는다.
SKIP_DISPOSITIONS = {"RECORD_ONLY"}


def repo_slug(project: dict) -> str:
    slug = project.get("repo")
    if not slug:
        raise SystemExit("project.yaml 에 repo 가 없다")
    return slug


def gh(args: list[str]) -> str:
    proc = subprocess.run(["gh", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        raise SystemExit(f"gh 실패: {' '.join(args)}\n{proc.stderr.strip()}")
    return proc.stdout


def find_existing(slug: str, defect_id: str) -> int | None:
    """이미 올라간 이슈가 있는지 마커로 찾는다."""
    out = gh([
        "issue", "list", "-R", slug, "--state", "all", "--limit", "100",
        "--search", defect_id, "--json", "number,body",
    ])
    for item in json.loads(out or "[]"):
        if has_marker_for(item.get("body"), defect_id):
            return item["number"]
    return None


def build_body(defect: dict, slug: str) -> str:
    evidence = defect.get("evidence") or {}
    lines = [
        render(defect["id"]),
        "",
        f"> Atlas registry `{defect['id']}` 에서 투영됐다. 정본은 `.project-atlas/registry/defects.yaml` 이다.",
        "",
        "## 증상",
        "",
        (defect.get("detail") or "").strip(),
        "",
        "## 근거",
        "",
    ]
    path = evidence.get("path")
    if path:
        location = f"`{path}`"
        if evidence.get("symbol"):
            location += f" — `{evidence['symbol']}`"
        if evidence.get("line"):
            location += f" (line {evidence['line']})"
        lines.append(f"- {location}")
    lines += ["", "## 분류", ""]
    lines.append(f"- severity: `{defect.get('severity')}`")
    lines.append(f"- disposition: `{defect.get('disposition')}`")
    if defect.get("relatedFeature"):
        lines.append(f"- feature: `{defect['relatedFeature']}`")
    if defect.get("relatedStory"):
        lines.append(f"- story: `{defect['relatedStory']}`")
    lines += [
        "",
        "## 처리 방법",
        "",
        "이 이슈를 고치는 PR 은 본문에 `closes #<이 번호>` 를 넣는다.",
        "머지되면 Atlas 의 결함 생애주기가 `RESOLVED` 로 파생된다 —",
        "생애주기를 손으로 적지 않는다. 사람이 적는 값은 이슈 번호 하나다.",
    ]
    return "\n".join(lines)


def write_back(defect_id: str, number: int) -> None:
    """`- id: <ID>` 줄 바로 뒤에 `issue: N` 을 끼운다. 주석을 건드리지 않는다.

    원자적으로 쓴다. 중간에 죽으면 defects.yaml 이 반쪽으로 남고, 그 파일은
    registry 의 정본이라 손상되면 resolver·sync 검사가 전부 무의미해진다.
    """
    text = DEFECTS.read_text(encoding="utf-8")
    pattern = re.compile(rf"^(  - id: {re.escape(defect_id)}[ \t]*)$", re.M)
    match = pattern.search(text)
    if not match:
        raise SystemExit(f"defects.yaml 에서 '- id: {defect_id}' 줄을 찾지 못했다")

    # 이미 issue 키가 있으면 덧붙이지 않는다. issue: null / 0 처럼 falsy 로
    # 적혀 있는 경우 호출부의 `if defect.get("issue")` 를 통과해 여기까지 오는데,
    # 그대로 삽입하면 같은 블록에 issue 키가 둘이 되어 YAML 이 조용히 뒤엣것만 읽는다.
    block_end = text.find("\n  - id:", match.end())
    block = text[match.end(): block_end if block_end != -1 else len(text)]
    if re.search(r"^\s+issue:", block, re.M):
        raise SystemExit(
            f"{defect_id} 에 이미 issue 키가 있다 — 값을 확인하고 손으로 정리하라"
        )

    insert_at = match.end()
    updated = text[:insert_at] + f"\n    issue: {number}" + text[insert_at:]
    tmp = DEFECTS.with_suffix(".yaml.tmp")
    tmp.write_text(updated, encoding="utf-8")
    tmp.replace(DEFECTS)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="실제로 이슈를 만든다 (기본은 dry-run)")
    parser.add_argument("--severity", help="P1/P2/P3 중 하나로 좁힌다")
    parser.add_argument("--id", help="결함 ID 하나만")
    parser.add_argument("--limit", type=int, help="최대 몇 건까지")
    args = parser.parse_args()

    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    slug = repo_slug(project)
    defects = yaml.safe_load(DEFECTS.read_text(encoding="utf-8"))["defects"]

    targets, skipped = [], []
    for defect in defects:
        if "issue" in defect and defect.get("issue") is not None:
            value = defect["issue"]
            label = f"이미 #{value}" if value else f"issue 키가 {value!r} — 손으로 정리 필요"
            skipped.append((defect["id"], label))
            continue
        if defect.get("disposition") in SKIP_DISPOSITIONS:
            skipped.append((defect["id"], f"{defect['disposition']} — 이슈 대상 아님"))
            continue
        if args.severity and defect.get("severity") != args.severity:
            continue
        if args.id and defect["id"] != args.id:
            continue
        targets.append(defect)

    if args.limit:
        targets = targets[: args.limit]

    print(f"저장소 {slug} · 결함 {len(defects)}건 · 대상 {len(targets)}건 · 제외 {len(skipped)}건")
    for defect_id, reason in skipped:
        print(f"  skip  {defect_id:14} {reason}")
    print()

    if not args.apply:
        print("dry-run — 아래를 만든다. 실제로 만들려면 --apply\n")
        for defect in targets:
            print(f"  [{defect['severity']}] {defect['id']:14} {defect['title']}")
        print(f"\n총 {len(targets)}건. 되돌리기 어려우니 소규모로 먼저 확인하라 (--severity P1 --limit 1).")
        return 0

    created = 0
    for defect in targets:
        existing = find_existing(slug, defect["id"])
        if existing:
            print(f"  회수  {defect['id']:14} 이미 #{existing} — 파일에만 기록한다")
            write_back(defect["id"], existing)
            continue

        title = f"[{defect['id']}] {defect['title']}"
        out = gh([
            "issue", "create", "-R", slug,
            "--title", title,
            "--body", build_body(defect, slug),
        ])
        url = out.strip().splitlines()[-1]
        number = int(url.rstrip("/").split("/")[-1])
        write_back(defect["id"], number)
        created += 1
        print(f"  생성  {defect['id']:14} #{number}  {url}")

    print(f"\n생성 {created}건. defects.yaml 에 번호를 기록했다.")
    print("다음: python3 .project-atlas/tools/resolve.py 로 ISS-01 이 통과하는지 확인하라.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
