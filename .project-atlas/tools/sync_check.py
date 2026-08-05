#!/usr/bin/env python3
"""registry ↔ GitHub Issue 양방향 정합 검사.

왜 resolve.py 가 아니라 별도 도구인가
  resolve.py 는 네트워크를 모른다. 그것이 그 도구의 성질이고, 그래서 오프라인에서
  결정론적으로 돌고 결과가 재현된다. 거기에 GitHub 조회를 넣으면 API 장애가
  "registry 가 어긋났다"로 보고되고, 그 순간 검사기를 믿을 수 없게 된다.
  네트워크가 필요한 검사는 여기 모은다.

무엇을 보는가 — resolve.py 의 ISS-01 이 못 보는 것들
  ISS-01 은 issue 값이 양의 정수인지만 본다. 번호가 실재하는지, 그 번호가 정말
  그 결함의 이슈인지는 보지 않는다. 999999 를 적어도 통과한다.

  SYN-01  registry 가 가리키는 이슈가 실재하는가
  SYN-02  그 이슈가 정말 그 결함인가 (본문 마커 대조)
  SYN-03  마커가 있는 이슈가 registry 에 있는가 (역방향 — 고아 투영)
  SYN-05  registry 밖의 열린 이슈 (--suggest 일 때만, 위반 아님)

SYN-04 를 뺀 이유 (2026-08-05)
  처음에는 "이슈가 닫혔는데 disposition 이 미해결이면 위반"으로 뒀다. 틀렸다.
  disposition 은 **처리 방침**이지 해결 상태가 아니다 — FIX_PLANNED 는 "고치기로
  했다"는 뜻이고 고친 뒤에도 그대로 남는다. schema 가 그렇게 선언한다.
  그 규칙대로면 BC-DEPLOY-01 을 고친 PR 이 머지되는 순간 #222 가 닫히고, 그 뒤
  모든 PR 이 "정상적으로 해결했다"는 이유로 빨간불이 된다.
  해결 상태는 이미 파생값이 소유한다 — pm_snapshot.py 가 issue 번호에서
  OBSERVED/TRACKED 를 만든다. 같은 것을 두 곳에서 판정하면 갈라진다.

SYN-05 를 기본에서 빼는 이유
  이 저장소의 열린 이슈에는 결함이 아닌 것이 섞여 있다 — 프로세스 개선, 데드락
  기록, 배선 작업. 그것들을 "미등재 결함"이라 부르면 매 실행마다 같은 목록이 뜨고,
  경고가 배경이 되어 진짜 신호가 죽는다. 그래서 요청할 때만 낸다.
  그리고 이 방향은 **보고까지만** 한다. registry 항목은 evidence 경로·심볼·
  severity·disposition 을 요구하는데 자유 서술 이슈에서 그것을 기계가 만들 수 없다.
  지어내면 그 순간 registry 가 거짓을 담는다 — 사람이 판단할 목록만 준다.

사용:
  python3 .project-atlas/tools/sync_check.py             # 위반 검사
  python3 .project-atlas/tools/sync_check.py --suggest   # + 미등재 후보 목록
  python3 .project-atlas/tools/sync_check.py --json
종료 코드: 위반 0건이면 0, 아니면 1. gh 실패는 2 (검사 불가와 어긋남을 구별한다)
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import yaml

ATLAS_DIR = Path(__file__).resolve().parent.parent
MARKER_PREFIX = "<!-- atlas-defect: "


class Report:
    def __init__(self) -> None:
        self.violations: list[dict] = []
        self.notes: list[str] = []
        self.checked = 0

    def fail(self, rule: str, where: str, detail: str) -> None:
        self.violations.append({"rule": rule, "where": where, "detail": detail})

    def ok(self) -> None:
        self.checked += 1


def gh_json(args: list[str]) -> object:
    proc = subprocess.run(["gh", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"gh 실패 — 검사할 수 없다 (어긋남이 아니다): {' '.join(args)}", file=sys.stderr)
        print(proc.stderr.strip(), file=sys.stderr)
        raise SystemExit(2)
    return json.loads(proc.stdout or "[]")


def marker_of(body: str) -> str | None:
    """마커를 읽는다. 닫히지 않은 마커에 크래시하지 않는다 —
    검사기가 예외로 죽으면 '어긋남'과 '버그'를 구별할 수 없게 된다."""
    text = body or ""
    if MARKER_PREFIX not in text:
        return None
    start = text.index(MARKER_PREFIX) + len(MARKER_PREFIX)
    end = text.find("-->", start)
    if end == -1:
        return None
    return text[start:end].strip()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--suggest", action="store_true", help="registry 밖 열린 이슈도 나열한다")
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()

    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    slug = project.get("repo")
    if not slug:
        print("project.yaml 에 repo 가 없다", file=sys.stderr)
        return 2

    defects = yaml.safe_load(
        (ATLAS_DIR / "registry" / "defects.yaml").read_text(encoding="utf-8")
    )["defects"]
    by_id = {d["id"]: d for d in defects}

    # --limit 은 절단이다. 300건을 넘기면 그 뒤 이슈는 아무도 보지 않고,
    # registry 가 가리키는 번호가 거기 있으면 SYN-01 이 "없다"고 오탐한다.
    # gh 는 --limit 이 총량 상한이므로 충분히 크게 준다.
    issues = gh_json([
        "issue", "list", "-R", slug, "--state", "all", "--limit", "10000",
        "--json", "number,title,body,state",
    ])
    by_number = {i["number"]: i for i in issues}

    report = Report()

    # ── registry → GitHub ─────────────────────────────────────
    for defect in defects:
        number = defect.get("issue")
        if not number:
            continue
        where = f"defects.yaml#{defect['id']}"

        issue = by_number.get(number)
        if issue is None:
            report.fail("SYN-01", where, f"가리키는 이슈 #{number} 가 저장소에 없다")
            continue
        report.ok()

        marker = marker_of(issue.get("body") or "")
        if marker is None:
            report.fail("SYN-02", where,
                        f"#{number} 에 atlas-defect 마커가 없다 — 다른 이슈를 가리킬 수 있다")
        elif marker != defect["id"]:
            report.fail("SYN-02", where,
                        f"#{number} 의 마커가 {marker} 다 — {defect['id']} 와 다르다")
        else:
            report.ok()

    # ── GitHub → registry ─────────────────────────────────────
    for issue in issues:
        marker = marker_of(issue.get("body") or "")
        if marker is None:
            continue
        if marker not in by_id:
            report.fail("SYN-03", f"#{issue['number']}",
                        f"마커가 가리키는 결함 {marker} 가 registry 에 없다 (고아 투영)")
        elif by_id[marker].get("issue") != issue["number"]:
            recorded = by_id[marker].get("issue")
            report.fail("SYN-03", f"#{issue['number']}",
                        f"{marker} 의 이슈로 올라왔으나 registry 는 {recorded or '없음'} 을 가리킨다")
        else:
            report.ok()

    # ── 미등재 후보 (위반 아님) ────────────────────────────────
    unregistered = [
        i for i in issues
        if i["state"] == "OPEN" and marker_of(i.get("body") or "") is None
    ]

    if args.as_json:
        print(json.dumps({
            "checked": report.checked,
            "violations": report.violations,
            "unregistered_open": (
                [{"number": i["number"], "title": i["title"]} for i in unregistered]
                if args.suggest else None
            ),
        }, ensure_ascii=False, indent=2))
        return 1 if report.violations else 0

    projected = sum(1 for d in defects if d.get("issue"))
    print(f"Atlas sync — 결함 {len(defects)}건 중 투영 {projected}건 · "
          f"검사 {report.checked}건 · 위반 {len(report.violations)}건")
    if report.violations:
        print()
        for violation in report.violations:
            print(f"  [{violation['rule']}] {violation['where']}")
            print(f"           {violation['detail']}")
    else:
        print("registry 와 GitHub Issue 가 양방향으로 맞는다")

    if args.suggest:
        print(f"\n미등재 열린 이슈 {len(unregistered)}건 — 결함인지 아닌지는 사람이 정한다")
        for issue in unregistered:
            print(f"  #{issue['number']:<5} {issue['title'][:60]}")

    return 1 if report.violations else 0


if __name__ == "__main__":
    sys.exit(main())
