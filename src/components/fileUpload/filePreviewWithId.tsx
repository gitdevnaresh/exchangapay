import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  Platform,
  Share,
  ActivityIndicator,
  PermissionsAndroid,
} from "react-native";
import { s } from "react-native-size-matters";
import { getThemedCommonStyles } from "../CommonStyles";
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Container from "../container/container";
import { useLngTranslation } from "../../hooks/languagesHook/useLngTranslation";
import LabelComponent from "../textComponets/lableComponent/lable";
import ImageUri from "../imageComponents/image";
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import ButtonComponent from "../buttons/button";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import { showCustomToast, ToastType } from "../toasterMessages";
import ProfileService from "../../apiServices/profile";
import useEncryptDecrypt from "../../hooks/encDecHook";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import { Logger } from '../../utils/Logger';

interface FilePreviewProps {
  label: string;
  uploadedImageUri?: string | null;
  fileName?: string;
  containerStyle?: object;
  id?: string;
  showImage?: boolean;
}

const FilePreviewWithId: React.FC<FilePreviewProps> = ({
  label,
  uploadedImageUri,
  fileName,
  containerStyle,
  id,
  showImage = true
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyeles(NEW_COLOR);

  const [isLoading, setIsLoading] = useState(false);
  const [fileUri, setFileUri] = useState<string | null | undefined>(uploadedImageUri);
  const isPdf = fileName?.toLowerCase().endsWith('.pdf') || false;

  useEffect(() => {
    setFileUri(uploadedImageUri);
  }, [uploadedImageUri]);

  const handlePress = async () => {
    if (fileUri) {
      setIsModalVisible(true);
      return;
    }
    if (!id) {
      showCustomToast({ message: "File ID is missing.", type: ToastType.WARNING });
      return;
    }

    setIsLoading(true);
    try {
      const response = await ProfileService.getCasesUploadFiles(id);
      if (response.ok && response.data) {
        const decryptedBase64 = response.data;
        // Check if the file is a PDF and set the appropriate URI
        const mimeType = isPdf ? 'application/pdf' : 'image/jpeg';
        const fullFileUri = `data:${mimeType};base64,${decryptedBase64}`;
        setFileUri(fullFileUri);
        setIsModalVisible(true);
      } else {
        showCustomToast({ message: "Failed to load file preview.", type: ToastType.ERROR });
      }
    } catch (error: any) {
      showCustomToast({ message: error.message || "An error occurred", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getFileDetails = (url: string): { name: string, extension: string, mime: string } => {
    const defaultName = `download_${Date.now()}`;
    let fileNameFromUrl = url.substring(url.lastIndexOf('/') + 1);

    const queryIndex = fileNameFromUrl.lastIndexOf('?');
    if (queryIndex !== -1) {
      fileNameFromUrl = fileNameFromUrl.substring(0, queryIndex);
    }
    fileNameFromUrl = fileNameFromUrl.replace(/[^\w.-]/g, '_');

    const parts = fileNameFromUrl.split('.');
    const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg';
    const nameWithoutExt = parts.join('.') || defaultName;
    const mimeType = isPdf ? 'application/pdf' : `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    return { name: `${nameWithoutExt}.${extension}`, extension, mime: mimeType };
  };
  const handleDownload = async () => {
    if (!fileUri) {
      showCustomToast({ message: "No file to download.", type: ToastType.WARNING });
      return;
    }

    const permissionGranted = await requestStoragePermissionForAndroid();
    if (Platform.OS === 'android' && !permissionGranted && Platform.Version < 33) {
      return;
    }

    try {
      if (fileUri.startsWith('data:')) {
        const match = fileUri.match(/^data:(.+);base64,(.*)$/);
        if (!match) {
          showCustomToast({ message: "Invalid file format.", type: ToastType.ERROR });
          return;
        }
        const mimeType = match[1];
        const base64Data = match[2];
        const extension = isPdf ? 'pdf' : (mimeType.split('/')[1] || 'jpg');
        const downloadFileName = fileName || `download_${Date.now()}.${extension}`;

        if (Platform.OS === 'ios') {
          const path = `${RNFS.TemporaryDirectoryPath}/${downloadFileName}`;
          await RNFS.writeFile(path, base64Data, 'base64');
          await Share.share({ url: path });
          await RNFS.unlink(path);
        } else {
          if (Platform.Version >= 33) { // Android 13+
            const folderPath = `${RNFS.DownloadDirectoryPath}/MyApp`;
            await RNFS.mkdir(folderPath);
            const path = `${folderPath}/${downloadFileName}`;
            await RNFS.writeFile(path, base64Data, 'base64');
            showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
          } else { // Android < 13
            // For Android < 13, use RNFS.writeFile to save base64 data
            const folderPath = `${RNFS.DownloadDirectoryPath}/MyApp`;
            await RNFS.mkdir(folderPath);
            const path = `${folderPath}/${downloadFileName}`;
            await RNFS.writeFile(path, base64Data, 'base64');
            // Trigger media scan for Android versions below 13 (API 33) to make the file visible
            if (Platform.Version < 33) {
              RNFS.scanFile(path);
            }
            showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
          }
        }
      } else {
        // Handle direct URL downloads
        if (Platform.OS === 'ios') {
          await Share.share({ url: fileUri });
        } else {
          downloadFromUrlForAndroid(fileUri);
        }
      }
    } catch (error) {
      Logger.error('Download Error:', error);
      showCustomToast({ message: "Could not download file.", type: ToastType.ERROR });
    }
  };

  const requestStoragePermissionForAndroid = async (): Promise<boolean> => {
    try {
      if (Platform.OS !== 'android') return true;
      if (Platform.Version >= 33) return true;

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (result === PermissionsAndroid.RESULTS.GRANTED) return true;

      showCustomToast({ message: "Storage permission denied.", type: ToastType.ERROR });
      return false;
    } catch (err) {
      Logger.error(err);
      return false;
    }
  };

  const downloadFromUrlForAndroid = async (url: string) => {
    try {
      const { name: actualFileName, mime } = getFileDetails(url);
      if (Platform.Version >= 33) { // Android 13+
        const folderPath = `${RNFS.DownloadDirectoryPath}/MyApp`;
        await RNFS.mkdir(folderPath);
        const path = `${folderPath}/${actualFileName}`;
        const res = await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
        if (res.statusCode === 200) {
          showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
        } else {
          showCustomToast({ message: "Download failed.", type: ToastType.ERROR });
        }
      } else { // Android < 13
        const { config, fs } = ReactNativeBlobUtil;
        const downloadDir = fs.dirs.DownloadDir;
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
        showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_START"), type: ToastType.INFO });
        await config(rnFetchBlobOptions).fetch('GET', url);
        showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
      }
    } catch (err) {
      showCustomToast({ message: "An error occurred during download.", type: ToastType.ERROR });
      Logger.error(err);
    }
  };

  return (
    <View style={containerStyle}>
      <LabelComponent
        style={[commonStyles.chatSubTitlepara, commonStyles.mb12, commonStyles.mt4]}
        text={label}
        multiLanguageAllows={true}
      />

      {fileName && <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.flex1, commonStyles.chatuploadbg, commonStyles.p4, commonStyles.rounded5]}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={[commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flex1, commonStyles.alignCenter]}>
            <ActivityIndicator size="small" color={NEW_COLOR.TEXT_PRIMARY} />
          </View>
        ) : (
          <>
            <MaterialIcons name={isPdf ? "picture-as-pdf" : "attachment"} size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} style={!isPdf ? { transform: [{ rotate: "115deg" }] } : {}} />
            <ParagraphComponent style={[commonStyles.chattitletext, commonStyles.textprimary, commonStyles.flex1]} text={fileName || "No File"} numberOfLines={1} />
          </>
        )}
      </TouchableOpacity>}

      <Modal visible={isModalVisible} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
        <SafeAreaView style={commonStyles.flex1}>
          <Container style={commonStyles.container}>
            <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justify]}>
              <ParagraphComponent style={[commonStyles.sectionTitle, { width: s(120) }]} text={"GLOBAL_CONSTANTS.PREVIEW"} />
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <AntDesign size={s(24)} style={[commonStyles.textRight]} name="close" color={NEW_COLOR.TEXT_WHITE} />
              </TouchableOpacity>
            </View>

            {isPdf ? (
              <View style={styles.noPreviewContainer}>
                <MaterialIcons name="picture-as-pdf" size={s(60)} color={NEW_COLOR.TEXT_WHITE} />
                <ParagraphComponent text="PDF Preview Not Available" style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite, commonStyles.mt10]} />
              </View>
            ) : (
              <ImageUri uri={fileUri} style={styles.fullImage} />
            )}

            <ButtonComponent
              title={t("GLOBAL_CONSTANTS.DOWNLOAD")}
              onPress={handleDownload}
            />
          </Container>
        </SafeAreaView>
      </Modal>

    </View>
  );
};

export default FilePreviewWithId;

const screenStyeles = (NEW_COLOR: any) => StyleSheet.create({
  image: { width: "100%", height: s(184), borderRadius: 5, borderWidth: 1, borderColor: NEW_COLOR.INPUT_BORDER },
  fullImage: { width: "100%", height: "85%", resizeMode: "contain" },
  imageShowStyle: { width: "100%", height: 200, resizeMode: "cover", borderWidth: 1, borderColor: NEW_COLOR.INPUT_BORDER, borderRadius: 5 },
  noPreviewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
