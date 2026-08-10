#!/usr/bin/env python3
"""관계 탐지가 사실만 말하는지, 실패를 '관계 없음'으로 위장하지 않는지 검사한다.

이 파일이 붙드는 것
  1. 신호 넷이 각각 혼자서도 잡히는가
  2. 세지 말아야 할 것을 안 세는가 — 자기 번호·봇 코멘트·공용 파일·경로 탈출
  3. 조회 실패가 "관계 없음"과 **다른 모양**으로 나오는가
  4. 상한에 걸렸을 때 그 사실이 코멘트에 남는가
  5. 캐시가 낡은 목록을 재사용하지 않는가

gh 는 때리지 않는다. `GhApi` 자리에 같은 메서드를 가진 가짜를 넣는다 —
네트워크를 타면 테스트가 저장소 상태에 따라 색이 바뀌고, 그때부터 아무도
빨간불을 믿지 않는다.

실행: python3 .project-atlas/tools/test_triage_relate.py
"""

from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

import yaml

# 캐시는 프로세스 밖 파일이다. 테스트가 실제 캐시를 건드리면 다음 실행이
# 앞 실행의 가짜 PR 목록을 재사용한다 — 반드시 먼저 갈아 끼운다.
CACHE = Path(tempfile.mkdtemp(prefix="atlas-triage-test-")) / "pr-files.json"
os.environ["ATLAS_TRIAGE_PR_CACHE"] = str(CACHE)

sys.path.insert(0, str(Path(__file__).resolve().parent))
import triage_relate as tr  # noqa: E402

ATLAS_DIR = Path(__file__).resolve().parent.parent
ROUTING = yaml.safe_load((ATLAS_DIR / "triage-routing.yaml").read_text(encoding="utf-8"))

failures: list[str] = []


def check(name: str, got, want) -> None:
    if got == want:
        print(f"ok    {name}")
    else:
        failures.append(f"{name}: 기대 {want!r}, 실제 {got!r}")
        print(f"FAIL  {name}  기대 {want!r} 실제 {got!r}")


def fresh_cache() -> None:
    """캐시 테스트 외에는 항상 빈 캐시에서 출발한다."""
    if CACHE.exists():
        CACHE.unlink()


class FakeApi:
    """GhApi 와 같은 표면. `fail` 에 든 이름은 조회가 실패한다."""

    slug = "Fake/Repo"

    def __init__(self, *, comments=None, timeline=None, prs=None, files=None, fail=()):
        self._comments = comments or []
        self._timeline = timeline or []
        self._prs = prs or []
        self._files = files or {}
        self.fail = set(fail)
        self.file_calls: list[int] = []

    def _guard(self, what):
        if what in self.fail:
            raise tr.RelateFetchError(what)

    def comments(self, issue):
        self._guard("comments")
        return self._comments

    def timeline(self, issue):
        self._guard("timeline")
        return self._timeline

    def open_prs(self, limit):
        self._guard("prs")
        return self._prs[:limit]

    def pr_files(self, number):
        self._guard("files")
        self._guard(f"files:{number}")
        self.file_calls.append(number)
        return list(self._files.get(number, []))


def pr(number, *, title="pr", body="", sha=None, updated="2026-08-07T00:00:00Z"):
    return {"number": number, "title": title, "body": body,
            "headRefOid": sha or f"sha{number}", "updatedAt": updated}


def xref(number, *, is_pr=True, state="open", title="t"):
    return {"event": "cross-referenced",
            "source": {"issue": {"number": number, "title": title, "state": state,
                                 **({"pull_request": {"url": "x"}} if is_pr else {})}}}


def run(issue=217, *, title="", body="", paths=(), api=None, comments=None, routing=None):
    fresh_cache()
    return tr.gather(issue=issue, title=title, body=body, paths=list(paths),
                     routing=routing or ROUTING, api=api or FakeApi(), comments=comments)


def numbers(result):
    return [r["number"] for r in result["relations"]]


def signals(result, number):
    for r in result["relations"]:
        if r["number"] == number:
            return sorted(r["signals"])
    return None


# ── 1. 관계 0건 ─────────────────────────────────────────────
zero = run(body="체크리스트가 저장이 안 돼요")
check("관계 0건 — 목록이 비어 있다", numbers(zero), [])
check("관계 0건 — 상태는 ok (실패가 아니다)", zero["status"], "ok")
check("관계 0건 — 코멘트가 '신호가 없다'고 말한다",
      any("신호가 없습니다" in ln for ln in tr.render_section(zero)), True)
check("관계 0건 — '조회 실패'라고 말하지 않는다",
      any("조회 실패" in ln for ln in tr.render_section(zero)), False)


# ── 2. 언급만 있음 ──────────────────────────────────────────
only_mention = run(217, body="#215 가 세운 게이트와 같은 자리다")
check("본문 언급을 잡는다", numbers(only_mention), [215])
check("언급만 있으면 신호도 mention 하나", signals(only_mention, 215), ["mention"])
check("언급은 PR 목록에 없으면 정체를 지어내지 않는다",
      only_mention["relations"][0]["kind"], None)

# 코멘트의 언급도 센다 — 사람이 "이건 #241 과 같은 문제"라고 적는 자리가 그곳이다.
in_comment = run(217, body="본문에는 없다",
                 comments=[{"user": {"login": "std-yong"}, "body": "#241 과 같은 원인 같습니다"}])
check("사람이 쓴 코멘트의 언급도 센다", numbers(in_comment), [241])

# 자기 번호. 이슈 템플릿·정정 문구에 자기 번호가 들어가는 일은 흔하다.
check("자기 자신 번호는 세지 않는다",
      numbers(run(217, body="#217 은 이 이슈다. 그리고 #215 를 본다")), [215])
check("자기 번호만 있으면 관계 0건",
      numbers(run(217, body="#217 참고")), [])

# 봇 코멘트. v1·v2 코멘트에는 다른 이슈 번호가 흔히 들어 있고, 그것을 세면
# 봇이 자기가 쓴 글을 근거로 관계를 주장하게 된다 — 순환이다.
bot_v2 = {"user": {"login": "Woo-JongHo"},
          "body": "<!-- atlas-triage:v2 {} -->\n## 분류·배정 제안\n- 참고 #999"}
check("봇 코멘트의 #N 은 신호가 아니다 (게시자가 사람 계정이어도)",
      numbers(run(217, comments=[bot_v2])), [])
bot_v1 = {"user": {"login": "Woo-JongHo"},
          "body": "<!-- atlas-triage:v1 {} -->\n#888 과 중복 후보"}
check("v1 코멘트의 #N 도 신호가 아니다", numbers(run(217, comments=[bot_v1])), [])
check("[bot] 계정 코멘트도 세지 않는다",
      numbers(run(217, comments=[{"user": {"login": "dependabot[bot]"},
                                  "body": "bumps #777"}])), [])

# 표기 오인.
check("HTML 이스케이프(&#39;)는 언급이 아니다",
      numbers(run(217, body="it&#39;s broken")), [])
check("URL 안의 앵커는 언급이 아니다",
      numbers(run(217, body="https://github.com/a/b/pull/263#3 참고")), [])
check("단어에 붙은 #1 은 언급이 아니다", numbers(run(217, body="abc#1")), [])


# ── 3. 파일 교집합만 있음 ───────────────────────────────────
files_only = run(
    217, paths=[".github/workflows/atlas-resolve.yml"],
    api=FakeApi(prs=[pr(263)],
                files={263: [".github/workflows/atlas-resolve.yml",
                             ".project-atlas/tools/sync_check.py"]}))
check("변경 파일 겹침만으로 관계가 선다", numbers(files_only), [263])
check("겹침 신호로 잡힌다", signals(files_only, 263), ["files"])
check("겹친 경로를 코멘트에 적는다",
      any("`.github/workflows/atlas-resolve.yml`" in ln
          for ln in tr.render_section(files_only)), True)
check("열린 PR 은 PR 로 표기된다", tr.label(files_only["relations"][0]), "#263 · PR(열림)")

check("겹치지 않으면 관계가 아니다",
      numbers(run(217, paths=["frontend/src/app/router.tsx"],
                  api=FakeApi(prs=[pr(263)], files={263: ["backend/build.gradle"]}))), [])

# PR 이 **새로 만드는** 파일과의 겹침. 이것을 잡으려고 교집합에서는 실재 검사를
# 하지 않는다 — 실재로 거르면 "이 이슈가 요구한 파일을 그 PR 이 만들고 있다"를
# 영원히 못 본다.
new_file = run(217, paths=["backend/src/test/resources/atlas-baseline-info/bean-names.txt"],
               api=FakeApi(prs=[pr(300)],
                           files={300: ["backend/src/test/resources/"
                                        "atlas-baseline-info/bean-names.txt"]}))
check("아직 없는 파일을 만드는 PR 도 겹침으로 잡는다", numbers(new_file), [300])

# 형태 검사는 그대로 지난다.
check("경로 탈출은 교집합에 쓰지 않는다",
      tr.overlap_paths(["frontend/../.project-atlas/tools/triage_route.py"]), [])
check("절대경로는 교집합에 쓰지 않는다",
      tr.overlap_paths(["/etc/passwd"]), [])
check("저장소 루트 밖은 교집합에 쓰지 않는다",
      tr.overlap_paths(["node_modules/x/index.js"]), [])
check("정상 경로는 실재하지 않아도 교집합에 쓴다",
      tr.overlap_paths(["frontend/src/nonexistent/Fake.tsx"]),
      ["frontend/src/nonexistent/Fake.tsx"])

# 공용 파일. 선언(sharedPaths)으로 걸러야 모든 이슈가 모든 PR 과 이어져 보이지 않는다.
shared = run(217, paths=["backend/build.gradle"],
             api=FakeApi(prs=[pr(263)], files={263: ["backend/build.gradle"]}))
check("sharedPaths 로 선언된 공용 파일은 겹침 근거가 아니다", numbers(shared), [])

# 관측으로도 거른다 — 열린 PR 다수가 건드리는 경로는 그 시기의 공용 파일이다.
many = [pr(n) for n in range(300, 306)]
noisy = run(217, paths=["frontend/src/app/router.tsx"],
            api=FakeApi(prs=many, files={n: ["frontend/src/app/router.tsx"] for n in
                                         range(300, 306)}))
check("열린 PR 다수가 건드리는 경로는 소음으로 본다", numbers(noisy), [])

only_two = run(217, paths=["frontend/src/app/router.tsx"],
               api=FakeApi(prs=[pr(300), pr(301)],
                           files={300: ["frontend/src/app/router.tsx"],
                                  301: ["frontend/src/app/router.tsx"]}))
check("상한 미만이면 그대로 겹침으로 센다", sorted(numbers(only_two)), [300, 301])


# ── 4. 나머지 두 신호 ───────────────────────────────────────
check("타임라인 역참조를 잡는다",
      numbers(run(262, api=FakeApi(timeline=[xref(263)]))), [263])
check("역참조가 준 정체를 그대로 쓴다",
      tr.label(run(262, api=FakeApi(timeline=[xref(263)]))["relations"][0]),
      "#263 · PR(열림)")
check("타임라인의 자기 번호는 세지 않는다",
      numbers(run(263, api=FakeApi(timeline=[xref(263)]))), [])
check("cross-referenced 가 아닌 이벤트는 세지 않는다",
      numbers(run(262, api=FakeApi(timeline=[{"event": "labeled"}]))), [])

check("PR 본문의 closes #N 을 역방향으로 잡는다",
      numbers(run(262, api=FakeApi(prs=[pr(263, body="Closes #262")]))), [263])
check("resolves 도 잡는다",
      numbers(run(262, api=FakeApi(prs=[pr(263, body="resolves #262")]))), [263])
check("다른 이슈를 닫는 PR 은 관계가 아니다",
      numbers(run(262, api=FakeApi(prs=[pr(263, body="closes #999")]))), [])
check("'related to #N' 은 닫힘 선언이 아니다",
      signals(run(262, api=FakeApi(prs=[pr(263, body="related to #262")])), 263), None)

# 신호가 겹치면 한 줄로 합친다 — 같은 PR 이 두 줄로 나오면 사람이 두 개로 읽는다.
merged = run(262, paths=[".github/workflows/atlas-resolve.yml"],
             api=FakeApi(timeline=[xref(263)],
                         prs=[pr(263, body="Closes #262")],
                         files={263: [".github/workflows/atlas-resolve.yml"]}))
check("같은 번호의 신호들은 한 항목으로 합친다", numbers(merged), [263])
check("신호 셋이 함께 기록된다", signals(merged, 263), ["closes", "files", "xref"])
check("가장 강한 신호가 먼저 적힌다",
      tr.describe(merged["relations"][0]).startswith("이 PR 이 본문에서"), True)

# 정렬 — 약한 신호(언급)가 강한 신호(겹침) 위로 올라오면 안 된다.
order = run(217, body="#100 참고", paths=[".github/workflows/atlas-resolve.yml"],
            api=FakeApi(prs=[pr(263)], files={263: [".github/workflows/atlas-resolve.yml"]}))
check("강한 신호가 위로 온다", numbers(order), [263, 100])


# ── 5. 조회 실패 ────────────────────────────────────────────
all_dead = run(217, body="#215", api=FakeApi(fail=("comments", "timeline", "prs")))
check("전부 실패하면 status=failed", all_dead["status"], "failed")
check("실패는 빈 결과로 흘리지 않는다 — 코멘트가 실패라고 말한다",
      any("실패" in ln for ln in tr.render_section(all_dead)), True)
check("실패를 '신호가 없다'로 적지 않는다",
      any("신호가 없습니다" in ln for ln in tr.render_section(all_dead)), False)

# 일부 실패 + 관계 0건. 여기서 "모두 0건입니다"라고 적으면 못 본 것을 봤다고
# 말하는 셈이 된다 — 조용히 빈 결과로 만들지 말라는 제약이 걸리는 자리다.
half_blind = run(217, api=FakeApi(fail=("prs",)))
check("일부 실패 + 0건은 '모두 0건'이라고 적지 않는다",
      any("모두 0건" in ln for ln in tr.render_section(half_blind)), False)
check("일부 실패 + 0건은 '확인하지 못했다'를 함께 적는다",
      any("확인하지 못했습니다" in ln for ln in tr.render_section(half_blind)), True)

partial = run(217, body="#215", api=FakeApi(fail=("prs",)))
check("일부만 실패하면 status=partial", partial["status"], "partial")
check("살아 있는 신호는 그대로 나간다", numbers(partial), [215])
check("실패한 신호를 코멘트에 적는다",
      any("조회 실패" in ln and "열린 PR" in ln for ln in tr.render_section(partial)), True)

# PR 한 건의 파일 조회만 실패한 경우. 나머지 PR 은 계속 대조해야 하고,
# 못 본 PR 이 있다는 사실은 남아야 한다.
one_pr_dead = run(217, paths=["frontend/src/app/router.tsx"],
                  api=FakeApi(prs=[pr(300), pr(301)],
                              files={301: ["frontend/src/app/router.tsx"]},
                              fail=("files:300",)))
check("PR 한 건의 파일 조회 실패가 나머지를 막지 않는다", numbers(one_pr_dead), [301])
check("못 본 PR 이 있다는 사실을 적는다",
      any("#300" in ln for ln in tr.render_section(one_pr_dead)), True)

# 관계 조회가 전멸해도 파트 판정은 나가야 한다 — gather 는 예외를 올리지 않는다.
check("관계 조회 전멸이 예외로 새지 않는다", isinstance(all_dead, dict), True)


# ── 6. 상한 초과 ────────────────────────────────────────────
tight = dict(ROUTING)
tight["relate"] = dict(ROUTING["relate"], maxOpenPullRequests=2, commonPathPrThreshold=0)
capped = run(217, paths=["frontend/src/app/router.tsx"], routing=tight,
             api=FakeApi(prs=[pr(300, updated="2026-08-01T00:00:00Z"),
                              pr(301, updated="2026-08-02T00:00:00Z"),
                              pr(302, updated="2026-08-03T00:00:00Z")],
                         files={n: ["frontend/src/app/router.tsx"] for n in (300, 301, 302)}))
check("열린 PR 상한을 넘으면 최근 갱신순으로 자른다", sorted(numbers(capped)), [301, 302])
check("자른 사실을 코멘트에 적는다",
      any("상한" in ln for ln in tr.render_section(capped)), True)

tight2 = dict(ROUTING)
tight2["relate"] = dict(ROUTING["relate"], maxRelations=2)
flood = run(217, body="#101 #102 #103 #104", routing=tight2)
check("관계 수 상한을 적용한다", len(flood["relations"]), 2)
check("접은 사실을 코멘트에 적는다",
      any("연관 후보" in ln for ln in tr.render_section(flood)), True)

wide = dict(ROUTING)
wide["relate"] = dict(ROUTING["relate"], maxOverlapPathsShown=1)
manyp = run(217, paths=["frontend/src/app/router.tsx", "frontend/src/main.tsx",
                        "frontend/src/App.tsx"], routing=wide,
            api=FakeApi(prs=[pr(300)],
                        files={300: ["frontend/src/app/router.tsx", "frontend/src/main.tsx",
                                     "frontend/src/App.tsx"]}))
check("겹친 경로가 많으면 접어서 개수를 적는다",
      any("외 2건" in ln for ln in tr.render_section(manyp)), True)


# ── 7. 캐시 ─────────────────────────────────────────────────
# 소급 적용은 이슈마다 새 프로세스다. 캐시가 프로세스 밖에 있어야 재사용된다.
fresh_cache()
api1 = FakeApi(prs=[pr(263, sha="aaa")], files={263: ["a/b.txt"]})
tr.pr_files_map("Fake/Repo", [pr(263, sha="aaa")], tr.config(ROUTING), api1)
api2 = FakeApi(prs=[pr(263, sha="aaa")], files={263: ["a/b.txt"]})
got, _ = tr.pr_files_map("Fake/Repo", [pr(263, sha="aaa")], tr.config(ROUTING), api2)
check("같은 head SHA 면 다시 긁지 않는다", api2.file_calls, [])
check("캐시에서 읽은 값이 맞다", got, {263: ["a/b.txt"]})

api3 = FakeApi(prs=[pr(263, sha="bbb")], files={263: ["a/b.txt", "c/d.txt"]})
tr.pr_files_map("Fake/Repo", [pr(263, sha="bbb")], tr.config(ROUTING), api3)
check("head SHA 가 바뀌면 다시 긁는다 — 낡은 목록으로 판정하지 않는다",
      api3.file_calls, [263])

stale = dict(ROUTING)
stale["relate"] = dict(ROUTING["relate"], cacheTtlSeconds=0)
api4 = FakeApi(prs=[pr(263, sha="bbb")], files={263: ["a/b.txt"]})
tr.pr_files_map("Fake/Repo", [pr(263, sha="bbb")], tr.config(stale), api4)
check("TTL 이 지나면 다시 긁는다", api4.file_calls, [263])

check("캐시 키에 저장소가 섞인다 — 다른 저장소의 #263 과 안 겹친다",
      tr.cache_key("A/B", 263, "aaa") != tr.cache_key("C/D", 263, "aaa"), True)


class CountingApi(FakeApi):
    def __init__(self, **kw):
        super().__init__(**kw)
        self.list_calls = 0

    def open_prs(self, limit):
        self.list_calls += 1
        return super().open_prs(limit)


# 열린 PR 목록도 캐시한다. 파일 목록만 캐시하면 소급 적용에서
# `gh pr list` 가 이슈 수만큼(200회) 그대로 나간다.
fresh_cache()
api5 = CountingApi(prs=[pr(263)], files={263: ["a/b.txt"]})
tr.open_prs_cached("Fake/Repo", 41, tr.config(ROUTING), api5)
tr.open_prs_cached("Fake/Repo", 41, tr.config(ROUTING), api5)
check("열린 PR 목록은 한 번만 긁는다 — 프로세스가 갈려도 캐시가 남는다",
      api5.list_calls, 1)
check("상한이 다르면 다른 목록으로 본다",
      (tr.open_prs_cached("Fake/Repo", 5, tr.config(ROUTING), api5), api5.list_calls)[1], 2)


# ── 8. 설정이 코드가 아니라 파일에 있는가 ───────────────────
check("triage-routing.yaml 이 relate 설정을 소유한다", "relate" in ROUTING, True)
check("공용 파일 제외 규칙은 yaml 에서 읽는다",
      "backend/build.gradle" in (ROUTING["relate"]["sharedPaths"] or []), True)
check("yaml 에 relate 가 없어도 죽지 않는다",
      tr.config({})["maxRelations"], tr.DEFAULTS["maxRelations"])


# ── 알려진 한계 ─────────────────────────────────────────────
# 언급 신호는 번호가 실재하는지 확인하지 않는다. 확인하려면 언급마다 조회가
# 하나씩 붙고, 그것이 소급 적용에서 터지는 그 호출량이다.
# 대가: 사람이 오타로 적은 `#9999` 도 관계로 나온다. 링크를 누르면 30초 안에
# 반증되고, 봇은 배정도 링크도 바꾸지 않으므로 대가가 작은 쪽을 골랐다.
check("[한계] 실재하지 않는 번호도 언급으로 센다",
      numbers(run(217, body="#999999 참고")), [999999])

# 겹침은 "같은 파일을 건드린다"까지만 말한다. 같은 파일의 다른 함수를 고치는
# 무관한 PR 도 걸린다. 줄 단위로 좁히려면 patch 를 파싱해야 하는데, 그러면
# 호출량과 오탐이 함께 는다 — 지금은 파일 단위에서 멈춘다.
check("[한계] 같은 파일의 다른 부분을 고치는 PR 도 겹침으로 나온다",
      numbers(run(217, paths=["frontend/src/app/router.tsx"],
                  api=FakeApi(prs=[pr(300)],
                              files={300: ["frontend/src/app/router.tsx"]}))), [300])


if failures:
    print(f"\n실패 {len(failures)}건")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
print("\n통과 — 관계는 검증 가능한 신호만 세고, 조회 실패를 '관계 없음'으로 위장하지 않는다")
