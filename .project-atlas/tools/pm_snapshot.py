#!/usr/bin/env python3
"""PM 스냅샷 생성기 — 페이지 하나가 어디까지 왔는지를 기계가 뽑은 사실로만 답한다.

    페이지
     └ 기능 (FT-*)
        ├ 프론트  registry가 가리킨 호출 지점 경로에 파일이 있는가
        ├ 백엔드  registry가 가리킨 구현 경로에 파일이 있는가
        ├ 결함    registry가 이 기능에 걸어둔 것 (양방향: relatedFeature + knownDefects)
        └ 테스트  registry의 tests

여기서 관측하는 것은 "그 경로에 파일이 있다"와 "이 페이지에서 그 API를 부르는 코드가 있다"
둘뿐이다. 그 파일이 비어 있는지, 죽은 legacy인지, 실행되는지는 보지 않는다.
그래서 화면 문구도 "구현됨"이 아니라 "파일 있음" 수준으로만 말해야 한다 —
정적으로 본 것을 실행으로 확인한 것처럼 말하면 그 화면을 근거로 잘못된 판단이 나온다.

왜 registry의 status를 안 쓰는가
  status/switchedOver는 "feature slice로 이관했는가"를 말한다. 개발 여부가 아니다.
  2026-08-04 기준 19개 기능이 전부 PLANNED/false인데 대부분은 동작하는 코드다.
  그대로 대시보드에 올리면 전 기능이 미개발로 보인다 — 사실과 정반대다.
  그래서 여기서는 코드의 실재만 본다.

왜 파일로 굽는가
  AD-12에 따라 .project-atlas는 별도 저장소로 나간다. 프론트가 registry를
  직접 읽으면 그날 끊긴다. 스냅샷 파일 하나를 계약면으로 두면 원천이 어디로
  가든 소비자는 안 바뀐다. 나중에 Hermes가 갱신할 자리도 이 파일이다.

사용: python3 .project-atlas/tools/pm_snapshot.py [-o 출력경로]
      또는 frontend/ 에서 npm run atlas:snapshot

필요: pyyaml (pagemap.py와 같다). 버전은 .project-atlas/requirements.txt가 고정한다.
      없으면 ModuleNotFoundError로 멈춘다.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pagemap  # noqa: E402  — sys.path를 세운 뒤에만 import할 수 있다

ATLAS_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ATLAS_DIR.parent
DEFAULT_OUT = REPO_ROOT / "frontend/src/features/research/atlas-snapshot.json"


REGISTRY_DIR = ATLAS_DIR / "registry"


def github_json(*args: str):
    """gh CLI가 돌려준 JSON. 실패하면 스냅샷을 만들지 않는다."""
    result = subprocess.run(
        ["gh", *args],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def lifecycle_by_issue(
    issue_numbers: set[int],
    issues: list[dict],
    pull_requests: list[dict],
) -> dict[int, str]:
    """GitHub의 closing 관계와 PR 상태에서 이슈별 lifecycle을 파생한다."""
    issues_by_number = {issue["number"]: issue for issue in issues}
    prs_by_number = {pr["number"]: pr for pr in pull_requests}
    lifecycle = {}

    for issue_number in issue_numbers:
        issue = issues_by_number.get(issue_number)
        if issue is None:
            raise RuntimeError(f"GitHub issue #{issue_number}를 조회 결과에서 찾지 못했습니다.")

        linked_prs = []
        for reference in issue.get("closedByPullRequestsReferences") or []:
            pr_number = reference["number"]
            pr = prs_by_number.get(pr_number)
            if pr is None:
                raise RuntimeError(f"GitHub PR #{pr_number}를 조회 결과에서 찾지 못했습니다.")
            linked_prs.append(pr)

        if issue.get("state") == "CLOSED" and any(pr.get("mergedAt") for pr in linked_prs):
            lifecycle[issue_number] = "RESOLVED"
        elif issue.get("state") == "OPEN" and any(pr.get("state") == "OPEN" for pr in linked_prs):
            lifecycle[issue_number] = "IN_PROGRESS"
        else:
            lifecycle[issue_number] = "TRACKED"

    return lifecycle


def load_github_lifecycles(defects: list[dict]) -> dict[int, str]:
    """registry의 이슈만 GitHub 상태와 연결한다. 추측이나 실패 fallback은 없다."""
    issue_numbers = {
        issue
        for defect in defects
        if isinstance((issue := defect.get("issue")), int)
        and not isinstance(issue, bool)
        and issue > 0
    }
    if not issue_numbers:
        return {}

    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    repo = project["repo"]
    issues = github_json(
        "issue", "list", "--repo", repo, "--state", "all", "--limit", "1000",
        "--json", "number,state,closedByPullRequestsReferences",
    )
    pull_requests = github_json(
        "pr", "list", "--repo", repo, "--state", "all", "--limit", "1000",
        "--json", "number,state,mergedAt",
    )
    prs_by_number = {pr["number"]: pr for pr in pull_requests}
    issues_by_number = {issue["number"]: issue for issue in issues}
    for issue_number in issue_numbers:
        pages = github_json(
            "api", "--paginate", "--slurp",
            f"repos/{repo}/issues/{issue_number}/timeline",
        )
        references = issues_by_number.get(issue_number, {}).setdefault(
            "closedByPullRequestsReferences",
            [],
        )
        referenced_numbers = {reference["number"] for reference in references}
        for event in (item for page in pages for item in page):
            source = (event.get("source") or {}).get("issue") or {}
            pr_number = source.get("number")
            if (
                event.get("event") == "cross-referenced"
                and source.get("pull_request")
                and pr_number in prs_by_number
                and pr_number not in referenced_numbers
            ):
                references.append({"number": pr_number})
                referenced_numbers.add(pr_number)
    return lifecycle_by_issue(issue_numbers, issues, pull_requests)


def registry_digest() -> str:
    """registry 원천의 내용 해시. 스냅샷이 낡았는지 판정하는 유일한 근거다.

    왜 mtime이 아니라 내용 해시인가
      git은 파일 시각을 보존하지 않는다. 새로 clone하면 registry와 스냅샷의
      mtime이 체크아웃 순서대로 사실상 임의로 정해져서, mtime 비교는
      "낡았다"와 "방금 받았다"를 구별하지 못한다. 내용은 clone과 무관하다.

    왜 registry만 넣는가
      스냅샷의 사실 원천은 registry(feature·defects)와 프론트 코드 둘이다.
      코드까지 넣으면 프론트 한 줄을 고칠 때마다 검사가 빨개져서, 경보가
      배경이 되고 진짜 갈라짐이 그 속에 묻힌다. 여기서 막으려는 것은
      "registry를 고치고 재생성을 잊는 것"이라 registry로 범위를 좁힌다.
      코드 쪽 갈라짐은 resolve.py의 FEC-01·SRC-01이 따로 잡는다.

    형식: 파일별 '상대경로\\n내용sha256\\n'을 경로 정렬 순으로 이어 붙여 sha256.
    frontend/scripts/check-atlas-snapshot.mjs가 이 정의를 node로 다시 구현한다 —
    두 곳에 적힌 유일한 규칙이므로 한쪽을 고치면 반드시 다른 쪽도 고쳐야 한다.
    """
    digest = hashlib.sha256()
    for file in sorted(REGISTRY_DIR.glob("*.yaml"), key=lambda p: p.name):
        digest.update(file.name.encode("utf-8"))
        digest.update(b"\n")
        digest.update(hashlib.sha256(file.read_bytes()).hexdigest().encode("ascii"))
        digest.update(b"\n")
    return digest.hexdigest()


def strip_symbol(path: str) -> str:
    """'a/b.tsx#symbol' 또는 'a/b.ts:27'에서 파일 경로만 남긴다."""
    return path.split("#", 1)[0].split(":", 1)[0]


def exists(path: str | None) -> bool:
    """그 경로에 파일이 실재하는가. 그 이상은 답하지 않는다.

    빈 클래스도, 아무도 안 부르는 legacy 파일도, 심볼이 주석에만 남은 파일도 True다.
    이 함수를 더 똑똑하게 만드는 것은 별개 과제이고, 그 전까지는 이 함수를 소비하는
    화면이 "구현됨"이라고 말하면 안 된다.
    """
    if not path or path == "-":
        return False
    return (REPO_ROOT / strip_symbol(path)).exists()


def load_features() -> dict[str, dict]:
    """featureId → registry 원본."""
    features = {}
    for file in sorted((ATLAS_DIR / "registry").glob("FT-*.yaml")):
        data = yaml.safe_load(file.read_text(encoding="utf-8"))
        if data and data.get("featureId"):
            features[data["featureId"]] = data
    return features


def defect_lifecycle(defect: dict, github_lifecycles: dict[int, str] | None = None) -> str:
    """결함이 어디까지 왔는가.

        OBSERVED    관측만 됨. 이슈가 없다
        TRACKED     이슈가 등록됨
        IN_PROGRESS 그 이슈에 PR이 열림
        RESOLVED    그 PR이 머지됨

    사람이 적는 값은 defects.yaml의 `issue` 하나뿐이다. 나머지 셋은 GitHub의
    closing 관계와 PR 상태에서 파생한다. 제목·본문의 번호는 연결로 취급하지 않는다.

    truthiness로 판정하지 않는 이유
      `if defect.get("issue")`는 `issue: 0`을 "이슈 없음"으로 흘린다. 0은 유효한
      GitHub 이슈 번호가 아니지만(번호는 1부터다), 화면에 "이슈 미등록"으로 뜨는 것과
      값이 잘못됐다고 걸리는 것은 다르다. 조용히 흘리면 사람이 적은 값이 사라진 채
      정상으로 보인다. 그래서 여기서는 "양의 정수인가"만 보고, 그 외의 값은
      resolve.py의 ISS-01이 위반으로 잡는다 — 판정은 여기, 거부는 resolver다.
      bool은 파이썬에서 int의 하위형이라 `issue: true`가 1로 새는 것을 따로 막는다.
    """
    issue = defect.get("issue")
    tracked = isinstance(issue, int) and not isinstance(issue, bool) and issue > 0
    if not tracked:
        return "OBSERVED"
    return (github_lifecycles or {}).get(issue, "TRACKED")


def defect_view(defect: dict, github_lifecycles: dict[int, str] | None = None) -> dict:
    """화면이 결함 하나에 대해 묻는 전부.

    detail과 evidence를 싣는 이유: "무엇이 문제인가"만으로는 아무도 확인하러 갈 수 없다.
    어느 파일 어느 심볼 몇 번째 줄인지가 있어야 주장이 검증 가능한 관측이 된다.
    """
    evidence = defect.get("evidence") or {}
    return {
        "id": defect.get("id"),
        "severity": defect.get("severity"),
        "title": defect.get("title"),
        # detail은 YAML 블록 스칼라라 줄바꿈이 남는다. 화면은 문단 하나로 읽는다.
        "detail": " ".join((defect.get("detail") or "").split()) or None,
        "disposition": defect.get("disposition"),
        "evidence": {
            "path": evidence.get("path"),
            "symbol": evidence.get("symbol"),
            "line": evidence.get("line"),
        } if evidence.get("path") else None,
        "relatedFeature": defect.get("relatedFeature"),
        "relatedStory": defect.get("relatedStory"),
        "issue": defect.get("issue"),
        "lifecycle": defect_lifecycle(defect, github_lifecycles),
    }


def load_defects(
    features: dict[str, dict],
    github_lifecycles: dict[int, str] | None = None,
) -> dict[str, list[dict]]:
    """featureId → 그 기능에 걸린 결함들.

    소속의 원천이 둘이다.
      defects.yaml의 `relatedFeature`  — 결함 쪽에서 기능을 가리킨다 (1:1)
      FT-*.yaml의 `knownDefects`       — 기능 쪽에서 결함을 가리킨다 (N:M)
    한쪽만 읽으면 누락된다. FT-ROOM-UPDATE는 relatedFeature로 걸린 결함이 0건이지만
    knownDefects로 BC-REG-02/03/04를 갖는다 — 이전 판은 이 기능을 결함 0건으로 표시했다.
    그래서 둘을 합치고 ID로 중복을 지운다.

    합치면 같은 결함이 여러 기능에 붙는다(BC-REG-04는 3개 기능에 걸린다).
    페이지 단위 집계는 그래서 ID로 다시 dedupe해야 한다 — 소비자 쪽 rollupPage의 책임이다.
    """
    raw = yaml.safe_load((ATLAS_DIR / "registry" / "defects.yaml").read_text(encoding="utf-8"))
    views = {
        d["id"]: defect_view(d, github_lifecycles)
        for d in ((raw or {}).get("defects") or [])
        if d.get("id")
    }

    by_feature: dict[str, dict[str, dict]] = {}
    for defect_id, view in views.items():
        feature = view.get("relatedFeature")
        if feature:
            by_feature.setdefault(feature, {})[defect_id] = view
    for feature_id, source in features.items():
        for defect_id in source.get("knownDefects") or []:
            view = views.get(defect_id)
            if view is None:
                # registry가 없는 ID를 가리킨다. 지어내지 않는다 — resolver가 잡을 정합 문제다.
                continue
            by_feature.setdefault(feature_id, {})[defect_id] = view

    return {feature_id: list(items.values()) for feature_id, items in by_feature.items()}


def unattached_defects(github_lifecycles: dict[int, str] | None = None) -> list[dict]:
    """어느 feature 도 데려가지 않은 결함.

    `load_defects` 가 세는 두 방향(relatedFeature · knownDefects) 중 어느 쪽으로도
    걸리지 않은 것들이다. 그것을 다시 계산하지 않고 같은 함수를 지나게 해서,
    "무엇이 feature 에 붙는가"의 판정이 두 벌이 되지 않게 한다.
    """
    raw = yaml.safe_load((ATLAS_DIR / "registry" / "defects.yaml").read_text(encoding="utf-8"))
    all_ids = [d["id"] for d in ((raw or {}).get("defects") or []) if d.get("id")]
    attached = {
        view["id"]
        for views in load_defects(load_features(), github_lifecycles).values()
        for view in views
    }
    views = {
        d["id"]: defect_view(d, github_lifecycles)
        for d in ((raw or {}).get("defects") or [])
        if d.get("id")
    }
    return [views[i] for i in all_ids if i not in attached]


def defect_layer(view: dict) -> str | None:
    """결함이 관측된 레이어. evidence.path의 최상위 디렉터리만 근거로 삼는다.

    evidence가 없거나 backend/·frontend/ 어느 쪽도 아니면 None을 돌려준다.
    모르는 것을 한쪽에 붙이면 그 레이어가 근거 없이 빨개진다 — 이전 판이
    front/back에 같은 배열을 넘겨 백엔드 결함으로 프론트까지 빨갛게 만든 원인이다.
    None인 결함은 레이어 판정에서 빠지고 기능 수준 결함으로만 남는다.
    """
    evidence = view.get("evidence") or {}
    path = evidence.get("path") or ""
    if path.startswith("backend/"):
        return "back"
    if path.startswith("frontend/"):
        return "front"
    return None


def layer_state(implemented: bool, defects: list[dict]) -> str:
    """한 레이어의 상태.

    absent  그 경로에 파일이 없다(또는 registry에 경로가 없다)
    defect  파일은 있고, 그 레이어에서 관측된 P1 결함이 있다
    built   파일은 있다. 그 이상은 관측하지 않았다 — 동작 확인이 아니다

    결함은 P1만 상태를 끌어내린다 — P2/P3까지 빨갛게 하면 전부 빨개진다.
    """
    if not implemented:
        return "absent"
    return "defect" if any(d["severity"] == "P1" for d in defects) else "built"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("-o", "--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    registry = load_features()
    raw_defects = yaml.safe_load((REGISTRY_DIR / "defects.yaml").read_text(encoding="utf-8"))
    github_lifecycles = load_github_lifecycles((raw_defects or {}).get("defects") or [])
    defects_by_feature = load_defects(registry, github_lifecycles)
    pages = []

    for page in pagemap.build():
        grouped: dict[str, dict] = {}

        for call in page["calls"]:
            feature_id = call.get("feature")
            if not feature_id:
                # registry에 없는 호출. 숨기지 않는다 — 안 보이면 아무도 등재하지 않는다.
                grouped.setdefault("__unmapped__", {
                    "featureId": None,
                    "title": "registry 미등재 호출",
                    "owner": None,
                    "operations": [],
                    "defects": [],
                    "tests": [],
                })["operations"].append({
                    "operationId": None, "route": call["route"],
                    "auth": None, "safety": None, "frontend": call.get("frontend"),
                })
                continue

            source = registry.get(feature_id, {})
            if feature_id not in grouped:
                defects = defects_by_feature.get(feature_id, [])
                backend_path = call.get("backend")
                grouped[feature_id] = {
                    "featureId": feature_id,
                    "title": call.get("title") or source.get("title"),
                    "owner": source.get("owner"),
                    "capability": source.get("capabilityTitle"),
                    "operations": [],
                    "defects": defects,
                    # tests는 registry가 파일 경로 목록으로 답한다. 비어 있으면 덮는 테스트가 없다는 뜻.
                    "tests": source.get("tests") or [],
                    # 레이어 상태에는 그 레이어에서 관측된 결함만 넘긴다.
                    # defects 전체를 양쪽에 넘기면 백엔드 결함이 프론트까지 빨갛게 만든다.
                    "front": {
                        "path": call.get("frontend"),
                        "state": layer_state(
                            exists(call.get("frontend")),
                            [d for d in defects if defect_layer(d) == "front"],
                        ),
                    },
                    "back": {
                        "path": backend_path,
                        "state": layer_state(
                            exists(backend_path),
                            [d for d in defects if defect_layer(d) == "back"],
                        ),
                    },
                }
            grouped[feature_id]["operations"].append({
                "operationId": call.get("operationId"),
                "route": call["route"],
                "auth": call.get("auth"),
                "safety": call.get("safety"),
                "frontend": call.get("frontend"),
            })

        pages.append({
            "page": page["page"],
            "component": page["component"],
            "features": [grouped[key] for key in grouped if key != "__unmapped__"]
                        + ([grouped["__unmapped__"]] if "__unmapped__" in grouped else []),
        })

    snapshot = {
        # 손으로 고치지 말라는 표시. 고쳐도 다음 생성에서 지워진다.
        "generator": ".project-atlas/tools/pm_snapshot.py",
        "note": "생성물이다. 원천은 registry와 코드다. 직접 편집하지 않는다.",
        # 이 스냅샷을 구울 때의 registry 내용 해시. 빌드 전 검사가 이 값으로
        # "registry를 고치고 재생성을 잊었는가"를 판정한다.
        "sourceDigest": registry_digest(),
        "pages": pages,
        # 어느 feature 도 데려가지 않은 결함. (2026-08-10)
        #
        # 이 배열이 없던 동안 그런 결함은 **사이트에서 통째로 사라졌다.** 화면이
        # pages(=feature) 를 타고만 결함에 닿기 때문이다. BC-DB-01·BC-ARCH-01/02 가
        # 그 상태로 있었고 아무도 몰랐다.
        #
        # #289 에서 BC-DEPLOY-01(P1)·BC-ATLAS-01 의 근거 없는 귀속을 지우자 그 둘도
        # 같은 자리로 떨어졌고, 그제서야 빈틈이 드러났다 — 틀린 귀속이 빈틈을
        # 가리고 있었던 것이다. 귀속을 지운 것은 옳지만, 지우면 안 보이게 되는
        # 구조를 그대로 두면 "정직하게 안 보이는" 상태가 된다.
        #
        # 배포·마이그레이션·아키텍처처럼 제품 feature 가 소유하지 않는 결함은
        # 앞으로도 생긴다. relatedFeature 는 schema 상 필수가 아니다 — 억지로
        # 붙이는 대신 여기로 모은다.
        "unattachedDefects": unattached_defects(github_lifecycles),
        # 연결 규약이 아직 없다. 빈 값을 그대로 둬서 화면이 '없음'을 말하게 한다 —
        # 있는 척하는 것보다 비어 있는 게 낫다. Hermes가 채울 자리.
        "links": {"source": None, "byFeature": {}},
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    total = sum(len(p["features"]) for p in pages)
    print(f"{args.out.relative_to(REPO_ROOT)} — 페이지 {len(pages)}개 / 기능 {total}건")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
