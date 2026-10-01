import { NativeModules, Platform } from "react-native";
import { EventType, Event } from "@notifee/react-native";
import FileViewer from "react-native-file-viewer";
import { log } from "./logger";

// The notification body comes from the push payload, so it is untrusted.
// Only a plain file name the app itself would produce is accepted: no
// slashes, no "..", and a known document extension (L-07).
const SAFE_FILE_NAME = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\.(pdf|xlsx|xls|csv)$/i;

export const isSafeDocumentName = (name?: string): name is string =>
  !!name && name.length <= 128 && SAFE_FILE_NAME.test(name);

export const handleDocumentNotificationPress = async ({ type, detail }: Event) => {
  if (type !== EventType.PRESS) return;

  const notificationType = detail.notification?.data?.type;
  // FileManagerModule is optional; calling into a missing module throws.
  const fileManager = NativeModules.FileManagerModule;
  if (!fileManager) return;

  try {
    if (Platform.OS === "ios" && notificationType === "Document_IOS") {
      const fileName = detail.notification?.body;
      if (!isSafeDocumentName(fileName)) {
        log.error("Rejected document notification with unsafe file name");
        return;
      }
      fileManager.getDocumentDirectoryPath(async (documentDirectory: string) => {
        try {
          await FileViewer.open(`${documentDirectory}/${fileName}`);
        } catch (error) {
          log.error("Could not open downloaded document", error);
        }
      });
    } else if (
      Platform.OS === "android" &&
      notificationType === "Document_Android"
    ) {
      await fileManager.goToFolder("Downloads");
    }
  } catch (error) {
    log.error("Could not handle document notification", error);
  }
};
