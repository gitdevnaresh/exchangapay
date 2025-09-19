import { random } from "crypto-js/lib-typedarrays";
import AES from "crypto-js/aes";
import PBKDF2 from "crypto-js/pbkdf2";
import Pkcs7 from "crypto-js/pad-pkcs7";
import ENC from "crypto-js/enc-utf8";
import { mode } from "crypto-js";
import RNFetchBlob from "rn-fetch-blob";
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import Share from 'react-native-share';

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
  const fileExt = extension?.toLowerCase();
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



export const requestAndroidPermission = async () => {
  try {
      let permission = '';
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
      title: 'Permission Required',
      message: 'We need access to save images to your device.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK',
    });

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (granted === PermissionsAndroid.RESULTS.DENIED) {
      // Not permanently denied — show prompt again next time
      Alert.alert('Permission Denied', 'Please allow permission to download images.');
    }

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      // Can't re-ask — must redirect to settings
      Alert.alert(
        'Permission Blocked',
        'You have permanently denied this permission. Please enable it from settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }

    return false;
  } catch (error) {
    Alert.alert('Permission Error', 'Failed to request permission.');
    return false;
  }
};

export const downloadImage = async (url) => {
  if (!url) return;

  if (Platform.OS === 'android') {
    const hasPermission = await requestAndroidPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot download image without permission.');
      return;
    }
  }

  try {
    const { config, fs } = RNFetchBlob;
    const isIOS = Platform.OS === 'ios';
    const date = new Date();
    const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `chat_image_${date.getTime()}.${ext}`;

    // Don't use path to access file directly on Android 13+
    const path = isIOS
      ? `${fs.dirs.DocumentDir}/${fileName}`
      : `${fs.dirs.DownloadDir}/${fileName}`;

    const options = {
      fileCache: true,
      path: path,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: path, // just instructs DownloadManager
        description: 'Image file',
        mime: `image/${ext}`,
        title: fileName,
      },
    };

    await config(options).fetch('GET', url);

    if (isIOS) {
      await Share.open({
        url: 'file://' + path,
        type: `image/${ext}`,
        title: 'Save Image',
      });
    } else {
      Alert.alert('Download Complete', 'Image has been saved to your Downloads folder.');
    }
  } catch (error) {

    if (Platform.OS === 'ios') {
      Alert.alert(
        'Permission Required',
        'Please allow photo library access in Settings to save images.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    } else {
      Alert.alert('Download Failed', 'Something went wrong while saving the image.');
    }
  }
};



