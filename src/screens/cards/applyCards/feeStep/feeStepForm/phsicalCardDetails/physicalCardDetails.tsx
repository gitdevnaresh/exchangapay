import { Alert, ScrollView } from "react-native"
import React, { useState } from "react"
import * as DocumentPicker from 'expo-document-picker';
import { FeePhysicalCardApplyProps } from "../../../kycRequirements/constants";
import { useThemeColors } from "../../../../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../../../../assets/styles/CommonStyles";
import ProfileService from "../../../../../../services/profile";
import * as ImagePicker from 'expo-image-picker';
import ViewComponent from "../../../../../../newComponents/view/view";
import FileUpload from "../../../../../../newComponents/fileUpload/fileUpload";
import FormikTextInput from "../../../../../../newComponents/textInputComponents/formik/textInput";


const PhysicalCardDetails: React.FC<FeePhysicalCardApplyProps> = ({ envelopeNoRequired, additionalDocforActiveCard, handleBlur, values, setFieldValue, handleChange, touched, errors }) => {
    const [loadingState, setLoadingState] = useState<boolean>(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const ref = React.useRef<ScrollView>(null);
    const [fileName, setFileName] = useState({ handHoldingIdPhoto: "" })

    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];

    const hasAcceptedExtension = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };
    const verifyFileTypes = (fileList: any) => {
        const fileName = fileList;
        if (!hasAcceptedExtension(fileName)) {
            return false;
        }
        return true;
    };
    const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFeilds: (field: string, value: string) => void) => {
        setLoadingState(false);
        const formData = new FormData();
        formData.append('document', {
            uri: uri,
            type: `${type}/${fileExtension}`,
            name: fileName,
        } as any);
        const uploadRes = await ProfileService.uploadFile(formData);
        if (uploadRes.status === 200) {
            const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
            setFeilds(item, uploadedImage);
            // setErrormsg("");
        } else {
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            // setErrormsg(isErrorDispaly(uploadRes));
        }
    };

    const getFileExtension = (uri: string) => {
        return uri?.split('.')?.pop()?.toLowerCase() ?? 'jpg';
    };

    const handleImageUpload = async (
        item: string,
        setFeilds: (field: string, value: string) => void,
        pickerOption?: 'camera' | 'library' | 'documents'
    ) => {
        setLoadingState(true);
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
                    // setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    requestAnimationFrame(() => {
                        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                // Validate file type
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

                if (!isPdf && !isImage) {
                    // setErrormsg(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                    requestAnimationFrame(() => {
                        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                setFileName(prevState => ({ ...prevState, [item]: fileName }));

                const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
                const type = isPdf ? 'application' : 'image';

                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
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
                // setErrormsg("Accepts only jpg ,png and jpeg format");
                requestAnimationFrame(() => {
                    ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                });
                return;
            }
            // Check file size (15MB limit)
            const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                // setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                requestAnimationFrame(() => {
                    ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                });
                return;
            }

            setFileName(prevState => ({ ...prevState, [item]: fileName }));

            if (uri && type && fileExtension) {
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
            }
        } catch (err) {
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            // setErrormsg(isErrorDispaly(err));
        } finally {
            setLoadingState(false);
        }
    };

    const deleteImages = (filedName: string) => {
        setFieldValue(filedName, "");
    }
    return (

        <ViewComponent>
            <ViewComponent>
                <ViewComponent style={[commonStyles.relative]}>
                     <FormikTextInput
                          name="cardNumber"
                          label={"GLOBAL_CONSTANTS.LINK_CARD_NUMBER"}
                          isRequired 
                           onChangeText={(val: any) => {
                            if (val.match(/[0-9/]/)) {
                                handleChange("cardNumber")(val);
                            }
                        }}
                         keyboardType={"decimal-pad"}
                          custInput={commonStyles.inputStyle}
                          placeholder={"GLOBAL_CONSTANTS.ENTER_MEMBER_NUMBER"}
                          maxLength={16}
                          autoCapitalize="words"
                         />

                </ViewComponent>
                {envelopeNoRequired && (
                    <ViewComponent >
                        <ViewComponent style={commonStyles.formItemSpace} />                    
                         <FormikTextInput
                          name="envelopenumber"
                          label={"GLOBAL_CONSTANTS.MEMBER_NUMBER"}
                          isRequired 
                          custInput={commonStyles.inputStyle}
                          placeholder={"GLOBAL_CONSTANTS.ENTER_MEMBER_NUMBER"}
                         />
                    </ViewComponent>
                )}


                <ViewComponent style={[commonStyles.formItemSpace]} />
                {(additionalDocforActiveCard !== null) && (<ViewComponent>
                    <FileUpload
                        fileLoader={loadingState}
                        onSelectImage={(source) => handleImageUpload("handHoldingIdPhoto", setFieldValue, source)}
                        uploadedImageUri={values?.handHoldingIdPhoto}
                        fileName={fileName?.handHoldingIdPhoto}
                        errorMessage={touched?.handHoldingIdPhoto && errors?.handHoldingIdPhoto}
                        deleteImage={() => deleteImages('handHoldingIdPhoto')}
                        label={`${additionalDocforActiveCard}`}
                        isRequired={true}
                        showImageSourceSelector={true}
                    />
                   
                    {/* <ViewComponent style={[commonStyles.formItemSpace]} />
                    <ViewComponent style={[commonStyles.notebg, commonStyles.p12, commonStyles.rounded11]}>
                        <ViewComponent
                            style={[
                                commonStyles.dflex,
                                commonStyles.gap8,
                                commonStyles.mb8,
                                commonStyles.alignCenter
                            ]}
                        >
                            <MaterialIcons name="info-outline" size={s(20)} color={NEW_COLOR.NOTE_ICON} />
                            <ViewComponent style={[commonStyles.flex1]}>
                                <TextMultiLangauge
                                    style={[
                                        commonStyles.fs12,
                                        commonStyles.textlinkgrey,
                                        commonStyles.fw400,
                                        commonStyles.mb4
                                    ]}
                                    text={FORM_DATA_PLACEHOLDER.UPLOAD_NOTE1}
                                />
                            </ViewComponent>
                        </ViewComponent>
                    </ViewComponent> */}
                </ViewComponent>)}
            </ViewComponent>
        </ViewComponent>
    )
}
export default PhysicalCardDetails;
