import { random } from "crypto-js/lib-typedarrays";
import AES from "crypto-js/aes";
import PBKDF2 from "crypto-js/pbkdf2";
import Pkcs7 from "crypto-js/pad-pkcs7";
import ENC from "crypto-js/enc-utf8";
import { mode } from "crypto-js";
import RNFetchBlob from "rn-fetch-blob";

// eslint-disable-next-line consistent-return

export const encrypt = (memberID, key) => {
  const msg =
    typeof memberID === "object" ? JSON.stringify(memberID) : memberID;
  const salt = random(128 / 8);
  const newKey = PBKDF2(key, salt, {
    keySize: 256 / 32,
    iterations: 10,
  });

  const iv = random(128 / 8);
  const encrypted = AES.encrypt(msg, newKey, {
    iv,
    padding: Pkcs7,
    mode: mode.CBC,
  });
  return salt.toString() + iv.toString() + encrypted.toString();
};
export const encryptForRegister = (msg) => {
  const key = ENC.parse("8080808080808080");
  const iv = ENC.parse("8080808080808080");
  const encryptedVal = AES.encrypt(ENC.parse(msg), key, {
    keySize: 128 / 8,
    iv,
    mode: mode.CBC,
    padding: Pkcs7,
  });
  return encryptedVal.toString();
};

export const downloadFileFromUrl = (path, extension) => {
  const date = new Date();
  const filename = path.replace(/^.*[\\\\/]/, "");
  const name = filename.split(".").slice(0, -1).join(".");

  const { config, fs } = RNFetchBlob;
  const { DownloadDir, DocumentDir } = fs?.dirs;
  const fileExt = extension.toLowerCase();
  let mimeType;
  if (fileExt === "png" || fileExt === "jpg" || fileExt === "jpeg") {
    mimeType = "image/*";
  }
  if (fileExt === "pdf") {
    mimeType = "application/pdf";
  }
  const options = Platform.select({
    ios: {
      fileCache: true,
      path: `${DocumentDir}${Math.floor(
        date.getTime() + date.getSeconds() / 2
      )}.${fileExt}`,
      notification: true,
    },
    android: {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mime: mimeType,
        title: name,
        path: `${DownloadDir}/me_${Math.floor(
          date.getTime() + date.getSeconds() / 2
        )}.${fileExt}`,
        description: "Downloading file",
      },
    },
  });
  config(options)
    .fetch("GET", path)
    .then(() => {
      Alert.alert("Download file success");
    })
    .catch((err) => {
      throw new Error("Download error", { cause: err });
    });
};
// eslint-disable-next-line consistent-return
export const uploadFileFromDocument = async () => {
  try {
    const response = await DocumentPicker.pick({
      type: [types.pdf, types.images],
    });
    const res = response[0];
    const indexRandom = Math.random().toString(36).substring(7);
    if (res) {
      const split = res.uri.split("/");
      const name = split.pop();
      const inbox = split.pop();
      if (Platform.OS === "android") {
        return {
          res,
          id: indexRandom,
          realPath: res?.uri,
        };
      }
      const realPath =
        Platform.OS === "ios"
          ? `${RNFS.TemporaryDirectoryPath}${inbox}/${name}`
          : res.uri;

      const decodeUrl = decodeURIComponent(realPath);
      return {
        res,
        id: indexRandom,
        realPath: decodeUrl,
      };
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      Alert.alert("Upload cancelled");
    } else {
      Alert.alert(`Unknown Error: ${JSON.stringify(err)}`);
      throw err;
    }
  }
};

export const readFileURL = async (path) => {
  const response = await RNFetchBlob.config({
    // add this option that makes response data to be stored as a file,
    // this is much more performant.
    fileCache: true,
  }).fetch("GET", path, {
    // some headers ..
  });
  const result =
    Platform.OS === "android" ? `file://${response.data}` : `${response.data}`;
  return result;
};

export const uploadImageFromGallery = async (callback) => {
  const options = {
    storageOptions: {
      path: "images",
      mediaType: "photo",
    },
    includeBase64: false,
  };
  const indexRandom = Math.random().toString(36).substring(7);
  await launchImageLibrary(options, (response) => {
    if (response.didCancel) {
      Alert.alert("Upload cancelled");
    } else if (response.errorCode) {
      Alert.alert(`Unknown Error: ${JSON.stringify(response.errorCode)}`);
      throw response.errorCode;
    } else {
      callback({
        id: indexRandom,
        realPath: response.assets[0].uri,
        res: {
          name: response.assets[0].fileName,
          size: response.assets[0].fileSize,
          type: response.assets[0].type,
        },
      });
    }
  });
};
