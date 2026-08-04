#!/usr/bin/env python3
"""Atlas registry resolver — ATLAS-DATA-001 / ATLAS-DATA-002 gate.

registry에 적힌 값이 실제 저장소와 맞는지 기계적으로 검사한다.
이 검사를 통과하지 못한 값은 AUTHORED가 아니라 SEED이며 LIVE·VERIFIED로 표시할 수 없다.

검사 항목
  ID-01  ID 형식이 schema의 패턴과 맞는가
  ID-02  ID가 유일한가
  REF-01 참조한 ID가 실제로 정의되어 있는가 (dangling reference)
  SRC-01 evidence·implementedBy의 경로가 실제로 존재하는가
  SRC-02 evidence.symbol이 그 파일 안에 실제로 등장하는가
  RTE-01 route가 제품 정답지(routes.txt)에 존재하는가
  WRT-01 safety.writes의 테이블이 Flyway 마이그레이션에 실재하는가
  FEC-01 프론트가 부르는 route가 제품에 실재하는가 (코드에서 추출)
  FLD-01 required 필드가 누락되지 않았는가
  ENM-01 enum 값이 schema가 허용한 값인가

알려진 한계
  SRC-02는 단순 문자열 포함 검사다. 심볼이 주석 안에만 남아 있어도 통과한다.
  2026-07-31 BC-REG-05가 이미 삭제된 메서드를 가리키는데도 통과했다 —
  "이관되어 제거됐다"는 주석에 그 이름이 남아 있었기 때문이다.
  선언 위치까지 보려면 Java 파서가 필요하며 별도 작업으로 남긴다.

사용: python3 .project-atlas/tools/resolve.py [--json]
종료 코드: 위반 0건이면 0, 아니면 1
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import yaml

ATLAS_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ATLAS_DIR.parent


class Report:
    def __init__(self) -> None:
        self.violations: list[dict] = []
        self.knowns: list[str] = []
        self.checked = 0

    def fail(self, rule: str, where: str, detail: str) -> None:
        self.violations.append({"rule": rule, "where": where, "detail": detail})

    def ok(self) -> None:
        self.checked += 1

    def known(self, note: str) -> None:
        """등재된 결함. 위반은 아니지만 사라진 것도 아니라 따로 센다."""
        self.checked += 1
        self.knowns.append(note)


def load(path: Path):
    with path.open(encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def load_route_oracle(project: dict, report: Report) -> set[str]:
    """제품 route 정답지. 이것이 route 주장의 기계적 근거다."""
    relative = project.get("sources", {}).get("routeOracle")
    if not relative:
        report.fail("RTE-01", "project.yaml", "sources.routeOracle이 없어 route를 검증할 수 없다")
        return set()

    oracle = REPO_ROOT / relative
    if not oracle.is_file():
        report.fail("RTE-01", relative, "route 정답지 파일이 없다")
        return set()

    return {line.strip() for line in oracle.read_text(encoding="utf-8").splitlines() if line.strip()}


def load_table_oracle(project: dict, report: Report) -> set[str]:
    """제품 테이블 정답지. safety.writes 주장의 기계적 근거다.

    Flyway 마이그레이션의 CREATE TABLE에서 뽑는다 — 스키마의 실제 원천이
    거기이기 때문이다. 엔티티의 @Table을 쓰지 않는 이유는 엔티티가 없는
    조인 테이블도 writes 대상이 될 수 있어서다.
    """
    relative = project.get("sources", {}).get("migrationRoot")
    if not relative:
        report.fail("WRT-01", "project.yaml", "sources.migrationRoot가 없어 writes를 검증할 수 없다")
        return set()

    root = REPO_ROOT / relative
    if not root.is_dir():
        report.fail("WRT-01", relative, "마이그레이션 디렉터리가 없다")
        return set()

    pattern = re.compile(r"create\s+table\s+(?:if\s+not\s+exists\s+)?[`\"]?([a-z_][a-z0-9_]*)", re.I)
    tables: set[str] = set()
    for sql in sorted(root.glob("*.sql")):
        tables.update(m.group(1).lower() for m in pattern.finditer(sql.read_text(encoding="utf-8")))

    if not tables:
        report.fail("WRT-01", relative, "마이그레이션에서 CREATE TABLE을 하나도 찾지 못했다")
    return tables


def check_writes(report: Report, where: str, writes, tables: set[str]) -> None:
    """writes에 적힌 이름이 실재하는 테이블인가.

    이 검사가 없던 동안 registry에 없는 테이블명 셋이 초록불로 통과했다
    (2026-08-04: checklist_custom_item·checklist_user_type·checklist_item_setting).
    자유 문자열이면 오타와 유추가 사실처럼 남는다.
    """
    if not tables:
        return
    for name in writes or []:
        if name in tables:
            report.ok()
        else:
            report.fail("WRT-01", where, f"실재하지 않는 테이블: '{name}'")


FRONT_CALL = re.compile(
    r"""\b(?:api|axios)\s*\.\s*(get|post|put|patch|delete)\s*(?:<[\s\S]*?>)?\s*\(\s*"""
    r"""(?:`([^`]+)`|'([^']+)'|"([^"]+)")""",
    re.S,
)


def normalize_route(route: str) -> str:
    """경로 변수 이름을 지운다. `/rooms/{id}`와 `/rooms/${roomId}`를 같게 본다."""
    return re.sub(r"\$?\{[^}]*\}", "{}", route.strip())


def collect_frontend_calls(project: dict, report: Report) -> tuple[dict[str, str], int]:
    """프론트 코드에서 실제 호출하는 route를 뽑는다.

    선언이 아니라 코드가 정답지다 — 선언은 낡지만 코드는 동작 그 자체다.
    route oracle이 백엔드 표면의 근거이듯 이것이 프론트 소비의 근거다.

    한계: 문자열 리터럴로 시작하는 호출만 잡는다. 경로를 변수로 조립하면
    못 잡으며, 그 경우 unresolved로 세어 보고한다.
    **못 잡은 것을 '호출 없음'으로 흘리지 않는 것이 이 함수의 계약이다.**
    """
    relative = project.get("sources", {}).get("frontendRoot")
    if not relative:
        return {}, 0

    root = REPO_ROOT / relative
    if not root.is_dir():
        report.fail("FEC-01", relative, "frontendRoot 디렉터리가 없다")
        return {}, 0

    calls: dict[str, str] = {}
    unresolved = 0
    for path in sorted(list(root.rglob("*.ts")) + list(root.rglob("*.tsx"))):
        if "project-atlas" in str(path):
            continue  # Atlas 자신은 관측 대상이 아니다
        source = path.read_text(encoding="utf-8")
        for match in FRONT_CALL.finditer(source):
            raw = match.group(2) or match.group(3) or match.group(4)
            stripped = re.sub(r"^\$\{[^}]+\}", "", raw)  # ${API_BASE_URL} 접두
            if not stripped.startswith("/"):
                unresolved += 1
                continue
            line = source[: match.start()].count("\n") + 1
            route = f"{match.group(1).upper()} {normalize_route(stripped)}"
            calls.setdefault(route, f"{path.relative_to(REPO_ROOT)}:{line}")
    return calls, unresolved


def check_frontend_calls(report: Report, calls: dict[str, str], unresolved: int,
                         routes: set[str], known: set[str]) -> None:
    """프론트가 부르는 route가 제품에 실재하는가 (FEC-01).

    반대 방향(제품에 있는데 프론트가 안 부름)은 위반이 아니다 — 죽은 표면은
    결함이 아니라 관측치이고, feature 파일의 frontendEntry 부재로 이미 기록된다.

    defects.yaml의 evidence가 이미 가리키는 파일은 위반이 아니라 known으로 센다.
    등재된 결함까지 매번 빨간불이면 새 위반이 그 속에 묻힌다 — 그러면 검사가
    신호가 아니라 배경이 된다. 다만 조용히 넘기지 않고 건수를 따로 보고한다.
    """
    if not routes:
        return
    normalized = {normalize_route(r) for r in routes}
    for route, where in sorted(calls.items()):
        if route in normalized:
            report.ok()
        elif where.split(":")[0] in known:
            report.known(f"FEC-01 {route} ({where}) — defects.yaml에 등재됨")
        else:
            report.fail("FEC-01", where, f"프론트가 부르는 route가 제품에 없다: {route}")
    if unresolved:
        report.fail("FEC-01", "frontend",
                    f"경로를 정적으로 해석하지 못한 호출 {unresolved}건 — 호출 없음과 구별되지 않는다")


def check_path(report: Report, rule: str, where: str, relative: str, *, directory: bool = False) -> Path | None:
    target = REPO_ROOT / relative
    if directory:
        if not target.is_dir():
            report.fail(rule, where, f"디렉터리가 없다: {relative}")
            return None
    elif not target.is_file():
        report.fail(rule, where, f"파일이 없다: {relative}")
        return None
    report.ok()
    return target


def check_symbol(report: Report, where: str, target: Path, relative: str, symbol: str) -> None:
    if symbol not in target.read_text(encoding="utf-8"):
        report.fail("SRC-02", where, f"심볼 '{symbol}'이 {relative} 안에 없다")
        return
    report.ok()


def check_enum(report: Report, where: str, field: str, value, allowed: list) -> None:
    if value not in allowed:
        report.fail("ENM-01", where, f"{field}='{value}'는 허용값이 아니다. 허용: {allowed}")
        return
    report.ok()


def check_required(report: Report, where: str, data: dict, required: list[str]) -> None:
    for field in required:
        if data.get(field) is None:
            report.fail("FLD-01", where, f"필수 필드 누락: {field}")
        else:
            report.ok()


def check_id(report: Report, where: str, value: str, pattern: str, id_type: str) -> None:
    if not re.match(pattern, str(value)):
        report.fail("ID-01", where, f"{id_type} ID 형식 위반: '{value}' (기대 {pattern})")
        return
    report.ok()


def main() -> int:
    as_json = "--json" in sys.argv
    report = Report()

    schema = load(ATLAS_DIR / "schema.yaml")
    project = load(ATLAS_DIR / "project.yaml")
    patterns = schema["idPattern"]
    entities = schema["entities"]

    routes = load_route_oracle(project, report)
    tables = load_table_oracle(project, report)
    front_calls, front_unresolved = collect_frontend_calls(project, report)

    # --- 결함 registry ---------------------------------------------------
    defect_ids: set[str] = set()
    defect_evidence_paths: set[str] = set()
    defects_file = ATLAS_DIR / "registry" / "defects.yaml"
    if defects_file.is_file():
        spec = entities["defect"]
        for defect in load(defects_file).get("defects", []):
            where = f"defects.yaml#{defect.get('id', '?')}"
            check_required(report, where, defect, spec["required"])

            identifier = str(defect.get("id", ""))
            check_id(report, where, identifier, patterns["defect"], "defect")
            if identifier in defect_ids:
                report.fail("ID-02", where, f"중복 ID: {identifier}")
            defect_ids.add(identifier)

            check_enum(report, where, "severity", defect.get("severity"),
                       spec["fields"]["severity"]["values"])
            check_enum(report, where, "disposition", defect.get("disposition"),
                       spec["fields"]["disposition"]["values"])

            evidence = defect.get("evidence") or {}
            relative = evidence.get("path")
            if relative:
                defect_evidence_paths.add(relative)
                target = check_path(report, "SRC-01", where, relative)
                if target and evidence.get("symbol"):
                    check_symbol(report, where, target, relative, evidence["symbol"])

    check_frontend_calls(report, front_calls, front_unresolved, routes, defect_evidence_paths)

    # --- feature registry ------------------------------------------------
    feature_ids: set[str] = set()
    operation_ids: set[str] = set()
    spec = entities["feature"]

    for path in sorted((ATLAS_DIR / "registry").glob("FT-*.yaml")):
        feature = load(path)
        where = path.name
        check_required(report, where, feature, spec["required"])

        identifier = str(feature.get("featureId", ""))
        check_id(report, where, identifier, patterns["feature"], "feature")
        if identifier in feature_ids:
            report.fail("ID-02", where, f"중복 ID: {identifier}")
        feature_ids.add(identifier)

        check_id(report, where, str(feature.get("capabilityId", "")), patterns["capability"], "capability")
        check_enum(report, where, "status", feature.get("status"), spec["fields"]["status"]["values"])

        # owns — 주인은 정확히 하나. 같은 operation이 두 feature에 owns로 나오면 나무가 깨진다.
        owned = feature.get("owns") or []
        if not owned:
            report.fail("FLD-01", where, "owns가 비어 있다. 주인 없는 feature는 만들 수 없다")
        for operation in owned:
            op_where = f"{where}#{operation.get('operationId', '?')}"
            check_required(report, op_where, operation, entities["operation"]["required"])

            op_id = str(operation.get("operationId", ""))
            check_id(report, op_where, op_id, patterns["operation"], "operation")
            if op_id in operation_ids:
                report.fail("ID-02", op_where, f"operation이 두 곳에서 owns 되고 있다: {op_id}")
            operation_ids.add(op_id)

            route = operation.get("route")
            if route and routes and route not in routes:
                report.fail("RTE-01", op_where, f"route가 제품 정답지에 없다: {route}")
            elif route:
                report.ok()

            safety = operation.get("safety") or {}
            check_required(report, op_where, safety, entities["safety"]["required"])
            for field in ("sideEffect", "abortOnFail"):
                if safety.get(field) is not None:
                    check_enum(report, op_where, field, safety[field],
                               entities["safety"]["fields"][field]["values"])
            check_writes(report, op_where, safety.get("writes"), tables)
            # 쓰기라고 선언했으면 무엇을 쓰는지 밝혀야 한다.
            # 빈 writes로 WRITE를 주장하면 영향 범위를 아무도 못 읽는다.
            if safety.get("sideEffect") == "WRITE" and not (safety.get("writes") or []):
                report.fail("WRT-01", op_where, "sideEffect가 WRITE인데 writes가 비어 있다")

        # uses — 소유를 주장하지 않지만 route는 실재해야 한다
        for operation in feature.get("uses") or []:
            op_where = f"{where}#uses:{operation.get('operationId', '?')}"
            route = operation.get("route")
            if route and routes and route not in routes:
                report.fail("RTE-01", op_where, f"route가 제품 정답지에 없다: {route}")
            elif route:
                report.ok()

        # 축 1 ↔ 축 2 접점
        implementation = feature.get("implementedBy") or {}
        check_required(report, where, implementation, entities["implementation"]["required"])
        slice_path = implementation.get("slice")
        if slice_path:
            slice_dir = check_path(report, "SRC-01", where, slice_path, directory=True)
            use_case = implementation.get("useCase")
            if slice_dir and use_case:
                check_path(report, "SRC-01", where, f"{slice_path}/{use_case}")
        legacy = implementation.get("legacyPath")
        if legacy:
            legacy_path, _, legacy_symbol = legacy.partition("#")
            target = check_path(report, "SRC-01", where, legacy_path)
            if target and legacy_symbol:
                check_symbol(report, where, target, legacy_path, legacy_symbol)

        # dangling reference
        for defect_ref in feature.get("knownDefects") or []:
            if defect_ref not in defect_ids:
                report.fail("REF-01", where, f"정의되지 않은 결함 ID를 참조한다: {defect_ref}")
            else:
                report.ok()

        for test in feature.get("tests") or []:
            check_path(report, "SRC-01", where, test)

    # --- 출력 -------------------------------------------------------------
    if as_json:
        print(json.dumps({"checked": report.checked, "violations": report.violations},
                         ensure_ascii=False, indent=2))
    else:
        known_note = f", 등재된 결함 {len(report.knowns)}건" if report.knowns else ""
        print(f"Atlas resolver — 검사 {report.checked}건, 위반 {len(report.violations)}건{known_note}")
        if report.violations:
            print()
            for violation in report.violations:
                print(f"  [{violation['rule']}] {violation['where']}")
                print(f"           {violation['detail']}")
        else:
            print("registry의 모든 참조가 실제 저장소에서 resolve 됨")
        for note in report.knowns:
            print(f"  [known] {note}")

    return 1 if report.violations else 0


if __name__ == "__main__":
    sys.exit(main())
