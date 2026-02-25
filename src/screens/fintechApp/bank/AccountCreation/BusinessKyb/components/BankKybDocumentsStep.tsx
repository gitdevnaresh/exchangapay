import { BackHandler, Alert, KeyboardAvoidingView, Platform } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { DocumentFileNamesState, DocumentFormValues, ImageType } from "../types/interface";
import ViewComponent from "../../../../../../components/view/view";
import ButtonComponent from "../../../../../../components/buttons/button";
import Container from "../../../../../../components/container/container";
import ScrollViewComponent from "../../../../../../components/scrollView/scrollView";
import { s } from "../../../../../../components/theme/scale";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import ErrorComponent from "../../../../../../components/errorDisplay/errorDisplay";
import { Field, Formik } from "formik";
import InputDefault from "../../../../../../components/textInputComponents/DefaultFiat";;
import * as ImagePicker from 'expo-image-picker';
import { getFileExtension } from "./constants";
import { useDispatch, useSelector } from "react-redux";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { BankKybService } from "../../../../../../apiServices/bank";
import { isErrorDispaly } from "../../../../../../utils/helpers";
import { BankKybDocumentsSchema } from "../schemas/schema";
import * as DocumentPicker from 'expo-document-picker';
import LabelComponent from "../../../../../../components/textComponets/lableComponent/lable";
import DatePickerComponent from "../../../../../../components/datePickers/formik/datePicker";
import FileUpload from "../../../../../../components/fileUpload/fileUpload";
import * as FileSystem from 'expo-file-system';
import SignatureDrawer from "../../../../../../components/signature/signature";
import DashboardLoader from "../../../../../../components/loader";
import ParagraphComponent from "../../../../../../components/textComponets/paragraphText/paragraph";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import { useLngTranslation } from "../../../../../../hooks/languagesHook/useLngTranslation";
import ProfileService from "../../../../../../apiServices/profile";


const BankKybDocumentsStep = () => {
    const ref = useRef<any>(null);
    const [passportFrontImage, setPassportFrontImage] = useState<string>("");
    const [passportBackImage, setPassportBackImage] = useState<string>("");
    const [passportHandHoldingImage, setPassportHandHoldingImage] = useState<string>("");
    const [passportSelfieImage, setPassportSelfieImage] = useState<string>("");
    const [passportSignatureImage, setPassportSignatureImage] = useState<string>("");
    const [nationalIdFrontImage, setNationalIdFrontImage] = useState<string>("");
    const [nationalIdBackImage, setNationalIdBackImage] = useState<string>("");

    const [errormsg, setErrormsg] = useState<string>('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);

    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [loadingData, setLoadingData] = useState(false);
    const [uploading, setUploading] = useState<Record<ImageType, boolean>>({
        passportFront: false, passportBack: false, passportHandHolding: false, passportSelfie: false, passportSignature: false,
        nationalIdFront: false, nationalIdBack: false
    });
    const [isSignatureProcessVisible, setIsSignatureProcessVisible] = useState<boolean>(false);
    const [fileNames, setFileNames] = useState<DocumentFileNamesState>({
        passportFrontFileName: "",
        passportBackFileName: "",
        passportHandHoldingFileName: "",
        passportSelfieFileName: "",
        passportSignatureFileName: "",
        nationalIdFrontFileName: "",
        nationalIdBackFileName: ""
    });

    const [initValues, setInitValues] = useState<DocumentFormValues>({
        passportDocNumber: '',
        passportExpiryDate: '',
        passportDateOfBirth: '',
        nationalIdDocNumber: '',
        nationalIdExpiryDate: '',
        passportFrontImage: '',
        passportBackImage: '',
        passportHandHoldingImage: '',
        passportSelfieImage: '',
        passportSignatureImage: '',
        nationalIdFrontImage: '',
        nationalIdBackImage: ''
    });

    const NEW_COLOR = useThemeColors();
    const dispatch = useDispatch();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const documentsData = useSelector((state: any) => state.userReducer?.documentsData);
    const selectedBank = useSelector((state: any) => state.userReducer?.selectedBank);
    const [kybDetails, setKybDetails] = useState<any>({});
    const { t } = useLngTranslation();

    useEffect(() => {
        if (isFocused) {
            getPersonalDetails();
        }
    }, [isFocused]);

    useEffect(() => {
        if (documentsData) {
            setInitValues({
                passportDocNumber: documentsData.passport?.docNumber || '',
                passportExpiryDate: documentsData.passport?.docExpiryDate || '',
                passportDateOfBirth: documentsData.passport?.dateOfBirth || '',
                nationalIdDocNumber: documentsData.nationalId?.docNumber || '',
                nationalIdExpiryDate: documentsData.nationalId?.docExpiryDate || '',
                passportFrontImage: documentsData.passport?.frontImage || '',
                passportBackImage: documentsData.passport?.backImage || '',
                passportHandHoldingImage: documentsData.passport?.handHoldingImage || '',
                passportSelfieImage: documentsData.passport?.selfieImage || '',
                passportSignatureImage: documentsData.passport?.signatureImage || '',
                nationalIdFrontImage: documentsData.nationalId?.frontImage || '',
                nationalIdBackImage: documentsData.nationalId?.backImage || ''
            });

            setPassportFrontImage(documentsData.passport?.frontImage || '');
            setPassportBackImage(documentsData.passport?.backImage || '');
            setPassportHandHoldingImage(documentsData.passport?.handHoldingImage || '');
            setPassportSelfieImage(documentsData.passport?.selfieImage || '');
            setPassportSignatureImage(documentsData.passport?.signatureImage || '');
            setNationalIdFrontImage(documentsData.nationalId?.frontImage || '');
            setNationalIdBackImage(documentsData.nationalId?.backImage || '');

            setFileNames({
                passportFrontFileName: documentsData.passport?.frontImage?.split('/').pop() ?? '',
                passportBackFileName: documentsData.passport?.backImage?.split('/').pop() ?? '',
                passportHandHoldingFileName: documentsData.passport?.handHoldingImage?.split('/').pop() ?? '',
                passportSelfieFileName: documentsData.passport?.selfieImage?.split('/').pop() ?? '',
                passportSignatureFileName: documentsData.passport?.signatureImage?.split('/').pop() ?? '',
                nationalIdFrontFileName: documentsData.nationalId?.frontImage?.split('/').pop() ?? '',
                nationalIdBackFileName: documentsData.nationalId?.backImage?.split('/').pop() ?? ''
            });
        }
    }, [documentsData]);

    useEffect(() => {
        const onBackPress = () => {
            if (isSignatureProcessVisible) {
                setIsSignatureProcessVisible(false);
            } else {
                (navigation as any).navigate('BankKybInfoPreview');
            }
            return true;
        };
        const backHandlerInstance = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandlerInstance.remove();
    }, [isSignatureProcessVisible, navigation]);

    const getRequirements = () => {
        const requirements = kybDetails?.kyc?.requirement?.toLowerCase()?.split(',') || [];
        return {
            showPFC: requirements.includes('pfc'),
            showPPHS: requirements.includes('pphs'),
            showNationalId: requirements.includes('ni')
        };
    };

    const getPersonalDetails = async () => {
        setLoadingData(true);
        setErrormsg('');

        // Always fetch API data first to get requirements
        let apiKybData = null;
        try {
            const res = await BankKybService.kybInfoDetails(selectedBank?.productId);
            if (res?.ok && (res?.data as any)?.kyc) {
                setKybDetails(res.data || {});
                apiKybData = res.data;
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }

        if (documentsData) {
            setInitValues({
                passportDocNumber: documentsData.passport?.docNumber || '',
                passportExpiryDate: documentsData.passport?.docExpiryDate || '',
                passportDateOfBirth: documentsData.passport?.dateOfBirth || '',
                nationalIdDocNumber: documentsData.nationalId?.docNumber || '',
                nationalIdExpiryDate: documentsData.nationalId?.docExpiryDate || '',
                passportFrontImage: documentsData.passport?.frontImage || '',
                passportBackImage: documentsData.passport?.backImage || '',
                passportHandHoldingImage: documentsData.passport?.handHoldingImage || '',
                passportSelfieImage: documentsData.passport?.selfieImage || '',
                passportSignatureImage: documentsData.passport?.signatureImage || '',
                nationalIdFrontImage: documentsData.nationalId?.frontImage || '',
                nationalIdBackImage: documentsData.nationalId?.backImage || ''
            });

            setPassportFrontImage(documentsData.passport?.frontImage || '');
            setPassportBackImage(documentsData.passport?.backImage || '');
            setPassportHandHoldingImage(documentsData.passport?.handHoldingImage || '');
            setPassportSelfieImage(documentsData.passport?.selfieImage || '');
            setPassportSignatureImage(documentsData.passport?.signatureImage || '');
            setNationalIdFrontImage(documentsData.nationalId?.frontImage || '');
            setNationalIdBackImage(documentsData.nationalId?.backImage || '');

            setFileNames({
                passportFrontFileName: documentsData.passport?.frontImage?.split('/').pop() ?? '',
                passportBackFileName: documentsData.passport?.backImage?.split('/').pop() ?? '',
                passportHandHoldingFileName: documentsData.passport?.handHoldingImage?.split('/').pop() ?? '',
                passportSelfieFileName: documentsData.passport?.selfieImage?.split('/').pop() ?? '',
                passportSignatureFileName: documentsData.passport?.signatureImage?.split('/').pop() ?? '',
                nationalIdFrontFileName: documentsData.nationalId?.frontImage?.split('/').pop() ?? '',
                nationalIdBackFileName: documentsData.nationalId?.backImage?.split('/').pop() ?? ''
            });
            setLoadingData(false);
            return;
        }

        // If no documentsData in Redux, load from API data
        if (apiKybData) {
            setInitValues({
                passportDocNumber: '',
                passportExpiryDate: '',
                passportDateOfBirth: '',
                nationalIdDocNumber: '',
                nationalIdExpiryDate: '',
                passportFrontImage: '',
                passportBackImage: '',
                passportHandHoldingImage: '',
                passportSelfieImage: '',
                passportSignatureImage: '',
                nationalIdFrontImage: '',
                nationalIdBackImage: ''
            });
        }
        setLoadingData(false);
    };

    const setImageState = (imageType: ImageType, uploadedImage: string, formikSetFieldValue?: any) => {
        switch (imageType) {
            case 'passportFront':
                setPassportFrontImage(uploadedImage);
                if (formikSetFieldValue) formikSetFieldValue('passportFrontImage', uploadedImage);
                break;
            case 'passportBack':
                setPassportBackImage(uploadedImage);
                if (formikSetFieldValue) formikSetFieldValue('passportBackImage', uploadedImage);
                break;
            case 'passportHandHolding':
                setPassportHandHoldingImage(uploadedImage);
                if (formikSetFieldValue) formikSetFieldValue('passportHandHoldingImage', uploadedImage);
                break;
            case 'passportSelfie':
                setPassportSelfieImage(uploadedImage);
                if (formikSetFieldValue) formikSetFieldValue('passportSelfieImage', uploadedImage);
                break;
            case 'passportSignature':
                setPassportSignatureImage(uploadedImage);
                if (formikSetFieldValue) formikSetFieldValue('passportSignatureImage', uploadedImage);
                break;
            case 'nationalIdFront':
                setNationalIdFrontImage(uploadedImage);
                if (formikSetFieldValue) formikSetFieldValue('nationalIdFrontImage', uploadedImage);
                break;
            case 'nationalIdBack':
                setNationalIdBackImage(uploadedImage);
                if (formikSetFieldValue) formikSetFieldValue('nationalIdBackImage', uploadedImage);
                break;
        }
    };

    const handleDrawnSignatureSaved = (signatureBase64: string, formikSetFieldValue?: any) => {
        setIsSignatureProcessVisible(false);
        uploadDrawnSignature(signatureBase64, formikSetFieldValue);
    };

    const uploadDrawnSignature = async (base64DataUrl: string, formikSetFieldValue?: any) => {
        if (!base64DataUrl) return;
        setUploading(prev => ({ ...prev, passportSignature: true }));

        try {
            const fileName = `signature_${Date.now()}.png`;
            const filePath = FileSystem.documentDirectory + fileName;
            const base64Code = base64DataUrl.split("data:image/png;base64,")[1];

            await FileSystem.writeAsStringAsync(filePath, base64Code, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const formData = new FormData();
            (formData as any).append("document", { uri: filePath, type: 'image/png', name: fileName });

            const uploadRes = await ProfileService.uploadFile(formData);
            if (uploadRes.status === 200) {
                const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                setPassportSignatureImage(uploadedImage);
                if (formikSetFieldValue) formikSetFieldValue('passportSignatureImage', uploadedImage);
            }
        } catch (err) {
            setErrormsg(isErrorDispaly(err));
        } finally {
            setUploading(prev => ({ ...prev, passportSignature: false }));
        }
    };

    const handleBack = useCallback(() => {
        (navigation as any).navigate('BankKybInfoPreview', { animation: 'slide_from_left' });
    }, [navigation]);

    const handleSave = async (values: DocumentFormValues, { validateForm }: any) => {
        setBtnLoading(true);

        const errors = await validateForm();
        if (Object.keys(errors).length > 0) {
            setBtnLoading(false);
            return;
        }

        if (btnLoading) return;

        try {
            const documentsData = {
                passport: {
                    docNumber: values.passportDocNumber,
                    docExpiryDate: values.passportExpiryDate && typeof values.passportExpiryDate === 'object' && (values.passportExpiryDate as any).toISOString ? (values.passportExpiryDate as any).toISOString() : values.passportExpiryDate,
                    dateOfBirth: values.passportDateOfBirth && typeof values.passportDateOfBirth === 'object' && (values.passportDateOfBirth as any).toISOString ? (values.passportDateOfBirth as any).toISOString() : values.passportDateOfBirth,
                    frontImage: values.passportFrontImage,
                    backImage: values.passportBackImage,
                    handHoldingImage: values.passportHandHoldingImage,
                    selfieImage: values.passportSelfieImage,
                    signatureImage: values.passportSignatureImage
                },
                nationalId: {
                    docNumber: values.nationalIdDocNumber,
                    docExpiryDate: values.nationalIdExpiryDate && typeof values.nationalIdExpiryDate === 'object' && (values.nationalIdExpiryDate as any).toISOString ? (values.nationalIdExpiryDate as any).toISOString() : values.nationalIdExpiryDate,
                    frontImage: values.nationalIdFrontImage,
                    backImage: values.nationalIdBackImage
                }
            };

            dispatch({ type: 'SET_DOCUMENTS_DATA', payload: documentsData });
            (navigation as any).navigate('BankKybInfoPreview', { animation: 'slide_from_left' });
        } finally {
            setBtnLoading(false);
        }
    };

    const deleteImageByType = (imageType: ImageType) => {
        setImageState(imageType, "");

    };

    const handleError = useCallback(() => {
        setErrormsg('');
    }, []);

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={s(64)}
            >
                <ScrollViewComponent
                    ref={ref}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {loadingData && <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}><DashboardLoader /></ViewComponent>}
                    {!loadingData && <Container style={commonStyles.container}>
                        <PageHeader title={"GLOBAL_CONSTANTS.DOCUMENTS"} onBackPress={handleBack} />

                        {errormsg !== "" && <ErrorComponent message={errormsg} onClose={handleError} />}

                        <Formik
                            initialValues={initValues}
                            onSubmit={handleSave}
                            validationSchema={BankKybDocumentsSchema}
                            enableReinitialize
                            validateOnChange={true}
                            validateOnBlur={true}
                        >
                            {(formik) => {
                                const { handleSubmit, handleBlur, touched, errors, setFieldValue, validateForm } = formik;

                                const requestPermission = async (pickerOption?: 'camera' | 'library') => {
                                    const permissionResult = pickerOption === 'camera'
                                        ? await ImagePicker.requestCameraPermissionsAsync()
                                        : await ImagePicker.requestMediaLibraryPermissionsAsync();

                                    if (!permissionResult.granted) {
                                        Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
                                        return false;
                                    }
                                    return true;
                                };

                                const launchImagePicker = async (pickerOption?: 'camera' | 'library') => {
                                    return pickerOption === 'camera'
                                        ? await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.5 })
                                        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: false, quality: 0.5 });
                                };

                                const processSelectedImage = async (selectedImage: any, imageType: ImageType) => {
                                    const fileName = selectedImage.fileName ?? selectedImage.uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
                                    const fileExtension = getFileExtension(selectedImage.uri);

                                    const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
                                    if (fileSizeMB > 15) {
                                        setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                                        ref?.current?.scrollTo?.({ y: 0, animated: true });
                                        return;
                                    }

                                    const formData = new FormData();
                                    (formData as any).append("document", {
                                        uri: selectedImage.uri,
                                        type: `${selectedImage.type}/${fileExtension}`,
                                        name: fileName
                                    });

                                    const uploadRes = await ProfileService.uploadFile(formData);
                                    if (uploadRes.status === 200) {
                                        const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                                        setImageState(imageType, uploadedImage, setFieldValue);
                                        setErrormsg("");
                                    } else {
                                        setErrormsg(isErrorDispaly(uploadRes));
                                    }
                                };

                                const handleImageUploadWithFormik = async (imageType: ImageType, pickerOption?: 'camera' | 'library' | 'documents') => {
                                    setUploading(prev => ({ ...prev, [imageType]: true }));

                                    try {
                                        if (pickerOption === 'documents') {
                                            const result = await DocumentPicker.getDocumentAsync({
                                                type: ['image/*', 'application/pdf'],
                                                copyToCacheDirectory: true,
                                            });

                                            if (!result.canceled && result.assets && result.assets.length > 0) {
                                                const selectedFile = result.assets[0];

                                                if (selectedFile.mimeType && !['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(selectedFile.mimeType)) {
                                                    setErrormsg(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                                                    requestAnimationFrame(() => {
                                                        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                                                    });
                                                    return;
                                                }

                                                const fileSizeMB = selectedFile.size ? selectedFile.size / (1024 * 1024) : 0;
                                                if (fileSizeMB > 15) {
                                                    setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                                                    requestAnimationFrame(() => {
                                                        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                                                    });
                                                    return;
                                                }

                                                const formData = new FormData();
                                                (formData as any).append("document", {
                                                    uri: selectedFile.uri,
                                                    type: selectedFile.mimeType,
                                                    name: selectedFile.name
                                                });

                                                const uploadRes = await ProfileService.uploadFile(formData);
                                                if (uploadRes.status === 200) {
                                                    const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                                                    setImageState(imageType, uploadedImage, setFieldValue);
                                                    setErrormsg("");
                                                } else {
                                                    setErrormsg(isErrorDispaly(uploadRes));
                                                }
                                            }
                                        } else {
                                            const hasPermission = await requestPermission(pickerOption);
                                            if (!hasPermission) return;

                                            const result = await launchImagePicker(pickerOption);
                                            if (!result.canceled && result.assets) {
                                                await processSelectedImage(result.assets[0], imageType);
                                            }
                                        }
                                    } catch (err) {
                                        setErrormsg(isErrorDispaly(err));
                                    } finally {
                                        setUploading(prev => ({ ...prev, [imageType]: false }));
                                    }
                                };

                                return (
                                    <>
                                        <SignatureDrawer
                                            isVisible={isSignatureProcessVisible}
                                            onClose={() => setIsSignatureProcessVisible(false)}
                                            onSaveDrawnSignature={(signature) => handleDrawnSignatureSaved(signature, setFieldValue)}
                                            onRequestUpload={() => {
                                                setIsSignatureProcessVisible(false);
                                                handleImageUploadWithFormik('passportSignature', 'library');
                                            }}
                                            drawOptionTextStyle={{ color: NEW_COLOR.TEXT_WHITE ?? 'white' }}
                                            drawingSaveButtonText="Save"
                                            drawingCancelButtonText="Cancel"
                                        />

                                        {(getRequirements().showPFC || getRequirements().showPPHS) && (
                                            <>
                                                <ParagraphComponent text="GLOBAL_CONSTANTS.PASSPORT" style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />

                                                <Field
                                                    touched={touched?.passportDocNumber}
                                                    name="passportDocNumber"
                                                    label="GLOBAL_CONSTANTS.DOCUMENT_NUMBER"
                                                    error={errors?.passportDocNumber}
                                                    handleBlur={handleBlur}
                                                    placeholder="GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"
                                                    component={InputDefault}
                                                    innerRef={ref}
                                                    requiredMark={<LabelComponent text="*" style={commonStyles.textError} />}
                                                />
                                                <ViewComponent style={commonStyles.formItemSpace} />
                                                <DatePickerComponent name='passportExpiryDate' minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))} label="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE" placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER" />
                                                <ViewComponent style={commonStyles.formItemSpace} />

                                                {getRequirements().showPFC && (
                                                    <>
                                                        <FileUpload
                                                            fileLoader={uploading.passportFront}
                                                            onSelectImage={(source) => handleImageUploadWithFormik('passportFront', source)}
                                                            uploadedImageUri={passportFrontImage}
                                                            fileName={fileNames.passportFrontFileName}
                                                            errorMessage={errors.passportFrontImage && touched.passportFrontImage ? errors.passportFrontImage : ''}
                                                            deleteImage={() => {
                                                                deleteImageByType('passportFront');
                                                                setFieldValue('passportFrontImage', '');
                                                            }}
                                                            label="GLOBAL_CONSTANTS.FRONT_ID_PHOTO"
                                                            isRequired={true}
                                                            showImageSourceSelector={true}
                                                            subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                        />
                                                        <ViewComponent style={commonStyles.formItemSpace} />

                                                        <FileUpload
                                                            fileLoader={uploading.passportBack}
                                                            onSelectImage={(source) => handleImageUploadWithFormik('passportBack', source)}
                                                            uploadedImageUri={passportBackImage}
                                                            fileName={fileNames.passportBackFileName}
                                                            errorMessage={errors.passportBackImage && touched.passportBackImage ? errors.passportBackImage : ''}
                                                            deleteImage={() => {
                                                                deleteImageByType('passportBack');
                                                                setFieldValue('passportBackImage', '');
                                                            }}
                                                            label="GLOBAL_CONSTANTS.BACK_ID_PHOTO"
                                                            isRequired={true}
                                                            showImageSourceSelector={true}
                                                            subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                        />
                                                        <ViewComponent style={commonStyles.formItemSpace} />
                                                    </>
                                                )}

                                                {getRequirements().showPPHS && (
                                                    <>
                                                        <FileUpload
                                                            fileLoader={uploading.passportHandHolding}
                                                            onSelectImage={(source) => handleImageUploadWithFormik('passportHandHolding', source)}
                                                            uploadedImageUri={passportHandHoldingImage}
                                                            fileName={fileNames.passportHandHoldingFileName}
                                                            errorMessage={errors.passportHandHoldingImage && touched.passportHandHoldingImage ? errors.passportHandHoldingImage : ''}
                                                            deleteImage={() => {
                                                                deleteImageByType('passportHandHolding');
                                                                setFieldValue('passportHandHoldingImage', '');
                                                            }}
                                                            label="GLOBAL_CONSTANTS.HAND_HOLDING_ID"
                                                            isRequired={true}
                                                            showImageSourceSelector={true}
                                                            subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                        />
                                                        <ViewComponent style={commonStyles.formItemSpace} />

                                                        <FileUpload
                                                            fileLoader={uploading.passportSelfie}
                                                            onSelectImage={(source) => handleImageUploadWithFormik('passportSelfie', source)}
                                                            uploadedImageUri={passportSelfieImage}
                                                            fileName={fileNames.passportSelfieFileName}
                                                            errorMessage={errors.passportSelfieImage && touched.passportSelfieImage ? errors.passportSelfieImage : ''}
                                                            deleteImage={() => {
                                                                deleteImageByType('passportSelfie');
                                                                setFieldValue('passportSelfieImage', '');
                                                            }}
                                                            label="GLOBAL_CONSTANTS.FACE_PHOTO"
                                                            isRequired={true}
                                                            showImageSourceSelector={true}
                                                            subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                        />
                                                        <ViewComponent style={commonStyles.formItemSpace} />

                                                        <FileUpload
                                                            fileLoader={uploading.passportSignature}
                                                            onSelectImage={() => setIsSignatureProcessVisible(true)}
                                                            uploadedImageUri={passportSignatureImage}
                                                            errorMessage={errors.passportSignatureImage && touched.passportSignatureImage ? errors.passportSignatureImage : ''}
                                                            fileName={fileNames.passportSignatureFileName}
                                                            deleteImage={() => {
                                                                deleteImageByType('passportSignature');
                                                                setFieldValue('passportSignatureImage', '');
                                                            }}
                                                            label="GLOBAL_CONSTANTS.SIGNATURE"
                                                            isRequired={true}
                                                            subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                        />
                                                        <ViewComponent style={commonStyles.formItemSpace} />
                                                    </>
                                                )}

                                            </>
                                        )}

                                        {getRequirements().showNationalId && (
                                            <>
                                                <ViewComponent style={commonStyles.sectionGap} />
                                                <ParagraphComponent text="GLOBAL_CONSTANTS.NATIONAL_ID" style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />

                                                <Field
                                                    touched={touched?.nationalIdDocNumber}
                                                    name="nationalIdDocNumber"
                                                    label="GLOBAL_CONSTANTS.DOCUMENT_NUMBER"
                                                    error={errors?.nationalIdDocNumber}
                                                    handleBlur={handleBlur}
                                                    placeholder="GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"
                                                    component={InputDefault}
                                                    innerRef={ref}
                                                    requiredMark={<LabelComponent text="*" style={commonStyles.textError} />}
                                                />
                                                <ViewComponent style={commonStyles.formItemSpace} />
                                                <DatePickerComponent name='nationalIdExpiryDate' minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))} label="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE" placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER" />

                                                <ViewComponent style={commonStyles.formItemSpace} />

                                                <FileUpload
                                                    fileLoader={uploading.nationalIdFront}
                                                    onSelectImage={(source) => handleImageUploadWithFormik('nationalIdFront', source)}
                                                    uploadedImageUri={nationalIdFrontImage}
                                                    fileName={fileNames.nationalIdFrontFileName}
                                                    errorMessage={errors.nationalIdFrontImage && touched.nationalIdFrontImage ? errors.nationalIdFrontImage : ''}
                                                    deleteImage={() => {
                                                        deleteImageByType('nationalIdFront');
                                                        setFieldValue('nationalIdFrontImage', '');
                                                    }}
                                                    label="GLOBAL_CONSTANTS.FRONT_ID_PHOTO"
                                                    isRequired={true}
                                                    showImageSourceSelector={true}
                                                    subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                />
                                                <ViewComponent style={commonStyles.formItemSpace} />

                                                <FileUpload
                                                    fileLoader={uploading.nationalIdBack}
                                                    onSelectImage={(source) => handleImageUploadWithFormik('nationalIdBack', source)}
                                                    uploadedImageUri={nationalIdBackImage}
                                                    fileName={fileNames.nationalIdBackFileName}
                                                    errorMessage={errors.nationalIdBackImage && touched.nationalIdBackImage ? errors.nationalIdBackImage : ''}
                                                    deleteImage={() => {
                                                        deleteImageByType('nationalIdBack');
                                                        setFieldValue('nationalIdBackImage', '');
                                                    }}
                                                    label="GLOBAL_CONSTANTS.BACK_ID_PHOTO"
                                                    isRequired={true}
                                                    showImageSourceSelector={true}
                                                    subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                />
                                            </>
                                        )}

                                        <ViewComponent style={commonStyles.sectionGap} />
                                        <ButtonComponent
                                            title="GLOBAL_CONSTANTS.CONTINUE"
                                            loading={btnLoading}
                                            disable={btnLoading}
                                            onPress={() => {
                                                if (btnLoading) return;
                                                validateForm().then((errors) => {
                                                    if (Object.keys(errors).length > 0) {
                                                        ref?.current?.scrollTo?.({ y: 0, animated: true });
                                                        setErrormsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
                                                    }
                                                    handleSubmit();
                                                });
                                            }}
                                        />
                                        <ViewComponent style={commonStyles.buttongap} />
                                        <ButtonComponent title="GLOBAL_CONSTANTS.BACK" onPress={handleBack} solidBackground={true} />
                                        <ViewComponent style={commonStyles.sectionGap} />
                                    </>
                                );
                            }}
                        </Formik>
                    </Container>}
                </ScrollViewComponent>
            </KeyboardAvoidingView>
        </ViewComponent>
    );
}

export default BankKybDocumentsStep;
