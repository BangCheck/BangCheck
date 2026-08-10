#!/usr/bin/env bash
# PreToolUse(Write|Edit) hook — BangCheck protected file gate
# Blocks Admin-only file edits from non-Admin sessions.
# Exit 2 = block with message. Exit 0 = allow.

INPUT=$(cat)

# Extract file_path from JSON input
FILE_PATH=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    print(d.get('file_path') or d.get('path') or '')
except:
    print('')
" 2>/dev/null)

[ -z "$FILE_PATH" ] && exit 0

PROTECTED=(
  "_wood/workflows/"
  "_wood/agents/"
  "_wood/team-roles.yaml"
  "_wood/milestone-meta.yaml"
  "_wood/context/"
  "AGENTS.md"
  "CLAUDE.md"
  "GEMINI.md"
  ".cursorrules"
  ".claude/commands/"
  ".claude/hooks/"
  ".claude/settings.json"
  ".github/"
  "docs/team-conventions.md"
  "docs/spec/"
)

for pat in "${PROTECTED[@]}"; do
  if [[ "$FILE_PATH" == *"$pat"* ]]; then
    echo "BLOCKED: '${FILE_PATH}' is Admin-protected." >&2
    echo "Contact @Woo-JongHo to request changes." >&2
    exit 2
  fi
done

exit 0
