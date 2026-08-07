#!/usr/bin/env bash
#
# M-07 — ATS local networking is a Debug-only exemption.
#
# NSAllowsLocalNetworking=true tells ATS to permit cleartext HTTP to every host
# on the local network: .local names, unqualified hostnames, and the RFC 1918
# ranges. React Native needs exactly that in development — a debug build running
# on a physical device fetches its bundle and opens its HMR/dev-menu websocket
# over http://<mac-lan-ip>:8081 — and needs none of it in a shipped build, where
# every reachable host is an HTTPS API that is also certificate-pinned.
#
# Shipping the key anyway is what the audit flagged: it does not by itself send
# traffic anywhere, but it removes the guard rail that would stop a future
# feature (or a dependency) from quietly consuming plaintext from whatever is
# sitting on the user's coffee-shop Wi-Fi.
#
# An Info.plist has one value per key for every configuration, so the exemption
# cannot be expressed per-configuration in the source file. It is therefore
# absent from ios/exchangapay/Info.plist — the source of truth is release-safe —
# and this script re-adds it to the *built* Info.plist inside the .app when, and
# only when, CONFIGURATION is Debug. Nothing about the developer experience
# changes; the release binary no longer carries the exemption.
#
# For any non-Debug configuration the script does the opposite: it strips the
# Debug keys from the built plist (a no-op when they were never added, e.g. a
# clean Release build) and then fails the build if a cleartext exemption
# survives anywhere in the ATS dictionary. Stripping and then verifying, rather
# than trusting the strip, is deliberate: other build phases write to this same
# plist, so the last word on what shipped has to come from reading it back.
#
# Wired in as the "[M-07] ATS local networking (Debug only)" build phase, which
# runs after the phases that copy/modify the built Info.plist and before
# "[H-07] Release security guards", which re-checks the same file — from source
# as well as from the built product, so a commit that puts the key back in
# Info.plist fails the release build too.

set -uo pipefail

PLIST_BUDDY=/usr/libexec/PlistBuddy
CONFIG="${CONFIGURATION:-}"
BUILT_DIR="${BUILT_PRODUCTS_DIR:-}"
PLIST_PATH="${INFOPLIST_PATH:-}"

if [ -z "$BUILT_DIR" ] || [ -z "$PLIST_PATH" ]; then
  echo "error: [M-07] BUILT_PRODUCTS_DIR/INFOPLIST_PATH are unset. This script is an Xcode build phase; it is not meant to be run by hand."
  exit 1
fi

TARGET_PLIST="${BUILT_DIR}/${PLIST_PATH}"

if [ ! -f "$TARGET_PLIST" ]; then
  # A missing built plist means this phase ran before the Info.plist was copied
  # into the .app. That is a build-phase ordering problem, not a security one:
  # a Debug build loses its dev-server exemption, a Release build is untouched
  # and is still verified from source by [H-07].
  echo "warning: [M-07] built Info.plist not found at ${TARGET_PLIST}; skipping. If a debug build on a physical device cannot reach Metro, move this build phase later in the target's phase list."
  exit 0
fi

# plutil writes its "no value at that key path" complaint to stdout and exits
# non-zero, so the fallback has to be an assignment on failure — `|| echo` would
# leave the error text in the variable and every comparison below would misread.
ats_value() {
  local value
  value=$(plutil -extract "NSAppTransportSecurity.$1" raw -o - "$TARGET_PLIST" 2>/dev/null) || value="missing"
  printf '%s' "$value"
}

ats_delete() {
  "$PLIST_BUDDY" -c "Delete :NSAppTransportSecurity:$1" "$TARGET_PLIST" >/dev/null 2>&1 || true
}

ats_add() {
  # Add-or-set: PlistBuddy's Add fails when the key already exists.
  "$PLIST_BUDDY" -c "Add :NSAppTransportSecurity:$1 $2 $3" "$TARGET_PLIST" >/dev/null 2>&1 ||
    "$PLIST_BUDDY" -c "Set :NSAppTransportSecurity:$1 $3" "$TARGET_PLIST" >/dev/null 2>&1
}

if [ "$CONFIG" = "Debug" ]; then
  # Metro over the LAN, for a debug build installed on a real device.
  ats_add "NSAllowsLocalNetworking" bool true

  # Loopback for the simulator. ATS does not normally stand between the app and
  # 127.0.0.1, but naming localhost explicitly costs nothing and keeps the
  # exemption readable: these two entries are the whole dev-server story.
  "$PLIST_BUDDY" -c "Add :NSAppTransportSecurity:NSExceptionDomains dict" "$TARGET_PLIST" >/dev/null 2>&1 || true
  "$PLIST_BUDDY" -c "Add :NSAppTransportSecurity:NSExceptionDomains:localhost dict" "$TARGET_PLIST" >/dev/null 2>&1 || true
  ats_add "NSExceptionDomains:localhost:NSExceptionAllowsInsecureHTTPLoads" bool true

  echo "note: [M-07] Debug build — local-networking ATS exemption added to the built Info.plist (dev server only; absent from the source plist and never in a Release build)."
  exit 0
fi

# --- Non-Debug: strip, then verify. ---
ats_delete "NSAllowsLocalNetworking"
ats_delete "NSExceptionDomains:localhost"

FAILED=0

LOCAL_NET=$(ats_value "NSAllowsLocalNetworking")
if [ "$LOCAL_NET" != "missing" ] && [ "$LOCAL_NET" != "0" ] && [ "$LOCAL_NET" != "false" ]; then
  echo "error: [M-07] NSAllowsLocalNetworking is enabled in the built Info.plist for configuration '${CONFIG}'. Cleartext to local-network hosts must not ship; it belongs to Debug only."
  FAILED=1
fi

ARBITRARY=$(ats_value "NSAllowsArbitraryLoads")
if [ "$ARBITRARY" != "missing" ] && [ "$ARBITRARY" != "0" ] && [ "$ARBITRARY" != "false" ]; then
  echo "error: [M-07] NSAllowsArbitraryLoads is enabled in the built Info.plist for configuration '${CONFIG}'."
  FAILED=1
fi

# Any per-domain cleartext exemption that survived — including one a pod or a
# future build phase injected, which is the case a source-file check misses.
EXCEPTIONS=$(plutil -extract NSAppTransportSecurity.NSExceptionDomains json -o - "$TARGET_PLIST" 2>/dev/null) || EXCEPTIONS=""
if echo "$EXCEPTIONS" | grep -q 'NSExceptionAllowsInsecureHTTPLoads[^,}]*true'; then
  echo "error: [M-07] the built Info.plist for configuration '${CONFIG}' still allows insecure HTTP loads for at least one domain: ${EXCEPTIONS}"
  FAILED=1
fi

if [ "$FAILED" -ne 0 ]; then
  exit 1
fi

echo "[M-07] '${CONFIG}' build — no cleartext ATS exemptions in the built Info.plist."
