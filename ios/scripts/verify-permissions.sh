#!/usr/bin/env bash
#
# iOS permission footprint (purpose-string allowlist).
#
# A purpose string is what makes a permission prompt possible: once the key
# exists, any SDK can raise a microphone or location prompt and the user sees a
# plausible reason. The allowlist below matches the keys the live BullSwipe app
# ships with. NSMicrophoneUsageDescription was removed because nothing in the
# app records audio and Sumsub's Default subspec has no Video Ident.
#
# Checked in the source plist, so a commit that adds a key fails, and in the
# built product, so a key a pod or a later build phase injected fails too.
#
# Runs only for Release; exits silently for Debug so simulator builds are
# unaffected. To allow a new permission, add its key to ALLOWED_PURPOSE together
# with the feature that needs it.

if [ "$CONFIGURATION" != "Release" ]; then exit 0; fi

set -e

ALLOWED_PURPOSE="NSCameraUsageDescription NSFaceIDUsageDescription NSLocationWhenInUseUsageDescription NSPhotoLibraryUsageDescription"
INFO_PLIST="${SRCROOT}/exchangapay/Info.plist"

if [ ! -f "$INFO_PLIST" ]; then
  echo "error: $INFO_PLIST not found. The iOS permission guard cannot run."
  exit 1
fi

for PLIST_TO_CHECK in "$INFO_PLIST" "${BUILT_PRODUCTS_DIR}/${INFOPLIST_PATH}"; do
  [ -f "$PLIST_TO_CHECK" ] || continue
  for KEY in $(plutil -p "$PLIST_TO_CHECK" | grep -oE 'NS[A-Za-z]+UsageDescription' | sort -u); do
    case " $ALLOWED_PURPOSE " in
      *" $KEY "*) ;;
      *)
        echo "error: $PLIST_TO_CHECK declares $KEY, which is not in the iOS purpose-string allowlist. Remove it, or add it to ALLOWED_PURPOSE in ios/scripts/verify-permissions.sh with the feature that needs it."
        exit 1
        ;;
    esac
  done
done

echo "Permission purpose strings match the allowlist."
