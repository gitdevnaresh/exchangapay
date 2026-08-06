import { Platform } from "react-native";
import BlobUtil from "react-native-blob-util";
import { log } from "./logger";

const UNSAFE_FILENAME_CHARS = /[^A-Za-z0-9._-]+/g;

const MIME_BY_EXTENSION: Record<string, string> = {
  csv: "text/csv",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  txt: "text/plain",
  json: "application/json",
  zip: "application/zip",
};

/**
 * Read the extension off a URL.
 *
 * Presigned download links carry a signature query string that contains its own
 * dots, so a naive "everything after the last dot" read produces an extension
 * like `csv?X-Amz-Signature=...`. Android then either refuses to create the file
 * or writes it under a name nothing can open.
 */
export const getUrlExtension = (url: string, fallback = "csv"): string => {
  const withoutQuery = String(url ?? "").split(/[?#]/)[0];
  const lastSegment = withoutQuery.split("/").pop() ?? "";
  const dotIndex = lastSegment.lastIndexOf(".");
  if (dotIndex < 0) return fallback;
  const extension = lastSegment.slice(dotIndex + 1).toLowerCase();
  return /^[a-z0-9]{1,5}$/.test(extension) ? extension : fallback;
};

export const sanitizeFileName = (name: string): string =>
  String(name ?? "")
    .replace(UNSAFE_FILENAME_CHARS, "_")
    .replace(/^_+|_+$/g, "") || "download";

export const mimeForExtension = (extension: string): string =>
  MIME_BY_EXTENSION[String(extension ?? "").toLowerCase()] ??
  "application/octet-stream";

/**
 * Derive a file extension from a Content-Type header value.
 *
 * Presigned download URLs often have no meaningful path extension — the
 * extension must come from the response headers instead. Falls back to the
 * supplied default when the header is absent or unrecognised.
 */
export const extensionFromContentType = (
  contentType: string | null | undefined,
  fallback = "csv"
): string => {
  if (!contentType) return fallback;
  const ct = contentType.split(";")[0].trim().toLowerCase();
  const found = Object.entries(MIME_BY_EXTENSION).find(([, mime]) => mime === ct);
  return found ? found[0] : fallback;
};

/**
 * Issue a HEAD request to resolve the Content-Type of a URL without
 * downloading the body. Returns null on any network or status error so the
 * caller can fall back gracefully.
 */
export const fetchContentType = async (
  url: string,
  headers?: Record<string, string>
): Promise<string | null> => {
  try {
    const response = await BlobUtil.config({}).fetch("HEAD", url, headers ?? {});
    return response.respInfo?.headers?.["content-type"]
      ?? response.respInfo?.headers?.["Content-Type"]
      ?? null;
  } catch {
    return null;
  }
};

export interface SaveToDownloadsOptions {
  /** File name without an extension. */
  baseName: string;
  /** Overrides the extension derived from the URL. */
  extension?: string;
  /** Overrides the MIME type derived from the extension. */
  mime?: string;
  /** Extra request headers, e.g. an auth token. */
  headers?: Record<string, string>;
}

export interface SavedFile {
  fileName: string;
  /** MediaStore content URI when published, otherwise the on-disk cache path. */
  path: string;
  mime: string;
  /** False when the bytes are on disk but not visible in the Downloads folder. */
  savedToDownloads: boolean;
}

/**
 * Download a file and publish it into the device's public Downloads collection.
 *
 * The obvious approach -- handing DownloadManager an `addAndroidDownloads.path`
 * under `DownloadDir` -- writes the bytes but never registers them with
 * MediaStore on Android 10+, so the file exists on disk while the Downloads app
 * and every file manager show nothing. Fetching into app storage and copying
 * through MediaStore publishes it properly: a MediaStore insert on Android 10+,
 * a plain write into the legacy Downloads directory below that.
 *
 * On iOS there is no shared Downloads folder, so the caller gets the cached path
 * to hand to a share sheet.
 */
export const saveToDownloads = async (
  url: string,
  { baseName, extension, mime, headers }: SaveToDownloadsOptions
): Promise<SavedFile> => {
  if (!url) throw new Error("No download URL was provided.");

  const ext = (extension ?? getUrlExtension(url)).toLowerCase();
  const fileName = `${sanitizeFileName(baseName)}.${ext}`;
  const resolvedMime = mime ?? mimeForExtension(ext);

  const response = await BlobUtil.config({
    fileCache: true,
    appendExt: ext,
  }).fetch("GET", url, headers);

  const cachedPath = response.path();
  const status = response.info()?.status ?? 0;
  // Without this an HTML error page is happily "downloaded" as the user's bill.
  if (status >= 400) {
    await BlobUtil.fs.unlink(cachedPath).catch(() => {});
    throw new Error(`Download failed with status ${status}.`);
  }

  return publishToDownloads(cachedPath, fileName, resolvedMime);
};

/**
 * Same contract as {@link saveToDownloads} for content the app already holds as
 * base64, e.g. a `data:` URI. Writing straight to `RNFS.DownloadDirectoryPath`
 * is denied outright on Android 11+, so the bytes go to app storage first and
 * reach the user through MediaStore.
 */
export const saveBase64ToDownloads = async (
  base64: string,
  { baseName, extension, mime }: Omit<SaveToDownloadsOptions, "headers"> & { extension: string }
): Promise<SavedFile> => {
  const ext = extension.toLowerCase();
  const fileName = `${sanitizeFileName(baseName)}.${ext}`;
  const resolvedMime = mime ?? mimeForExtension(ext);
  const cachedPath = `${BlobUtil.fs.dirs.CacheDir}/${fileName}`;

  await BlobUtil.fs.writeFile(cachedPath, base64, "base64");

  return publishToDownloads(cachedPath, fileName, resolvedMime);
};

const publishToDownloads = async (
  cachedPath: string,
  fileName: string,
  mime: string
): Promise<SavedFile> => {
  if (Platform.OS !== "android") {
    return { fileName, path: cachedPath, mime, savedToDownloads: false };
  }

  try {
    const mediaUri = await BlobUtil.MediaCollection.copyToMediaStore(
      { name: fileName, parentFolder: "", mimeType: mime },
      "Download",
      cachedPath
    );
    await BlobUtil.fs.unlink(cachedPath).catch(() => {});
    return { fileName, path: mediaUri, mime, savedToDownloads: true };
  } catch (error) {
    // Keep the cached copy so the caller can still offer a share sheet.
    log.error("Could not publish file to Downloads", error);
    return { fileName, path: cachedPath, mime, savedToDownloads: false };
  }
};
