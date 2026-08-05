#!/usr/bin/env bash
#
# H-02 — compute SPKI pins for every host the app actually talks to.
#
# The pin-set covered 2 of 8 hosts because the host list lived in one place and
# the pin-set in another, and nobody reconciled them. This script reads the same
# inventory the build guard reads (the apiUrls block of environments/*.js, plus
# any baseURL literal left in src/) so the two cannot disagree, and prints the
# chain for each host with the SHA-256 SPKI hash of every certificate in it.
#
#   ./scripts/compute-spki-pins.sh                 every host in the inventory
#   ./scripts/compute-spki-pins.sh neobank.azurewebsites.net   just this one
#
# WHICH HASH TO PIN: the INTERMEDIATE, not the leaf. A leaf pin breaks on every
# certificate renewal — the prod leaf expires 2026-12-13. Take a second pin from
# the root as backup, so a reissue from a different intermediate under the same
# root still validates. Two pins minimum; one pin plus one renewal is an outage
# with no remote recovery.
#
# Then, for each host promoted out of security/pinning-policy.json:
#   android/app/src/main/res/xml/network_security_config.xml   <domain-config>
#   ios/exchangapay/Info.plist                                 NSPinnedDomains
# Both, or the release build fails on the Android/iOS parity check.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

collect_inventory() {
  # apiUrls hosts from each environment. Restricted to that block on purpose:
  # oAuthConfig holds an `audience` that looks like a URL but is an identifier,
  # and the Sentry DSN is not a host the pin-set governs.
  awk '
    /apiUrls[[:space:]]*:[[:space:]]*\{/ { inblock = 1 }
    inblock && /https?:\/\// {
      line = $0
      while (match(line, /https?:\/\/[^\/"'"'"'[:space:]]+/)) {
        host = substr(line, RSTART, RLENGTH)
        sub(/^https?:\/\//, "", host)
        print host
        line = substr(line, RSTART + RLENGTH)
      }
    }
    inblock && /^[[:space:]]*\},[[:space:]]*$/ { inblock = 0 }
  ' "$REPO_ROOT"/environments/dev.js "$REPO_ROOT"/environments/tst.js \
    "$REPO_ROOT"/environments/prod.js 2>/dev/null

  # Any baseURL literal still in src/. After H-01 there should be none.
  grep -rhoE 'baseURL[[:space:]]*:[[:space:]]*["'"'"'`][[:space:]]*https?://[^/"'"'"'`[:space:]]+' \
    "$REPO_ROOT/src" 2>/dev/null | sed -E 's#.*https?://##'
}

print_chain() {
  local host="$1"
  echo
  echo "==================================================================="
  echo "  $host"
  echo "==================================================================="

  local chain
  chain="$(openssl s_client -servername "$host" -connect "$host:443" -showcerts \
             </dev/null 2>/dev/null)"

  if [ -z "$chain" ]; then
    echo "  UNREACHABLE — no TLS handshake. Check the host and your network."
    return
  fi

  # Walk the chain one certificate at a time. Position 0 is the leaf; the last
  # is the highest intermediate the server sends. The root is usually NOT sent —
  # take its hash from the trust store or the CA's published value.
  local cert="/tmp/spki-$$-cert.pem"
  rm -f "$cert"
  local index=0

  while IFS= read -r line; do
    printf '%s\n' "$line" >> "$cert"
    [ "$line" = "-----END CERTIFICATE-----" ] || continue

    subject="$(openssl x509 -in "$cert" -noout -subject 2>/dev/null)"
    expiry="$(openssl x509 -in "$cert" -noout -enddate 2>/dev/null)"
    pin="$(openssl x509 -in "$cert" -pubkey -noout 2>/dev/null \
             | openssl pkey -pubin -outform der 2>/dev/null \
             | openssl dgst -sha256 -binary \
             | openssl enc -base64)"

    case "$index" in
      0) role="leaf         (do NOT pin — breaks on renewal)" ;;
      1) role="intermediate (PIN THIS)" ;;
      *) role="ca           (backup pin candidate)" ;;
    esac

    echo
    echo "  [$index] $role"
    echo "      ${subject#subject=}"
    echo "      ${expiry#notAfter=}"
    echo "      SHA-256 SPKI: $pin"

    index=$((index + 1))
    rm -f "$cert"
  done < <(printf '%s\n' "$chain" | awk '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/')

  rm -f "$cert"
}

if [ "$#" -gt 0 ]; then
  hosts="$*"
else
  hosts="$(collect_inventory | tr ' ' '\n' | sort -u)"
fi

if [ -z "$hosts" ]; then
  echo "No hosts found. Is environments/*.js missing its apiUrls block?" >&2
  exit 1
fi

echo "Hosts in the inventory:"
echo "$hosts" | sed 's/^/  /'

for host in $hosts; do
  print_chain "$host"
done

echo
echo "-------------------------------------------------------------------"
echo "Currently pinned (Android):"
grep -oE '<domain[^>]*>[^<]+</domain>' \
  "$REPO_ROOT/android/app/src/main/res/xml/network_security_config.xml" \
  | sed -E 's#<[^>]+>##g' | sed 's/^/  /'
echo
echo "Deliberately unpinned (security/pinning-policy.json):"
grep -oE '"host"[[:space:]]*:[[:space:]]*"[^"]+"' "$REPO_ROOT/security/pinning-policy.json" \
  | sed -E 's/.*"host"[[:space:]]*:[[:space:]]*"([^"]+)"/  \1/'
