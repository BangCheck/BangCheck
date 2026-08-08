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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
검사 범위 — --scope (2026-08-07, #262)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  global  registry 전체 × 이슈 전체. 어긋남이 하나라도 있으면 exit 1.
  pr      이 PR 이 실제로 건드린 결함 ID 만. base 의 defects.yaml 이 필요하다.

왜 나눴는가
  SYN-01/02 는 PR 의 defects.yaml 을 읽으므로 그 PR 이 만들 수 있는 위반이다.
  SYN-03 은 **저장소의 모든 이슈**를 훑는다 — PR 과 인과가 없는 전역 상태다.

  2026-08-07 하루에 세 번, 무관한 PR 이 SYN-03 때문에 떨어졌다.
  이슈를 먼저 열고 registry 항목을 나중에 넣는 것은 정상 작업 흐름인데
  (봇 안내문 자신이 그렇게 안내한다), 그 사이 창이 저장소 전체를 막았다.
  워크플로 파일 하나를 지운 PR #258 이 두 번 그 채무를 갚았다 — 그 작성자는
  고칠 권한도 맥락도 없었다.

왜 "PR 이 만든 위반만 골라낸다"로 가지 않았는가 (기각한 설계)
  base 와 HEAD 로 각각 전체 검사를 돌려 차집합만 죽이는 안을 먼저 세웠고,
  2026-08-07 codex 교차검증에서 기각됐다.
    - 두 실행 사이 이슈가 생기거나 편집되면 결과가 바뀐다. 스냅샷을 하나로
      고정해도 판정되는 것은 "HEAD 가 base 대비 새로 깼는가"이지
      "PR 이 만들었는가"가 아니다. 명제 자체가 과장이다.
    - 기존 위반을 경고로 낮추는 것은 이 저장소의 게이트 계약과 정면으로 어긋난다.
      이 검사는 gh 실패조차 job 을 죽인다 — "맞다"와 "안 봤다"를 같은 초록불로
      만들지 않기 위해서다. 실재하는 어긋남을 경고로 내리면 그 계약이 깨지고,
      체크 이름을 더 이상 "registry 와 이슈가 맞는다"라고 부를 수 없다.

  그래서 낮추지 않고 **자리를 옮겼다.** 전역 SYN-03 은 사라지지 않는다 —
  atlas-sync-audit.yml 이 issues 이벤트·push:main·schedule 에서 엄격하게 돌린다.
  이슈가 열리거나 편집되는 즉시 잡히므로, PR 을 인질로 잡지 않고도
  같은 드리프트가 더 빨리 드러난다.

사용:
  python3 .project-atlas/tools/sync_check.py                       # 전역 검사
  python3 .project-atlas/tools/sync_check.py --scope pr --base <defects.yaml>
  python3 .project-atlas/tools/sync_check.py --suggest             # + 미등재 후보
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

from atlas_marker import marker_of

ATLAS_DIR = Path(__file__).resolve().parent.parent


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


def load_defects(path: Path) -> list[dict]:
    return yaml.safe_load(path.read_text(encoding="utf-8"))["defects"]


def changed_ids(base: list[dict], head: list[dict]) -> set[str]:
    """base → head 에서 추가·삭제·재매핑된 결함 ID.

    이 PR 이 조인 키를 건드린 자리다. 여기 없는 ID 의 어긋남은 이 PR 이
    만든 것이 아니므로 PR 게이트가 판정하지 않는다 — 전역 감시가 소유한다.
    """
    base_map = {d["id"]: d.get("issue") for d in base}
    head_map = {d["id"]: d.get("issue") for d in head}
    return {
        defect_id
        for defect_id in base_map.keys() | head_map.keys()
        if base_map.get(defect_id) != head_map.get(defect_id)
        or (defect_id in base_map) != (defect_id in head_map)
    }


def evaluate(
    defects: list[dict],
    issues: list[dict],
    scope_ids: set[str] | None = None,
) -> Report:
    """registry 스냅샷과 이슈 스냅샷을 받아 위반을 낸다.

    **네트워크를 모른다.** gh 도 파일도 건드리지 않는다 — 그래서 테스트가
    fixture 만으로 이 함수의 판정을 통째로 붙들 수 있다
    (test_sync_check.py). 규칙이 죽어도 초록불이 되는 것을 그 테스트가 막는다.

    scope_ids 가 None 이면 전부 본다. 집합이면 그 결함 ID 에 걸린 관계만 본다.
    """
    by_id = {d["id"]: d for d in defects}
    by_number = {i["number"]: i for i in issues}
    report = Report()

    def in_scope(defect_id: str) -> bool:
        return scope_ids is None or defect_id in scope_ids

    # ── registry → GitHub ─────────────────────────────────────
    for defect in defects:
        if not in_scope(defect["id"]):
            continue
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
        if not in_scope(marker):
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

    return report


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", choices=("global", "pr"), default="global",
                        help="pr 이면 base 대비 바뀐 결함 ID 만 검사한다")
    parser.add_argument("--base", type=Path,
                        help="--scope pr 일 때 base 의 defects.yaml 경로")
    parser.add_argument("--suggest", action="store_true", help="registry 밖 열린 이슈도 나열한다")
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()

    if args.scope == "pr" and not args.base:
        # 조용히 전역으로 떨어지지 않는다. 그러면 배선 실수가 "왜인지 모르게
        # 무관한 PR 이 막힌다"로 되돌아오고, 그것이 #262 였다.
        print("--scope pr 에는 --base 가 필요하다", file=sys.stderr)
        return 2

    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    slug = project.get("repo")
    if not slug:
        print("project.yaml 에 repo 가 없다", file=sys.stderr)
        return 2

    defects = load_defects(ATLAS_DIR / "registry" / "defects.yaml")

    scope_ids: set[str] | None = None
    if args.scope == "pr":
        if not args.base.exists():
            print(f"base defects.yaml 을 찾을 수 없다: {args.base}", file=sys.stderr)
            return 2
        scope_ids = changed_ids(load_defects(args.base), defects)

    # --limit 은 절단이다. 300건을 넘기면 그 뒤 이슈는 아무도 보지 않고,
    # registry 가 가리키는 번호가 거기 있으면 SYN-01 이 "없다"고 오탐한다.
    # gh 는 --limit 이 총량 상한이므로 충분히 크게 준다.
    issues = gh_json([
        "issue", "list", "-R", slug, "--state", "all", "--limit", "10000",
        "--json", "number,title,body,state",
    ])

    report = evaluate(defects, issues, scope_ids)

    # ── 미등재 후보 (위반 아님) ────────────────────────────────
    unregistered = [
        i for i in issues
        if i["state"] == "OPEN" and marker_of(i.get("body") or "") is None
    ]

    if args.as_json:
        print(json.dumps({
            "scope": args.scope,
            "scope_ids": sorted(scope_ids) if scope_ids is not None else None,
            "checked": report.checked,
            "violations": report.violations,
            "unregistered_open": (
                [{"number": i["number"], "title": i["title"]} for i in unregistered]
                if args.suggest else None
            ),
        }, ensure_ascii=False, indent=2))
        return 1 if report.violations else 0

    projected = sum(1 for d in defects if d.get("issue"))
    header = (f"Atlas sync — 결함 {len(defects)}건 중 투영 {projected}건 · "
              f"검사 {report.checked}건 · 위반 {len(report.violations)}건")
    if scope_ids is not None:
        header += f"\n범위 pr — 이 PR 이 건드린 결함 {len(scope_ids)}건 {sorted(scope_ids) or '(없음)'}"
    print(header)

    if report.violations:
        print()
        for violation in report.violations:
            print(f"  [{violation['rule']}] {violation['where']}")
            print(f"           {violation['detail']}")
    elif scope_ids is not None:
        # 전역이 맞다고 말하지 않는다. 이 실행은 그것을 보지 않았다.
        print("이 PR 이 건드린 조인 관계는 맞는다 "
              "— 전역 정합은 atlas-sync-audit 이 본다")
    else:
        print("registry 와 GitHub Issue 가 양방향으로 맞는다")

    if args.suggest:
        print(f"\n미등재 열린 이슈 {len(unregistered)}건 — 결함인지 아닌지는 사람이 정한다")
        for issue in unregistered:
            print(f"  #{issue['number']:<5} {issue['title'][:60]}")

    return 1 if report.violations else 0


if __name__ == "__main__":
    sys.exit(main())
