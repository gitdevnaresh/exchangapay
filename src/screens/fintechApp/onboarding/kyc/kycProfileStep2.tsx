import { View, BackHandler, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { Field, Formik } from "formik";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { isErrorDispaly } from "../../../../utils/helpers";
import Container from "../../../../components/container/container";
import ProfileService from "../../../../apiServices/profile";
import * as ImagePicker from 'expo-image-picker';
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import FileUpload from "../../../../components/fileUpload/fileUpload";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import * as FileSystem from 'expo-file-system';
import { getFileExtension, KYC_PROFILE_PRIVEW_CONSTANTS } from "../constants";
import SignatureDrawer from "../../../../components/signature/signature";
import ButtonComponent from "../../../../components/buttons/button";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import ViewComponent from "../../../../components/view/view";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import SafeAreaViewComponent from "../../../../components/safeArea/safeArea";
import InputDefault from '../../../../components/textInputComponents/DefaultFiat';
import PageHeader from "../../../../components/pageHeader/pageHeader";
import LabelComponent from "../../../../components/textComponets/lableComponent/lable";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import DatePickerComponent from "../../../../components/datePickers/formik/datePicker";

type ImageType =
    | 'nationalIdFront'
    | 'nationalIdBack'
    | 'passportSelfie'
    | 'passportFront'
    | 'passportBack'
    | 'passportHandHolding'
    | 'passportSignature';

const KycProfileStep2 = (props: any) => {
    const ref = useRef<any>(null);
    const [nationalIdFrontImage, setNationalIdFrontImage] = useState<any>(null);
    const [nationalIdBackImage, setNationalIdBackImage] = useState<any>("");
    const [idPhoto, setIdPhoto] = useState<any>(null);
    const [passortImage, setPassortImage] = useState<any>(null);
    const [passportBackImage, setPassportBackImage] = useState<any>(null);
    const [signImage, setSignImage] = useState<any>(null);
    const [selfie, setSelfie] = useState<any>("");
    const [errormsg, setErrormsg] = useState<any>('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [imageErrors, setImageErrors] = useState<Record<ImageType, string>>({
        nationalIdFront: "",
        nationalIdBack: "",
        passportSelfie: "",
        passportFront: "",
        passportBack: "",
        passportHandHolding: "",
        passportSignature: ""
    });
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const [loadingData, setLoadingData] = useState(false);
    const [uploading, setUploading] = useState<Record<ImageType, boolean>>({
        nationalIdFront: false,
        nationalIdBack: false,
        passportSelfie: false,
        passportFront: false,
        passportBack: false,
        passportHandHolding: false,
        passportSignature: false
    });
    const [isSignatureProcessVisible, setIsSignatureProcessVisible] = useState<boolean>(false);
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const [fileNames, setFileNames] = useState({
        "nationalIdFrontFileName": "",
        "backIdFilename": "",
        "frontIdFileName": '',
        "passportBackFileName": "",
        "handleHoldingImgFilename": "",
        "selfieFileName": "",
        "signFileName": ""
    });

    const [initValues, setInitValues] = useState<any>({
        passportId: '',
        nationalId: '',
        passportDocNumber: '',
        passportDocExpireDate: null,
        nationalIdDocNumber: '',
        nationalIdDocExpireDate: null,
    });

    const NEW_COLOR = useThemeColors();
    const fileNameKeyMap: Record<ImageType, keyof typeof fileNames> = {
        nationalIdFront: 'nationalIdFrontFileName',
        nationalIdBack: 'backIdFilename',
        passportSelfie: 'selfieFileName',
        passportFront: 'frontIdFileName',
        passportBack: 'passportBackFileName',
        passportHandHolding: 'handleHoldingImgFilename',
        passportSignature: 'signFileName',
    };
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useHardwareBackHandler(() => {
        handleGoBack();
    });

    const handleGoBack = useCallback(() => {
        if (props?.route?.params?.cardId) {
            navigation?.navigate("ApplyExchangaCard", {
                cardId: props?.route?.params?.cardId,
                logo: props?.route?.params?.logo
            });
        } else if (props?.route?.params?.customerId) {
            navigation?.navigate("KycProfilePreview")
        } else {
            navigation?.navigate("NewProfile");
        }
    }, [props.navigation, props?.route?.params?.cardId, props?.route?.params?.logo]);

    useEffect(() => {
        if (props?.route?.params?.customerId) {
            getPersionalDetails();
        }
    }, [isFocused, props?.route?.params?.customerId]);

    useEffect(() => {
        const onBackPress = () => {
            if (isSignatureProcessVisible) {
                setIsSignatureProcessVisible(false);
                return true;
            }
            handleGoBack();
            return false;
        };
        const backHandlerInstance = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandlerInstance.remove();
    }, [isSignatureProcessVisible, handleGoBack]);

    const handleRefresh = useCallback(() => {
        getPersionalDetails();
    }, []);

    const getPersionalDetails = async () => {
        setLoadingData(true);
        setErrormsg('');
        try {
            const res: any = await ProfileService.identityDocumentsDetails();
            if (res?.ok) {
                const kycDocs = res?.data;
                let passportDoc: any = null;
                let nationalIdDoc: any = null;

                if (kycDocs && Array.isArray(kycDocs)) {
                    kycDocs.forEach((item: any) => {
                        const docType = decryptAES(item.documentType);
                        if (docType?.toLowerCase() === "passport") {
                            passportDoc = item;
                        } else if (docType === "National ID") {
                            nationalIdDoc = item;
                        }
                    });
                }
                setInitValues({
                    passportId: passportDoc?.id,
                    nationalId: nationalIdDoc?.id,
                    passportDocNumber: passportDoc?.number ? passportDoc.number : '',
                    passportDocExpireDate: passportDoc?.expiryDate ? new Date(passportDoc.expiryDate) : null,
                    nationalIdDocNumber: nationalIdDoc?.number ? nationalIdDoc.number : '',
                    nationalIdDocExpireDate: nationalIdDoc?.expiryDate ? new Date(nationalIdDoc.expiryDate) : null,
                });
                setPassortImage(passportDoc?.frontImage);
                setPassportBackImage(passportDoc?.backDocImage);
                setNationalIdBackImage(nationalIdDoc?.backDocImage);
                setNationalIdFrontImage(nationalIdDoc?.frontImage);
                setSignImage(passportDoc?.singatureImage);
                setIdPhoto(passportDoc?.handHoldingImage);
                setSelfie(passportDoc?.selfieImage);
                setLoadingData(false);
                setFileNames(prevState => ({
                    ...prevState,
                    nationalIdFrontFileName: nationalIdDoc?.frontImage?.split('/').pop() ?? `image_${Date.now()}.jpg`,
                    backIdFilename: nationalIdDoc?.backDocImage?.split('/').pop() ?? `image_${Date.now()}.jpg`,
                    frontIdFileName: passportDoc?.frontImage?.split('/').pop() ?? `image_${Date.now()}.jpg`,
                    passportBackFileName: passportDoc?.backDocImage?.split('/').pop() ?? `image_${Date.now()}.jpg`,
                    signFileName: passportDoc?.singatureImage?.split('/').pop() ?? `image_${Date.now()}.jpg`,
                    handleHoldingImgFilename: passportDoc?.handHoldingImage?.split('/').pop() ?? `image_${Date.now()}.jpg`,
                    selfieFileName: passportDoc?.selfieImage?.split('/').pop() ?? `image_${Date.now()}.jpg`,
                }));
            } else {
                setErrormsg(isErrorDispaly(res));
                setLoadingData(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoadingData(false);
        }
    };

    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];

    const verifyFileTypes = (fileList: any) => {
        const fileName = fileList;
        if (!hasAcceptedExtension(fileName)) {
            return false;
        }
        return true;
    };

    const hasAcceptedExtension = (fileName: string) => {
        const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        return acceptedExtensions.includes(extension);
    };

    const handleImageUpload = async (imageType: ImageType, pickerOption?: 'camera' | 'library') => {
        const clearAndLoad = () => {
            switch (imageType) {
                case 'nationalIdFront': setNationalIdFrontImage(""); break;
                case 'nationalIdBack': setNationalIdBackImage(""); break;
                case 'passportSelfie': setSelfie(""); break;
                case 'passportFront': setPassortImage(""); break;
                case 'passportBack': setPassportBackImage(""); break;
                case 'passportHandHolding': setIdPhoto(""); break;
                case 'passportSignature': setSignImage(""); break;
            }
            setImageErrors(prev => ({ ...prev, [imageType]: "" }));
            setUploading(prev => ({ ...prev, [imageType]: true }));
        };
        clearAndLoad();
        try {
            const permissionResult =
                pickerOption === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Denied", "You need to enable permissions to use this feature.");
                return;
            }
            const result =
                pickerOption === 'camera'
                    ? await ImagePicker.launchCameraAsync({
                        allowsEditing: false,
                        aspect: [1, 1],
                        quality: 0.5,
                        cameraType: ImagePicker.CameraType.front,
                    })
                    : await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: false,
                        aspect: [1, 1],
                        quality: 0.5
                    });
            if (!result.canceled) {
                const selectedImage = result.assets[0];
                const { uri, type, fileSize } = selectedImage;
                const isValidSize = verifyFileSize(fileSize);
                if (!isValidSize) {
                    setErrormsg(KYC_PROFILE_PRIVEW_CONSTANTS.FILE_SIZE_SHOULD_2MB);
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    return;
                }
                const fileName = selectedImage.fileName ?? uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
                const fileExtension = getFileExtension(selectedImage.uri);
                const isValidFileType = verifyFileTypes(fileName);
                if (!isValidFileType) {
                    setErrormsg("Accepts only jpg, png, and jpeg format");
                    ref?.current?.scrollTo({ y: 0, animated: true });
                    return;
                }
                setFileNames(prevState => ({ ...prevState, [fileNameKeyMap[imageType]]: fileName }));

                if (uri) {
                    const formData = new FormData();
                    formData.append("document", { uri: uri, type: `${type}/${fileExtension}`, name: fileName } as any);
                    const uploadRes = await ProfileService.uploadFile(formData);
                    if (uploadRes.status === 200) {
                        const uploadedImage: any = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                        switch (imageType) {
                            case 'nationalIdFront': setNationalIdFrontImage(uploadedImage); break;
                            case 'nationalIdBack': setNationalIdBackImage(uploadedImage); break;
                            case 'passportSelfie': setSelfie(uploadedImage); break;
                            case 'passportFront': setPassortImage(uploadedImage); break;
                            case 'passportBack': setPassportBackImage(uploadedImage); break;
                            case 'passportHandHolding': setIdPhoto(uploadedImage); break;
                            case 'passportSignature': setSignImage(uploadedImage); break;
                        }
                        setErrormsg("");
                    } else {
                        setErrormsg(isErrorDispaly(uploadRes));
                        ref?.current?.scrollTo({ y: 0, animated: true });
                    }
                }
            }
        } catch (err) {
            setErrormsg(isErrorDispaly(err));
            ref?.current?.scrollTo({ y: 0, animated: true });
        } finally {
            setUploading(prev => ({ ...prev, [imageType]: false }));
        }
    };

    // Clean validation function - only validates, minimal side effects
    const validate = (formikValues: any) => {
        let formikErrors: any = {};

        // Document and Date Validations
        if (!formikValues.passportDocNumber) {
            formikErrors.passportDocNumber = "GLOBAL_CONSTANTS.IS_REQUIRED";
        } else if (!/^[a-zA-Z0-9]+$/.test(formikValues.passportDocNumber)) {
            formikErrors.passportDocNumber = "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER";
        }
        if (!formikValues.passportDocExpireDate) {
            formikErrors.passportDocExpireDate = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
        if (!formikValues.nationalIdDocNumber) {
            formikErrors.nationalIdDocNumber = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
        else if (!/^[a-zA-Z0-9]+$/.test(formikValues.passportDocNumber)) {
            formikErrors.nationalIdDocNumber = "GLOBAL_CONSTANTS.INVALID_DOCUMENT_NUMBER";
        }

        // Image Validations
        const imageFields: { type: ImageType; value: any }[] = [
            { type: 'nationalIdFront', value: nationalIdFrontImage },
            { type: 'nationalIdBack', value: nationalIdBackImage },
            { type: 'passportSelfie', value: selfie },
            { type: 'passportFront', value: passortImage },
            { type: 'passportBack', value: passportBackImage },
            { type: 'passportHandHolding', value: idPhoto },
            { type: 'passportSignature', value: signImage },
        ];

        let imageErrorsUpdate: Partial<Record<ImageType, string>> = {};
        let hasImageErrors = false;

        for (const field of imageFields) {
            if (!field.value) {
                imageErrorsUpdate[field.type] = "GLOBAL_CONSTANTS.IS_REQUIRED";
                hasImageErrors = true;
            } else {
                imageErrorsUpdate[field.type] = "";
            }
        }

        // Update image errors state (side effect for UI)
        setImageErrors(prev => ({ ...prev, ...imageErrorsUpdate }));

        // Add general error if images are missing to prevent form submission
        if (hasImageErrors) {
            formikErrors._images = "Please upload all required images";
        }

        return formikErrors;
    };

    const verifyFileSize = (fileSize: any) => {
        const maxSizeInBytes = 15 * 1024 * 1024;
        return fileSize <= maxSizeInBytes;
    };

    const handleDrawnSignatureSaved = (signatureBase64: string) => {
        setIsSignatureProcessVisible(false);
        uploadDrawnSignature(signatureBase64);
    };

    const uploadDrawnSignature = async (base64DataUrl: string) => {
        if (!base64DataUrl) return;
        setUploading(prev => ({ ...prev, passportSignature: true }));
        setSignImage("");
        setImageErrors(prev => ({ ...prev, passportSignature: "" }));
        setErrormsg("");
        try {
            const fileName = `signature_${Date.now()}.png`;
            const filePath = FileSystem.documentDirectory + fileName;
            const base64Code = base64DataUrl.split("data:image/png;base64,")[1];
            await FileSystem.writeAsStringAsync(filePath, base64Code, {
                encoding: FileSystem.EncodingType.Base64,
            });
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            if (!fileInfo.exists || fileInfo.size === undefined) {
                throw new Error("Failed to save signature image or get file info.");
            }
            const isValidSize = verifyFileSize(fileInfo.size);
            if (!isValidSize) {
                setErrormsg(KYC_PROFILE_PRIVEW_CONSTANTS.FILE_SIZE_SHOULD_2MB);
                ref?.current?.scrollTo({ y: 0, animated: true });
                return;
            }
            setFileNames(prevState => ({ ...prevState, signFileName: fileName }));
            const formData = new FormData();
            formData.append("document", { uri: filePath, type: 'image/png', name: fileName } as any);
            const uploadRes = await ProfileService.uploadFile(formData);
            if (uploadRes.status === 200) {
                const uploadedImage: any = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                setSignImage(uploadedImage);
            } else {
                setErrormsg(isErrorDispaly(uploadRes));
                ref?.current?.scrollTo({ y: 0, animated: true });
            }
        } catch (err: any) {
            setErrormsg(isErrorDispaly(err.message ?? err));
            ref?.current?.scrollTo({ y: 0, animated: true });
        } finally {
            setUploading(prev => ({ ...prev, passportSignature: false }));
        }
    };

    const handleBack = useCallback(() => {
        if (props?.route?.params?.customerId) {
            props?.navigation?.goBack();
        } else {
            props?.navigation?.navigate('NewProfile');
        }
    }, []);

    // Simplified handleSave - no validation, just submission
    const handleSave = async (values: any, { setSubmitting }: any) => {
        setBtnLoading(true);
        setSubmitting(true);

        const postObject = [
            {
                selfieImage: selfie,
                frontImage: passortImage,
                backDocImage: passportBackImage,
                handHoldingImage: idPhoto,
                singatureImage: signImage,
                documentType: encryptAES("Passport"),
                number: values.passportDocNumber,
                expiryDate: values.passportDocExpireDate,
                id: values?.passportId ?? KYC_PROFILE_PRIVEW_CONSTANTS.GUID_FORMATE,
            },
            {
                frontImage: nationalIdFrontImage,
                backDocImage: nationalIdBackImage,
                documentType: encryptAES("National ID"),
                number: values.nationalIdDocNumber,
                expiryDate: values.nationalIdDocExpireDate,
                id: values?.nationalId ?? KYC_PROFILE_PRIVEW_CONSTANTS.GUID_FORMATE,
            },
        ];

        try {
            let res;
            if (props?.route?.params?.customerId) {
                res = await ProfileService?.updateIdentityDocumentsProfile(postObject);
            } else {
                res = await ProfileService?.identityDocumentsProfile(postObject);
            }

            if (res.status === 200) {
                navigation.navigate('KycProfilePreview');
                setErrormsg('');
            } else {
                setErrormsg(isErrorDispaly(res));
                ref?.current?.scrollTo({ y: 0, animated: true });
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        } finally {
            setBtnLoading(false);
            setSubmitting(false);
        }
    };

    const deleteImageByType = (imageType: ImageType) => {
        switch (imageType) {
            case 'nationalIdFront': setNationalIdFrontImage(""); break;
            case 'nationalIdBack': setNationalIdBackImage(""); break;
            case 'passportSelfie': setSelfie(""); break;
            case 'passportFront': setPassortImage(""); break;
            case 'passportBack': setPassportBackImage(""); break;
            case 'passportHandHolding': setIdPhoto(""); break;
            case 'passportSignature': setSignImage(""); break;
        }
        setImageErrors(prev => ({ ...prev, [imageType]: "" }));
    };

    const handleError = useCallback(() => {
        setErrormsg(null);
    }, []);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loadingData && (
                <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </SafeAreaViewComponent>
            )}
            {!loadingData && (
                <Container style={commonStyles.container}>
                    <PageHeader
                        title={props?.route?.params?.customerId ? "GLOBAL_CONSTANTS.EDIT_KYC" : "GLOBAL_CONSTANTS.KYC"}
                        onBackPress={handleBack}
                        isrefresh={!!props?.route?.params?.customerId}
                        onRefresh={handleRefresh}
                    />
                    <KeyboardAwareScrollView
                        ref={ref}
                        contentContainerStyle={[{ flexGrow: 1 }]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        enableOnAndroid={true}
                    >

                        <>
                            <SignatureDrawer
                                isVisible={isSignatureProcessVisible}
                                onClose={() => setIsSignatureProcessVisible(false)}
                                onSaveDrawnSignature={handleDrawnSignatureSaved}
                                onRequestUpload={() => {
                                    setIsSignatureProcessVisible(false);
                                    handleImageUpload('passportSignature', 'library');
                                }}
                                drawOptionTextStyle={{ color: NEW_COLOR.TEXT_WHITE ?? 'white' }}
                                drawingSaveButtonText="GLOBAL_CONSTANTS.SAVE"
                                drawingCancelButtonText="GLOBAL_CONSTANTS.CANCEL"
                            />

                            {errormsg && <ErrorComponent message={errormsg} onClose={handleError} />}

                            {!loadingData && (
                                <Formik
                                    initialValues={initValues}
                                    onSubmit={handleSave}
                                    validate={validate}
                                    enableReinitialize
                                >
                                    {(formik) => {
                                        const { handleSubmit, touched, errors, handleBlur, isSubmitting } = formik;
                                        return (
                                            <>
                                                <ParagraphComponent
                                                    text="GLOBAL_CONSTANTS.PASSPORT"
                                                    style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
                                                />
                                                <Field
                                                    activeOpacity={0.9}
                                                    touched={touched?.passportDocNumber}
                                                    name="passportDocNumber"
                                                    label={"GLOBAL_CONSTANTS.DACUMENT_NUMBER"}
                                                    autoCapitalize="characters"
                                                    maxLength={20}
                                                    error={errors?.passportDocNumber}
                                                    handleBlur={handleBlur}
                                                    placeholder={"GLOBAL_CONSTANTS.DACUMENT_NUMBER_PLACEHOLDER"}
                                                    component={InputDefault}
                                                    requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                />
                                                <ViewComponent style={[commonStyles.formItemSpace]} />
                                                <DatePickerComponent
                                                    name='passportDocExpireDate'
                                                    minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                                    label="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE"
                                                    placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER"
                                                />
                                                <ViewComponent style={[commonStyles.formItemSpace]} />
                                                <FileUpload
                                                    fileLoader={uploading.passportSelfie}
                                                    onSelectImage={(source) => handleImageUpload('passportSelfie', source)}
                                                    uploadedImageUri={selfie}
                                                    fileName={fileNames?.selfieFileName}
                                                    errorMessage={imageErrors.passportSelfie}
                                                    deleteImage={() => deleteImageByType('passportSelfie')}
                                                    label="GLOBAL_CONSTANTS.FACE_IMAGE"
                                                    isRequired={true}
                                                    showImageSourceSelector={true}
                                                />

                                                <View style={[commonStyles.formItemSpace]} />
                                                <FileUpload
                                                    fileLoader={uploading.passportFront}
                                                    onSelectImage={(source) => handleImageUpload('passportFront', source)}
                                                    uploadedImageUri={passortImage}
                                                    errorMessage={imageErrors.passportFront}
                                                    deleteImage={() => deleteImageByType('passportFront')}
                                                    fileName={fileNames?.frontIdFileName}
                                                    label="GLOBAL_CONSTANTS.FRONT_ID_PHOTO"
                                                    isRequired={true}
                                                    showImageSourceSelector={true}
                                                />
                                                <View style={[commonStyles.formItemSpace]} />
                                                <FileUpload
                                                    fileLoader={uploading.passportBack}
                                                    onSelectImage={(source) => handleImageUpload('passportBack', source)}
                                                    uploadedImageUri={passportBackImage}
                                                    fileName={fileNames?.passportBackFileName}
                                                    errorMessage={imageErrors.passportBack}
                                                    deleteImage={() => deleteImageByType('passportBack')}
                                                    label="GLOBAL_CONSTANTS.BACK_ID_PHOTO"
                                                    isRequired={true}
                                                    showImageSourceSelector={true}
                                                />
                                                <View>
                                                    <View style={[commonStyles.formItemSpace]} />
                                                    <FileUpload
                                                        fileLoader={uploading.passportHandHolding}
                                                        onSelectImage={(source) => handleImageUpload('passportHandHolding', source)}
                                                        uploadedImageUri={idPhoto}
                                                        fileName={fileNames?.handleHoldingImgFilename}
                                                        errorMessage={imageErrors.passportHandHolding}
                                                        deleteImage={() => deleteImageByType('passportHandHolding')}
                                                        label="GLOBAL_CONSTANTS.HAND_HANDLING_ID_PHOTO"
                                                        isRequired={true}
                                                        showImageSourceSelector={true}
                                                    />
                                                    <View style={[commonStyles.formItemSpace]} />
                                                    <FileUpload
                                                        fileLoader={uploading.passportSignature}
                                                        onSelectImage={() => setIsSignatureProcessVisible(true)}
                                                        uploadedImageUri={signImage}
                                                        errorMessage={imageErrors.passportSignature}
                                                        fileName={fileNames?.signFileName}
                                                        deleteImage={() => deleteImageByType('passportSignature')}
                                                        label="GLOBAL_CONSTANTS.SIGNATURE_PHOTO"
                                                        isRequired={true}
                                                    />
                                                </View>
                                                <View style={[commonStyles.sectionGap]} />
                                                <ParagraphComponent
                                                    text="GLOBAL_CONSTANTS.NATIONAL_ID"
                                                    style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
                                                />
                                                <Field
                                                    activeOpacity={0.9}
                                                    touched={touched?.nationalIdDocNumber}
                                                    maxLength={20}
                                                    name="nationalIdDocNumber"
                                                    label={"GLOBAL_CONSTANTS.DACUMENT_NUMBER"}
                                                    error={errors?.nationalIdDocNumber}
                                                    handleBlur={handleBlur}
                                                    placeholder={"GLOBAL_CONSTANTS.DACUMENT_NUMBER_PLACEHOLDER"}
                                                    component={InputDefault}
                                                    autoCapitalize="characters"
                                                    autoCorrect={false}
                                                    requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                />
                                                <ViewComponent style={[commonStyles.formItemSpace]} />
                                                <DatePickerComponent
                                                    name='nationalIdDocExpireDate'
                                                    minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                                    label="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE"
                                                    placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER"
                                                    required={false}
                                                />
                                                <ViewComponent style={[commonStyles.formItemSpace]} />


                                                <FileUpload
                                                    fileLoader={uploading.nationalIdFront}
                                                    onSelectImage={(source) => handleImageUpload('nationalIdFront', source)}
                                                    uploadedImageUri={nationalIdFrontImage}
                                                    fileName={fileNames?.nationalIdFrontFileName}
                                                    errorMessage={imageErrors.nationalIdFront}
                                                    deleteImage={() => deleteImageByType('nationalIdFront')}
                                                    label="GLOBAL_CONSTANTS.FRONT_ID_PHOTO"
                                                    isRequired={true}
                                                    showImageSourceSelector={true}
                                                />
                                                <View style={[commonStyles.formItemSpace]} />
                                                <FileUpload
                                                    fileLoader={uploading.nationalIdBack}
                                                    onSelectImage={(source) => handleImageUpload('nationalIdBack', source)}
                                                    fileName={fileNames?.backIdFilename}
                                                    uploadedImageUri={nationalIdBackImage}
                                                    errorMessage={imageErrors.nationalIdBack}
                                                    deleteImage={() => deleteImageByType('nationalIdBack')}
                                                    label="GLOBAL_CONSTANTS.BACK_ID_PHOTO"
                                                    isRequired={true}
                                                    showImageSourceSelector={true}
                                                />
                                                <View style={[commonStyles.mb32]} />
                                                <View style={[commonStyles.justify, commonStyles.flex1]}>
                                                    <ButtonComponent
                                                        title="GLOBAL_CONSTANTS.NEXT"
                                                        loading={btnLoading || isSubmitting}
                                                        onPress={handleSubmit}
                                                    />
                                                </View>
                                                <View style={[commonStyles.justify, commonStyles.mt16, commonStyles.flex1]}>
                                                    <ButtonComponent
                                                        title={"GLOBAL_CONSTANTS.BACK"}
                                                        onPress={handleBack}
                                                        solidBackground={true}
                                                    />
                                                </View>
                                                <View style={commonStyles.mb32} />
                                            </>
                                        );
                                    }}
                                </Formik>
                            )}
                        </>

                    </KeyboardAwareScrollView>
                </Container>
            )}
        </ViewComponent>
    );
}

export default KycProfileStep2;

