#!/usr/bin/env bash
#
# Firebase project selection and guard for iOS (security finding H-15).
#
# iOS has no equivalent of the Android Gradle plugin's build-type source sets,
# so per-configuration Firebase config needs an explicit build phase. This is it.
#
# HOW TO USE A DIFFERENT PROJECT PER CONFIGURATION
#   Put per-configuration files next to the default one and they are picked up
#   automatically, overwriting the copy Xcode placed in the built app:
#
#     ios/firebase/GoogleService-Info-Release.plist   <- production project
#     ios/firebase/GoogleService-Info-Debug.plist     <- optional
#     ios/GoogleService-Info.plist                    <- fallback, currently test
#
#   The fallback is the file already in the Xcode target, so with no per-config
#   files present this script changes nothing.
#
# THE GUARD is deliberately inert today. The app is pinned to the test tenant
# end to end (bundle id, Auth0 domain, Firebase — see C-05), so today's Release
# builds are legitimately test builds and must keep working. It fires the moment
# the bundle identifier becomes a production one while Firebase still points at
# test — the mistake this finding is about.
#
# Calibration: the API key in these files is NOT a secret. Google documents it
# as an identifier expected to appear in client apps; access is controlled by
# Security Rules and App Check. What matters is which PROJECT receives the data.

set -euo pipefail

PLIST_BUDDY=/usr/libexec/PlistBuddy
DEFAULT_PLIST="${PROJECT_DIR}/GoogleService-Info.plist"
VARIANT_PLIST="${PROJECT_DIR}/firebase/GoogleService-Info-${CONFIGURATION}.plist"
BUNDLED_PLIST="${BUILT_PRODUCTS_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/GoogleService-Info.plist"

# Bundle identifiers that constitute a production build.
# com.exchangapay.app is the live App Store bundle id (App Store id 6480390257).
PRODUCTION_BUNDLE_IDS=("com.exchangapay.app")
# Firebase projects that must never back a production build.
NON_PRODUCTION_PROJECTS=("exchangapay-tst-f570a")
# Any project id containing one of these markers is treated as non-production
# too (M-12), so a future dev/staging project is caught without editing the list.
NON_PRODUCTION_PATTERN='(^|[-_.])(tst|test|dev|stg|stage|staging|uat|qa|sandbox|demo)([-_.0-9]|$)'

# --- 1. select -------------------------------------------------------------

SELECTED="${DEFAULT_PLIST}"
if [[ -f "${VARIANT_PLIST}" ]]; then
  SELECTED="${VARIANT_PLIST}"
  echo "note: [H-15] Using ${CONFIGURATION} Firebase config: ${VARIANT_PLIST}"
  cp "${VARIANT_PLIST}" "${BUNDLED_PLIST}"
else
  echo "note: [H-15] No ${CONFIGURATION}-specific Firebase config; using the default."
fi

if [[ ! -f "${SELECTED}" ]]; then
  echo "error: [H-15] No GoogleService-Info.plist found at ${SELECTED}" >&2
  exit 1
fi

# --- 2. guard --------------------------------------------------------------

PROJECT_ID="$(${PLIST_BUDDY} -c 'Print :PROJECT_ID' "${SELECTED}" 2>/dev/null || echo '')"
BUNDLE_ID="${PRODUCT_BUNDLE_IDENTIFIER:-}"

is_production=false
for id in "${PRODUCTION_BUNDLE_IDS[@]}"; do
  [[ "${BUNDLE_ID}" == "${id}" ]] && is_production=true
done

if [[ "${is_production}" != true ]]; then
  echo "note: [H-15] Bundle id '${BUNDLE_ID}' is not a production id; project check skipped."
  exit 0
fi

for bad in "${NON_PRODUCTION_PROJECTS[@]}"; do
  if [[ "${PROJECT_ID}" == "${bad}" ]]; then
    echo "error: [H-15] Refusing to build production '${BUNDLE_ID}' against Firebase project '${PROJECT_ID}', which is a TEST project." >&2
    echo "error: Resolved from ${SELECTED}. Customer tokens and personal data would be written to a test-tier project." >&2
    echo "error: Add the production plist at ios/firebase/GoogleService-Info-${CONFIGURATION}.plist" >&2
    exit 1
  fi
done

if [[ -z "${PROJECT_ID}" ]]; then
  echo "error: [M-12] ${SELECTED} has no PROJECT_ID; cannot verify which Firebase project production '${BUNDLE_ID}' reports to." >&2
  exit 1
fi

if [[ "${PROJECT_ID}" =~ ${NON_PRODUCTION_PATTERN} ]]; then
  echo "error: [M-12] Firebase project '${PROJECT_ID}' looks non-production (matches ${NON_PRODUCTION_PATTERN}); refusing to build production '${BUNDLE_ID}' against it." >&2
  echo "error: Add the production plist at ios/firebase/GoogleService-Info-${CONFIGURATION}.plist" >&2
  exit 1
fi

# The Firebase iOS SDK only logs a warning when the plist was registered for a
# different app, so check it here: a mismatch means the plist belongs to some
# other app in some other project.
PLIST_BUNDLE_ID="$(${PLIST_BUDDY} -c 'Print :BUNDLE_ID' "${SELECTED}" 2>/dev/null || echo '')"
if [[ "${PLIST_BUNDLE_ID}" != "${BUNDLE_ID}" ]]; then
  echo "error: [M-12] ${SELECTED} is registered for '${PLIST_BUNDLE_ID}', not '${BUNDLE_ID}'. Download the plist for the production iOS app." >&2
  exit 1
fi

echo "note: [H-15] Release Firebase project '${PROJECT_ID}' OK for '${BUNDLE_ID}'."
