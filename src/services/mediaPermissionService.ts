import * as ImagePicker from "expo-image-picker";

export type PickerOption = "camera" | "library";

export async function checkAppPermissions(
  type: PickerOption
): Promise<{
  allowed: boolean;
  showPopup: boolean;
  titleKey?: string;
  messageKey?: string;
}> {
  // =========================
  // CAMERA PERMISSION FLOW
  // =========================
  if (type === "camera") {
    const currentPerm = await ImagePicker.getCameraPermissionsAsync();

    // ❌ Permanently denied → show custom popup
    if (currentPerm.status === "denied" && currentPerm.canAskAgain === false) {
      return {
        allowed: false,
        showPopup: true,
        titleKey: "GLOBAL_CONSTANTS.CAMERA_PERMISSION_REQUIRED",
        messageKey: "GLOBAL_CONSTANTS.CAMERA_ACCESS_REQUIRED_TO_CAPTURE_PROFILE_PHOTO",
      };
    }

    // ✅ Already granted
    if (currentPerm.status === "granted") {
      return { allowed: true, showPopup: false };
    }

    // 🔁 Ask system permission
    const reqPerm = await ImagePicker.requestCameraPermissionsAsync();

    // ❌ Denied now → silent
    if (!reqPerm.granted) {
      return { allowed: false, showPopup: false };
    }

    // ✅ Granted
    return { allowed: true, showPopup: false };
  }

  // =========================
  // LIBRARY PERMISSION FLOW
  // =========================
  if (type === "library") {
    const currentPerm = await ImagePicker.getMediaLibraryPermissionsAsync();

    // ❌ Permanently denied → show custom popup
    if (currentPerm.status === "denied" && currentPerm.canAskAgain === false) {
      return {
        allowed: false,
        showPopup: true,
        titleKey: "GLOBAL_CONSTANTS.PHOTOS_PERMISSION_REQUIRED",
        messageKey: "GLOBAL_CONSTANTS.CASES_REPLAY_PERISSION_MESSAGE",
      };
    }

    // ✅ Already granted
    if (currentPerm.status === "granted") {
      return { allowed: true, showPopup: false };
    }

    // 🔁 Ask system permission
    const reqPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // ❌ Denied now → silent
    if (!reqPerm.granted) {
      return { allowed: false, showPopup: false };
    }

    // ✅ Granted
    return { allowed: true, showPopup: false };
  }

  // Fallback (should never happen)
  return { allowed: false, showPopup: false };
}
