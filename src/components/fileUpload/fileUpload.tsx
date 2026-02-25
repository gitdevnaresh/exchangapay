import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator, Image, Modal, StyleProp, ViewStyle, TextStyle, StyleSheet, SafeAreaView, Alert, Platform, ToastAndroid, Share, Keyboard } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { s } from "react-native-size-matters";
import { getThemedCommonStyles } from "../CommonStyles";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { AntDesign } from '@expo/vector-icons';
import Container from "../container/container";
import { useLngTranslation } from "../../hooks/languagesHook/useLngTranslation";
import RNFetchBlob from "rn-fetch-blob";
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import CustomRBSheet from "../models/commonBottomSheet";
import ButtonComponent from "../buttons/button";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import TextMultiLangauge from "../textComponets/multiLanguageText/textMultiLangauge";
import ViewComponent from "../view/view";
import GalleryIcon from "../svgIcons/mainmenuicons/galleryicon";
import UploadDeleteIcon from "../svgIcons/mainmenuicons/deleteicon";
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import LabelComponent from "../textComponets/lableComponent/lable";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import ProfileService from "../../apiServices/profile";
import { isErrorDispaly } from "../../utils/helpers";
import FileUploadIcon from "../../components/svgIcons/mainmenuicons/fileupload";
import { getTabsConfigation } from "../../../configuration";
import { LinearGradient } from "expo-linear-gradient";

/* 
DEV COMMENT: Enhanced FileUpload interface with built-in upload functionality
- Added fieldName, setFieldValue, setErrorMessage, scrollRef props for automatic form integration
- Component now handles upload internally using ProfileService
- Maintains backward compatibility with existing onSelectImage prop
- Eliminates need for complex upload logic in parent components
*/
interface FileUploadProps {
  label: string;
  subLabel?: string;
  errorMessage?: string | any;
  uploading?: boolean;
  fileLoader?: boolean;                 // External loader control
  uploadedImageUri?: string | null;
  onSelectImage?: (source?: 'camera' | 'library' | 'documents') => void;
  showImageSourceSelector?: boolean;
  deleteImage?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  uploadStyles?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  subLabelStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  isRequired?: boolean;
  maxFileSizeMB?: number;
  onFileSizeError?: (message: string) => void;
  onFileUpload?: (uri: string, fileName: string) => void;
  fieldName?: string;                    // Form field name to update
  setFieldValue?: (field: string, value: string) => void;  // Formik setFieldValue function
  setErrorMessage?: (message: string) => void;             // Error message setter
  scrollRef?: React.RefObject<any>;                        // Scroll reference for error handling
  fileName?: string | null;              // External file name
  editable?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  subLabel = "GLOBAL_CONSTANTS.PNG_JPG_JPEG_FILES_ALLOWED",
  errorMessage,
  uploading = false,
  fileLoader,
  uploadedImageUri = null,
  showImageSourceSelector = false,
  onSelectImage,
  deleteImage,
  containerStyle,
  uploadStyles,
  labelStyle,
  subLabelStyle,
  iconColor,
  isRequired,
  maxFileSizeMB = 15,
  onFileSizeError,
  onFileUpload,
  fieldName,
  setFieldValue,
  setErrorMessage,
  scrollRef,
  fileName,
  editable=true
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  /* 
  DEV COMMENT: Internal state management for built-in upload functionality
  - internalLoader: Manages loading state during upload operations
  - internalFileName: Tracks uploaded file names internally
  - These replace the need for external state management in parent components
  */
  const [internalLoader, setInternalLoader] = useState(false);
  const [internalFileName, setInternalFileName] = useState<string | null>(null);
  const { t } = useLngTranslation();
  const imageSourceSheetRef = React.useRef<any>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyles(NEW_COLOR);

  // Use external fileLoader if provided, otherwise fall back to internal loader
  const isLoading = fileLoader !== undefined ? fileLoader : internalLoader;
  const displayFileName = fileName || internalFileName;

  // Sync internal file name with uploadedImageUri prop
  useEffect(() => {
    if (!uploadedImageUri) {
      setInternalFileName(null);
    } else if (uploadedImageUri && !internalFileName) {
      // Extract filename from URI if available
      const extractedName = uploadedImageUri.split('/').pop() || null;
      setInternalFileName(extractedName);
    }
  }, [uploadedImageUri]);

  const scrollToTop = () => {
    if (scrollRef?.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      });
    }
  };

  const handleError = (error: any) => {
    const errorMsg = isErrorDispaly(error);
    if (setErrorMessage) {
      setErrorMessage(errorMsg);
      scrollToTop();
    }
  };
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



  const downloadImage = async (imageUrl: string | null | undefined) => {
    if (!imageUrl) {
      ToastAndroid.show("No file to download.", ToastAndroid.SHORT);
      return;
    }

    const permissionGranted = await requestStoragePermissionForAndroid();
    if (Platform.OS === 'android' && !permissionGranted && Number(Platform.Version) < 33) {
      return;
    }

    try {
      if (imageUrl.startsWith('data:')) {
        const match = imageUrl.match(/^data:(.+);base64,(.*)$/);
        if (!match) {
          ToastAndroid.show("Invalid file format.", ToastAndroid.SHORT);
          return;
        }
        const mimeType = match[1];
        const base64Data = match[2];
        const isPdf = displayFileName?.toLowerCase().endsWith('.pdf') || false;
        const extension = isPdf ? 'pdf' : (mimeType.split('/')[1] || 'jpg');
        const downloadFileName = displayFileName || `download_${Date.now()}.${extension}`;

        if (Platform.OS === 'ios') {
          const path = `${RNFS.TemporaryDirectoryPath}/${downloadFileName}`;
          await RNFS.writeFile(path, base64Data, 'base64');
          await Share.share({ url: path });
          await RNFS.unlink(path);
        } else {
          const isPdf = downloadFileName.toLowerCase().endsWith('.pdf');
          const folderPath = isPdf ? `${RNFS.DownloadDirectoryPath}` : `${RNFS.PicturesDirectoryPath}`;
          const path = `${folderPath}/${downloadFileName}`;
          await RNFS.writeFile(path, base64Data, 'base64');

          // Trigger media scan to make file visible
          RNFS.scanFile(path);
          ToastAndroid.show(t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE") || "Download complete", ToastAndroid.SHORT);
        }
      } else {
        if (Platform.OS === 'ios') {
          await Share.share({ url: imageUrl });
        } else {
          await downloadFromUrlForAndroid(imageUrl);
        }
      }
    } catch (error) {
      ToastAndroid.show("Could not download file.", ToastAndroid.LONG);
    }
  };

  const requestStoragePermissionForAndroid = async (): Promise<boolean> => {
    try {
      const permission = Number(Platform.Version) >= 33
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

      const result = await request(permission);
      if (result === RESULTS.GRANTED) return true;

      ToastAndroid.show("Storage permission denied.", ToastAndroid.LONG);
      return false;
    } catch (err) {
      ToastAndroid.show('Something went wrong', ToastAndroid.LONG);
    }
  };

  const downloadFromUrlForAndroid = async (url: string) => {
    try {
      // Handle content URIs and file URIs by copying to appropriate folder
      if (url.startsWith('content://') || url.startsWith('file://')) {
        const fileName = displayFileName || `download_${Date.now()}.${url.includes('.pdf') ? 'pdf' : 'jpg'}`;
        const isPdf = fileName.toLowerCase().endsWith('.pdf');
        const folderPath = isPdf ? `${RNFS.DownloadDirectoryPath}` : `${RNFS.PicturesDirectoryPath}`;
        const destinationPath = `${folderPath}/${fileName}`;

        await RNFS.copyFile(url, destinationPath);

        // Trigger media scan to make file visible
        RNFS.scanFile(destinationPath);
        ToastAndroid.show(t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE") || "Download complete", ToastAndroid.SHORT);
        return;
      }

      const { name: actualFileName, mime } = getFileDetails(url);
      if (Number(Platform.Version) >= 33) {
        const isPdf = actualFileName.toLowerCase().endsWith('.pdf');
        const folderPath = isPdf ? `${RNFS.DownloadDirectoryPath}` : `${RNFS.PicturesDirectoryPath}`;
        const path = `${folderPath}/${actualFileName}`;
        const res = await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
        if (res.statusCode === 200) {
          // Trigger media scan to make file visible
          RNFS.scanFile(path);
          ToastAndroid.show(t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE") || "Download complete", ToastAndroid.SHORT);
        } else {
          ToastAndroid.show("Download failed.", ToastAndroid.LONG);
        }
      } else {
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
        ToastAndroid.show(t("GLOBAL_CONSTANTS.DOWNLOAD_START") || "Download started", ToastAndroid.SHORT);
        await config(rnFetchBlobOptions).fetch('GET', url);
        ToastAndroid.show(t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE") || "Download complete", ToastAndroid.SHORT);
      }
    } catch (err: any) {
      let errorMessage = 'Something went wrong during download.';
      if (err.message) {
        if (err.message?.toLowerCase().includes("permission denied") || err.message.toLowerCase().includes("eacces")) {
          errorMessage = "Download failed due to a permission issue.";
        } else if (err.message.toLowerCase().includes("no address associated with hostname") || err.message.toLowerCase().includes("network error") || err.message.toLowerCase().includes("failed to connect")) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
      }
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    }
  };
  const downloadTemplete = () => {
    downloadImage(uploadedImageUri);
  };

  const getFileExtension = (uri: string) => {
    const parts = uri.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() : 'jpg';
  };

  const verifyFileTypes = (fileName: string) => {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    const extension = getFileExtension(fileName);
    return allowedExtensions.includes(extension || '');
  };

  /* 
  DEV COMMENT: Built-in server upload functionality
  - Handles file upload to ProfileService automatically
  - Updates form fields via setFieldValue when fieldName is provided
  - Manages loading states and error handling internally
  - Eliminates need for duplicate upload logic in parent components
  */
  const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string) => {
    setInternalLoader(true);

    const formData = new FormData();
    formData.append('document', {
      uri: uri,
      type: `${type}/${fileExtension}`,
      name: fileName,
    } as any);

    try {
      const uploadRes = await ProfileService.uploadFile(formData);
      if (uploadRes.status === 200) {
        const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
        // Automatically update form field if integration props are provided
        if (setFieldValue && fieldName) {
          setFieldValue(fieldName, uploadedImage);
        }
        // Callback for additional handling if needed
        if (onFileUpload) {
          onFileUpload(uploadedImage, fileName);
        }
        // Clear any existing error messages
        if (setErrorMessage) {
          setErrorMessage('');
        }
      } else {
        handleError(uploadRes);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setInternalLoader(false);
    }
  };

  const handleUploadImg = async (pickerOption?: 'camera' | 'library' | 'documents') => {
    try {
      if (pickerOption === 'documents') {
        await new Promise(resolve => setTimeout(resolve, 200));
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const selectedFile = result.assets[0];
        const { uri, mimeType, name, size } = selectedFile;
        const fileName = name || uri.split('/').pop() || `file_${Date.now()}`;

        const fileSizeMB = size ? size / (1024 * 1024) : 0;
        if (fileSizeMB > maxFileSizeMB) {
          const errorMsg = t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB') || `File size exceeded ${maxFileSizeMB}MB limit`;
          if (setErrorMessage) {
            setErrorMessage(errorMsg);
            scrollToTop();
          }
          if (onFileSizeError) {
            onFileSizeError(errorMsg);
          }
          return;
        }

        const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
        const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

        if (!isPdf && !isImage) {
          const errorMsg = t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED') || 'Only images and PDF files are accepted';
          if (setErrorMessage) {
            setErrorMessage(errorMsg);
            scrollToTop();
          }
          return;
        }

        setInternalFileName(fileName);

        const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
        const type = isPdf ? 'application' : 'image';

        await uploadFileToServer(uri, type, fileName, fileExtension);
        return;
      }

      const permissionResult = pickerOption === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
        return;
      }

      const result = pickerOption === 'camera'
        ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: false, aspect: [1, 1], quality: 0.5 });

      if (result.canceled) return;

      const selectedImage = result.assets[0];
      const { uri, type } = selectedImage;
      const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
      const fileExtension = getFileExtension(selectedImage.uri);

      if (!verifyFileTypes(fileName)) {
        const errorMsg = t('GLOBAL_CONSTANTS.ONLY_JPG_JPEG_PNG_FILES_ALLOWED') || 'Only JPG, JPEG, PNG files are allowed';
        if (setErrorMessage) {
          setErrorMessage(errorMsg);
          scrollToTop();
        }
        return;
      }

      const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
      if (fileSizeMB > maxFileSizeMB) {
        const errorMsg = t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB') || `File size exceeded ${maxFileSizeMB}MB limit`;
        if (setErrorMessage) {
          setErrorMessage(errorMsg);
          scrollToTop();
        }
        if (onFileSizeError) {
          onFileSizeError(errorMsg);
        }
        return;
      }

      setInternalFileName(fileName);

      if (uri && type && fileExtension) {
        await uploadFileToServer(uri, type, fileName, fileExtension);
      }
    } catch (err) {
      handleError(err);
    }
  };

  /* 
  DEV COMMENT: Enhanced upload press handler with automatic fallback
  - Maintains backward compatibility with existing onSelectImage prop
  - Falls back to built-in upload functionality when no external handler provided
  - Provides seamless integration for both legacy and new usage patterns
  */
  const handleUploadPress = () => {
    Keyboard.dismiss();
    if (showImageSourceSelector) {
      imageSourceSheetRef.current?.open();
    } else if (onSelectImage) {
      // Legacy support: use external handler if provided
      onSelectImage();
    } else {
      // New functionality: use built-in upload handling
      handleUploadImg('documents');
    }
  };
  return (
    <View style={containerStyle}>
      <View style={[]}>
        <LabelComponent style={[commonStyles.inputLabel,]} text={label} children={isRequired && <ParagraphComponent style={[commonStyles.textRed]} text={" *"} /> || ""} />
      </View>
      {!uploadedImageUri && !uploading && (
        <TouchableOpacity activeOpacity={0.6} onPress={handleUploadPress}>
          <View style={[commonStyles.uploadStyle, uploadStyles,]}>
            {isLoading ? (
              <View style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, { height: 120 }]}>
                <ActivityIndicator size="large" color={NEW_COLOR.TEXT_WHITE} />
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
                  style={[commonStyles.fileuploadprimarytext]}
                  text={"GLOBAL_CONSTANTS.CHOOSE_FILE(15MB)"}
                />
                <TextMultiLangauge
                  style={[commonStyles.fileuploadsecondarytext, subLabelStyle]}
                  text={t(subLabel)}
                />
              </>
            )}
          </View>
        </TouchableOpacity>
      )}

      <View style={{ flex: 1 }}>
        {uploadedImageUri && !uploading && (
          <>
            <TouchableOpacity onPress={() => setIsModalVisible(true)} activeOpacity={0.7}>
              <View>
                {displayFileName?.toLowerCase().endsWith(".pdf") ? (
                  <View style={[commonStyles.customuploadimage, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                    <MaterialIcons name="picture-as-pdf" size={s(60)} color={NEW_COLOR.TEXT_PRIMARY} />
                  </View>
                ) : (
                  <View style={commonStyles.customuploadimage}>
                    <Image
                      style={commonStyles.customuploadpassportImage}
                      resizeMode="contain"
                      source={{ uri: uploadedImageUri }}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={[commonStyles.attachmentStyle, commonStyles.justifyContent]}>
              <TouchableOpacity activeOpacity={uploadedImageUri && !uploading && 0.7 || 1} onPress={() => setIsModalVisible(true)} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1]}>
                <MaterialIcons name="attachment" size={s(18)} color={NEW_COLOR.FILE_ATTACHMENT_ICON} style={{ transform: [{ rotate: "115deg" }] }} />
                <ParagraphComponent style={[commonStyles.Attachedfiletext, commonStyles.flex1]} text={displayFileName || "Upload File"} numberOfLines={1} />
              </TouchableOpacity>
               {editable&&  <TouchableOpacity activeOpacity={0.8} onPress={deleteImage}>
                <UploadDeleteIcon />
              </TouchableOpacity>}
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


                    {displayFileName?.toLowerCase()?.endsWith('.pdf') ? (
                      <View style={[styles.fullImage, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                        <MaterialIcons name="picture-as-pdf" size={s(120)} color={NEW_COLOR.TEXT_PRIMARY} />
                        <ParagraphComponent text={displayFileName} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.mt10, commonStyles.textCenter]} numberOfLines={2} />
                      </View>
                    ) : (
                      <Image source={{ uri: uploadedImageUri }} style={[styles.fullImage, commonStyles.mxAuto]} resizeMode="contain" />
                    )}

                  </View>
                  <View>
                    <View style={[commonStyles.sectionGap]} />
                    <ButtonComponent title={"GLOBAL_CONSTANTS.DOWNLOAD"} onPress={downloadTemplete} />
                    <View style={[commonStyles.mb40]} />
                  </View>
                </Container>
              </SafeAreaView>
            </Modal>
          </>
        )}
      </View>

      {showImageSourceSelector && (
        <CustomRBSheet
          height={"Small"}
          title={t("GLOBAL_CONSTANTS.SELECT_OPTION") || "Select Option"}
          refRBSheet={imageSourceSheetRef}
        >
          <View>
            <View>


              {/* 
              DEV COMMENT: Gallery/Documents selection with dual compatibility
              - Supports both legacy onSelectImage callback and new built-in handling
              - Provides smooth transition for existing implementations
              */}
              <TouchableOpacity onPress={() => {
                imageSourceSheetRef.current?.close();
                setTimeout(() => {
                  if (onSelectImage) {
                    onSelectImage('documents');
                  } else {
                    handleUploadImg('documents');
                  }
                }, 300);
              }}
                style={[]}
              >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, },]}>
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                    <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb5, commonStyles.bottomsheeticonbg]}>
                      <GalleryIcon width={s(18)} height={s(18)} />
                    </ViewComponent>
                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.CHOOSE_FROM_GALLERY"} style={[commonStyles.bottomsheeticonprimarytext]} />
                  </ViewComponent>
                  <Entypo name="chevron-small-right" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                </ViewComponent>
              </TouchableOpacity>
              <ViewComponent style={[commonStyles.listGap]} />








              {/* 
              DEV COMMENT: Camera selection with dual compatibility
              - Same pattern as gallery selection for consistency
              - Maintains existing behavior while adding new capabilities
              */}
              <TouchableOpacity onPress={() => {
                imageSourceSheetRef.current?.close();
                setTimeout(() => {
                  if (onSelectImage) {
                    onSelectImage('camera');
                  } else {
                    handleUploadImg('camera');
                  }
                }, 300);
              }}
              >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, },]} >
                  <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                    <ViewComponent style={[commonStyles.mb5, commonStyles.bottomsheeticonbg]}>
                      <Feather name="camera" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                    </ViewComponent>
                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.TAKE_PHOTO"} style={[commonStyles.bottomsheeticonprimarytext, commonStyles.dflex]} />
                  </ViewComponent>
                  <Entypo name="chevron-small-right" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                </ViewComponent>
              </TouchableOpacity>
            </View>
            <View style={[commonStyles.mb16]} />
          </View>
        </CustomRBSheet>
      )}
      {errorMessage && <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.inputrequirederrormessage]} text={errorMessage} />}
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

const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
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
  }
});

