import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, Image, Modal, StyleProp, ViewStyle, TextStyle, StyleSheet, SafeAreaView, Alert, Platform, ToastAndroid, Share, Keyboard } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { s } from "react-native-size-matters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useLngTranslation } from "../../hooks/useLngTranslation";
import RNFetchBlob from "rn-fetch-blob";
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import { useThemeColors } from "../../hooks/useThemeColors";
import ParagraphComponent from "../../newComponents/textComponets/paragraphText/paragraph";
import TextMultiLangauge from "../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ViewComponent from "../../newComponents/view/view";
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import LabelComponent from "../textComponets/lableComponent/lable";
import UploadDeleteIcon from "../../assets/mainmenuicons/deleteicon copy";
import GalleryIcon from "../../assets/mainmenuicons/galleryicon copy";
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import PopupOrSheet from "../models/PopupOrSheet";
import Container from "../container/container";
import ButtonComponent from "../buttons/button";
import { showCustomToast, ToastType } from "../ToasterMessages";
import RNShare from "react-native-share";
import ImageSourcePopup from "./fileUploadPopup";
interface FileUploadProps {
  label: string;
  subLabel?: string|null;
  errorMessage?: string | any;
  uploading?: boolean;
  fileLoader?: boolean;
  uploadedImageUri?: string | null;
  onSelectImage: (source?: 'camera' | 'library') => void;
  showImageSourceSelector?: boolean;
  deleteImage?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  uploadStyles?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  subLabelStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  fileName?: string | any;
  isRequired?: boolean;
  maxFileSizeMB?: number;
  onFileSizeError?: (message: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  subLabel,
  errorMessage,
  uploading = false,
  fileLoader = false,
  uploadedImageUri = null,
  showImageSourceSelector = false,
  onSelectImage,
  deleteImage,
  containerStyle,
  uploadStyles,
  labelStyle,
  subLabelStyle,
  iconColor,
  fileName,
  isRequired,
  maxFileSizeMB = 15,
  onFileSizeError,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useLngTranslation();
  const imageSourceSheetRef = React.useRef<any>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reverseCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR)

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
  const extension = (fileName || uploadedImageUri?.split('/').pop() || '').split('.').pop()?.toLowerCase();

  const requestStoragePermissionForAndroid = async (): Promise<boolean> => {
    try {
      const permission = Number(Platform.Version) >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

      const result = await request(permission);
      if (result === RESULTS.GRANTED) return true;

      showCustomToast({ message: "Storage permission denied.", type: ToastType.ERROR });
      return false;
    } catch (err) {
      return false;
    }
  };

  const downloadFromUrlForAndroid = async (url: string) => {
    try {
      const { name: actualFileName, mime } = getFileDetails(url);
      if (Number(Platform.Version) >= 33) { // Android 13+
        const folderPath = `${RNFS.DownloadDirectoryPath}/BullSwipe`;
        await RNFS.mkdir(folderPath);
        const path = `${folderPath}/${actualFileName}`;
        const res = await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
        if (res.statusCode === 200) {
          await refreshGallery(path);
          // showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
        } else {
          showCustomToast({ message: "Download failed.", type: ToastType.ERROR });
        }
      } else { // Android < 13
        const { config, fs } = RNFetchBlob;
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
        await config(rnFetchBlobOptions).fetch('GET', url);
        // showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
      }
    } catch (err: any) {
      showCustomToast({ message: `Download error: ${err.message || 'Unknown error'}`, type: ToastType.ERROR });
    }
  };
  const refreshGallery = async (filePath: string) => {
    try {
      if (Platform.OS === 'android') {
        await RNFetchBlob.fs.scanFile([{ path: filePath, mime: 'image/*' }]);
      }
    } catch (err) {
      console.log('Gallery refresh failed:', err);
    }
  };


  const handleDownload = async () => {
    if (!uploadedImageUri) {
      showCustomToast({ message: 'No file to download.', type: ToastType.WARNING });
      return;
    }

    try {
      // Handle content:// URIs (Android)
      if (uploadedImageUri.startsWith('content://')) {
        const downloadFileName = fileName || `download_${Date.now()}.${extension || 'jpg'}`;
        showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_START"), type: ToastType.INFO });

        if (Platform.OS === 'ios') {
          await Share.share({ url: uploadedImageUri });
        } else {
          try {
            // Read the file content from content URI and write to downloads
            const fileContent = await RNFS.readFile(uploadedImageUri, 'base64');
            const folderPath = `${RNFS.DownloadDirectoryPath}/BullSwipe`;
            await RNFS.mkdir(folderPath);
            const destinationPath = `${folderPath}/${downloadFileName}`;
            await RNFS.writeFile(destinationPath, fileContent, 'base64');
            await refreshGallery(destinationPath);
            showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
          } catch (contentError) {
            try {
              const folderPath = `${RNFS.DownloadDirectoryPath}/BullSwipe`;
              await RNFS.mkdir(folderPath);
              const destinationPath = `${folderPath}/${downloadFileName}`;
              await RNFS.copyFile(uploadedImageUri, destinationPath);
              showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETED"), type: ToastType.SUCCESS });
            } catch (copyError) {
              showCustomToast({ message: `Content URI download failed: ${copyError.message}`, type: ToastType.ERROR });
            }
          }
        }
        return;
      }

      if (uploadedImageUri.startsWith('data:')) {
        const match = uploadedImageUri.match(/^data:(.+);base64,(.*)$/);
        if (!match) {
          showCustomToast({ message: 'Invalid file format.', type: ToastType.ERROR });
          return;
        }

        const mimeType = match[1];
        const base64Data = match[2];
        const extension = mimeType.split('/')[1] || 'jpg';
        const downloadFileName = `download_${Date.now()}.${extension}`;

        showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_START"), type: ToastType.INFO });

        if (Platform.OS === 'ios') {
          const path = `${RNFS.TemporaryDirectoryPath}/${downloadFileName}`;
          await RNFS.writeFile(path, base64Data, 'base64');
          await Share.share({ url: `file://${path}` });
        } else {
          if (Number(Platform.Version) >= 33) {
            const folderPath = `${RNFS.DownloadDirectoryPath}/BullSwipe`;
            await RNFS.mkdir(folderPath);
            const path = `${folderPath}/${downloadFileName}`;
            await RNFS.writeFile(path, base64Data, 'base64');
          } else {
            const granted = await requestStoragePermissionForAndroid();
            if (!granted) return;

            const path = `${RNFS.DownloadDirectoryPath}/${downloadFileName}`;
            await RNFS.writeFile(path, base64Data, 'base64');
          }
        }

        showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });

      } else {
        // Direct URL case
        if (Platform.OS === 'ios') {
          showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_START"), type: ToastType.INFO });
          await shareFileOnIOS(uploadedImageUri);
          showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
        } else {
          showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_START"), type: ToastType.INFO });
          await downloadFromUrlForAndroid(uploadedImageUri);
          showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
        }
      }
    } catch (error) {
      showCustomToast({ message: 'Could not download file.', type: ToastType.ERROR });
    }
  };

  const handleUploadPress = () => {
    Keyboard.dismiss();
    if (showImageSourceSelector) {
      setTimeout(() => {
        imageSourceSheetRef.current?.open();
      }, 300);
    } else {
      onSelectImage();
    }
  };

  const renderIcon = () => {
    switch (extension) {
      case 'pdf':
        return <FontAwesome5 name="file-pdf" size={s(50)} color={NEW_COLOR.TEXT_WHITE} />;
      case 'doc':
      case 'docx':
        return <FontAwesome5 name="file-word" size={s(50)} color={NEW_COLOR.TEXT_WHITE} />;
      case 'xls':
      case 'xlsx':
        return <FontAwesome5 name="file-excel" size={s(50)} color={NEW_COLOR.TEXT_WHITE} />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <MaterialIcons name="image" size={s(50)} color={NEW_COLOR.TEXT_WHITE} />;
      default:
        return <MaterialIcons name="description" size={s(50)} color={NEW_COLOR.TEXT_WHITE} />;
    }
  };

  const getFileExtension = (fileUri: string) => {
    return fileUri?.split('.').pop()?.toLowerCase() || '';
  };
  const shareFileOnIOS = async (uri: string) => {
  try {
    // Always derive name/mime from a "real filename"
    const { name, mime } = getFileDetails(uri);
    let localPath = uri;
    let shareMime = mime;

    // If it's remote, download to a real file with extension
    if (uri.startsWith("http")) {
      const downloadedPath = `${RNFS.TemporaryDirectoryPath}/${name}`;

      const res = await RNFS.downloadFile({
        fromUrl: uri,
        toFile: downloadedPath,
      }).promise;

      if (res.statusCode !== 200) {
        showCustomToast({ message: "Failed to prepare file for sharing.", type: ToastType.ERROR });
        return;
      }

      localPath = `file://${downloadedPath}`;
      shareMime = getFileDetails(downloadedPath).mime; // ✅ ensure correct mime from final file
    }

    // If already local path ("/var/.."), add file://
    if (uri.startsWith("/") && !uri.startsWith("file://")) {
      localPath = `file://${uri}`;
      shareMime = getFileDetails(uri).mime;
    }
    // If already file:// keep it
    if (uri.startsWith("file://")) {
      localPath = uri;
      shareMime = getFileDetails(uri).mime;
    }
    await RNShare.open({
      url: localPath,
      type: shareMime,
      failOnCancel: false,
    });
  } catch (error) {
    showCustomToast({ message: "Unable to share file. Please try again.", type: ToastType.ERROR });
  }
};


  return (
    <View style={containerStyle}>
      <View style={[]}>
        <LabelComponent style={[commonStyles.inputLabel]} text={t(label)} children={isRequired && <ParagraphComponent style={[commonStyles.textRed]} text={" *"} /> || ""} />
      </View>
      {!uploadedImageUri && !uploading && (
        <TouchableOpacity activeOpacity={0.6} onPress={handleUploadPress}>
          <View style={[commonStyles.uploadStyle, uploadStyles, styles.inputborder]}>
            {fileLoader ? (
              <View style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, { height: 120 }]}>
                <ActivityIndicator size="large" color={NEW_COLOR.BG_YELLOW} />
              </View>
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={s(40)}
                  color={iconColor || NEW_COLOR.TEXT_WHITE}
                  style={[commonStyles.mxAuto, commonStyles.mb8, commonStyles.textCenter]}
                />
                <TextMultiLangauge
                  style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textCenter, commonStyles.mb4, { color: iconColor || NEW_COLOR.TEXT_WHITE }]}
                  text={"GLOBAL_CONSTANTS.CHOOSE_FILE(15MB)"}
                />
                <TextMultiLangauge
                  style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400, commonStyles.textCenter, subLabelStyle]}
                  text={subLabel || "GLOBAL_CONSTANTS.PNG_JPG_JPEG_FILES_ALLOWED"}
                />
              </>
            )}
          </View>
        </TouchableOpacity>
      )}

      {uploadedImageUri && !uploading && (
        <>
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.7}
          >
            {["png", "jpg", "jpeg"].includes(getFileExtension(uploadedImageUri || '')) ? (
              <Image
                style={styles.passport}
                overlayColor={NEW_COLOR.TEXT_WHITE}
                resizeMode="contain"
                source={{ uri: uploadedImageUri || '' }}
              />
            ) : (
              <View style={[styles.passport, { justifyContent: 'center', alignItems: 'center', backgroundColor: NEW_COLOR.TEXTBLACK }]}>
                {renderIcon()}
                {/* <ParagraphComponent
                  style={[commonStyles.textWhite,{ textAlign: 'center', marginTop: s(8) }]}
                  text={fileName || uploadedImageUri?.split('/').pop()}
                  numberOfLines={1}
                /> */}
              </View>
            )}
          </TouchableOpacity>

          <View style={[commonStyles.attachmentStyle, commonStyles.justifyContent]}>
            <TouchableOpacity
              activeOpacity={uploadedImageUri && !uploading ? 0.7 : 1}
              onPress={() => setIsModalVisible(true)}
              style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1]}
            >
              <MaterialIcons
                name="attachment"
                size={s(18)}
                color={NEW_COLOR.BG_YELLOW}
                style={{ transform: [{ rotate: "115deg" }] }}
              />
              <ParagraphComponent
                style={[commonStyles.fs14, commonStyles.fw500, commonStyles.flex1, { color: iconColor || NEW_COLOR.TEXT_WHITE }]}
                text={uploadedImageUri?.split('/')?.pop() || fileName}
                numberOfLines={1}
              />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={deleteImage}>
              <UploadDeleteIcon color={NEW_COLOR.BG_YELLOW} />
            </TouchableOpacity>
          </View>

          <Modal visible={isModalVisible} statusBarTranslucent={true} transparent={false} animationType="fade">
            <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
              <Container style={[commonStyles.container, commonStyles.nativeModalpt]}>
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.mt5]}>
                  <TextMultiLangauge style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.PREVIEW"} />
                  <TouchableOpacity style={[commonStyles.p10]} activeOpacity={0.7} onPress={() => setIsModalVisible(false)}>
                    <AntDesign size={s(24)} name="close" color={NEW_COLOR.TEXT_WHITE} />
                  </TouchableOpacity>
                </View>
                <View style={[commonStyles.flex1, commonStyles.mt10]}>
                  {["png", "jpg", "jpeg", "gif"].includes(getFileExtension(uploadedImageUri || '')) ? (
                    <Image source={{ uri: uploadedImageUri }} style={[styles.fullImage, commonStyles.mxAuto]} resizeMode="contain" />
                  ) : (
                    <View style={styles.noPreviewContainer}>
                      {renderIcon()}
                      <ParagraphComponent
                        text={fileName || uploadedImageUri?.split('/').pop()}
                        style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite, commonStyles.mt10]}
                        numberOfLines={1}
                      />
                    </View>
                  )}
                </View>
                <View>
                  <View style={[commonStyles.sectionGap]} />
                  <ButtonComponent title={"GLOBAL_CONSTANTS.DOWNLOAD"} onPress={handleDownload} />
                  <View style={[commonStyles.mb40]} />
                </View>
              </Container>
            </SafeAreaView>
          </Modal>
        </>
      )}
      {showImageSourceSelector && (
        <ImageSourcePopup
          imageSourceSheetRef={imageSourceSheetRef}
          onSelectImage={onSelectImage}
        />
      )}
      {errorMessage &&
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
          <AntDesign
            name="closecircleo"
            size={s(14)}
            color={NEW_COLOR.TEXT_RED}
            style={[commonStyles.mt6]}
          />
          <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.inputerrormessage, commonStyles.fw400, commonStyles.fs14]} text={errorMessage} />
        </ViewComponent>}
    </View>
  );
};

// Helper function to validate file size for both Android and iOS
export const validateFileSize = (fileUri: string, maxSizeMB: number = 15): Promise<boolean> => {
  return new Promise((resolve) => {
    RNFS.stat(fileUri)
      .then((stats) => {
        const fileSizeMB = stats.size / (1024 * 1024);
        resolve(fileSizeMB <= maxSizeMB);
      })
      .catch(() => resolve(true)); // If we can't get size, allow upload
  });
};

export default FileUpload;

const screenStyeles = (NEW_COLOR: any) => StyleSheet.create({
  passport: {
    width: "100%",
    borderRadius: 5,
    height: s(184),
    borderWidth: 1,
    borderColor: NEW_COLOR.BORDER_LIGHT_GREEN,
    overflow: "hidden",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "90%", resizeMode: "contain", marginTop: "auto", marginBottom: "auto"
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  labelStyle: {

  },
  inputborder: {
    borderWidth: 1,
    borderColor: NEW_COLOR.INPUT_BORDER,
    borderRadius: s(12), marginTop: s(4)
  },
  noPreviewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
