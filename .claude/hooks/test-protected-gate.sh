#!/usr/bin/env bash
# ============================================================
# protected-gate.sh 검사
# ------------------------------------------------------------
# 왜 이 파일이 있나 (#220)
#   훅은 2026-06-14 부터 66일간 아무것도 막지 못했는데 아무도 몰랐다.
#   훅에는 "돌았다"는 신호만 있고 "막았다"는 신호가 없기 때문이다.
#   게이트를 고치면서 테스트를 같이 두지 않으면 같은 일이 다시 난다.
#
#   그리고 한 번 더 있었다 — 이슈 본문에 "수정안 (검증 완료, 미커밋)" 이라며
#   7개 시나리오 검증표까지 실려 있었지만, 그 코드는 커밋되지 않아 사라졌다.
#   세션 안에서 검증한 것과 저장소에 남은 것은 다르다. 이 파일이 그 차이다.
#
# 실행: bash .claude/hooks/test-protected-gate.sh
# ============================================================

set -uo pipefail

HOOK="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/protected-gate.sh"
REPO_ROOT="$(cd "$(dirname "$HOOK")/../.." && pwd)"

# 캐시를 저장소 밖 임시 디렉터리로 격리한다. 실사용 캐시를 건드리면
# 테스트가 사용자의 다음 편집에 영향을 준다.
SANDBOX="$(mktemp -d)"
trap 'rm -rf "$SANDBOX"' EXIT

ADMIN_LOGIN=$(sed -n 's/^[[:space:]]*admin_login:[[:space:]]*"\{0,1\}\([^"[:space:]]*\)"\{0,1\}.*/\1/p' \
  "$REPO_ROOT/_wood/team-roles.yaml" | head -1)

failures=0

# run <기대exit> <이름> <입력JSON> [계정]
#   계정을 주면 그 값으로 캐시를 심는다 — gh 를 실제로 부르지 않는다.
#   "gh-missing" 을 주면 PATH 를 비워 gh 가 없는 상황을 만든다.
run() {
  local want="$1" name="$2" input="$3" who="${4:-$ADMIN_LOGIN}"
  local cache="$SANDBOX/bangcheck-gate-login.$(id -u)"
  local out rc

  rm -f "$cache"
  if [ "$who" = "gh-missing" ]; then
    # 캐시도 없고 gh 도 없다 → 판정 불가 → 막아야 한다(fail closed).
    out=$(printf '%s' "$input" | env TMPDIR="$SANDBOX" PATH="/usr/bin:/bin" \
          bash -c 'PATH=$(echo "$PATH" | tr ":" "\n" | grep -v gh | tr "\n" ":"); \
                   command -v gh >/dev/null 2>&1 && exit 99; exec bash "$0"' "$HOOK" 2>&1)
    rc=$?
    if [ "$rc" = "99" ]; then
      echo "skip  $name  (이 환경의 PATH 에서 gh 를 제거하지 못했다)"
      return
    fi
  else
    printf '%s' "$who" > "$cache"
    out=$(printf '%s' "$input" | TMPDIR="$SANDBOX" bash "$HOOK" 2>&1)
    rc=$?
  fi

  if [ "$rc" = "$want" ]; then
    echo "ok    $name  (exit $rc)"
  else
    echo "FAIL  $name  기대 exit $want, 실제 $rc"
    [ -n "$out" ] && echo "      출력: $(printf '%s' "$out" | head -2 | tr '\n' ' ')"
    failures=$((failures + 1))
  fi
}

nested() { printf '{"tool_name":"Write","tool_input":{"file_path":"%s"}}' "$1"; }
legacy() { printf '{"file_path":"%s"}' "$1"; }

echo "── 입력 형식 ──"
# 이것이 #220 의 본체다. 실제 호스트가 보내는 중첩 형식에서 판정이 나야 한다.
run 2 "중첩 tool_input.file_path 를 읽는다 — 비-Admin 은 막힌다" \
    "$(nested "$REPO_ROOT/AGENTS.md")" "some-teammate"
run 2 "구형 최상위 file_path 도 계속 동작한다 (하위호환)" \
    "$(legacy "$REPO_ROOT/AGENTS.md")" "some-teammate"
run 0 "빈 입력에 크래시하지 않는다" "" "some-teammate"
run 0 "깨진 JSON 에 크래시하지 않는다" '{"tool_input": {' "some-teammate"
run 0 "JSON 이 배열이어도 크래시하지 않는다" '[1,2,3]' "some-teammate"

echo ""
echo "── 역할 검사 ──"
run 0 "보호 파일 + Admin → 통과" \
    "$(nested "$REPO_ROOT/AGENTS.md")" "$ADMIN_LOGIN"
run 2 "보호 파일 + 비-Admin → 차단" \
    "$(nested "$REPO_ROOT/_wood/team-roles.yaml")" "some-teammate"
run 2 "gh 도 캐시도 없으면 막는다 (fail closed)" \
    "$(nested "$REPO_ROOT/AGENTS.md")" "gh-missing"

echo ""
echo "── 보호 범위 ──"
# (b) 옛 판본은 `.github/` 전체를 잠갔다. 그대로 두고 입력만 고치면
#     새 워크플로 추가 같은 정상 작업이 부당하게 막힌다.
run 0 "보호되지 않는 워크플로는 막지 않는다 (.github/ 전체 잠금이 아니다)" \
    "$(nested "$REPO_ROOT/.github/workflows/atlas-resolve.yml")" "some-teammate"
run 2 "보호 목록에 있는 워크플로는 막는다" \
    "$(nested "$REPO_ROOT/.github/workflows/protected-files.yml")" "some-teammate"
run 0 "일반 소스는 막지 않는다" \
    "$(nested "$REPO_ROOT/frontend/src/app/router.tsx")" "some-teammate"
run 0 "docs/impl 은 보호 대상이 아니다" \
    "$(nested "$REPO_ROOT/docs/impl/ver1.1/be.md")" "some-teammate"
run 2 "docs/spec 아래는 보호 대상이다" \
    "$(nested "$REPO_ROOT/docs/spec/functional-spec.md")" "some-teammate"
run 2 "훅 자신도 보호 대상이다" \
    "$(nested "$REPO_ROOT/.claude/hooks/protected-gate.sh")" "some-teammate"

echo ""
echo "── 경로 앵커링 ──"
# 옛 판본은 절대경로 부분일치라 저장소 밖 동명 파일까지 잡았다.
run 0 "저장소 밖 같은 이름 파일은 이 훅의 일이 아니다" \
    "$(nested "/tmp/other-repo/AGENTS.md")" "some-teammate"
# 접두만 같은 경로가 걸리면 정상 작업이 막힌다.
run 0 "접두만 같은 디렉터리는 걸리지 않는다 (docs/spec- ≠ docs/spec/)" \
    "$(nested "$REPO_ROOT/docs/spec-draft/x.md")" "some-teammate"
run 2 "저장소 루트 기준 상대경로도 판정한다" \
    "$(nested "AGENTS.md")" "some-teammate"

echo ""
if [ "$failures" -gt 0 ]; then
  echo "실패 ${failures}건"
  exit 1
fi
echo "통과 — 게이트가 실제로 막고, 막지 말아야 할 것은 통과시킨다"
