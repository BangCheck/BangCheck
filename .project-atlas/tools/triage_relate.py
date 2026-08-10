#!/usr/bin/env python3
"""이 이슈가 어떤 이슈·PR 과 이어져 있는지 판정한다. **검증 가능한 신호만** 센다.

봇이 하는 것
  아래 네 신호로 관계를 **제시**한다. 코멘트 한 섹션이 전부다.

봇이 하지 않는 것 (설계 제약이지 게으름이 아니다)
  이슈 링크를 걸지 않는다 — GitHub 의 sub-issue·linked 기능을 건드리지 않는다.
  본문·제목·label·assignee·registry 를 고치지 않는다.
  **제목이 비슷하다는 이유로 관계를 주장하지 않는다.**
  v1 트리아지가 정확히 그 방식(제목 토큰 유사도)으로 중복을 추정하다 은퇴했다
  (`retire_v1_comments.py` 참조). 추정은 틀려도 짚을 자리가 없고, 그 코멘트는
  봇이 낼 수 없는 권위를 주장하게 된다. 여기 있는 넷은 전부 "그렇게 적혀 있다"를
  가리키는 사실이다 — 사람이 링크를 눌러 30초 안에 반증할 수 있다.

세는 신호 넷
  ① mention   이슈 본문·코멘트의 `#N` (자기 번호 제외, 봇 코멘트 제외)
  ② xref      타임라인의 `cross-referenced` 이벤트 (양방향 역참조)
  ③ closes    열린 PR 본문의 `closes/fixes/resolves #N` 이 이 이슈를 가리킴
  ④ files     이슈에서 뽑은 경로와 열린 PR 의 변경 파일이 겹침

"관계 없음"과 "조회 실패"는 다른 상태다
  gh 가 실패했을 때 빈 결과로 흘리면 두 상태가 코멘트에서 같은 모양이 된다.
  실패는 예외로 올려 신호별로 잡고, 코멘트에 그 신호가 **확인되지 않았다**고 적는다.
  파트·담당자 판정은 여기서 무슨 일이 나든 그대로 나간다 — 관계는 곁다리이지
  판정의 전제가 아니다.

호출량
  열린 PR 의 변경 파일 목록은 이슈마다 다시 긁으면 안 된다. 소급 적용은
  `.github/workflows/atlas-triage.yml` 의 `for n in $numbers` 로 돌아
  **이슈마다 새 프로세스**를 띄운다. 프로세스 안 캐시는 그 루프에서 한 번도
  재사용되지 않는다 — 열린 이슈 200건 × 열린 PR 60건이면 12,000 회 호출이
  그대로 난다. 그래서 캐시는 프로세스 밖(파일)에 둔다.

사용 (단독 실행은 확인용이다. 코멘트는 triage_comment.py 가 쓴다):
  python3 .project-atlas/tools/triage_relate.py --issue 217
"""

from __future__ import annotations

import argparse
import fnmatch
import json
import os
import re
import sys
import tempfile
import time
from collections import Counter
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from triage_route import URL_RE, extract_paths, gh, is_wellformed  # noqa: E402

ATLAS_DIR = Path(__file__).resolve().parent.parent
ROUTING = ATLAS_DIR / "triage-routing.yaml"

# `#123`. 앞에 `&` 가 오면 세지 않는다 — HTML 이스케이프(`&#39;`)가 그대로 남은
# 본문이 실재한다. 앞에 단어 문자가 오면(`abc#1`) 참조 표기가 아니다.
MENTION_RE = re.compile(r"(?<![\w&])#(\d{1,6})\b")

# GitHub 이 닫힘으로 인정하는 동사만. 임의로 늘리지 않는다 —
# "related to #12" 를 닫힘으로 읽으면 PR 이 하지 않은 약속을 봇이 대신 한다.
CLOSING_RE = re.compile(
    r"\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\b\s*:?\s*#(\d{1,6})\b", re.I)

# 봇이 쓴 코멘트를 가려내는 표식.
#
# 왜 작성자 계정으로 가리지 않는가
#   triageAuthors 에는 사람 계정(Woo-JongHo)이 들어 있다. 2단이 Hermes 머신에서
#   사람 토큰으로 코멘트를 달기 때문이다. 작성자로 가르면 그 사람이 손으로 쓴
#   코멘트까지 통째로 버린다 — 사람이 "#215 와 같은 문제입니다"라고 적은,
#   가장 값진 신호가 사라진다.
# 본문 표식으로 가르면 누가 게시했든 봇이 저작한 글만 정확히 빠진다.
BOT_MARKER = "<!-- atlas-triage"

# 신호의 세기. 작을수록 강하다 — 코멘트에서 위로 올라간다.
#   closes  PR 이 "이걸 닫는다"고 스스로 선언했다. 가장 강하다.
#   files   실제로 같은 파일을 건드린다. 사람 손을 안 탄 사실이다.
#   xref    GitHub 이 기록한 역참조. 누군가 어딘가에서 이 이슈를 가리켰다.
#   mention 본문에 번호가 적혀 있을 뿐이다. "참고"일 수도 있다.
SIGNAL_RANK = {"closes": 0, "files": 1, "xref": 2, "mention": 3}

SIGNAL_LABEL = {
    "closes": "이 PR 이 본문에서 이 이슈를 닫는다고 선언",
    "xref": "타임라인 역참조",
    "mention": "본문·코멘트에서 언급",
}

# triage-routing.yaml 에 `relate:` 가 없을 때만 쓰는 보수적 기본값.
# **정본은 yaml 이다.** 여기 값이 실제로 쓰이는 상황은 규칙 파일이 이 기능보다
# 오래된 판본일 때뿐이고, 그때는 조용히 도는 것보다 좁게 도는 편이 낫다.
DEFAULTS = {
    "maxOpenPullRequests": 40,
    "maxRelations": 8,
    "maxOverlapPathsShown": 3,
    "sharedPaths": [],
    "commonPathPrThreshold": 0,   # 0 = 끔
    "cacheTtlSeconds": 900,
}


class RelateFetchError(RuntimeError):
    """조회가 실패했다.

    이 예외가 있는 이유는 하나다 — 실패를 빈 리스트로 돌려주면 호출부에서
    '관계 없음'과 구별할 수 없다. 코멘트에서 그 둘이 같은 모양이 되는 순간
    봇은 모르는 것을 아는 척하게 된다.
    """


def config(routing: dict) -> dict:
    cfg = dict(DEFAULTS)
    cfg.update(routing.get("relate") or {})
    return cfg


# ── gh 표면 ──────────────────────────────────────────────────
class GhApi:
    """읽기만 한다. 실패는 예외로 올린다.

    `gh(..., optional=True)` 를 쓰는 이유: 기본 gh() 는 실패에 SystemExit 을 내
    프로세스를 죽인다. 관계 조회가 파트 판정을 죽이면 안 된다 —
    설계 제약 중 되돌릴 수 없는 쪽이 그것이다.
    """

    def __init__(self, slug: str) -> None:
        self.slug = slug

    def _json(self, args: list[str], what: str):
        out = gh(args, optional=True)
        if not out.strip():
            # 빈 문자열은 gh 실패다. 정상 응답은 최소 `[]` 를 준다.
            raise RelateFetchError(what)
        try:
            return json.loads(out)
        except json.JSONDecodeError as exc:
            raise RelateFetchError(what) from exc

    def comments(self, issue: int) -> list[dict]:
        return self._json(["api", "--paginate",
                           f"repos/{self.slug}/issues/{issue}/comments?per_page=100"],
                          "코멘트")

    def timeline(self, issue: int) -> list[dict]:
        return self._json(["api", "--paginate",
                           f"repos/{self.slug}/issues/{issue}/timeline?per_page=100"],
                          "타임라인")

    def open_prs(self, limit: int) -> list[dict]:
        return self._json(["pr", "list", "-R", self.slug, "--state", "open",
                           "--limit", str(limit), "--json",
                           "number,title,body,headRefOid,updatedAt"],
                          "열린 PR 목록")

    def pr_files(self, number: int) -> list[str]:
        raw = self._json(["api", "--paginate",
                          f"repos/{self.slug}/pulls/{number}/files?per_page=100"],
                         f"PR #{number} 변경 파일")
        return [f.get("filename") for f in raw if f.get("filename")]


# ── 변경 파일 캐시 ───────────────────────────────────────────
def cache_path() -> Path:
    """프로세스 밖 캐시. 저장소 트리에는 쓰지 않는다 —
    소급 적용이 워킹 트리를 더럽히면 그 다음 게이트가 그것을 드리프트로 읽는다."""
    env = os.environ.get("ATLAS_TRIAGE_PR_CACHE")
    return Path(env) if env else Path(tempfile.gettempdir()) / "atlas-triage-pr-files.json"


def cache_key(slug: str, number: int, sha: str) -> str:
    """번호가 아니라 **번호+head SHA** 로 캐시한다.

    PR 에 커밋이 하나 붙으면 변경 파일이 달라진다. 번호만으로 캐시하면
    낡은 목록으로 교집합을 판정하고, 그 오답은 캐시가 만료될 때까지 계속 나온다.
    """
    return f"{slug}#{number}@{sha or 'unknown'}"


def load_cache() -> dict:
    try:
        raw = json.loads(cache_path().read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return raw if isinstance(raw, dict) else {}


def save_cache(cache: dict, ttl: int) -> None:
    """만료된 항목을 떨어내고 쓴다. 실패해도 조용히 넘어간다 —
    캐시를 못 써서 판정을 못 내는 것은 앞뒤가 바뀐 일이다."""
    now = time.time()
    pruned = {k: v for k, v in cache.items()
              if isinstance(v, dict) and now - v.get("savedAt", 0) < max(ttl, 1)}
    try:
        cache_path().write_text(json.dumps(pruned, ensure_ascii=False), encoding="utf-8")
    except OSError:
        pass


def open_prs_cached(slug: str, limit: int, cfg: dict, api) -> list[dict]:
    """열린 PR 목록도 캐시한다. 파일 목록만 캐시하면 절반만 묶은 것이다.

    소급 적용은 이슈마다 프로세스를 새로 띄우므로, 파일 목록이 전부 캐시에
    맞아도 `gh pr list` 는 이슈 수만큼 나간다 — 열린 이슈 200건이면 200회다.
    한 번 받아 TTL 동안 나눠 쓴다.

    대가: TTL 안에 PR 에 커밋이 붙으면 낡은 head SHA 를 들고 있게 되고,
    그러면 파일 목록도 낡은 것을 재사용한다. 그 창은 cacheTtlSeconds 로 닫혀 있고,
    이슈가 편집되면 그때 다시 판정되므로 틀린 값이 굳지 않는다.
    캐시 키에 limit 을 섞는다 — 상한이 바뀌면 목록의 의미가 달라진다.
    """
    ttl = int(cfg["cacheTtlSeconds"])
    key = f"{slug}#open-prs@{limit}"
    cache = load_cache()
    hit = cache.get(key)
    if isinstance(hit, dict) and time.time() - hit.get("savedAt", 0) < ttl:
        return list(hit.get("prs") or [])
    prs = api.open_prs(limit)
    cache[key] = {"prs": prs, "savedAt": time.time()}
    save_cache(cache, ttl)
    return prs


def pr_files_map(slug: str, prs: list[dict], cfg: dict, api) -> tuple[dict[int, list[str]], list[str]]:
    """열린 PR 의 변경 파일. 캐시를 먼저 보고 없는 것만 긁는다.

    한 PR 조회가 실패해도 나머지는 계속한다. 실패한 번호는 돌려줘서
    코멘트가 "그 PR 은 대조하지 못했다"고 말할 수 있게 한다.
    """
    ttl = int(cfg["cacheTtlSeconds"])
    cache = load_cache()
    now = time.time()
    files: dict[int, list[str]] = {}
    failed: list[str] = []
    dirty = False

    for pr in prs:
        number = pr["number"]
        key = cache_key(slug, number, pr.get("headRefOid") or "")
        hit = cache.get(key)
        if isinstance(hit, dict) and now - hit.get("savedAt", 0) < ttl:
            files[number] = list(hit.get("files") or [])
            continue
        try:
            got = api.pr_files(number)
        except RelateFetchError:
            failed.append(f"#{number}")
            continue
        files[number] = got
        cache[key] = {"files": got, "savedAt": now}
        dirty = True

    if dirty:
        save_cache(cache, ttl)
    return files, failed


# ── 신호 ─────────────────────────────────────────────────────
def is_bot_comment(c: dict) -> bool:
    body = c.get("body") or ""
    login = (c.get("user") or {}).get("login") or ""
    return BOT_MARKER in body or login.endswith("[bot]")


def mention_numbers(text: str, self_number: int) -> set[int]:
    """본문에서 `#N` 을 뽑는다. 자기 번호는 뺀다.

    URL 은 걷는다 — `.../pull/263#3` 같은 앵커가 참조로 오인된다.
    **코드펜스는 걷지 않는다.** `extract_paths` 와 판단이 갈리는 자리라 근거를 남긴다:
    경로는 펜스 안에서 "예시"가 되지만 `#N` 은 펜스 안에서도 그 번호를 가리킨다.
    2026-08-10 실측 — #262 본문의 펜스는 붙여넣은 게이트 로그이고, 그 안의
    `[SYN-03] #256` 은 실제로 그 이슈 얘기다. 펜스를 걷으면 이 이슈의 가장
    구체적인 관계가 통째로 사라진다.
    """
    cleaned = URL_RE.sub(" ", text or "")
    found = {int(m) for m in MENTION_RE.findall(cleaned)}
    return {n for n in found if n != self_number}


def cross_referenced(events: list[dict], self_number: int) -> list[dict]:
    """타임라인의 역참조. `source.issue` 가 있는 것만 센다.

    같은 저장소 밖에서 온 참조는 버린다 — 다른 저장소의 #12 를 이 저장소의
    #12 처럼 적으면 링크가 엉뚱한 곳으로 간다.
    """
    out = []
    for ev in events or []:
        if ev.get("event") != "cross-referenced":
            continue
        src = (ev.get("source") or {}).get("issue") or {}
        number = src.get("number")
        if not isinstance(number, int) or number == self_number:
            continue
        out.append({
            "number": number,
            "kind": "pr" if src.get("pull_request") else "issue",
            "state": src.get("state"),
            "title": src.get("title"),
        })
    return out


def noisy_paths(files: dict[int, list[str]], cfg: dict) -> set[str]:
    """교집합 근거로 세지 않을 경로.

    두 갈래다.
      선언 — `relate.sharedPaths` glob. build.gradle·package.json 처럼
             거의 모든 PR 이 건드리는 파일을 사람이 지목해 둔다.
      관측 — 열린 PR 중 `commonPathPrThreshold` 건 이상이 건드린 경로.
             선언을 아무리 채워도 시기마다 공용이 되는 파일이 생긴다.
             (예: 대규모 리팩터 기간의 라우터 파일)
    둘 다 **정본은 triage-routing.yaml** 이다. 여기에 파일명을 박으면
    노이즈가 바뀔 때마다 봇을 다시 배포해야 한다.
    """
    shared = list(cfg.get("sharedPaths") or [])
    noisy = set()
    threshold = int(cfg.get("commonPathPrThreshold") or 0)
    if threshold > 0:
        counts = Counter(p for fs in files.values() for p in fs)
        noisy |= {p for p, c in counts.items() if c >= threshold}
    if shared:
        for fs in files.values():
            noisy |= {p for p in fs if any(fnmatch.fnmatch(p, g) for g in shared)}
    return noisy


def overlap(paths: list[str], files: dict[int, list[str]], cfg: dict) -> dict[int, list[str]]:
    """이슈 경로 ∩ PR 변경 파일."""
    if not paths:
        return {}
    noisy = noisy_paths(files, cfg)
    wanted = [p for p in paths if p not in noisy]
    if not wanted:
        return {}
    out = {}
    for number, fs in files.items():
        hit = sorted(set(wanted) & set(fs))
        if hit:
            out[number] = hit
    return out


def overlap_paths(paths: list[str]) -> list[str]:
    """교집합에 쓸 경로. **실재 검사를 하지 않는다** — 이유가 있다.

    파트 판정은 `is_safe` 로 실재하는 파일만 근거로 삼는다. 지어낸 경로 위에
    배정이 서면 안 되기 때문이다. 그런데 교집합에서는 그 검사가 정반대로 작동한다 —
    PR 이 **새로 만드는** 파일은 현재 체크아웃에 없다. 실재로 거르면
    "이 이슈가 요구한 파일을 그 PR 이 만들고 있다"는, 가장 알고 싶은 겹침을
    영원히 못 본다.
    대신 형태 검사(`is_wellformed`)는 그대로 지난다 — `..` 탈출·절대경로·
    저장소 밖 루트는 PR 파일 목록과 대조할 값이 아니다.
    """
    return [p for p in paths if is_wellformed(p)]


# ── 판정 ─────────────────────────────────────────────────────
def slug_of(api) -> str:
    """캐시 키에 저장소를 섞기 위한 값. 테스트의 가짜 api 는 slug 가 없을 수 있다."""
    return getattr(api, "slug", "")


def _touch(rels: dict, number: int, kind: str, detail=None, meta: dict | None = None) -> None:
    rel = rels.setdefault(number, {"number": number, "kind": None, "state": None,
                                   "title": None, "signals": {}})
    rel["signals"][kind] = detail
    for key in ("kind", "state", "title"):
        if meta and meta.get(key) and not rel.get(key):
            rel[key] = meta[key]


def gather(*, issue: int, title: str, body: str, paths: list[str], routing: dict,
           api, comments: list[dict] | None = None) -> dict:
    """네 신호를 모아 관계를 만든다.

    신호마다 따로 잡는다. 하나가 실패해도 나머지 셋은 나가야 하고,
    실패한 것은 실패했다고 적어야 한다.
    """
    cfg = config(routing)
    rels: dict[int, dict] = {}
    errors: list[str] = []
    notes: list[str] = []
    # 신호는 넷이지만 **조회 갈래는 셋**이다 — ③과 ④는 같은 PR 목록에서 나온다.
    # 실패율을 신호 수로 세면 PR 목록 하나가 죽었을 때 "절반은 살아 있다"고
    # 잘못 보고한다. 실제로 죽은 것은 세 갈래 중 하나다.
    # 죽은 갈래는 따로 센다 — errors 를 세면 "PR 한 건의 파일 조회 실패" 같은
    # 부분 실패가 갈래 실패와 같은 무게로 잡혀 status 가 failed 로 넘어간다.
    probes = failed_probes = 0

    # ① 언급 — 본문 + 사람이 쓴 코멘트
    probes += 1
    try:
        if comments is None:
            comments = api.comments(issue)
        texts = [f"{title or ''}\n{body or ''}"]
        texts += [(c.get("body") or "") for c in comments if not is_bot_comment(c)]
        for n in mention_numbers("\n".join(texts), issue):
            _touch(rels, n, "mention")
    except RelateFetchError:
        failed_probes += 1
        errors.append("코멘트 조회 — 코멘트 안의 언급은 확인하지 못했습니다")

    # ② 타임라인 역참조
    probes += 1
    try:
        for src in cross_referenced(api.timeline(issue), issue):
            _touch(rels, src["number"], "xref", meta=src)
    except RelateFetchError:
        failed_probes += 1
        errors.append("타임라인 역참조 조회")

    # ③④ 열린 PR — 목록 하나로 둘을 다 본다.
    # 본문 링크(③)와 변경 파일(④)이 같은 목록에서 나오므로 조회가 하나로 묶인다.
    probes += 1
    try:
        limit = int(cfg["maxOpenPullRequests"])
        # 상한+1 을 받아 "더 있는지"를 판별한다. 정확히 상한만큼 받으면
        # 잘린 것인지 딱 그만큼인지 구별할 수 없고, 그 차이를 코멘트에 적어야 한다.
        prs = open_prs_cached(slug_of(api), limit + 1, cfg, api)
        prs = sorted(prs, key=lambda p: p.get("updatedAt") or "", reverse=True)
        if len(prs) > limit:
            notes.append(f"열린 PR 이 상한 {limit}건을 넘어 최근 갱신순 {limit}건만 "
                         "대조했습니다. 나머지 PR 과의 겹침은 확인하지 않았습니다.")
            prs = prs[:limit]

        for pr in prs:
            if issue in {int(n) for n in CLOSING_RE.findall(pr.get("body") or "")}:
                _touch(rels, pr["number"], "closes",
                       meta={"kind": "pr", "state": "open", "title": pr.get("title")})

        files, failed = pr_files_map(slug_of(api), prs, cfg, api)
        if failed:
            errors.append("PR 변경 파일 조회 " + ", ".join(failed[:5])
                          + (f" 외 {len(failed) - 5}건" if len(failed) > 5 else ""))
        shown = int(cfg["maxOverlapPathsShown"])
        for number, hit in overlap(overlap_paths(paths), files, cfg).items():
            pr = next((p for p in prs if p["number"] == number), {})
            _touch(rels, number, "files", {"paths": hit, "shown": shown},
                   meta={"kind": "pr", "state": "open", "title": pr.get("title")})
        # 언급(①)으로만 잡힌 번호의 정체를 이미 받은 목록으로 채운다.
        # 언급마다 `gh issue view` 를 붙이지 않기 위해서다 — 본문에 `#N` 이 열 개면
        # 조회가 열 번 는다. 목록으로 알 수 있는 것만 채우고 모르면 비운 채 둔다.
        # (그래서 코멘트의 `#215` 는 PR 인지 이슈인지 안 적힌 채 나갈 수 있다.
        #  모르는 것을 지어내는 것보다 안 적는 편이 낫다.)
        by_number = {p["number"]: p for p in prs}
        for rel in rels.values():
            pr = by_number.get(rel["number"])
            if pr and not rel["kind"]:
                rel.update({"kind": "pr", "state": "open", "title": pr.get("title")})
    except RelateFetchError:
        failed_probes += 1
        errors.append("열린 PR 조회 — PR 링크와 변경 파일 겹침을 확인하지 못했습니다")

    ordered = sorted(rels.values(),
                     key=lambda r: (min(SIGNAL_RANK[k] for k in r["signals"]), -r["number"]))

    cap = int(cfg["maxRelations"])
    if len(ordered) > cap:
        notes.append(f"연관 후보 {len(ordered)}건 중 신호가 강한 {cap}건만 적었습니다.")
        ordered = ordered[:cap]

    if failed_probes >= probes:
        status = "failed"
    elif errors:
        status = "partial"
    else:
        status = "ok"

    return {"relations": ordered, "errors": errors, "notes": notes, "status": status}


# ── 렌더 ─────────────────────────────────────────────────────
def describe(rel: dict) -> str:
    bits = []
    for kind in sorted(rel["signals"], key=lambda k: SIGNAL_RANK[k]):
        detail = rel["signals"][kind]
        if kind == "files" and isinstance(detail, dict):
            paths = detail.get("paths") or []
            shown = int(detail.get("shown") or 3)
            head = ", ".join(f"`{p}`" for p in paths[:shown])
            more = f" 외 {len(paths) - shown}건" if len(paths) > shown else ""
            bits.append(f"변경 파일 겹침: {head}{more}")
        else:
            bits.append(SIGNAL_LABEL[kind])
    return ", ".join(bits)


def label(rel: dict) -> str:
    if rel.get("kind") == "pr":
        state = {"open": "열림", "OPEN": "열림",
                 "closed": "닫힘", "CLOSED": "닫힘"}.get(rel.get("state") or "", "")
        return f"#{rel['number']} · PR{f'({state})' if state else ''}"
    return f"#{rel['number']}"


def render_section(result: dict) -> list[str]:
    """관계 섹션. 세 상태가 코멘트에서 서로 다른 모양이어야 한다 —
    관계 있음 / 관계 없음 / 조회 실패."""
    out = ["", "## 연관 (자동 탐지)", ""]

    if not result["relations"]:
        if result["status"] == "failed":
            out.append("- 관계 조회에 **실패**했습니다. 연관이 없다는 뜻이 아니라 "
                       "확인하지 못했다는 뜻입니다.")
        elif result["status"] == "partial":
            # 여기가 가장 오해하기 쉬운 자리다. 살아남은 신호에서 0건인 것과
            # 전부 0건인 것은 다르고, 그 차이를 문장이 말해야 한다.
            out.append("- 확인에 성공한 신호에서는 연관이 없었습니다. "
                       "아래 실패한 신호는 **확인하지 못했습니다**.")
        else:
            out.append("- 검증 가능한 연관 신호가 없습니다 — 언급·역참조·PR 링크·"
                       "변경 파일 겹침 모두 0건입니다.")

    for rel in result["relations"]:
        out.append(f"- {label(rel)} — {describe(rel)}")

    for err in result["errors"]:
        out.append(f"- 조회 실패: {err}")
    for note in result["notes"]:
        out.append(f"- 참고: {note}")
    return out


# ── 단독 실행 (확인용) ───────────────────────────────────────
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--issue", type=int, required=True)
    ap.add_argument("--path", action="append", default=[])
    args = ap.parse_args()

    routing = yaml.safe_load(ROUTING.read_text(encoding="utf-8"))
    project = yaml.safe_load((ATLAS_DIR / "project.yaml").read_text(encoding="utf-8"))
    slug = project["repo"]

    raw = json.loads(gh(["issue", "view", str(args.issue), "-R", slug,
                         "--json", "number,title,body"]))
    paths = args.path or extract_paths(f"{raw['title']}\n{raw.get('body') or ''}")
    result = gather(issue=args.issue, title=raw["title"], body=raw.get("body") or "",
                    paths=paths, routing=routing, api=GhApi(slug))
    print("\n".join(render_section(result)).strip())
    print(f"\n상태: {result['status']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
