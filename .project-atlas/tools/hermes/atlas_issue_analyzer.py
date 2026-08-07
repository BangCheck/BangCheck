#!/usr/bin/env python3
"""2단 — 이슈를 읽고 코드에서 근거 경로를 찾는다.

1단(GitHub Actions)이 근거 경로를 못 찾은 이슈만 여기로 온다.

LLM 에게 무엇을 시키는가
  **배정이 아니라 경로 탐색이다.**
  "이건 프론트야"는 검증할 방법이 없다. "이 증상은 이 파일에서 난다"는
  파일이 실재하는지 확인할 수 있고, 틀리면 사람이 열어보고 안다.
  배정은 triage_route.py 의 규칙이 한다 — 1단과 같은 규칙이다.

실패를 값으로 돌린다
  타임아웃·hermes 부재·JSON 아닌 답·지어낸 경로 — 전부 예외가 아니라 상태값이다.
  교차검증 때는 traceback 으로 죽거나(TimeoutExpired·FileNotFoundError)
  실패했는데 성공으로 보고했다(check=False).
  실패가 조용히 흐르면 큐가 그 이슈를 처리했다고 착각한다.

큐를 쓴다
  한 번 실패한 이슈가 유실되지 않게 attempt 를 기록하고 재시도한다.
  상한에 닿으면 포기 상태로 남겨 사람이 볼 수 있게 한다.

왜 --provider 를 명시하는가
  2026-08-05 실측: HERMES_HOME 을 걸어도 `hermes -z` 는 provider 를 기본값에서
  못 읽고 "No LLM provider configured" 로 죽는다. 명시하면 돈다.

RPA 봇과 섞지 않는다
  ~/HermesHome/scripts/ 의 PR watcher/analyzer 는 woo-world 의 RPA 저장소 5개를
  본다. 그쪽을 건드리지 않고 이 프로필 안에서만 돈다.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# 경로를 환경변수로 받는다. 절대경로를 박으면 그 머신 밖에서는 테스트조차 못 한다 —
# 실제로 처음에 그렇게 짰다가 로컬 테스트가 ModuleNotFoundError 로 막혔다.
HOME_DIR = Path(os.environ.get("BANGCHECK_HERMES_HOME", "/Users/woojongho/HermesHome"))
PROFILE = HOME_DIR / "profiles" / "bangcheck"
REPO = Path(os.environ.get("BANGCHECK_REPO", str(HOME_DIR / "repos" / "bangcheck")))
STATE = Path(os.environ.get("BANGCHECK_STATE", str(PROFILE / "state" / "issue-triage.json")))
HERMES = os.environ.get("BANGCHECK_HERMES_BIN", "/Users/woojongho/.local/bin/hermes")
MODEL = "gpt-5.6-luna"
PROVIDER = "openai-codex"
SLUG = "BangCheck/BangCheck"

MAX_PATHS = 3
MAX_ATTEMPTS = 3
LLM_TIMEOUT = 240      # 600 은 근거 없이 길었다. 한 건이 10분을 점유한다
BODY_LIMIT = 12000     # 4000 은 본문 뒤쪽의 핵심 증상을 잘랐다

PROMPT = """이 저장소에서 아래 이슈가 가리키는 코드 위치를 찾아라.

너는 파일을 읽을 수 있다. 추측하지 말고 **실제로 찾아보고** 답하라.
프론트는 frontend/src, 백엔드는 backend/src/main/java 다.

이슈 #{number}
제목: {title}
본문:
{body}

요구
- 이 증상이 나는 소스 **파일** 경로를 최대 {max_paths}개까지.
- 경로는 저장소 루트 기준이고 확장자까지 적는다.
  예: frontend/src/features/rooms/pages/RoomsPage.tsx
- 디렉터리만 적지 마라. 파일이어야 한다.
- **확신이 없으면 빈 목록을 답하라.** 지어낸 경로는 틀린 사람을 부른다.
- 배정·담당자·심각도를 말하지 마라. 경로와 이유만.

출력은 이 JSON 하나뿐이다. 앞뒤에 다른 말을 쓰지 마라.
{{"paths": ["..."], "reason": "왜 그 파일이라고 보는지 한 문장"}}
"""


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _routing_module():
    """저장소의 triage_route 를 쓴다. 1단과 같은 규칙이어야 하므로 복제하지 않는다."""
    p = str(REPO / ".project-atlas" / "tools")
    if p not in sys.path:
        sys.path.insert(0, p)
    import triage_route
    return triage_route


def gh(args: list[str], *, optional: bool = False) -> str:
    try:
        p = subprocess.run(["gh", *args], capture_output=True, text=True, timeout=60)
    except (OSError, subprocess.SubprocessError) as e:
        print(f"gh 실행 실패: {e}", file=sys.stderr)
        if optional:
            return ""
        raise SystemExit(1)
    if p.returncode != 0:
        print(f"gh 실패: {' '.join(args[:4])} — {p.stderr.strip()[:200]}", file=sys.stderr)
        if optional:
            return ""
        raise SystemExit(1)
    return p.stdout


def _json_objects(text: str):
    """중괄호 균형을 세어 최상위 JSON 객체를 앞에서부터 내놓는다.

    `\\{.*\\}` 는 greedy 라 JSON 이 둘이면 하나로 붙여 읽어 파싱이 깨지고,
    산문 속 `{이렇습니다}` 까지 함께 삼킨다.
    """
    depth, start = 0, None
    for i, ch in enumerate(text):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}" and depth:
            depth -= 1
            if depth == 0 and start is not None:
                yield text[start:i + 1]
                start = None


def parse_llm_output(text: str) -> dict | None:
    """스키마를 지킨 첫 JSON 을 찾는다. 못 찾으면 None.

    스키마를 경계에서 강제한다 — paths 가 문자열이거나 원소가 int 면
    뒤의 경로 검사에서 터진다.
    """
    for blob in _json_objects(text or ""):
        try:
            data = json.loads(blob)
        except json.JSONDecodeError:
            continue
        if not isinstance(data, dict):
            continue
        paths = data.get("paths")
        if not isinstance(paths, list) or not all(isinstance(p, str) for p in paths):
            continue
        return {"paths": paths[:MAX_PATHS], "reason": data.get("reason")}
    return None


def ask_llm(number: int, title: str, body: str | None) -> dict | None:
    """hermes 를 한 번 부른다. 어떤 실패든 None 으로 돌린다 —
    예외로 죽으면 큐가 그 이슈를 처리했는지 알 수 없다."""
    env = dict(os.environ, HERMES_HOME=str(HOME_DIR))
    prompt = PROMPT.format(number=number, title=title,
                           body=(body or "")[:BODY_LIMIT], max_paths=MAX_PATHS)
    try:
        p = subprocess.run(
            [HERMES, "-z", prompt, "-m", MODEL, "--provider", PROVIDER, "--cli"],
            capture_output=True, text=True, env=env, timeout=LLM_TIMEOUT, cwd=str(REPO),
        )
    except subprocess.TimeoutExpired:
        print(f"hermes 타임아웃 {LLM_TIMEOUT}s", file=sys.stderr)
        return None
    except (OSError, subprocess.SubprocessError) as e:
        print(f"hermes 실행 실패: {e}", file=sys.stderr)
        return None
    if p.returncode != 0:
        print(f"hermes 오류: {p.stderr.strip()[:300]}", file=sys.stderr)
        return None
    return parse_llm_output(p.stdout)


def should_skip(text: str) -> bool:
    """1단이 이미 처리했을 이슈인가.

    '경로 표기가 있다'가 아니라 '**실재하는** 경로가 있다'로 판정한다.
    표기만 보고 건너뛰면, 1단이 실재 검사에서 걸러 미분류를 낸 이슈가
    2단에서도 버려져 영영 분류되지 않는다.
    """
    tr = _routing_module()
    return any(tr.is_safe(p) for p in tr.extract_paths(text))


def load_state() -> dict:
    try:
        return json.loads(STATE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"issues": {}}


def save_state(state: dict) -> None:
    STATE.parent.mkdir(parents=True, exist_ok=True)
    tmp = STATE.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(STATE)


def record(state: dict, number: int, status: str, **extra) -> None:
    entry = state["issues"].setdefault(str(number), {"attempts": 0})
    entry.update({"status": status, "at": now(), **extra})
    save_state(state)


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: atlas_issue_analyzer.py <issue-number>", file=sys.stderr)
        return 2
    number = int(sys.argv[1])
    state = load_state()
    entry = state["issues"].setdefault(str(number), {"attempts": 0})

    if entry.get("status") == "routed":
        print(json.dumps({"issue": number, "status": "done"}, ensure_ascii=False))
        return 0
    if entry["attempts"] >= MAX_ATTEMPTS:
        print(json.dumps({"issue": number, "status": "gave-up",
                          "attempts": entry["attempts"]}, ensure_ascii=False))
        return 0

    raw = json.loads(gh(["issue", "view", str(number), "-R", SLUG,
                         "--json", "number,title,body"]))

    if should_skip(f"{raw['title']}\n{raw.get('body') or ''}"):
        record(state, number, "skip", reason="본문에 실재하는 경로가 있다 — 1단 소관")
        print(json.dumps({"issue": number, "status": "skip"}, ensure_ascii=False))
        return 0

    entry["attempts"] += 1
    save_state(state)

    found = ask_llm(number, raw["title"], raw.get("body"))
    if found is None:
        record(state, number, "llm-failed", attempts=entry["attempts"])
        print(json.dumps({"issue": number, "status": "llm-failed",
                          "attempts": entry["attempts"]}, ensure_ascii=False))
        return 1

    tr = _routing_module()
    real = [p for p in found["paths"] if tr.is_safe(p)]
    ghost = [p for p in found["paths"] if p not in real]

    if not real:
        record(state, number, "not-found", reason=found.get("reason"), ghost=ghost)
        print(json.dumps({"issue": number, "status": "not-found",
                          "reason": found.get("reason"), "ghost": ghost}, ensure_ascii=False))
        return 0

    args = []
    for p in real:
        args += ["--path", p]
    try:
        cp = subprocess.run(
            [sys.executable, str(REPO / ".project-atlas/tools/triage_comment.py"),
             "--issue", str(number), *args],
            cwd=str(REPO), capture_output=True, text=True, timeout=120,
        )
    except (OSError, subprocess.SubprocessError) as e:
        record(state, number, "comment-failed", error=str(e)[:200])
        print(json.dumps({"issue": number, "status": "comment-failed",
                          "error": str(e)[:200]}, ensure_ascii=False))
        return 1

    # check=False 로 두면 코멘트가 실패해도 routed 로 보고한다.
    if cp.returncode != 0:
        record(state, number, "comment-failed", error=cp.stderr.strip()[:200])
        print(json.dumps({"issue": number, "status": "comment-failed",
                          "error": cp.stderr.strip()[:200]}, ensure_ascii=False))
        return 1

    record(state, number, "routed", paths=real, ghost=ghost, reason=found.get("reason"))
    print(json.dumps({"issue": number, "status": "routed", "paths": real,
                      "ghost": ghost, "reason": found.get("reason")}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
