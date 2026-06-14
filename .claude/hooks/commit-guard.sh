#!/usr/bin/env bash
# PostToolUse(Bash) hook — BangCheck commit message guard
# Warns (does not block) when git commit message format is non-conventional.
# Expected format: type(scope): description #이슈번호

INPUT=$(cat)

COMMAND=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    print(d.get('input', {}).get('command', ''))
except:
    print('')
" 2>/dev/null)

# Only check git commit commands
[[ "$COMMAND" != *"git commit"* ]] && exit 0

# Extract -m message (handles both single and double quotes)
MSG=$(echo "$COMMAND" | sed -E 's/.*-m ["'"'"']([^"'"'"']+)["'"'"'].*/\1/')
[ -z "$MSG" ] || [ "$MSG" = "$COMMAND" ] && exit 0

# Validate: type[(scope)]: description #NNN  (grep -E, macOS compatible)
PATTERN='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\([^)]+\))?: .+ #[0-9]+'
if ! echo "$MSG" | grep -qE "$PATTERN"; then
  echo "" >&2
  echo "[commit-guard] ⚠️  커밋 메시지 형식 불일치" >&2
  echo "  입력  : $MSG" >&2
  echo "  권장  : feat(scope): 설명 #이슈번호" >&2
  echo "  예시  : fix(auth): refresh token MISSING 처리 #214" >&2
  echo "" >&2
fi

exit 0
