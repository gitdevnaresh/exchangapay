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
} from "react-native";
import { s } from "react-native-size-matters";
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import ProfileService from "../../services/profile";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Container from "../Container";
import ParagraphComponent from "../Paragraph/Paragraph";
import { commonStyles } from "../CommonStyles";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { NEW_COLOR } from "../../constants/theme/variables";
import DefaultButton from "../DefaultButton";
import { Image } from "react-native";
import { AttachmentIcon } from "../../assets/svg";

interface FilePreviewProps {
    label: string;
    uploadedImageUri?: string | null;
    fileName?: string;
    containerStyle?: object;
    id?: string;
    showImage?: boolean;
    files?: Array<{ id: string; fileName: string; uri?: string }>;
}

const FilePreviewWithId: React.FC<FilePreviewProps> = ({
    label,
    uploadedImageUri,
    fileName,
    containerStyle,
    id,
    files
}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const styles = screenStyeles(NEW_COLOR);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
    const [fileUri, setFileUri] = useState<string | null | undefined>(uploadedImageUri);
    const [currentFileName, setCurrentFileName] = useState<string | undefined>(fileName);
    const isPdf = fileName?.toLowerCase().endsWith('.pdf') || false;
    const getFileExtension = (fileUri: string | undefined | null) => {
        return fileUri?.split('.').pop()?.toLowerCase() || '';
    };

    const renderFileIcon = (fileName: string | undefined | null) => {
        const ext = getFileExtension(fileName);
        switch (ext) {
            case 'pdf':
                return <MaterialCommunityIcons name="picture-as-pdf" size={s(60)} color={NEW_COLOR.TEXT_WHITE} />;
            case 'doc':
                return <MaterialCommunityIcons name="file-document-multiple-outline" size={s(60)} color={NEW_COLOR.TEXT_WHITE} />
            case 'docx':
                return <MaterialCommunityIcons name="file-document-multiple-outline" size={s(60)} color={NEW_COLOR.TEXT_WHITE} />
            case 'xls':
            case 'xlsx':
                return <MaterialCommunityIcons name="file-excel" size={s(60)} color={NEW_COLOR.TEXT_WHITE} />;
            default:
                return <MaterialCommunityIcons name="description" size={s(60)} color={NEW_COLOR.TEXT_WHITE} />;
        }
    };
    useEffect(() => {
        setFileUri(uploadedImageUri);
    }, [uploadedImageUri]);

    const handlePress = async (fileId?: string, selectedFileName?: string) => {
        if (fileUri) {
            setIsModalVisible(true);
            return;
        }
        const targetId = fileId || id;
        if (!targetId) {
            return;
        }

        setIsLoading(true);
        setLoadingFileId(targetId);
        try {
            const response = await ProfileService.getCasesUploadFiles(targetId);
            if (response.ok && response.data) {
                const decryptedBase64 = response.data;
                const currentFile = selectedFileName || fileName;
                const isPdfFile = currentFile?.toLowerCase().endsWith('.pdf') || false;
                const mimeType = isPdfFile ? 'application/pdf' : 'image/jpeg';
                const fullFileUri = `data:${mimeType};base64,${decryptedBase64}`;
                setFileUri(fullFileUri);
                setCurrentFileName(currentFile);
                setIsModalVisible(true);
            } else {
            }
        } catch (error: any) {
        } finally {
            setIsLoading(false);
            setLoadingFileId(null);
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
            //   showCustomToast({ message: 'No file to download.', type: ToastType.WARNING });
            return;
        }

        setIsDownloading(true);
        try {
            if (fileUri.startsWith('data:')) {
                const match = fileUri.match(/^data:(.+);base64,(.*)$/);
                if (!match) {
                    return;
                }

                const mimeType = match[1];                // e.g. image/jpeg
                const base64Data = match[2];
                const extension = mimeType.split('/')[1] || 'jpg';
                const downloadFileName = `download_${Date.now()}.${extension}`;

                // 🔔 Notify immediately when download starts
                // showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_START"), type: ToastType.INFO });

                if (Platform.OS === 'ios') {
                    const path = `${RNFS.TemporaryDirectoryPath}/${downloadFileName}`;
                    await RNFS.writeFile(path, base64Data, 'base64');
                    await Share.share({ url: `file://${path}` });
                    // optional cleanup: await RNFS.unlink(path);
                } else {
                    if (Platform.Version >= 33) {
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

                // ✅ Notify only after the file is completely written
                // showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });

            } else {
                // Direct URL case
                if (Platform.OS === 'ios') {
                    await Share.share({ url: fileUri });
                } else {
                    //   showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_START"), type: ToastType.INFO });
                    await downloadFromUrlForAndroid(fileUri);
                    //   showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
                }
            }
        } catch (error) {
            //   showCustomToast({ message: 'Could not download file.', type: ToastType.ERROR });
        } finally {
            setIsDownloading(false);
        }
    };



    const requestStoragePermissionForAndroid = async (): Promise<boolean> => {
        try {
            const permission = Platform.Version >= 33
                ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
                : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

            const result = await request(permission);
            if (result === RESULTS.GRANTED) return true;

            //   showCustomToast({ message: "Storage permission denied.", type: ToastType.ERROR });
            return false;
        } catch (err) {
            return false;
        }
    };

    const downloadFromUrlForAndroid = async (url: string) => {
        try {
            const { name: actualFileName, mime } = getFileDetails(url);
            if (Platform.Version >= 33) { // Android 13+
                const folderPath = `${RNFS.DownloadDirectoryPath}/BullSwipe`;
                await RNFS.mkdir(folderPath);
                const path = `${folderPath}/${actualFileName}`;
                const res = await RNFS.downloadFile({ fromUrl: url, toFile: path }).promise;
                if (res.statusCode === 200) {
                    //   showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
                } else {
                    //   showCustomToast({ message: "Download failed.", type: ToastType.ERROR });
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
                        description: 'Downloading file...',
                        mime: mime,
                        title: actualFileName,
                        mediaScannable: true,
                    },
                };
                // showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_START"), type: ToastType.INFO });
                await config(rnFetchBlobOptions).fetch('GET', url);
                // showCustomToast({ message: t("GLOBAL_CONSTANTS.DOWNLOAD_COMPLETE"), type: ToastType.SUCCESS });
            }
        } catch (err) {
            //   showCustomToast({ message: "An error occurred during download.", type: ToastType.ERROR });
        }
    };

    return (
        <View style={containerStyle}>
            <ParagraphComponent
                style={[commonStyles.listsecondarytext, commonStyles.mb8]}
                text={label}

            />

            {files && files.length > 0 ? (
                files.map((file, index) => (
                    <TouchableOpacity
                        key={file.id}
                        activeOpacity={0.7}
                        onPress={() => handlePress(file.id, file.fileName)}
                        style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1, commonStyles.bgBlack, commonStyles.p8, commonStyles.rounded8, commonStyles.mb8]}
                        disabled={loadingFileId === file.id}
                    >
                        {loadingFileId === file.id ? (
                            <View style={[commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flex1, commonStyles.alignCenter]}>
                                <ActivityIndicator size="small" color={NEW_COLOR.BG_ORANGE} />
                            </View>
                        ) : (
                            <>
                                {/* <MaterialCommunityIcons name={file.fileName?.toLowerCase().endsWith('.pdf') ? "picture-as-pdf" : "attachment"} size={s(18)} color={NEW_COLOR.BG_YELLOW} style={!file.fileName?.toLowerCase().endsWith('.pdf') ? { transform: [{ rotate: "115deg" }] } : {}} /> */}
                                <AttachmentIcon height={14} width={14} />

                                <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, commonStyles.flex1, commonStyles.textAlwaysWhite]} text={file.fileName || "No File"} numberOfLines={1} />
                                {files.length > 1 && (
                                    <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textAlwaysWhite]} text={`${index + 1}/${files.length}`} />
                                )}
                            </>
                        )}
                    </TouchableOpacity>
                ))
            ) : fileName && (
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handlePress}
                    style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.flex1, commonStyles.bgCard, commonStyles.p8, commonStyles.rounded16]}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <View style={[commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flex1, commonStyles.alignCenter]}>
                            <ActivityIndicator size="small" color={NEW_COLOR.BG_YELLOW} />
                        </View>
                    ) : (
                        <>
                            <MaterialCommunityIcons name={isPdf ? "picture-as-pdf" : "attachment"} size={s(18)} color={NEW_COLOR.BG_YELLOW} style={!isPdf ? { transform: [{ rotate: "115deg" }] } : {}} />
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.flex1, commonStyles.textAlwaysWhite]} text={fileName || "No File"} numberOfLines={1} />
                        </>
                    )}
                </TouchableOpacity>
            )}

            <Modal visible={isModalVisible} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
                <SafeAreaView style={commonStyles.flex1}>
                    <Container style={commonStyles.container}>
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justify]}>
                            <ParagraphComponent style={[commonStyles.listprimarytext, { width: s(120) }]} text={"Preview"} />
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <AntDesign size={s(24)} style={[commonStyles.textRight]} name="close" color={NEW_COLOR.TEXT_BLACK} />
                            </TouchableOpacity>
                        </View>

                        {["png", "jpg", "jpeg", "gif"].includes(currentFileName?.split('.').pop()?.toLowerCase() || '') ? (
                            <Image source={{ uri: fileUri }} style={styles.fullImage} />
                        ) : (
                            <View style={styles.noPreviewContainer}>
                                {renderFileIcon(currentFileName)}
                                <ParagraphComponent
                                    text={currentFileName?.split('/').pop() || currentFileName}
                                    style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textAlwaysWhite, commonStyles.mt10]}
                                    numberOfLines={1}
                                />
                            </View>
                        )}

                        <DefaultButton
                            title={"Download"}
                            onPress={handleDownload}
                            loading={isDownloading}
                            disable={isDownloading}
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
