#!/usr/bin/env python3
"""페이지 축 뷰 생성기 — 페이지에서 기능·고유 ID·양쪽 코드까지 잇는다.

    페이지
     └ 기능 (FT-*)
        └ 고유 ID (OP-*)
           └ 프론트 / 백엔드

손으로 적지 않는다. 세 원천에서 뽑아 조인한다.
  라우트→페이지   frontend/src/app/router.tsx
  페이지→API      import 그래프를 따라가며 api·axios 호출을 수집
  API→기능        .project-atlas/registry 의 owns[].route

그래서 화면이 바뀌면 이 뷰도 저절로 바뀐다. registry에 화면 정보를 적지
않는 이유가 이것이다 — 같은 사실을 두 곳에 두면 갈라진다.

사용: python3 .project-atlas/tools/pagemap.py [--json|--md]
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import yaml

ATLAS_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ATLAS_DIR.parent
FE = REPO_ROOT / "frontend" / "src"
EXTS = (".ts", ".tsx")

CALL = re.compile(
    r"""\b(?:api|axios)\s*\.\s*(get|post|put|patch|delete)\s*(?:<[\s\S]*?>)?\s*\(\s*"""
    r"""(?:`([^`]+)`|'([^']+)'|"([^"]+)")""",
    re.S,
)
IMPORT = re.compile(r"""(?:from\s+|import\s*\(\s*)['"]([^'"]+)['"]""")
ROUTE_EL = re.compile(r"""<Route\s+[^>]*?path=\{?([^}\s>]+)\}?[^>]*?element=\{<(?:Suspense[^>]*>\s*<)?([A-Z]\w+)""", re.S)


def norm(route: str) -> str:
    return re.sub(r"\$?\{[^}]*\}", "{}", route.strip())


def resolve(spec: str, origin: Path) -> Path | None:
    if spec.startswith("@/"):
        base = FE / spec[2:]
    elif spec.startswith("."):
        base = (origin.parent / spec).resolve()
    else:
        return None
    for suffix in ("", *EXTS, *(f"/index{e}" for e in EXTS)):
        candidate = Path(str(base) + suffix)
        if candidate.is_file():
            return candidate
    return None


def exported_calls(path: Path) -> dict[str, tuple[str, str]]:
    """모듈의 export 함수별 API 호출. {심볼: (route, 파일:줄)}

    모듈 단위로 세면 안 된다 — 한 service 파일에 함수가 여덟이면 그중 하나만
    써도 여덟이 다 딸려온 것처럼 보인다. 실제로 그렇게 세어 /checklist/:id가
    호출 15건으로 나왔다(실제로는 그중 일부만 쓴다).
    """
    src = path.read_text(encoding="utf-8")
    spans: list[tuple[str, int, int]] = []
    for m in re.finditer(r"^export\s+(?:const|async\s+function|function)\s+(\w+)", src, re.M):
        spans.append((m.group(1), m.start(), len(src)))
    for i in range(len(spans) - 1):
        spans[i] = (spans[i][0], spans[i][1], spans[i + 1][1])

    out: dict[str, tuple[str, str]] = {}
    for name, start, end in spans:
        chunk = src[start:end]
        for m in CALL.finditer(chunk):
            raw = m.group(2) or m.group(3) or m.group(4)
            route = re.sub(r"^\$\{[^}]+\}", "", raw)
            if not route.startswith("/"):
                continue
            line = src[: start + m.start()].count("\n") + 1
            out[name] = (f"{m.group(1).upper()} {norm(route)}",
                         f"{path.relative_to(REPO_ROOT)}:{line}")
    return out


def symbol_spans(src: str) -> list[tuple[str, int, int]]:
    spans = [(m.group(1), m.start(), len(src))
             for m in re.finditer(r"^export\s+(?:const|async\s+function|function)\s+(\w+)", src, re.M)]
    for i in range(len(spans) - 1):
        spans[i] = (spans[i][0], spans[i][1], spans[i + 1][1])
    return spans


def calls_from(entry: Path) -> dict[str, str]:
    """entry에서 실제로 쓰는 심볼만 따라간 API 호출.

    모듈 단위로 세면 안 된다 — service 파일 하나에 함수가 여덟이면 그중
    하나만 써도 여덟이 다 딸려온다. 실측으로 82건이 42건이 됐고, 훅 파일까지
    심볼 단위로 내리자 더 줄었다.

    전파 규칙: 어떤 심볼을 쓰면 그 심볼 본문 안에서 쓰인 import 이름만
    다음 모듈로 넘긴다. `import * as x`와 default import는 모듈 전체로 본다.
    """
    found: dict[str, str] = {}
    seen: set[tuple[Path, tuple[str, ...] | None]] = set()
    stack: list[tuple[Path, set[str] | None]] = [(entry, None)]

    while stack:
        current, wanted = stack.pop()
        key = (current, tuple(sorted(wanted)) if wanted else None)
        if key in seen or not current.is_file():
            continue
        seen.add(key)

        src = current.read_text(encoding="utf-8")
        spans = symbol_spans(src)
        imports = list(re.finditer(
            r"""import\s+(?:(\*\s+as\s+\w+)|\{([^}]*)\}|(\w+))\s+from\s+['"]([^'"]+)['"]""", src))

        # 이 파일에서 살펴볼 본문 범위
        if wanted is None:
            regions = [(0, len(src))]
        else:
            regions = [(s, e) for name, s, e in spans if name in wanted]

        for start, end in regions:
            chunk = src[start:end]
            for m in CALL.finditer(chunk):
                raw = m.group(2) or m.group(3) or m.group(4)
                route = re.sub(r"^\$\{[^}]+\}", "", raw)
                if not route.startswith("/"):
                    continue
                line = src[: start + m.start()].count("\n") + 1
                found.setdefault(f"{m.group(1).upper()} {norm(route)}",
                                 f"{current.relative_to(REPO_ROOT)}:{line}")

            for m in imports:
                star, named, default, spec = m.groups()
                target = resolve(spec, current)
                if not target:
                    continue
                if star or default:
                    stack.append((target, None))
                    continue
                names = {n.strip().split(" as ")[0].strip()
                         for n in (named or "").split(",") if n.strip()}
                used = {n for n in names if re.search(rf"\b{re.escape(n)}\b", chunk)}
                if used:
                    stack.append((target, used))
    return found


def load_registry() -> dict[str, dict]:
    """route(정규화) → {feature, operationId, backend}"""
    index: dict[str, dict] = {}
    for path in sorted((ATLAS_DIR / "registry").glob("FT-*.yaml")):
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        impl = data.get("implementedBy") or {}
        slice_dir = impl.get("slice", "")
        use_case = impl.get("useCase", "")
        backend = f"{slice_dir}/{use_case}" if slice_dir and use_case else (impl.get("legacyPath") or "-")
        for operation in data.get("owns") or []:
            index[norm(operation.get("route", ""))] = {
                "feature": data.get("featureId"),
                "title": data.get("title"),
                "operationId": operation.get("operationId"),
                "backend": backend,
                "auth": operation.get("auth"),
                "safety": (operation.get("safety") or {}).get("sideEffect"),
            }
    return index


def load_pages() -> list[tuple[str, Path]]:
    """(route path, 페이지 파일). router.tsx의 Route 선언에서 뽑는다."""
    router = FE / "app" / "router.tsx"
    src = router.read_text(encoding="utf-8")
    consts = dict(re.findall(r"""^\s+([A-Z_]+):\s*'([^']+)'""",
                             (FE / "lib" / "routes.ts").read_text(encoding="utf-8"), re.M))
    imports = dict(re.findall(r"""import\s+(\w+)\s+from\s+['"]([^'"]+)['"]""", src))
    imports.update(re.findall(r"""const\s+(\w+)\s*=[\s\S]*?import\(\s*['"]([^'"]+)['"]""", src))

    pages: list[tuple[str, Path]] = []
    for raw_path, comp in ROUTE_EL.findall(src):
        if raw_path.startswith("ROUTES."):
            route = consts.get(raw_path.split(".", 1)[1], raw_path)
        else:
            route = raw_path.strip('"\'')
        spec = imports.get(comp)
        target = resolve(spec, router) if spec else None
        if target:
            pages.append((route, target))
    return pages


def main() -> int:
    registry = load_registry()
    pages = load_pages()
    result = []
    for route, page in sorted(pages, key=lambda x: x[0]):
        entries = []
        for api_route, where in sorted(calls_from(page).items()):
            hit = registry.get(api_route)
            entries.append({
                "route": api_route,
                "frontend": where,
                **(hit or {"feature": None, "operationId": None, "backend": None}),
            })
        result.append({"page": route, "component": str(page.relative_to(REPO_ROOT)), "calls": entries})

    if "--json" in sys.argv:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    for item in result:
        print(f"\n{item['page']}   ({item['component']})")
        if not item["calls"]:
            print("   API 호출 없음")
        for call in item["calls"]:
            mark = "" if call["feature"] else "  ← registry 미등재"
            print(f"   ├─ {call['route']}{mark}")
            if call["feature"]:
                print(f"   │    기능    {call['feature']} — {call['title']}")
                print(f"   │    ID      {call['operationId']}  [{call['auth']}/{call['safety']}]")
            print(f"   │    프론트  {call['frontend']}")
            if call.get("backend"):
                print(f"   │    백엔드  {call['backend']}")
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
