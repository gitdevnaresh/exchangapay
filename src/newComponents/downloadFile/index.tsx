import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, Share, ToastAndroid, View } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import { s } from '../../constants/theme/scale';
import ButtonComponent from '../buttons/button';
import CustomOverlay from '../../components/commonOverlay';
import ParagraphComponent from '../../components/Paragraph/Paragraph';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { TransactionDownload } from '../../assets/svg';
import { useThemeColors } from '../../hooks/useThemeColors';
import { showCustomToast, ToastType } from '../ToasterMessages';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { COMMON_SVG_URLS } from '../../assets/blobUrls';
interface DownloadFileProps {
    imageURL: string;
    fileName?: string;
    onDownloadSuccess?: () => void;
    uri?: any;
    imageHeight?: any;
    imageWidth?: any;
    isDownloadInvoice?: boolean;
    autoStartDownload?: boolean;
    onAutoStartProcessed?: () => void;
    onDownloadAttempt?: () => void; // Callback when download attempt begins
}
const getCleanFileExtension = (urlString: string): string => {
    const urlWithoutQuery = urlString.split('?')[0];
    const urlWithoutHash = urlWithoutQuery.split('#')[0];
    const parts = urlWithoutHash.split('.');
    if (parts.length === 1 || (parts[0] === "" && parts.length === 2 && !parts[1])) {
        return '';
    }
    return parts.pop()?.toLowerCase() || '';
};

const getMimeTypeFromExtension = (extension: string): string => {
    switch (extension.toLowerCase()) {
        case 'pdf': return 'application/pdf';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'txt': return 'text/plain';
        default: return 'application/octet-stream'; 
    }
};

const DownloadFile: React.FC<DownloadFileProps> = ({
    imageURL,
    fileName,
    onDownloadSuccess,
    uri = COMMON_SVG_URLS.downloadIcon,
    isDownloadInvoice = false,
    autoStartDownload = false,
    onAutoStartProcessed,
    onDownloadAttempt
}) => {
    const [loading, setLoading] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [overlayTitle, setOverlayTitle] = useState("");
    const [overlayText, setOverlayText] = useState("");
    const {t} = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        if (autoStartDownload && imageURL && !loading) {
            // console.log("Auto-starting download for:", imageURL);
            if (onDownloadAttempt) {
                onDownloadAttempt();
            }
            newCheckPermission();
            if (onAutoStartProcessed) {
                onAutoStartProcessed();
            }
        }
    }, [autoStartDownload, imageURL, loading, onAutoStartProcessed, onDownloadAttempt]);


    const onDownloadError = () => {
        showCustomToast({message:t("GLOBAL_CONSTANTS.DOWNLOAD_FAILED"),  type: ToastType.ERROR, duration: ToastAndroid.LONG });
        
        setOverlayText(t("GLOBAL_CONSTANTS.THERE_WAS_AN_ERROR_DOWNLOADING_THE_FILE"))
    };

    const checkPermission = async () => {
        setLoading(true);
        if (onDownloadAttempt) {
            onDownloadAttempt();
        }
        if (Platform.OS === 'ios') {
            setLoading(false);
            await downloadImage();
        } else {
            if (Number(Platform.Version) >= 30) {
                await downloadPdfAndroid11Plus(uri,imageURL);
                return;
            }
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: t("GLOBAL_CONSTANTS.STORAGE_PERMISSION_REQUIRED"),
                        message:  t("GLOBAL_CONSTANTS.APP_NEEDS_ACCESS_TO_YOUR_STORAGE_TO_DOWNLOAD_PHOTOS"),
                        buttonPositive: t("GLOBAL_CONSTANTS.OK")
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    await downloadImage();
                    setLoading(false);
                } else {
                    setOverlayVisible(true);
                    setOverlayTitle(t("GLOBAL_CONSTANTS.DOWNLOAD_STATUS"))
                    showCustomToast({message:t("GLOBAL_CONSTANTS.STORAGE_PERMISSION_NOT_GRANTED"),  type: ToastType.WARNING, duration: ToastAndroid.LONG });

                    setLoading(false);
                }
            } catch (err) {
                setLoading(false);
            }
        }
    };
    const downloadPdfAndroid11Plus = async (actualFileUrl: string, targetFileNameBase?: string) => {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 30) {
    throw new Error('This method is for Android 11+ only and should not be called on other platforms/versions.');
  }
  try {
    const response = await axios.get(actualFileUrl, { responseType: 'arraybuffer' });
    const binary = new Uint8Array(response.data);
    let binaryStr = '';
    for (let i = 0; i < binary.length; i++) {
      binaryStr += String.fromCharCode(binary[i]);
    }
    if (typeof btoa === 'undefined') {
        throw new Error("btoa is not available for base64 encoding.");
    }
    const base64Data = btoa(binaryStr); // Use btoa to create base64
    const { DownloadDirectoryPath } = RNFS;
    const ext = getCleanFileExtension(actualFileUrl);
    const fileExtension = ext ? `.${ext}` : '.dat'; 

    let namePartToUse = targetFileNameBase;
    if (!namePartToUse) {
        const urlFileNameWithExt = actualFileUrl.split('?')[0].split('/').pop() || `file_${Date.now()}`;
        const lastDotIndex = urlFileNameWithExt.lastIndexOf('.');
        if (lastDotIndex > 0 && urlFileNameWithExt.substring(lastDotIndex + 1).toLowerCase() === ext) {
            namePartToUse = urlFileNameWithExt.substring(0, lastDotIndex);
        } else {
            namePartToUse = urlFileNameWithExt;
        }
    }
    if (!namePartToUse) namePartToUse = `download_${Date.now()}`;

    const date = new Date();
    const timestampSuffix = `_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
    
    const finalFileName = `${namePartToUse}${timestampSuffix}${fileExtension}`;
    const filePath = `${DownloadDirectoryPath}/${finalFileName}`;

    await RNFS?.writeFile(filePath, base64Data, 'base64');
    return filePath;
  } catch (error) {
    throw error; // Re-throw the error to be handled by the caller
  }
};
    const downloadImage = async () => {
         const date = new Date();
        const ext = getCleanFileExtension(imageURL);
        const fileExtension = ext ? `.${ext}` : '';
        const mimeType = getMimeTypeFromExtension(ext);
        const fileNameFinal = fileName || imageURL?.split('/').pop()?.split('.')[0] || 'download';
        const { fs } = RNFetchBlob;
        const PictureDir = fs.dirs.DownloadDir;

        if (Platform.OS !== 'ios') {
            try {
                const res = await RNFetchBlob.config({
                    fileCache: true,
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        path: `${PictureDir}/${fileNameFinal}_${Math.floor(date.getTime() + date.getSeconds() / 2)}${fileExtension}`,
                        description: 'Downloading file...',
                        mime: mimeType, 
                    },
                }).fetch('GET', imageURL);

                if (onDownloadSuccess) {
                    onDownloadSuccess();
                }
                setOverlayVisible(true);
                    showCustomToast({message:t("GLOBAL_CONSTANTS.DOWNLOAD_SUCCESSFUL"),  type: ToastType.SUCCESS, duration: ToastAndroid.LONG });
            } catch (err) {
                if (onDownloadError) {
                    onDownloadError();
                }
                setOverlayVisible(true);
                setOverlayTitle(t("GLOBAL_CONSTANTS.DOWNLOAD_FAILED"))
                showCustomToast({message:t("GLOBAL_CONSTANTS.THERE_WAS_AN_ERROR_DOWNLOADING_THE_FILE"),  type: ToastType.SUCCESS, duration: ToastAndroid.LONG });
                setOverlayText(t("GLOBAL_CONSTANTS.THERE_WAS_AN_ERROR_DOWNLOADING_THE_FILE"))
                // Alert.alert('Download Failed', 'There was an error downloading the file.');
            }
        } else {
            const targetIOSPath = `${fs.dirs.DocumentDir}/${fileNameFinal}_${Math.floor(date.getTime() + date.getSeconds() / 2)}${fileExtension}`;
            try {
                const downloadedPath = await downloadAndSavePDF(imageURL, targetIOSPath);
                await sharePDF(downloadedPath);
                return;
                if (onDownloadSuccess) {
                    onDownloadSuccess();
                }
                setOverlayVisible(true);
                setOverlayTitle(t("GLOBAL_CONSTANTS.DOWNLOAD_SUCCESSFUL"))
                setOverlayText(t("GLOBAL_CONSTANTS.THE_FILE_HAS_BEEN_DOWNLOADED_SUCCESSFULLY"))
                await sharePDF(downloadedPath);
            } catch (err) {
                if (onDownloadError) {
                    onDownloadError(); 
                }
                setOverlayVisible(true);
            }
        }
    };
    const downloadAndSavePDF = async (actualFileUrl: string, targetPath: string): Promise<string> => {
        try {
          const { dirs } = RNFetchBlob.fs;
          const res = await RNFetchBlob.config({
            fileCache: true,
            path: targetPath,
          }).fetch('GET', actualFileUrl); // Fetch from the actual file URL
          return res.path();
        } catch (error) {
          throw error; // Re-throw the error to be handled by the caller
        }
      };
    const sharePDF = async (pdfPath: string) => {
        try {
            const shareOptionsContent = {
                title: t("GLOBAL_CONSTANTS.TRANSACTION_BILL_TITLE") || 'Transaction PDF', // Title for the content
                url: Platform.OS === 'ios' ? `file://${pdfPath}` : pdfPath, // iOS requires file:// prefix
                // message: Platform.OS === 'ios' ? undefined : (t("GLOBAL_CONSTANTS.TRANSACTION_BILL_TITLE") || 'Transaction PDF'), // Optional: A message to share with the file
            };
            
            const shareOptionsDialog = {
                // iOS specific
                subject: t("GLOBAL_CONSTANTS.TRANSACTION_BILL_TITLE") || 'Transaction PDF', // Subject for email if user chooses email
                // excludedActivityTypes: [],

                // Android specific
                dialogTitle: t("GLOBAL_CONSTANTS.SHARE_TRANSACTION_BILL_TITLE") || 'Share Transaction PDF', // Title of the share dialog
            };

            await Share.share(shareOptionsContent, shareOptionsDialog);

        } catch (error: any) {
            console.error('Error sharing PDF:', error);
            // Handle common errors, e.g., user dismissing the share sheet
            if (error.message && error.message.includes("User did not share")) {
                // User cancelled the share operation, typically not an "error" to show to the user
            } else {
                Alert.alert(
                    t("GLOBAL_CONSTANTS.SHARE_ERROR_TITLE") || "Sharing Error",
                    t("GLOBAL_CONSTANTS.COULD_NOT_SHARE_FILE") || "Could not share the file at this time."
                );
            }
        }
    };
    const newCheckPermission = async () => {
        if (!imageURL) {
            setOverlayVisible(true);
            setOverlayTitle(t("GLOBAL_CONSTANTS.DOWNLOAD_FAILED"));
            showCustomToast({message:t("GLOBAL_CONSTANTS.INVALID_FILE_URL"),  type: ToastType.WARNING, duration: ToastAndroid.LONG });
            return;
        }

        if (onDownloadAttempt) {
            onDownloadAttempt();
        }
        try {
            if (Platform.OS === 'ios') {
                // downloadImage for iOS already calls sharePDF internally after successful download
                // and handles its own success/error popups or lack thereof for share.
                // So, we just call it and let it manage the flow.
                await downloadImage(); 
                // No explicit overlay here for success/failure of sharing, as downloadImage's sharePDF handles it
                // or the share sheet itself is the UI.
            } else { 
                if (Number(Platform.Version) >= 30) {
                    const downloadedPath = await downloadPdfAndroid11Plus(imageURL, fileName); 
                    setOverlayVisible(true);
                    setOverlayTitle(t("GLOBAL_CONSTANTS.DOWNLOAD_SUCCESSFUL"));
                    showCustomToast({message:t("GLOBAL_CONSTANTS.DOWNLOAD_SUCCESSFUL"),  type: ToastType.SUCCESS, duration: ToastAndroid.LONG });

                    setOverlayText(`${t("GLOBAL_CONSTANTS.THE_FILE_HAS_BEEN_DOWNLOADED_SUCCESSFULLY")}`);
                    if (onDownloadSuccess) onDownloadSuccess();
                } else { 
                    try { 
                        const granted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                            {
                                title: t("GLOBAL_CONSTANTS.STORAGE_PERMISSION_REQUIRED"),
                                message:  t("GLOBAL_CONSTANTS.APP_NEEDS_ACCESS_TO_YOUR_STORAGE_TO_DOWNLOAD_PHOTOS"),
                                buttonPositive: t("GLOBAL_CONSTANTS.OK")
                            }
                        );
                        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                            await downloadImage(); // downloadImage handles its own success/error popups
                        } else {
                            setOverlayVisible(true);
                            setOverlayTitle(t("GLOBAL_CONSTANTS.DOWNLOAD_STATUS"));
                            setOverlayText(`${t("GLOBAL_CONSTANTS.STORAGE_PERMISSION_NOT_GRANTED")}`);
                        }
                    } catch (permErr) {
                        if (onDownloadError) onDownloadError();
                        setOverlayVisible(true);
                    }
                }
            }
        } catch (err) {
            if (onDownloadError) {
                onDownloadError(); // Sets error title/text
            }
            setOverlayVisible(true); // Ensure overlay is visible
        } finally {
            setLoading(false); // Ensure loading is always set to false
        }
    };
    return (
        <View>
            {!isDownloadInvoice &&loading ? (
                <ActivityIndicator size={s(20)} color={NEW_COLOR.TEXT_BLUE} />
            ) : (
               !isDownloadInvoice && <CommonTouchableOpacity activeOpacity={0.7} onPress={newCheckPermission} style={[commonStyles.dflex,commonStyles.alignCenter,commonStyles.justifyCenter]}>
               <TransactionDownload style={{ width: s(100), height: s(20) }} />     
                   </CommonTouchableOpacity>
            )}
             {isDownloadInvoice && <ButtonComponent
                                title={"GLOBAL_CONSTANTS.DOWNLOAD_INVOICE"}
                                multiLanguageAllows={true}
                                onPress={newCheckPermission}
                                loading={loading}
                            />}
                            {/* <CustomOverlay
                isVisible={overlayVisible}
                onPressCloseIcon={() => setOverlayVisible(false)}
                title={overlayTitle}
            >
                <ParagraphComponent style={[commonStyles.fs18,commonStyles.fw600,commonStyles.textWhite]} text={overlayText} />
                <View style={commonStyles.sectionGap} />
            </CustomOverlay> */}
        </View>
    );
};

export default DownloadFile;
