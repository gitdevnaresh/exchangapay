import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";
import Share from "react-native-share";
import {
  discardLocalCopy,
  getUrlExtension,
  saveToDownloads,
} from "./fileDownload";
import { notifyDownloadComplete } from "./documentNotification";

export const requestAndroidPermission = async () => {
  try {
    let permission = "";
    if (Platform.Version >= 29) {
      return true;
    }
    // Only request WRITE_EXTERNAL_STORAGE for SDK < 29
    permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    // First check if it's already granted
    const alreadyGranted = await PermissionsAndroid.check(permission);
    if (alreadyGranted) return true;

    // Now request the permission
    const granted = await PermissionsAndroid.request(permission, {
      title: "Permission Required",
      message: "We need access to save images to your device.",
      buttonNeutral: "Ask Me Later",
      buttonNegative: "Cancel",
      buttonPositive: "OK",
    });

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (granted === PermissionsAndroid.RESULTS.DENIED) {
      // Not permanently denied — show prompt again next time
      Alert.alert(
        "Permission Denied",
        "Please allow permission to download images."
      );
    }

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      // Can't re-ask — must redirect to settings
      Alert.alert(
        "Permission Blocked",
        "You have permanently denied this permission. Please enable it from settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }

    return false;
  } catch (error) {
    Alert.alert("Permission Error", "Failed to request permission.");
    return false;
  }
};

export const downloadImage = async (url) => {
  if (!url) return;

  if (Platform.OS === "android") {
    const hasPermission = await requestAndroidPermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Cannot download image without permission."
      );
      return;
    }
  }

  try {
    const isIOS = Platform.OS === "ios";
    const date = new Date();

    const saved = await saveToDownloads(url, {
      baseName: `chat_image_${date.getTime()}`,
      extension: getUrlExtension(url, "jpg"),
    });

    if (isIOS) {
      try {
        await Share.open({
          url: "file://" + saved.path,
          type: saved.mime,
          title: "Save Image",
        });
      } finally {
        await discardLocalCopy(saved);
      }
    } else if (saved.savedToDownloads) {
      await notifyDownloadComplete(saved);
      Alert.alert(
        "Download Complete",
        "Image has been saved to your Downloads folder."
      );
    } else {
      await Share.open({
        url: "file://" + saved.path,
        type: saved.mime,
        title: "Save Image",
      });
    }
  } catch (error) {
    if (Platform.OS === "ios") {
      Alert.alert(
        "Permission Required",
        "Please allow photo library access in Settings to save images.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
    } else {
      Alert.alert(
        "Download Failed",
        "Something went wrong while saving the image."
      );
    }
  }
};
