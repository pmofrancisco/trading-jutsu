#!/usr/bin/env bash
#
# Checks a just-edited file against the architecture rules in AGENTS.md.
#
# The rules there are load-bearing for authorization — a data function that
# skips `requireUser()` is reachable by direct POST — but ESLint enforces none
# of them, so they are checked here instead. Reports violations back to Claude
# as a PostToolUse block; a clean file exits silently.

set -uo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)

payload=$(cat)
file=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .tool_response.filePath // empty' 2>/dev/null)

[ -n "$file" ] && [ -f "$file" ] || exit 0

# Only this app's TypeScript sources have these rules.
case "$file" in
  "$repo_root"/src/*.ts | "$repo_root"/src/*.tsx) ;;
  *) exit 0 ;;
esac

rel=${file#"$repo_root"/}
violations=''

note() {
  violations="${violations}  - $1"$'\n'
}

# Only a feature's data layer may reach the database.
if grep -q "@/lib/ph-stocks-db" "$file"; then
  case "$rel" in
    src/features/*/data/*) ;;
    *) note "imports @/lib/ph-stocks-db outside src/features/*/data/ — only a feature's data layer may touch the database." ;;
  esac
fi

case "$rel" in
  src/features/*/data/*)
    # The page-level check is not the boundary; the data layer is.
    if grep -q '\.query(' "$file" && ! grep -q 'requireUser(' "$file"; then
      note "queries the database without calling requireUser() — every data function must authorize first."
    fi

    # `dto.ts` is types only and erased at compile time, so it has nothing to
    # keep off the client.
    if [ "$(basename "$file")" != 'dto.ts' ] && ! grep -q "^import 'server-only';" "$file"; then
      note "is missing \`import 'server-only';\` — a data module must not be importable from the client."
    fi
    ;;
esac

# Features do not import each other, except from the auth shared kernel.
case "$rel" in
  src/features/*)
    own=${rel#src/features/}
    own=${own%%/*}
    imports=$(grep -oE "(from|import) '@/features/[a-z0-9-]+" "$file" | sed "s|.*@/features/||" | sort -u)
    for imported in $imports; do
      [ "$imported" = "$own" ] && continue
      [ "$imported" = 'auth' ] && continue
      note "imports @/features/$imported from the $own feature — features may only import features/auth."
    done
    ;;
esac

[ -n "$violations" ] || exit 0

reason="$rel violates the architecture rules in AGENTS.md:"$'\n\n'"$violations"$'\n'"Fix the file, then re-check. See AGENTS.md for the reasoning behind each rule."

jq -nc --arg reason "$reason" --arg rel "$rel" \
  '{decision: "block", reason: $reason, systemMessage: "Architecture guard: \($rel) violates AGENTS.md"}'
