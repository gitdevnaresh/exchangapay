#!/usr/bin/env bash
#
# Does every host the app is configured to reach actually exist?
#
# This script exists because the answer turned out to be no. Four of the eight
# previously configured legacy hosts returned NXDOMAIN from the
# public resolver. The app had been calling them for as long as they were
# hardcoded in src/utils/api.tsx, and nothing said a word: a request to a host
# that does not resolve looks exactly like a request to a host that is briefly
# down, and until H-01 attached a response interceptor there was no telemetry on
# those routes at all.
#
# The pin-coverage guards in app/build.gradle and __tests__/pinningCoverage.test.ts
# assert that every host is pinned or exempt. Neither can assert that a host is
# REAL — that needs the network, which is why this is a script you run rather
# than a test that would go flaky in CI. Run it when adding a host, when a
# feature is reported broken with no obvious cause, and before a release.
#
#   ./scripts/verify-hosts.sh
#
# Exit status is 1 if any host fails to resolve, so it can gate a nightly job.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
failures=0

source "$REPO_ROOT/scripts/lib/host-inventory.sh"

hosts="$(require_inventory --resolvable)" || exit 1
checked=0

printf '%-36s %-18s %s\n' "HOST" "DNS" "TLS"
printf '%-36s %-18s %s\n' "------------------------------------" "------------------" "---"

for host in $hosts; do
  checked=$((checked + 1))
  ip="$(dig +short +time=3 +tries=1 "$host" 2>/dev/null | grep -E '^[0-9]+\.' | head -1)"

  if [ -z "$ip" ]; then
    printf '%-36s %-18s %s\n' "$host" "NXDOMAIN" "-- HOST DOES NOT EXIST"
    failures=$((failures + 1))
    continue
  fi

  subject="$(openssl s_client -servername "$host" -connect "$host:443" </dev/null 2>/dev/null \
              | openssl x509 -noout -subject 2>/dev/null)"
  if [ -z "$subject" ]; then
    printf '%-36s %-18s %s\n' "$host" "$ip" "no TLS handshake"
    failures=$((failures + 1))
  else
    printf '%-36s %-18s %s\n' "$host" "$ip" "${subject#subject=}"
  fi
done

echo
if [ "$failures" -gt 0 ]; then
  echo "$failures host(s) unreachable."
  echo "A host in .env* or src/ that does not resolve means every feature routed"
  echo "through it is dead, and the user sees a spinner. Fix the config or delete the"
  echo "routes. security/pinning-policy.json (lastVerified) records the last survey."
  exit 1
fi

echo "All $checked hosts resolve and complete a TLS handshake."
