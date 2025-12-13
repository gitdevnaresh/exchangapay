import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Platform,
    Share,
    ActivityIndicator,
    Alert,
    Image
} from "react-native";
import { s } from "react-native-size-matters";
import RNFS from 'react-native-fs';
import { BlobUtil } from "react-native-blob-util";
import ProfileService from "../../services/profile";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Container from "../Container";
import ParagraphComponent from "../Paragraph/Paragraph";
import { commonStyles } from "../CommonStyles";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { NEW_COLOR } from "../../constants/theme/variables";
import DefaultButton from "../DefaultButton";
import { AttachmentIcon } from "../../assets/svg";
import { requestAndroidPermission } from "../../utils/tools";
import { SafeAreaView } from "react-native-safe-area-context";

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

    // const requestStoragePermissionForAndroid = async (): Promise<boolean> => {
    //     try {
    //         const permission = Platform.Version >= 33
    //             ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
    //             : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;

    //         const result = await request(permission);
    //         if (result === RESULTS.GRANTED) return true;

    //         //   showCustomToast({ message: "Storage permission denied.", type: ToastType.ERROR });
    //         return false;
    //     } catch (err) {
    //         return false;
    //     }
    // };
    const getExtensionFromUrl = (filename: any) => {
        return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined;
    };
    const downloadFileWithBlobUtil = async (fileUrl: string) => {
        try {
            if (Platform.OS === "android") {
                const hasPermission = await requestAndroidPermission();
                if (!hasPermission) {
                    Alert.alert("Permission Denied", "Storage permission is required.");
                    return;
                }
            }

            const ext = getExtensionFromUrl(fileUrl);
            const fileName = `Downloaded_File_${Date.now()}.${ext}`;

            const dir =
                Platform.OS === "ios"
                    ? BlobUtil.fs.dirs.DocumentDir
                    : BlobUtil.fs.dirs.DownloadDir;

            const filePath = `${dir}/${fileName}`;

            const config =
                Platform.OS === "android"
                    ? {
                        fileCache: true,
                        addAndroidDownloads: {
                            useDownloadManager: true,
                            notification: true,
                            path: filePath,
                            description: "Downloading file...",
                            mediaScannable: true,
                        },
                    }
                    : {
                        fileCache: true,
                        path: filePath,
                    };

            const response = await BlobUtil.config(config).fetch("GET", fileUrl);

            if (Platform.OS === "ios") {
                await Share.share({
                    url: `file://${response.path()}`,
                });
            } else {
                Alert.alert("Download Complete", `Saved to: ${response.path()}`);
            }
        } catch (error) {
            console.log("Download Error:", error);
            Alert.alert("Download Failed", "Unable to download file.");
        }
    };
    const handleDownload = async () => {
        if (!fileUri) return;

        setIsDownloading(true);

        try {
            if (fileUri.startsWith("data:")) {
                // ✅ BASE64 DOWNLOAD
                const match = fileUri.match(/^data:(.+);base64,(.*)$/);
                if (!match) return;

                const mimeType = match[1];
                const base64Data = match[2];
                const extension = mimeType.split("/")[1] || "jpg";
                const fileName = `download_${Date.now()}.${extension}`;

                const path =
                    Platform.OS === "ios"
                        ? `${RNFS.TemporaryDirectoryPath}/${fileName}`
                        : `${RNFS.DownloadDirectoryPath}/${fileName}`;

                await RNFS.writeFile(path, base64Data, "base64");

                if (Platform.OS === "ios") {
                    await Share.share({ url: `file://${path}` });
                } else {
                    Alert.alert("Download Complete", "File saved successfully");
                }
            } else {
                // ✅ NORMAL FILE URL DOWNLOAD USING BlobUtil
                await downloadFileWithBlobUtil(fileUri);
            }
        } catch (error) {
            Alert.alert("Download Failed", "Could not download file.");
        } finally {
            setIsDownloading(false);
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
                        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justify, commonStyles.mt30]}>
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
