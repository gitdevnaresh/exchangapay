#!/usr/bin/env bash
# Hosts from .env* and https:// literals in src/. --resolvable skips *_AUDIENCE.

collect_inventory() {
  local resolvable=0
  [ "${1:-}" = "--resolvable" ] && resolvable=1

  local root="${REPO_ROOT:?REPO_ROOT must be set}"
  local env_file

  for env_file in "$root"/.env "$root"/.env.*; do
    [ -f "$env_file" ] || continue
    case "$(basename "$env_file")" in .env.example) continue ;; esac

    grep -vE '^[[:space:]]*(#|$)' "$env_file" \
      | { if [ "$resolvable" -eq 1 ]; then grep -vE '^[[:space:]]*[A-Z0-9_]*AUDIENCE[[:space:]]*='; else cat; fi; } \
      | grep -oE '=[[:space:]]*["'"'"']?https?://[^/"'"'"'[:space:]]+' \
      | sed -E 's#^=[[:space:]]*["'"'"']?https?://##; s#^[^@]*@##; s#:[0-9]+$##'

    grep -E '^[[:space:]]*[A-Z0-9_]*(ISSUER|DOMAIN|HOST)[[:space:]]*=' "$env_file" \
      | sed -E 's#^[^=]*=[[:space:]]*["'"'"']?##; s#["'"'"'[:space:]].*$##; s#/.*$##' \
      | grep -E '^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  done

  grep -rhE 'https://' "$root/src" \
      --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
      --exclude-dir='__tests__' --exclude='*.test.*' --exclude='*.spec.*' 2>/dev/null \
    | grep -vE '^[[:space:]]*(//|\*|/\*)' \
    | grep -oE 'https://[A-Za-z0-9.-]+\.[A-Za-z]{2,}' \
    | sed -E 's#^https://##'
}

require_inventory() {
  local hosts
  hosts="$(collect_inventory "$@" | tr 'A-Z' 'a-z' | sort -u)"
  if [ -z "$hosts" ]; then
    echo "Host inventory is EMPTY — refusing to report success." >&2
    echo "Looked in: $REPO_ROOT/.env* (URL values) and https:// literals in $REPO_ROOT/src." >&2
    echo "Run 'npm run env:<dev|tst|prod>' to create .env, or fix scripts/lib/host-inventory.sh." >&2
    exit 1
  fi
  printf '%s\n' "$hosts"
}
