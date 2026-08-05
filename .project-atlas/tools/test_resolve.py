#!/usr/bin/env python3
"""resolve.py의 규칙이 실제로 잡는지 검사한다.

무엇을 확인하는가
  "위반을 잡았다"가 아니라 "의도한 규칙이 잡았다"를 확인한다.
  SRC-01 위반을 ENM-01이 잡아도 exit code는 똑같이 1이다. 그러면 규칙을 하나
  추가할 때마다 "통과했으니 맞겠지"가 쌓이고, 어느 규칙이 죽었는지 아무도 모른다.
  그래서 각 케이스는 기대 규칙 ID를 명시하고, 그것 말고 다른 규칙이 함께 울면
  그것도 실패로 본다.

왜 fixture 저장소가 아니라 실제 registry를 변형하는가 (고른 선택지와 이유)
  후보는 셋이었다.
    (a) fixture 저장소를 따로 둔다 — 격리는 완벽하지만 resolver가 검사하는 대상은
        backend/·frontend/의 실제 소스다. fixture에 그 트리를 복제하면 제품이 바뀔
        때마다 fixture도 따라가야 하고, 따라가지 않으면 그 순간 fixture는 제품을
        설명하지 못한다. _wood가 죽은 것과 같은 방식으로 죽는다.
    (b) resolver를 파라미터화해 임시 트리를 가리키게 한다 — 그러려면 REPO_ROOT를
        주입 가능하게 고쳐야 한다. 테스트를 위해 대상 코드의 구조를 바꾸는 것이고,
        그 결과 "테스트에서 도는 resolver"와 "CI에서 도는 resolver"의 경로 해석이
        갈릴 여지가 생긴다.
    (c) 실제 registry를 변형했다 되돌린다 — 검사 대상이 CI에서 도는 것과 완전히
        같다. 대신 중단되면 트리가 더럽혀진다.
  (c)를 골랐다. 되돌리기는 finally + 종료 직전 digest 대조로 두 겹 보장한다.
  digest가 다르면 그 사실을 exit 2로 크게 알린다 — 조용히 넘어가면 그다음 사람이
  변형된 registry를 정상이라고 믿는다.

사용: python3 .project-atlas/tools/test_resolve.py [-v]
종료 코드: 전부 통과 0, 실패 1, 복원 실패 2
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

ATLAS_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ATLAS_DIR.parent
RESOLVER = ATLAS_DIR / "tools" / "resolve.py"
REGISTRY = ATLAS_DIR / "registry"


@dataclass(frozen=True)
class Case:
    """변형 하나와 그것이 울려야 할 규칙."""

    name: str
    rule: str
    target: Path
    old: str
    new: str
    # 이 변형이 필연적으로 함께 울리는 규칙. 비어 있으면 rule 하나만 울려야 한다.
    also: frozenset[str] = field(default_factory=frozenset)


CASES = [
    Case(
        name="RTE-02 — 제품 route의 주인이 사라지면 잡는다",
        rule="RTE-02",
        target=REGISTRY / "FT-ROOM-LIST.yaml",
        # 정답지에 실재하는 다른 route로 바꾼다. RTE-01은 통과시키고
        # "GET /api/v1/rooms"만 주인 없는 상태로 만든다 — RTE-02만 울려야 한다.
        old='route: "GET /api/v1/rooms"',
        new='route: "GET /api/v1/rooms/{id}"',
    ),
    Case(
        name="RTE-03 — 면제 목록이 낡으면 잡는다",
        rule="RTE-03",
        target=ATLAS_DIR / "project.yaml",
        old='    - "* /error"',
        new='    - "* /error"\n    - "GET /this-route-does-not-exist"',
    ),
    Case(
        name="SRC-01 — implementedBy가 없는 파일을 가리키면 잡는다",
        rule="SRC-01",
        target=REGISTRY / "FT-ROOM-LIST.yaml",
        old="service/RoomService.java",
        new="service/NoSuchService.java",
    ),
    Case(
        name="REF-01 — 정의되지 않은 결함 ID를 참조하면 잡는다",
        rule="REF-01",
        target=REGISTRY / "FT-ROOM-LIST.yaml",
        old="- BC-LIST-01",
        new="- BC-NOT-A-REAL-DEFECT-01",
    ),
    Case(
        name="ISS-01 — 이슈 번호가 양의 정수가 아니면 잡는다",
        rule="ISS-01",
        target=REGISTRY / "defects.yaml",
        old="  - id: BC-SEC-01",
        new="  - id: BC-SEC-01\n    issue: -1",
    ),
    Case(
        name="ENM-01 — schema가 허용하지 않는 enum 값이면 잡는다",
        rule="ENM-01",
        target=REGISTRY / "defects.yaml",
        old="    severity: P1\n    title: 고아 엔드포인트가 방 소유권을 검증하지 않는다",
        new="    severity: P0\n    title: 고아 엔드포인트가 방 소유권을 검증하지 않는다",
    ),
]


def digest(paths: list[Path]) -> str:
    h = hashlib.sha256()
    for path in sorted(paths):
        h.update(path.read_bytes())
    return h.hexdigest()


def run_resolver() -> tuple[int, list[dict]]:
    proc = subprocess.run(
        [sys.executable, str(RESOLVER), "--json"],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    try:
        payload = json.loads(proc.stdout)
    except json.JSONDecodeError:
        print(f"  resolver가 JSON을 내지 않았다:\n{proc.stdout}\n{proc.stderr}")
        return proc.returncode, []
    return proc.returncode, payload.get("violations", [])


def main() -> int:
    verbose = "-v" in sys.argv
    watched = sorted(REGISTRY.glob("*.yaml")) + [ATLAS_DIR / "project.yaml"]
    before = digest(watched)
    originals = {path: path.read_text(encoding="utf-8") for path in watched}

    failures: list[str] = []
    try:
        # 기준선 — 변형 없이 통과해야 한다. 이게 깨지면 아래 케이스의 결과를
        # 믿을 수 없다. 변형이 잡혔는지 원래부터 울고 있었는지 구별이 안 된다.
        code, violations = run_resolver()
        if code != 0 or violations:
            rules = sorted({v["rule"] for v in violations})
            failures.append(f"기준선 실패 — 변형 전에 이미 위반 {len(violations)}건 {rules}")
            print(f"FAIL  기준선 (exit={code}, 위반 {len(violations)}건)")
        else:
            print("ok    기준선 — 변형 전 위반 0건")

        for case in CASES:
            text = originals[case.target]
            if case.old not in text:
                failures.append(f"{case.name} — 변형 대상 문자열을 찾지 못했다: {case.old!r}")
                print(f"FAIL  {case.name}  (변형 지점 없음 — registry가 바뀌었다)")
                continue

            case.target.write_text(text.replace(case.old, case.new, 1), encoding="utf-8")
            try:
                code, violations = run_resolver()
            finally:
                case.target.write_text(text, encoding="utf-8")

            fired = {v["rule"] for v in violations}
            expected = {case.rule} | set(case.also)

            if code == 0:
                failures.append(f"{case.name} — 변형했는데 통과했다")
                print(f"FAIL  {case.name}  (exit=0)")
            elif case.rule not in fired:
                failures.append(f"{case.name} — {case.rule}이 울지 않았다 (운 규칙: {sorted(fired)})")
                print(f"FAIL  {case.name}  (기대 {case.rule}, 실제 {sorted(fired)})")
            elif fired - expected:
                # 다른 규칙까지 울면 이 케이스는 기대한 이유로 통과한 것이 아니다.
                failures.append(f"{case.name} — 예상 밖 규칙이 함께 울었다: {sorted(fired - expected)}")
                print(f"FAIL  {case.name}  (초과: {sorted(fired - expected)})")
            else:
                print(f"ok    {case.name}")
                if verbose:
                    for v in violations:
                        print(f"        [{v['rule']}] {v['where']}: {v['detail']}")
    finally:
        for path, text in originals.items():
            path.write_text(text, encoding="utf-8")

    after = digest(watched)
    if before != after:
        print("\n복원 실패 — registry가 변형된 상태로 남았다. git status로 확인하고 되돌려라.")
        return 2

    print()
    if failures:
        print(f"실패 {len(failures)}건 / 케이스 {len(CASES) + 1}개")
        for line in failures:
            print(f"  - {line}")
        return 1
    print(f"통과 {len(CASES) + 1}개 — 규칙이 각자 의도한 위반을 잡는다. registry 복원 확인됨.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
