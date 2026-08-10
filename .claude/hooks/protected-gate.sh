#!/usr/bin/env bash
# ============================================================
# PreToolUse(Write|Edit) hook — BangCheck protected file gate
# ------------------------------------------------------------
# Admin 이 아닌 세션이 Admin 전용 보호 파일을 고치는 것을 막는다.
# exit 2 = 차단(메시지는 stderr), exit 0 = 통과.
#
# 왜 다시 썼나 (#220)
#   옛 판본은 stdin JSON 의 **최상위**에서 file_path 를 읽었다. 그런데
#   Claude Code 의 PreToolUse 입력은 `tool_input.file_path` 에 중첩돼 있어
#   값이 항상 빈 문자열이었고, 바로 다음 줄의 `[ -z ... ] && exit 0` 이
#   전부를 통과시켰다. 훅은 돌았지만 66일간 아무것도 막지 못했다.
#
#   실측 (2026-08-10, 옛 판본):
#     {"tool_name":"Write","tool_input":{"file_path":".../AGENTS.md"}}  → exit 0
#     {"file_path":".../AGENTS.md"}                                     → exit 2
#
#   "돈다"와 "받아들여진다"는 다르다. 실행된 것만 보고 green 으로 적으면
#   이런 것이 그대로 남는다.
#
# 하나만 고치면 나머지가 터진다 — 그래서 셋을 함께 고쳤다
#   (a) 입력 경로   `tool_input.file_path` 를 읽는다 (구형 최상위도 함께 본다)
#   (b) 보호 범위   옛 판본은 `.github/` **전체**를 잠갔다. AGENTS.md 가
#                   보호하는 것은 그 아래 셋뿐이라, (a) 만 고치면 새 워크플로
#                   추가 같은 정상 작업이 부당하게 막힌다.
#   (c) 역할 검사   AGENTS.md 는 `gh api user` 를 team-roles.yaml 의
#                   admin_login 과 대조하라고 이미 선언했는데 훅에 그 절차가
#                   없었다. (a) 만 고치면 Admin 본인도 자기 파일을 못 고친다.
#
# 정본은 AGENTS.md 의 "Protected Files — DO NOT MODIFY" 목록이다.
# 이 파일의 PROTECTED 배열은 그 목록과 **같은 항목·같은 순서**여야 한다.
# ============================================================

set -uo pipefail

INPUT=$(cat)

# ── 1. 대상 경로 ────────────────────────────────────────────
# `tool_input.file_path` 가 실제 형식이다. 최상위 `file_path`/`path` 도
# 함께 보는 것은 하위호환이지 대안이 아니다 — 옛 형식으로 부르는 호스트가
# 있어도 같은 판정이 나가야 한다.
FILE_PATH=$(printf '%s' "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    print(''); raise SystemExit
if not isinstance(d, dict):
    print(''); raise SystemExit
ti = d.get('tool_input')
ti = ti if isinstance(ti, dict) else {}
print(ti.get('file_path') or ti.get('path')
      or d.get('file_path') or d.get('path') or '')
" 2>/dev/null)

# 경로를 못 읽은 것은 "보호 대상이 아니다"가 아니라 "모른다"다.
# 그래도 통과시킨다 — 훅은 Write/Edit 이외의 입력으로도 불릴 수 있고,
# 여기서 죽이면 도구 전체가 멈춘다. 대신 아래 판정이 경로 없이는
# 아무것도 하지 않으므로, 이 통과가 보호를 무르게 하지는 않는다.
[ -z "$FILE_PATH" ] && exit 0

# ── 2. 저장소 루트 기준 상대경로로 앵커링 ───────────────────
# 옛 판본은 절대경로에 `*"$pat"*` 부분일치를 걸었다. 그러면
# `/tmp/other-repo/AGENTS.md` 처럼 **이 저장소 밖** 파일까지 잡히고,
# 반대로 `docs/spec-draft/x.md` 처럼 접두만 같은 파일도 잡힌다.
REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

case "$FILE_PATH" in
  /*)
    # 저장소 밖이면 이 훅이 판단할 일이 아니다.
    case "$FILE_PATH" in
      "$REPO_ROOT"/*) REL="${FILE_PATH#"$REPO_ROOT"/}" ;;
      *) exit 0 ;;
    esac
    ;;
  *) REL="$FILE_PATH" ;;
esac

# ── 3. 보호 목록 — AGENTS.md 와 같은 항목·같은 순서 ─────────
# `/` 로 끝나면 그 아래 전부, 아니면 정확히 그 파일.
PROTECTED=(
  "AGENTS.md"
  "CLAUDE.md"
  "GEMINI.md"
  ".cursorrules"
  ".claude/commands/"
  ".claude/hooks/"
  ".claude/settings.json"
  ".github/CODEOWNERS"
  ".github/copilot-instructions.md"
  ".github/workflows/protected-files.yml"
  ".github/workflows/compliance-guard.yml"
  "_wood/workflows/"
  "_wood/agents/"
  "_wood/team-roles.yaml"
  "_wood/milestone-meta.yaml"
  "_wood/context/"
  "docs/team-conventions.md"
  "docs/spec/"
)

RULE=""
for pat in "${PROTECTED[@]}"; do
  case "$pat" in
    */) [ "${REL##"$pat"}" != "$REL" ] && RULE="$pat" ;;
    *)  [ "$REL" = "$pat" ] && RULE="$pat" ;;
  esac
  [ -n "$RULE" ] && break
done

# 보호 대상이 아니면 조용히 통과한다. 네트워크 호출도 여기서 끝나므로
# 흔한 편집(대부분의 파일)에는 비용이 0 이다.
[ -z "$RULE" ] && exit 0

# ── 4. 역할 검사 ────────────────────────────────────────────
# 여기부터가 보호 경로다. 판정 못 하면 **막는다**(fail closed) —
# "확인 못 했다"를 통과로 적으면 게이트가 아니라 장식이다.
ROLES="$REPO_ROOT/_wood/team-roles.yaml"

block() {
  echo "BLOCKED: '$REL' is Admin-protected (rule: $RULE)." >&2
  echo "$1" >&2
  echo "정본: AGENTS.md 'Protected Files — DO NOT MODIFY'" >&2
  exit 2
}

[ -f "$ROLES" ] || block "team-roles.yaml 을 찾지 못해 역할을 판정할 수 없습니다."

ADMIN_LOGIN=$(sed -n 's/^[[:space:]]*admin_login:[[:space:]]*"\{0,1\}\([^"[:space:]]*\)"\{0,1\}.*/\1/p' \
  "$ROLES" | head -1)
[ -n "$ADMIN_LOGIN" ] || block "team-roles.yaml 에서 admin_login 을 읽지 못했습니다."

# 로그인 조회는 캐시한다. 보호 경로에 걸렸을 때만 도는 데다 60분 캐시라
# 실제 호출은 세션당 한 번 수준이다.
CACHE="${TMPDIR:-/tmp}/bangcheck-gate-login.$(id -u)"
CURRENT_LOGIN=""
if [ -f "$CACHE" ]; then
  # find 로 나이를 본다 — stat 의 플래그가 macOS 와 Linux 에서 다르다.
  if [ -n "$(find "$CACHE" -mmin -60 2>/dev/null)" ]; then
    CURRENT_LOGIN=$(cat "$CACHE" 2>/dev/null)
  fi
fi

if [ -z "$CURRENT_LOGIN" ]; then
  command -v gh >/dev/null 2>&1 \
    || block "gh CLI 가 없어 현재 계정을 확인할 수 없습니다. 'gh auth login' 후 다시 시도하세요."
  CURRENT_LOGIN=$(gh api user --jq .login 2>/dev/null)
  [ -n "$CURRENT_LOGIN" ] \
    || block "gh 로 현재 계정을 확인하지 못했습니다. 'gh auth status' 를 확인하세요."
  printf '%s' "$CURRENT_LOGIN" > "$CACHE" 2>/dev/null || true
fi

if [ "$CURRENT_LOGIN" != "$ADMIN_LOGIN" ]; then
  block "현재 계정 '$CURRENT_LOGIN' 은 Admin($ADMIN_LOGIN) 이 아닙니다."
fi

# Admin 이다. 통과시키되 무엇을 왜 통과시켰는지는 남긴다 —
# 조용한 통과와 구별되어야 나중에 되짚을 수 있다.
echo "protected-gate: '$REL' (rule: $RULE) — Admin($CURRENT_LOGIN) 이므로 허용" >&2
exit 0
