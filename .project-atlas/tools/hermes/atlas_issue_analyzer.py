#!/usr/bin/env python3
"""2단 — 이슈를 읽고 코드에서 근거 경로를 찾는다.

1단(GitHub Actions)이 본문에서 경로를 못 찾은 이슈만 여기로 온다.

LLM 에게 무엇을 시키는가
  **배정이 아니라 경로 탐색이다.**
  "이건 프론트야"는 검증할 방법이 없다. "이 증상은 이 파일에서 난다"는
  파일이 실재하는지 확인할 수 있고, 틀리면 사람이 열어보고 안다.
  배정은 triage_route.py 의 규칙이 한다 — 1단과 같은 규칙이다.

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
import re
import subprocess
import sys
from pathlib import Path

PROFILE = Path("/Users/woojongho/HermesHome/profiles/bangcheck")
REPO = Path("/Users/woojongho/HermesHome/repos/bangcheck")
STATE = PROFILE / "state" / "issue-triage.json"
HERMES = "/Users/woojongho/.local/bin/hermes"
MODEL = "gpt-5.6-luna"
PROVIDER = "openai-codex"
SLUG = "BangCheck/BangCheck"

PATH_RE = re.compile(r"(?:frontend|backend)/[A-Za-z0-9_./-]+\.[A-Za-z]{2,4}")

PROMPT = """다음 GitHub 이슈가 가리키는 코드 위치를 찾아라.

저장소는 {repo} 에 클론돼 있다. 프론트는 frontend/src, 백엔드는
backend/src/main/java 다.

이슈 #{number}
제목: {title}
본문:
{body}

요구
- 이 증상이 나는 소스 파일 경로를 최대 3개까지 답하라.
- 경로는 저장소 루트 기준이다. 예: frontend/src/features/rooms/RoomsPage.tsx
- **확신이 없으면 찾지 못했다고 답하라.** 지어낸 경로는 해롭다.
- 배정이나 담당자를 말하지 마라. 경로만 답하라.

출력 형식 — 이 JSON 하나만 출력하고 다른 말을 쓰지 마라.
{{"paths": ["...", "..."], "reason": "왜 그 파일이라고 보는지 한 문장"}}
찾지 못했으면 {{"paths": [], "reason": "..."}}
"""


def gh(args, optional=False):
    p = subprocess.run(["gh", *args], capture_output=True, text=True)
    if p.returncode != 0:
        print(f"gh 실패: {' '.join(args[:4])} — {p.stderr.strip()[:200]}", file=sys.stderr)
        if optional:
            return ""
        raise SystemExit(1)
    return p.stdout


def ask_llm(number, title, body):
    env = dict(os.environ, HERMES_HOME="/Users/woojongho/HermesHome")
    prompt = PROMPT.format(repo=REPO, number=number, title=title, body=(body or "")[:4000])
    p = subprocess.run(
        [HERMES, "-z", prompt, "-m", MODEL, "--provider", PROVIDER, "--cli"],
        capture_output=True, text=True, env=env, timeout=600,
    )
    if p.returncode != 0:
        print(f"hermes 실패: {p.stderr.strip()[:300]}", file=sys.stderr)
        return None
    m = re.search(r"\{.*\}", p.stdout, re.S)
    if not m:
        print(f"LLM 이 JSON 을 내지 않았다: {p.stdout.strip()[:200]}", file=sys.stderr)
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 실패: {e}", file=sys.stderr)
        return None


def main():
    number = int(sys.argv[1])
    raw = json.loads(gh(["issue", "view", str(number), "-R", SLUG,
                         "--json", "number,title,body"]))

    # 이미 본문에 경로가 있으면 1단이 처리했을 일이다. 여기서 또 LLM 을 부르지 않는다.
    if PATH_RE.search(f"{raw['title']}\n{raw.get('body') or ''}"):
        print(json.dumps({"issue": number, "status": "skip",
                          "reason": "본문에 이미 경로가 있다 — 1단 소관"}, ensure_ascii=False))
        return 0

    found = ask_llm(number, raw["title"], raw.get("body"))
    if not found:
        print(json.dumps({"issue": number, "status": "llm-failed"}, ensure_ascii=False))
        return 1

    # 실재하지 않는 경로는 근거가 못 된다. 지어낸 것을 그대로 넘기면
    # 판정이 허구 위에 선다.
    real = [p for p in found.get("paths", []) if (REPO / p).exists()]
    ghost = [p for p in found.get("paths", []) if p not in real]

    if not real:
        print(json.dumps({"issue": number, "status": "not-found",
                          "reason": found.get("reason"), "ghost": ghost},
                         ensure_ascii=False))
        return 0

    args = []
    for p in real:
        args += ["--path", p]
    subprocess.run([sys.executable, str(REPO / ".project-atlas/tools/triage_comment.py"),
                    "--issue", str(number), *args], cwd=REPO, check=False)

    print(json.dumps({"issue": number, "status": "routed", "paths": real,
                      "ghost": ghost, "reason": found.get("reason")}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
