import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, Share, ToastAndroid, View } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import { s } from '../../constants/styels/scale';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import RNFS from 'react-native-fs';
import axios from 'axios';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../CommonStyles';
import { showCustomToast, ToastType } from '../toasterMessages';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Logger } from '../../utils/Logger';
interface DownloadFileProps {
    imageURL: string;
    fileName?: string;
    onDownloadSuccess?: () => void;
    uri?: any;
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
    uri = "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/download-large.svg",
    isDownloadInvoice = false,
    autoStartDownload = false,
    onAutoStartProcessed,
    onDownloadAttempt
}) => {
    const [loading, setLoading] = useState(false);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useEffect(() => {
        if (autoStartDownload && imageURL && !loading) {
            void triggerDownload();
            if (onAutoStartProcessed) {
                onAutoStartProcessed();
            }
        }
    }, [autoStartDownload, imageURL, loading, onAutoStartProcessed]);


    const onDownloadError = () => {
        showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_FAILED"), type: ToastType.ERROR, duration: ToastAndroid.LONG });

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

            // Notify media scanner to make file visible in Downloads
            if (Platform?.OS === 'android') {
                try {
                    const { android } = ReactNativeBlobUtil;
                    await android?.addCompleteDownload({
                        title: finalFileName,
                        description: 'Downloaded file',
                        mime: getMimeTypeFromExtension(ext),
                        path: filePath,
                        showNotification: true,
                    });
                } catch (e) {
                    // Media scanner notification failed - silently continue
                }
            }

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
        const { fs } = ReactNativeBlobUtil;
        const PictureDir = fs.dirs.DownloadDir;

        if (Platform.OS !== 'ios') {
            try {
                await ReactNativeBlobUtil.config({
                    fileCache: true,
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        path: `${PictureDir}/${fileNameFinal}_${Math.floor(date.getTime() + date.getSeconds() / 2)}${fileExtension}`,
                        description: 'Downloading file...',
                        mime: mimeType,
                        mediaScannable: true,
                    },
                }).fetch('GET', imageURL);

                if (onDownloadSuccess) {
                    onDownloadSuccess();
                }
                showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_SUCCESSFUL"), type: ToastType.SUCCESS, duration: ToastAndroid.LONG });
            } catch (err) {
                if (onDownloadError) {
                    onDownloadError();
                }
                showCustomToast({ message: t("GLOBAL_CONSTANTS.THERE_WAS_AN_ERROR_DOWNLOADING_THE_FILE"), type: ToastType.SUCCESS, duration: ToastAndroid.LONG });
            }
        } else {
            const targetIOSPath = `${fs.dirs.DocumentDir}/${fileNameFinal}_${Math.floor(date.getTime() + date.getSeconds() / 2)}${fileExtension}`;
            try {
                const downloadedPath = await downloadAndSavePDF(imageURL, targetIOSPath);
                await sharePDF(downloadedPath);
                return;
            } catch (err) {
                if (onDownloadError) {
                    onDownloadError();
                }
            }
        }
    };
    const downloadAndSavePDF = async (actualFileUrl: string, targetPath: string): Promise<string> => {
        try {
            const { dirs } = ReactNativeBlobUtil.fs;
            const res = await ReactNativeBlobUtil.config({
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
            Logger.error('Error sharing PDF:', error);
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
    const handleIOSDownload = async () => {
        await downloadImage();
    };

    const handleAndroid11PlusDownload = async () => {
        await downloadPdfAndroid11Plus(imageURL, fileName);
        showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_SUCCESSFUL"), type: ToastType.SUCCESS, duration: ToastAndroid.LONG });
        if (onDownloadSuccess) onDownloadSuccess();
    };

    const handleLegacyAndroidDownload = async () => {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                title: t("GLOBAL_CONSTANTS.STORAGE_PERMISSION_REQUIRED"),
                message: t("GLOBAL_CONSTANTS.APP_NEEDS_ACCESS_TO_YOUR_STORAGE_TO_DOWNLOAD_PHOTOS"),
                buttonPositive: t("GLOBAL_CONSTANTS.OK")
            }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            await downloadImage();
        }
    };

    const newCheckPermission = async () => {
        if (!imageURL) {
            showCustomToast({ message: t("GLOBAL_CONSTANTS.INVALID_FILE_URL"), type: ToastType.WARNING, duration: ToastAndroid.LONG });
            return;
        }

        if (onDownloadAttempt) {
            onDownloadAttempt();
        }

        if (Platform.OS === 'ios') {
            await handleIOSDownload();
        } else if (Number(Platform.Version) >= 30) {
            await handleAndroid11PlusDownload();
        } else {
            await handleLegacyAndroidDownload();
        }

    };

    const triggerDownload = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await newCheckPermission();
        } catch (error) {
            onDownloadError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <View>
            {!isDownloadInvoice && loading ? (
                <ActivityIndicator size={s(20)} color={NEW_COLOR.TEXT_BLUE} />
            ) : (
                !isDownloadInvoice && <CommonTouchableOpacity activeOpacity={0.7} onPress={() => { void triggerDownload(); }} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <MaterialCommunityIcons name="tray-arrow-down" size={s(20)} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                </CommonTouchableOpacity>
            )}
            {isDownloadInvoice &&
                <CommonTouchableOpacity activeOpacity={0.7} onPress={() => { void triggerDownload(); }} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <MaterialCommunityIcons name="tray-arrow-down" size={s(24)} color={NEW_COLOR.TEXT_WHITE} /></CommonTouchableOpacity>
            }
        </View>
    );
};

export default DownloadFile;

