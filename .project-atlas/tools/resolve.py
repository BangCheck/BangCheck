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
        self.checked = 0

    def fail(self, rule: str, where: str, detail: str) -> None:
        self.violations.append({"rule": rule, "where": where, "detail": detail})

    def ok(self) -> None:
        self.checked += 1


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

    # --- 결함 registry ---------------------------------------------------
    defect_ids: set[str] = set()
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
                target = check_path(report, "SRC-01", where, relative)
                if target and evidence.get("symbol"):
                    check_symbol(report, where, target, relative, evidence["symbol"])

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
        print(f"Atlas resolver — 검사 {report.checked}건, 위반 {len(report.violations)}건")
        if report.violations:
            print()
            for violation in report.violations:
                print(f"  [{violation['rule']}] {violation['where']}")
                print(f"           {violation['detail']}")
        else:
            print("registry의 모든 참조가 실제 저장소에서 resolve 됨")

    return 1 if report.violations else 0


if __name__ == "__main__":
    sys.exit(main())
