import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    Keyboard,
    Platform,
    Modal,
    TouchableWithoutFeedback,
    StyleSheet,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { SvgFromUri } from 'react-native-svg';
import ParagraphComponent from '../Paragraph/Paragraph';
import LabelComponent from '../Paragraph/label';
import { commonStyles } from '../CommonStyles';
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from '../../constants/theme/variables';
import { s } from '../../constants/theme/scale';
import { isErrorDispaly } from '../../utils/helpers';
import { downloadImage } from '../../utils/tools';
import { Container } from '../index';
import OverlayPopup from '../../screens/cards/SelectPopup';

type Props = {
    onUploadSuccess: (file: {
        id: string;
        fileName: string;
        fileSize: number;
        localUri: string;
    }) => void;
    uploadApi: (formData: FormData) => Promise<any>;
};

const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
const MAX_SIZE = 20 * 1024 * 1024;

const CommonUploadAttachment = ({ onUploadSuccess, uploadApi }: Props) => {
    const [loadingState, setLoadingState] = useState({
        attchmentLoadibng: false,
        isPopupVisible: false,
        loadingType: '',
    });

    const [error, setError] = useState('');
    const [previewUri, setPreviewUri] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // ✅ VALIDATION
    const hasAcceptedExtension = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };

    const verifyFileSize = (fileSize: number) => fileSize <= MAX_SIZE;

    // ✅ CAMERA PERMISSION
    const requestCameraPermission = async () => {
        const permission =
            Platform.OS === 'ios'
                ? PERMISSIONS.IOS.CAMERA
                : PERMISSIONS.ANDROID.CAMERA;

        const result = await request(permission);
        if (result === RESULTS.GRANTED) return true;

        Alert.alert("Permission Required", "Please enable camera permission.");
        return false;
    };

    // ✅ IMAGE PICKER
    const selectImage = async (isCamera?: boolean) => {
        Keyboard.dismiss();

        setLoadingState(prev => ({
            ...prev,
            loadingType: isCamera ? 'methodOne' : 'methodTwo',
            attchmentLoadibng: true,
        }));

        try {
            let result;

            if (isCamera) {
                const hasPermission = await requestCameraPermission();
                if (!hasPermission) return;
                result = await launchCamera({ mediaType: 'photo' });
            } else {
                result = await launchImageLibrary({ mediaType: 'photo' });
            }

            if (!result.didCancel && result.assets?.length) {
                const file = result.assets[0];

                if (!hasAcceptedExtension(file.fileName || '')) {
                    return setError('Accept only jpg or png format');
                }

                if (!verifyFileSize(file.fileSize || 0)) {
                    return setError('Image size should be less than 20MB');
                }

                let formData = new FormData();
                formData.append('document', {
                    uri: file.uri,
                    type: file.type,
                    name: file.fileName,
                } as any);

                const uploadRes = await uploadApi(formData);

                if (uploadRes?.status === 200 && uploadRes?.data?.id) {
                    const uploadedFile = uploadRes.data;

                    const finalFile = {
                        id: uploadedFile.id,
                        fileName: uploadedFile.fileName,
                        fileSize: file.fileSize || 0,
                        localUri: uploadedFile.url || '',
                    };

                    onUploadSuccess(finalFile);
                    setPreviewUri(finalFile.localUri);
                } else {
                    setError(isErrorDispaly(uploadRes));
                }
            }
        } catch (err) {
            setError(isErrorDispaly(err));
        } finally {
            setLoadingState({
                attchmentLoadibng: false,
                isPopupVisible: false,
                loadingType: '',
            });
        }
    };

    // ✅ DOWNLOAD HANDLER
    const handleDownload = async (uri: string) => {
        setIsDownloading(true);
        try {
            await downloadImage(uri);
        } catch (e) {
            setError(isErrorDispaly(e));
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            {error && <ParagraphComponent text={error} style={commonStyles.textError} />}

            {/* ✅ UPLOAD BUTTON */}
            <TouchableOpacity onPress={() => setLoadingState(p => ({ ...p, isPopupVisible: true }))}>
                <LabelComponent text="Upload Attachment" />

                <View style={styles.uploadBox}>
                    <Ionicons name="cloud-upload-outline" size={22} color={NEW_COLOR.TEXT_BLACK} />
                    <ParagraphComponent text="Upload attachment" />
                </View>
            </TouchableOpacity>

            {/* ✅ IMAGE PREVIEW */}
            <View style={{ minHeight: 150, justifyContent: 'center', alignItems: 'center' }}>
                {loadingState.attchmentLoadibng && <ActivityIndicator size="large" />}

                {!loadingState.attchmentLoadibng && previewUri && (
                    <TouchableOpacity onPress={() => setPreviewUri(previewUri)}>
                        <Image
                            source={{ uri: previewUri }}
                            style={{ width: '100%', height: 250, borderRadius: 16 }}
                        />
                    </TouchableOpacity>
                )}

                {!loadingState.attchmentLoadibng && !previewUri && (
                    <SvgFromUri
                        uri="https://prdexchangapaystorage.blob.core.windows.net/images/upload.svg"
                        width={s(120)}
                        height={s(120)}
                    />
                )}
            </View>

            <OverlayPopup
                title="Upload your attachment"
                isVisible={loadingState.isPopupVisible}
                handleClose={() => setLoadingState(p => ({ ...p, isPopupVisible: false }))}
                methodOne={() => selectImage(true)}
                methodTwo={() => selectImage(false)}
                lable1="Upload From Camera"
                lable2="Upload From Gallery"
                colors={NEW_COLOR}
                windowWidth={WINDOW_WIDTH}
                windowHeight={WINDOW_HEIGHT}
                isLoading={loadingState.attchmentLoadibng}
                loadingType={loadingState.loadingType}
            />

            {/* ✅ PREVIEW MODAL WITH DOWNLOAD */}
            <Modal visible={!!previewUri} transparent animationType="slide">
                <Container style={commonStyles.container}>
                    <TouchableWithoutFeedback onPress={() => setPreviewUri(null)}>
                        <View style={[commonStyles.screenBg, commonStyles.flex1]}>
                            <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mt22]}>
                                <AntDesign
                                    name="close"
                                    size={22}
                                    color={NEW_COLOR.TEXT_ALWAYS_WHITE}
                                    onPress={() => setPreviewUri(null)}
                                />

                                <TouchableOpacity onPress={() => handleDownload(previewUri || '')}>
                                    {isDownloading ? (
                                        <ActivityIndicator />
                                    ) : (
                                        <AntDesign name="download" size={20} color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                                <Image
                                    source={{ uri: previewUri || '' }}
                                    style={styles.previewImage}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Container>
            </Modal>
        </>
    );
};

export default CommonUploadAttachment;

export const styles = StyleSheet.create({
    uploadBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
        marginBottom: 6,
        gap: 9,
        minHeight: 54,
        backgroundColor: NEW_COLOR.BG_BLACK,
        borderStyle: "dashed",
    },

    previewImage: {
        width: '100%',
        height: 250,
        borderRadius: 16,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
    },

    loaderCenter: {
        minHeight: 150,
        justifyContent: "center",
        alignItems: "center",
    },
});
