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

이 뷰가 답하지 못하는 것 (2026-08-04 교차 검토로 확인)
  - 조건부 호출. enabled 조건을 보지 않으므로 게스트 /rooms의 실제 호출은
    0건인데 3건으로 나온다. 출력은 "어떤 상태에서든 호출 가능"의 합집합이다.
  - 호출 순서와 한 작업의 경계. 그것은 registry의 uses가 소유한다.
  - 재export(export { x } from). barrel을 거치면 조용히 누락된다.
  - 동적 import. 정적 import만 따라간다.
  - import * as 별칭. 모듈 전체로 보므로 과대 계상 여지가 있다.
  - 심볼 경계가 AST가 아니라 export 선언 사이의 텍스트 구간이다.
    top-level side effect(api.ts의 인터셉터 등)는 어느 심볼에도 안 잡힌다.

사용: python3 .project-atlas/tools/pagemap.py [--json]
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
# path와 element를 따로 뽑는다. element 안의 fallback JSX 때문에 한 정규식으로
# 컴포넌트를 집으면 Suspense·AtlasLoading이 잡힌다(2026-08-04 실측: DEV 라우트 3개 탈락).
ROUTE_TAG = None  # 아래 iter_route_tags가 대신한다
ATTR_PATH = re.compile(r"""path=(?:\{([^}]+)\}|"([^"]+)"|'([^']+)')""")
ATTR_ELEM = re.compile(r"element=\{([\s\S]*?)\}\s*$")
# element 값에서 실제 페이지 컴포넌트를 고른다. Suspense·Navigate 같은 래퍼는 건너뛴다.
WRAPPERS = {"Suspense", "Navigate", "Fragment"}


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


def iter_route_tags(src: str):
    """<Route ...> 태그의 속성 본문을 뽑는다.

    정규식으로 `[^>]*`를 쓰면 `element={<Suspense fallback={<X />}>`의 첫 `>`에서
    끊겨 element 값이 잘린다 — 실제로 그래서 DEV 라우트 셋이 탈락했다.
    중괄호 깊이를 세어 태그 끝을 찾는다.
    """
    i = 0
    while True:
        start = src.find("<Route", i)
        if start == -1:
            return
        j, depth = start + 6, 0
        while j < len(src):
            ch = src[j]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
            elif ch == ">" and depth == 0:
                break
            j += 1
        yield start, src[start + 6:j]
        i = j + 1


def page_component(element: str) -> str | None:
    """element 속성값에서 페이지 컴포넌트 이름을 고른다.

    `<Suspense fallback={<AtlasLoading />}><ProjectAtlasPage /></Suspense>`처럼
    래퍼가 감싸면 안쪽을 집어야 한다. fallback에 먼저 나오는 컴포넌트를 집으면
    AtlasLoading이 잡힌다 — 실제로 그래서 DEV 라우트 셋이 조용히 탈락했다.
    """
    names = re.findall(r"<([A-Z]\w+)", element)
    if not names:
        return None
    if names[0] == "Navigate":
        return None  # redirect는 페이지가 아니다
    for name in names:
        if name not in WRAPPERS and name != "AtlasLoading":
            return name
    return None


def load_pages(consts: dict[str, str]) -> list[tuple[str, Path, list[Path]]]:
    """(route, 페이지 파일, 그 페이지를 감싸는 레이아웃 파일들).

    중첩 라우트를 다룬다. `<Route element={<AppLayout />}>` 안의 페이지는
    AppLayout이 부르는 API도 함께 받는다 — 화면에 실제로 그 요청이 나가기
    때문이다. 이걸 빼면 /my가 '호출 0건'으로 나오는데 Header·BottomNavigation이
    useRoomsList를 부른다(2026-08-04 교차 검토가 잡은 과소 계상).
    """
    router = FE / "app" / "router.tsx"
    src = router.read_text(encoding="utf-8")
    imports = dict(re.findall(r"""import\s+(\w+)\s+from\s+['"]([^'"]+)['"]""", src))
    imports.update(re.findall(r"""const\s+(\w+)\s*=[\s\S]*?import\(\s*['"]([^'"]+)['"]""", src))

    def comp_path(name: str) -> Path | None:
        """컴포넌트 파일. import가 없으면 router.tsx 자신에 정의된 것으로 본다.

        AppLayout이 그 경우다 — import가 아니라 같은 파일에 있어서 처음엔
        None으로 떨어져 레이아웃이 통째로 버려졌다.
        """
        spec = imports.get(name)
        return resolve(spec, router) if spec else None

    def local_component_deps(name: str) -> list[Path]:
        """router.tsx 안에 정의된 컴포넌트가 렌더하는 다른 컴포넌트들의 파일.

        AppLayout이 그 경우다. router.tsx 자신을 반환하면 그 파일 전체를 훑어
        모든 페이지의 호출을 빨아들인다(실측: 페이지마다 17건). 본문에서
        실제로 렌더하는 것만 따라간다.
        """
        m = re.search(rf"(?:const|function)\s+{re.escape(name)}\b[\s\S]*?\n\);", src)
        if not m:
            return []
        body = m.group(0)
        out = []
        for used in dict.fromkeys(re.findall(r"<([A-Z]\w+)", body)):
            target = comp_path(used)
            if target:
                out.append(target)
        return out

    # 레이아웃 블록: <Route element={<X />}> ... </Route> 의 범위와 그 레이아웃 파일
    layouts: list[tuple[int, int, Path]] = []
    for m in re.finditer(r"<Route\s+element=\{<(\w+)\s*/>\}>", src):
        name = m.group(1)
        targets = comp_path(name)
        targets = [targets] if targets else local_component_deps(name)
        if not targets:
            continue
        # 여는 태그 이후 첫 </Route>까지. 이 저장소의 레이아웃 중첩은 1단이며,
        # 다단이 생기면 이 계산이 틀리므로 그때 스택 파서로 바꾼다.
        close = src.find("</Route>", m.end())
        end = close if close != -1 else len(src)
        layouts.extend((m.start(), end, tgt) for tgt in targets)

    pages: list[tuple[str, Path, list[Path]]] = []
    for tag_start, body in iter_route_tags(src):
        pm = ATTR_PATH.search(body)
        em = re.search(r"element=\{([\s\S]*)\}\s*/?$", body.strip()) or re.search(r"element=\{([\s\S]*)", body)
        if not pm or not em:
            continue
        raw = (pm.group(1) or pm.group(2) or pm.group(3) or "").strip()
        route = consts.get(raw.split(".", 1)[1], raw) if raw.startswith("ROUTES.") else raw.strip("\"'")
        name = page_component(em.group(1))
        if not name:
            continue
        target = comp_path(name)
        if not target:
            continue
        wrapping = [lay for start, end, lay in layouts if start < tag_start < end]
        pages.append((route, target, wrapping))
    return pages


def main() -> int:
    registry = load_registry()
    consts = dict(re.findall(r"""^\s+([A-Z_]+):\s*'([^']+)'""",
                             (FE / "lib" / "routes.ts").read_text(encoding="utf-8"), re.M))
    pages = load_pages(consts)
    result = []
    for route, page, layouts in sorted(pages, key=lambda x: x[0]):
        merged: dict[str, str] = {}
        for source in [page, *layouts]:
            for api_route, where in calls_from(source).items():
                merged.setdefault(api_route, where)
        entries = []
        for api_route, where in sorted(merged.items()):
            hit = registry.get(api_route)
            entries.append({
                "route": api_route,
                "frontend": where,
                **(hit or {"feature": None, "operationId": None, "backend": None}),
            })
        result.append({
            "page": route,
            "component": str(page.relative_to(REPO_ROOT)),
            "layouts": [str(l.relative_to(REPO_ROOT)) for l in layouts],
            "calls": entries,
        })

    if "--json" in sys.argv:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    for item in result:
        extra = f"  + {', '.join(Path(l).name for l in item['layouts'])}" if item["layouts"] else ""
        print(f"\n{item['page']}   ({item['component']}){extra}")
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
