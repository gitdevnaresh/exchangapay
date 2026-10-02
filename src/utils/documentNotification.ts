import { NativeModules, Platform } from "react-native";
import notifee, { AndroidImportance, EventType, Event } from "@notifee/react-native";
import FileViewer from "react-native-file-viewer";
import BlobUtil from "react-native-blob-util";
import { log } from "./logger";
import type { SavedFile } from "./fileDownload";

const DOWNLOAD_NOTIFICATION_TYPE = "Download_Complete";
const DOWNLOAD_CHANNEL_ID = "downloads";

/**
 * Files this process published, keyed by the id of the notification announcing
 * them. The tap handler opens a file only through this map, never from the
 * notification payload, so a push message cannot name a file to open (L-07).
 * The map lives in memory: after the app process is killed a tap falls back to
 * the Downloads screen.
 */
const publishedDownloads = new Map<string, { uri: string; mime: string }>();

/**
 * Android's "Download complete" notification. Downloads used to go through
 * DownloadManager, which posted one; since files are published through
 * MediaStore (fileDownload.ts) nothing did. Tapping it opens the file.
 */
export const notifyDownloadComplete = async (saved: SavedFile): Promise<void> => {
  if (Platform.OS !== "android" || !saved.savedToDownloads) return;
  try {
    await notifee.createChannel({
      id: DOWNLOAD_CHANNEL_ID,
      name: "Downloads",
      importance: AndroidImportance.DEFAULT,
    });
    const id = `download-${Date.now()}`;
    publishedDownloads.set(id, { uri: saved.path, mime: saved.mime });
    await notifee.displayNotification({
      id,
      title: "Download complete",
      body: saved.fileName,
      data: { type: DOWNLOAD_NOTIFICATION_TYPE },
      android: {
        channelId: DOWNLOAD_CHANNEL_ID,
        smallIcon: "ic_launcher",
        autoCancel: true,
        showTimestamp: true,
        pressAction: { id: "default", launchActivity: "default" },
      },
    });
  } catch (error) {
    log.error("Could not show download notification", error);
  }
};

const openPublishedDownload = async (notificationId?: string) => {
  const file = notificationId ? publishedDownloads.get(notificationId) : undefined;
  if (file) {
    publishedDownloads.delete(notificationId!);
    await BlobUtil.android.actionViewIntent(file.uri, file.mime);
    return;
  }
  // Process restarted since the download: open the Downloads screen instead.
  await NativeModules.FileManagerModule?.goToFolder("Downloads");
};

// The notification body comes from the push payload, so it is untrusted.
// Only a plain file name the app itself would produce is accepted: no
// slashes, no "..", and a known document extension (L-07).
const SAFE_FILE_NAME = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*\.(pdf|xlsx|xls|csv)$/i;

export const isSafeDocumentName = (name?: string): name is string =>
  !!name && name.length <= 128 && SAFE_FILE_NAME.test(name);

export const handleDocumentNotificationPress = async ({ type, detail }: Event) => {
  if (type !== EventType.PRESS) return;

  const notificationType = detail.notification?.data?.type;

  if (Platform.OS === "android" && notificationType === DOWNLOAD_NOTIFICATION_TYPE) {
    try {
      await openPublishedDownload(detail.notification?.id);
    } catch (error) {
      log.error("Could not open downloaded file", error);
    }
    return;
  }
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
