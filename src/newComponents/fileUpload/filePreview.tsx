import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  Platform,
  ToastAndroid,
  Share,
} from "react-native";
import { s } from "react-native-size-matters";
import { AntDesign } from '@expo/vector-icons';
import { useLngTranslation } from "../../hooks/useLngTranslation";
import LabelComponent from "../../newComponents/textComponets/lableComponent/lable";
import ImageUri from "../../newComponents/imageComponents/image"; // Assuming this is a custom component for displaying images
import ReactNativeBlobUtil from 'react-native-blob-util'; // Import react-native-blob-util
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import ButtonComponent from "../../newComponents/buttons/button";
import { useThemeColors } from "../../hooks/useThemeColors";
import { showCustomToast, ToastType } from "../ToasterMessages";
import ViewComponent from "../../newComponents/view/view";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import Container from "../container/container";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";

interface FilePreviewProps {
  label: string;
  uploadedImageUri: string | null;
  fileName?: string;
  containerStyle?: object;
  labelColor?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  label,
  uploadedImageUri,
  fileName,
  containerStyle,
  labelColor
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyeles(NEW_COLOR);
  const getFileDetails = (url: string): { name: string, extension: string, mime: string } => {
    const defaultName = `download_${Date.now()}`;
    let fileNameFromUrl = url.substring(url.lastIndexOf('/') + 1);

    // Remove query parameters from filename if they exist
    const queryIndex = fileNameFromUrl.lastIndexOf('?');
    if (queryIndex !== -1) {
      fileNameFromUrl = fileNameFromUrl.substring(0, queryIndex);
    }
    fileNameFromUrl = fileNameFromUrl.replace(/[^\w.-]/g, '_');

    const parts = fileNameFromUrl.split('.');
    const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg'; // Default to jpg if no extension
    const nameWithoutExt = parts.join('.') || defaultName;

    let mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    if (extension === 'pdf') mimeType = 'application/pdf';
    else if (extension === 'png') mimeType = 'image/png';

    return { name: `${nameWithoutExt}.${extension}`, extension, mime: mimeType };
  };
  const downloadImageForAndroid12Plus = async (url: string) => {
    if (!url) return;

    try {
      if (Platform.OS === 'android') {
        const permission = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        if (permission !== RESULTS.GRANTED) {
          showCustomToast({ message: 'Permission denied', type: ToastType.ERROR, duration: ToastAndroid.LONG });
          return;
        }
      }
      const { name: actualFileName } = getFileDetails(url);
      const folderPath = `${RNFS.DownloadDirectoryPath}/MyApp`;
      await RNFS.mkdir(folderPath);
      const path = `${folderPath}/${actualFileName}`;
      const res = await RNFS?.downloadFile({
        fromUrl: url,
        toFile: path,
      }).promise;
      if (res.statusCode === 200) {
        showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS, duration: ToastAndroid.LONG });
      } else {
        showCustomToast({ message: 'Download failed', type: ToastType.ERROR, duration: ToastAndroid.LONG });
      }
    } catch (err) {
      showCustomToast({ message: "Something went wrong", type: ToastType.ERROR, duration: ToastAndroid.LONG });

    }
  };

  const downloadImage = async (imageUrl: string) => {
    if (!imageUrl) {
      showCustomToast({ message: 'Invalid file URL.', type: ToastType.ERROR, duration: ToastAndroid.SHORT });
      return;
    }

    if (Platform.OS === 'ios') {
      await Share.share({
        url: imageUrl,
      });
    } else if (Platform.OS === 'android') {
      if (Platform.Version >= 33) { // Android 13+
        return downloadImageForAndroid12Plus(imageUrl);
      }
      // Android < 13
      try {
        const storageResult = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        if (storageResult !== RESULTS.GRANTED) {
          showCustomToast({ message: t("GLOBAL_CONSTANTS.STORAGE_DENIED_DOWNLOAD"), type: ToastType.ERROR, duration: ToastAndroid.LONG });
          return;
        }

        const { name: actualFileName, mime } = getFileDetails(imageUrl);
        const { config, fs } = ReactNativeBlobUtil;
        if (!config || !fs || !fs.dirs || !fs.dirs.DownloadDir) {
          showCustomToast({ message: "Download feature is currently unavailable.", type: ToastType.WARNING, duration: ToastAndroid.LONG });
          return;
        }

        const downloadDir = fs.dirs.DownloadDir; // Public Downloads directory

        const rnFetchBlobOptions = {
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: `${downloadDir}/${actualFileName}`,
            description: t("GLOBAL_CONSTANTS.DOWNLOADING_FILE") || 'Downloading file...',
            mime: mime,
            title: actualFileName,
            mediaScannable: true,
          },
        };
        showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_START"), type: ToastType.INFO, duration: ToastAndroid.SHORT });
        config(rnFetchBlobOptions)
          .fetch('GET', imageUrl)
          .then((res) => {
            // This callback indicates the download was successfully submitted to Android's Download Manager.
            // The Download Manager handles actual download progress and completion notifications.
            showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS, duration: ToastAndroid.LONG });
          })
          .catch((err) => {
            showCustomToast({ message: "Failed to start download with system manager.", type: ToastType.WARNING, duration: ToastAndroid.LONG });
          });

      } catch (err: any) {
        let errorMessage = 'Something went wrong during download.';
        if (err.message) {
          if (err.message?.toLowerCase().includes("permission denied") || err.message.toLowerCase().includes("eacces")) {
            errorMessage = "Download failed due to a permission issue.";
          } else if (err.message.toLowerCase().includes("no address associated with hostname") || err.message.toLowerCase().includes("network error") || err.message.toLowerCase().includes("failed to connect")) {
            errorMessage = "Network error. Please check your connection and try again.";
          }
        }
        showCustomToast({ message: errorMessage, type: ToastType.ERROR, duration: ToastAndroid.LONG });
      }
    }
  };

  return (
    <View style={containerStyle}>
      <LabelComponent
        style={[
          commonStyles.fs14,
          commonStyles.fw400,
          commonStyles.mb6, { color: labelColor ?? NEW_COLOR.TEXT_WHITE }]}
        text={label}
        multiLanguageAllows={true}
      />

      {uploadedImageUri && (
        <>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <ImageUri style={styles.imageShowStyle} uri={uploadedImageUri} />
          </TouchableOpacity>

          <Modal visible={isModalVisible} animationType="fade">
            <SafeAreaView style={commonStyles.flex1}>
              <Container style={commonStyles.container}>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.justifyContent,
                    commonStyles.sectionGap
                  ]}
                >
                  <ParagraphComponent
                    style={[commonStyles.sectionTitle, { width: s(120) }]}
                    text={"GLOBAL_CONSTANTS.PREVIEW"}
                  />
                  <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                    <AntDesign
                      size={s(24)}
                      style={[commonStyles.textRight]}
                      name="close"
                      color={NEW_COLOR.TEXT_WHITE}
                    />
                  </TouchableOpacity>
                </View>
                <ImageUri uri={uploadedImageUri} style={styles.fullImage} />
                <ViewComponent style={[commonStyles.sectionGap]} />
                <ButtonComponent
                  title={t("GLOBAL_CONSTANTS.DOWNLOAD")}
                  onPress={() => downloadImage(uploadedImageUri)}
                />
              </Container>
            </SafeAreaView>
          </Modal>
        </>
      )}
    </View>
  );
};

export default FilePreview;

const screenStyeles = (NEW_COLOR: any) => StyleSheet.create({
  image: {
    width: "100%",
    height: s(184),
    borderRadius: s(5),
    borderWidth: 1,
    borderColor: NEW_COLOR.INPUT_BORDER,
  },
  fullImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  imageShowStyle: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: NEW_COLOR.INPUT_BORDER,
    borderRadius: s(5),
  },
});
