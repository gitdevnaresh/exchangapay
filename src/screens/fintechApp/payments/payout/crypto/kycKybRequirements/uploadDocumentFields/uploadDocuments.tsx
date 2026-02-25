import React from "react";
import { View, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { FORM_FIELD, getFileExtension, KYB_INFO_CONSTANTS } from '../../../../../onboarding/kyb/constants';
import { verifyFileTypes } from '../../../../../onboarding/constants';
import { isErrorDispaly } from '../../../../../../../utils/helpers';
import { Field } from 'formik';
import FileUpload from '../../../../../../../components/fileUpload/fileUpload';
import { useThemeColors } from '../../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../../components/CommonStyles';
import { useLngTranslation } from '../../../../../../../hooks/languagesHook/useLngTranslation';
import LabelComponent from '../../../../../../../components/textComponets/lableComponent/lable';
import CustomPicker from '../../../../../../../components/customPicker/CustomPicker';
import TextMultiLanguage from '../../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import InfoTooltip from '../../../../../../../components/tooltip/InfoTooltip';
import { s } from '../../../../../../../components/theme/scale';
import ViewComponent from '../../../../../../../components/view/view';

interface DocumentUploadFieldsProps {
    touched: any;
    errors: any;
    handleBlur: any;
    values: any;
    setFieldValue: any;
    documentTypesLookUp: any[];
    businessRegistrationProofTypes: any[];
    setErrormsg: (message: string | null) => void;
    imagesLoader: any;
    setImagesLoader: (loader: any) => void;
    fileNames: any;
    setFileNames: (names: any) => void;
    uploadFileToServer: (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFeilds: (field: string, value: string) => void) => Promise<void>;
    handleUploadImg?: (item: string, setFieldValue: (field: string, value: string) => void, pickerOption?: 'camera' | 'library' | 'documents') => Promise<void>;
    t: (key: string) => string;
    ref: any;
    kybDocumentsDetails?: any[];
}

const DocumentUploadFields: React.FC<DocumentUploadFieldsProps> = ({
    touched,
    errors,
    handleBlur,
    values,
    setFieldValue,
    documentTypesLookUp,
    businessRegistrationProofTypes,
    setErrormsg,
    imagesLoader,
    setImagesLoader,
    fileNames,
    setFileNames,
    uploadFileToServer,
    handleUploadImg,
    ref,
    kybDocumentsDetails
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const handleUploadImgLocal = async (
        item: string,
        pickerOption?: 'camera' | 'library' | 'documents'
    ) => {
        if (handleUploadImg) {
            // Use the parent's handleUploadImg function which supports PDF
            return handleUploadImg(item, setFieldValue, pickerOption);
        }

        // Fallback to local implementation for backward compatibility
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

                // Check file size (15MB limit)
                const fileSizeMB = size ? size / (1024 * 1024) : 0;
                if (fileSizeMB > 15) {
                    setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    return;
                }

                // Validate file type
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

                if (!isPdf && !isImage) {
                    setErrormsg(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                    return;
                }

                setFileNames((prevState: any) => ({ ...prevState, [item]: fileName }));

                const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
                const type = isPdf ? 'application' : 'image';

                setErrormsg(null); // Clear any previous error
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFieldValue);
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
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: false, aspect: [1, 1], quality: 0.5, cameraType: ImagePicker.CameraType.front });

            if (result.canceled) return;

            const selectedImage = result.assets[0];
            const { uri, type } = selectedImage;
            const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
            const fileExtension = getFileExtension(selectedImage.uri);

            if (!verifyFileTypes(fileName)) {
                setErrormsg(KYB_INFO_CONSTANTS.ACCEPT_IMG_MSG);
                return;
            }

            const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                return;
            }

            setFileNames((prevState: any) => ({ ...prevState, [item]: fileName }));

            if (uri && type && fileExtension) {
                setErrormsg(null); // Clear any previous error
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFieldValue);
            }
        } catch (err) {
            setErrormsg(isErrorDispaly(err));
        } finally {
            setImagesLoader((prevState: any) => ({ ...prevState, [item]: false }));
        }
    };

    const deleteImage = (fileName: string) => {
        setFieldValue(fileName, '');
    };

    const handleBussinessRegistrationProofTypeChange = (value: string, setFieldValue: any) => {
        setFieldValue('businessRegistrationProof', ''); // Clear the uploaded document  
        setFieldValue('businessRegistrationProofType', value);
        const formattedBusinessProofFiles = (kybDocumentsDetails || [])
            .filter((doc: any) => (doc?.type?.type || '').toLowerCase() === value?.toLowerCase())
            .map((doc: any) => ({
                id: doc?.id,
                fileName: doc?.fileName,
                type: doc?.type || value,
                blob: doc?.blob || '',
                createdDate: doc?.createdDate || null,
            }));
        if (value) {
            setFieldValue('businessRegistrationProof', formattedBusinessProofFiles[0]?.type?.blob || '');
        }

    };

    const hanldeDocumentTypeChange = (value: string, setFieldValue: any) => {
        setFieldValue(FORM_FIELD.FRONT_ID, '');// Clear the uploaded document  
        setFieldValue(FORM_FIELD.DOC_TYPE, value);
        const formattedFrontIdFiles = (kybDocumentsDetails || [])
            .filter((doc: any) => (doc?.type?.type || '').toLowerCase() === value?.toLowerCase())
            .map((doc: any) => ({
                id: doc?.id,
                fileName: doc?.fileName,
                type: doc?.type || value,
                blob: doc?.blob || '',
                createdDate: doc?.createdDate || null,
            }));
        if (value) {
            setFieldValue(FORM_FIELD.FRONT_ID, formattedFrontIdFiles[0]?.type?.blob || '');
        }
    }

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mt16, commonStyles.mb16]} >
                <TextMultiLanguage style={[commonStyles.sectionTitle]} text={"GLOBAL_CONSTANTS.DOCUMENTS_UPLOAD"} />
                <ViewComponent style={[commonStyles.alignCenter]}>
                    <InfoTooltip
                        tooltipText="GLOBAL_CONSTANTS.PLEASE_UPLOAD_CLEAR_AND_LEGIBLE_COPIES_OF_YOUR_IDENTIFICATION_DOCUMENTS"
                        linkText=""
                        linkUrl=""
                        verticalGap={s(30)}
                        arrowXPosition={s(0)}

                    />
                </ViewComponent>
            </ViewComponent>


            <Field
                activeOpacity={0.9}
                innerRef={ref}
                style={{ color: KYB_INFO_CONSTANTS.TRANSPARENT, backgroundColor: KYB_INFO_CONSTANTS.TRANSPARENT }}
                label={"GLOBAL_CONSTANTS.CHOOSE_DOCUMENT_TYPE"}
                touched={touched?.docType}
                name={FORM_FIELD.DOC_TYPE}
                error={errors?.docType}
                handleBlur={handleBlur}
                customContainerStyle={{ height: 80 }}
                data={documentTypesLookUp || []}
                placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                component={CustomPicker}
                modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />

            <View style={[commonStyles.formItemSpace]} />
            <FileUpload
                fileLoader={imagesLoader?.frontId}
                onSelectImage={(source) => handleUploadImgLocal(FORM_FIELD.FRONT_ID, source)}
                uploadedImageUri={values?.frontId}
                fileName={fileNames?.frontId as string}
                errorMessage={touched?.frontId ? errors?.frontId as string : undefined}
                deleteImage={() => deleteImage(FORM_FIELD.FRONT_ID)}
                label={"GLOBAL_CONSTANTS.DOCUMENT_PHOTO"}
                isRequired={true}
                showImageSourceSelector={true}
                subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
            />
            <View style={[commonStyles.formItemSpace]} />
            {/* Business Registration Proof Fields */}
            <Field
                activeOpacity={0.9}
                innerRef={ref}
                style={{ color: KYB_INFO_CONSTANTS.TRANSPARENT, backgroundColor: KYB_INFO_CONSTANTS.TRANSPARENT }}
                label={"GLOBAL_CONSTANTS.CHOOSE_BUSINESS_REGISTRATION_PROOF"}
                touched={touched?.businessRegistrationProofType}
                name={'businessRegistrationProofType'}
                error={errors?.businessRegistrationProofType}
                handleBlur={handleBlur}
                customContainerStyle={{ height: 80 }}
                data={businessRegistrationProofTypes || []}
                placeholder={"GLOBAL_CONSTANTS.SELECT_BUSINESS_REGISTRATION_PROOF"}
                placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                component={CustomPicker}
                modalTitle={"Select Business Registration Proof"}
                requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
            />

            <View style={[commonStyles.formItemSpace]} />
            <FileUpload
                fileLoader={imagesLoader?.businessRegistrationProof}
                onSelectImage={(source) => handleUploadImgLocal('businessRegistrationProof', source)}
                uploadedImageUri={values?.businessRegistrationProof}
                fileName={fileNames?.businessRegistrationProof as string}
                errorMessage={touched?.businessRegistrationProof ? errors?.businessRegistrationProof as string : undefined}
                deleteImage={() => deleteImage('businessRegistrationProof')}
                label={"GLOBAL_CONSTANTS.BUSINESS_REGISTRATION_PROOF"}
                isRequired={true}
                showImageSourceSelector={true}
                subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
            />
        </ViewComponent>
    );
};

export default DocumentUploadFields;