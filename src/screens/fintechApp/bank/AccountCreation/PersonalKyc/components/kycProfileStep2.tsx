import { BackHandler, Alert, KeyboardAvoidingView, Platform } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Formik, Field } from "formik";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useDispatch, useSelector } from 'react-redux';
import {
    BankKycProfileStep2Props,
    FileNames,
    ImageType,
    ImageAsset,
    UploadApiResponse,
    ImageFieldConfig
} from '../types/interface';
import useEncryptDecrypt from "../../../../../../hooks/encDecHook";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { formatDates, isErrorDispaly } from "../../../../../../utils/helpers";
import ViewComponent from "../../../../../../components/view/view";
import ScrollViewComponent from "../../../../../../components/scrollView/scrollView";
import { s } from "../../../../../../components/theme/scale";
import Container from "../../../../../../components/container/container";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import SignatureDrawer from "../../../../../../components/signature/signature";
import ErrorComponent from "../../../../../../components/errorDisplay/errorDisplay";
import ParagraphComponent from "../../../../../../components/textComponets/paragraphText/paragraph";
import DatePickerComponent from "../../../../../../components/datePickers/formik/datePicker";
import LabelComponent from "../../../../../../components/textComponets/lableComponent/lable";
import FileUpload from "../../../../../../components/fileUpload/fileUpload";
import InputDefault from '../../../../../../components/textInputComponents/DefaultFiat';
import ButtonComponent from "../../../../../../components/buttons/button";
import DashboardLoader from "../../../../../../components/loader";
import { getBankKycDocumentsSchema } from '../schemas/schema';
import { getFileExtension, KYC_PROFILE_PRIVEW_CONSTANTS } from "../../../../onboarding/constants";
import { FORM_FIELD } from "../../BusinessKyb/components/constants";
import PermissionModel from "../../../../../commonScreens/permissionPopup";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import { useLngTranslation } from "../../../../../../hooks/languagesHook/useLngTranslation";
import ProfileService from "../../../../../../apiServices/profile";


const BankKycProfileStep2 = (props: BankKycProfileStep2Props) => {
    const ref = useRef<any>(null);
    const [nationalIdFrontImage, setNationalIdFrontImage] = useState<string | null>(null);
    const [nationalIdBackImage, setNationalIdBackImage] = useState<string>("");
    const [passortImage, setPassortImage] = useState<string | null>(null); // Passport/ID Front
    const [passportBackImage, setPassportBackImage] = useState<string | null>(null); // Passport/ID Back
    const [idPhoto, setIdPhoto] = useState<string | null>(null); // Hand holding ID
    const [selfie, setSelfie] = useState<string>(""); // Face 
    const [signImage, setSignImage] = useState<string | null>(null);

    const [errormsg, setErrormsg] = useState<string>('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [imageErrors, setImageErrors] = useState<Record<ImageType, string>>({ nationalIdFront: "", nationalIdBack: "", passportFront: "", passportBack: "", passportHandHolding: "", passportSelfie: "", passportSignature: "" });
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const [loadingData, setLoadingData] = useState(false);
    const [uploading, setUploading] = useState<Record<ImageType, boolean>>({ nationalIdFront: false, nationalIdBack: false, passportFront: false, passportBack: false, passportHandHolding: false, passportSelfie: false, passportSignature: false });
    const [isSignatureProcessVisible, setIsSignatureProcessVisible] = useState<boolean>(false);
    const { encryptAES } = useEncryptDecrypt();
    const [permissionModel, setPermissionModel] = useState<boolean>(false);
    const [fileNames, setFileNames] = useState<FileNames>({
        nationalIdFrontFileName: "",
        nationalIdBackFileName: "",
        frontIdFileName: '',
        backIdFileName: '', // Added for passport back
        handleHoldingImgFilename: "",
        selfieFileName: "",
        signFileName: ""
    });

    const [initValues, setInitValues] = useState<{
        passportId: string;
        nationalId: string;
        idNumber: string;
        docExpiryDate: Date | null;
        nationalIdNumber: string;
        nationalIdDocExpiryDate: Date | null;
    }>({
        passportId: '',
        nationalId: '',
        idNumber: '',
        docExpiryDate: null,
        nationalIdNumber: '',
        nationalIdDocExpiryDate: null
    });
    const [kycDetails, setKycDetails] = useState<any>({});
    const NEW_COLOR = useThemeColors();
    const dispatch = useDispatch();
    const identityDocuments = useSelector((state: any) => state.userReducer?.identityDocuments);
    const { t } = useLngTranslation();

    const fileNameKeyMap: Record<ImageType, keyof typeof fileNames> = {
        nationalIdFront: 'nationalIdFrontFileName',
        nationalIdBack: 'nationalIdBackFileName',
        passportFront: 'frontIdFileName',
        passportBack: 'backIdFileName',
        passportHandHolding: 'handleHoldingImgFilename',
        passportSelfie: 'selfieFileName',
        passportSignature: 'signFileName',
    };
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    // Shared utility function for date conversion
    const convertToDate = (dateStr: string) => {
        if (!dateStr) return null;
        try {
            const parsedDateStr = formatDates(dateStr, 'yyyy-MM-dd');
            if (parsedDateStr === '--') return null;
            const date = new Date(parsedDateStr);
            return isNaN(date.getTime()) ? null : date;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        if (isFocused && props?.route?.params?.ProgramID) {
            getPersonalDetails();
        }
    }, [isFocused, props?.route?.params?.ProgramID]);

    useEffect(() => {
        const onBackPress = () => {
            if (isSignatureProcessVisible) {
                setIsSignatureProcessVisible(false);
            } else {
                handleBack();
            }
            return true;
        };
        const backHandlerInstance = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandlerInstance.remove();
    }, [isSignatureProcessVisible]);

    const getRequirements = () => {
        const requirements = kycDetails?.kyc?.requirement?.split(',') || [];
        return {
            showPFC: requirements.includes('PFC'),
            showPPHS: requirements.includes('PPHS'),
            showNationalId: requirements.includes('NI')
        };
    };

    /**
     * Fetches and binds KYC data exactly like in the preview component.
     */
    const getPersonalDetails = async () => {
        setLoadingData(true);
        setErrormsg('');

        // Always fetch API data first to get requirements
        let apiKycData = null;
        try {
            const res: any = await ProfileService.kycInfoDetails(props?.route?.params?.ProgramID || '');
            if (res?.ok && res?.data?.kyc) {
                setKycDetails(res.data || {});
                apiKycData = res.data?.kyc; // Store for immediate use
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }

        // Then prioritize identityDocuments from Redux if available
        if (identityDocuments && identityDocuments.length > 0) {
            const passportDoc = identityDocuments[0]; // First document (Passport)
            const nationalIdDoc = identityDocuments[1]; // Second document (National ID)

            // Set passport/document images
            setPassortImage(passportDoc?.frontImage || '');
            setPassportBackImage(passportDoc?.backDocImage || '');
            setIdPhoto(passportDoc?.handHoldingImage || '');
            setSelfie(passportDoc?.selfieImage || '');
            setSignImage(passportDoc?.singatureImage || '');

            // Set national ID images
            setNationalIdFrontImage(nationalIdDoc?.frontImage || '');
            setNationalIdBackImage(nationalIdDoc?.backDocImage || '');

            // Set file names
            setFileNames({
                nationalIdFrontFileName: nationalIdDoc?.frontImage?.split('/').pop() ?? '',
                nationalIdBackFileName: nationalIdDoc?.backDocImage?.split('/').pop() ?? '',
                frontIdFileName: passportDoc?.frontImage?.split('/').pop() ?? '',
                backIdFileName: passportDoc?.backDocImage?.split('/').pop() ?? '',
                handleHoldingImgFilename: passportDoc?.handHoldingImage?.split('/').pop() ?? '',
                selfieFileName: passportDoc?.selfieImage?.split('/').pop() ?? '',
                signFileName: passportDoc?.singatureImage?.split('/').pop() ?? ''
            });

            // Convert string dates to Date objects using shared utility

            // Set form initial values with existing document data
            setInitValues({
                passportId: '',
                nationalId: '',
                idNumber: passportDoc?.documentNumber || '',
                docExpiryDate: convertToDate(passportDoc?.documentExpiryDate),
                nationalIdNumber: nationalIdDoc?.documentNumber || '',
                nationalIdDocExpiryDate: convertToDate(nationalIdDoc?.documentExpiryDate)
            });

            setLoadingData(false);
            return;
        }

        // If no identityDocuments in Redux, load from API data
        if (apiKycData) {
            // Bind PFC documents (Front/Back ID)
            // Use pphs.idImage as primary front image, fallback to pfc.frontDoc
            const frontIdImage = apiKycData?.pphs?.idImage || apiKycData?.pfc?.frontDoc;
            const backIdImage = apiKycData?.pfc?.backDoc;

            // Bind PPHS documents (Hand holding, Face, Signature from pphs section)
            const handHoldingId = apiKycData?.pphs?.handHoldingIDPhoto;
            const faceImage = apiKycData?.pphs?.faceImage;
            const signatureImage = apiKycData?.pphs?.signImage;

            // Bind National ID data from 'nationalId' object
            const nationalIdFront = apiKycData?.nationalId?.frontDoc;
            const nationalIdBack = apiKycData?.nationalId?.backDoc;

            // Set state for all images
            setPassortImage(frontIdImage);
            setPassportBackImage(backIdImage);
            setIdPhoto(handHoldingId);
            setSelfie(faceImage);
            setSignImage(signatureImage);
            setNationalIdFrontImage(nationalIdFront);
            setNationalIdBackImage(nationalIdBack);

            // Set state for file names by extracting from URLs
            setFileNames(prevState => ({
                ...prevState,
                nationalIdFrontFileName: nationalIdFront?.split('/').pop() ?? '',
                nationalIdBackFileName: nationalIdBack?.split('/').pop() ?? '',
                frontIdFileName: frontIdImage?.split('/').pop() ?? '',
                backIdFileName: backIdImage?.split('/').pop() ?? '',
                handleHoldingImgFilename: handHoldingId?.split('/').pop() ?? '',
                selfieFileName: faceImage?.split('/').pop() ?? '',
                signFileName: signatureImage?.split('/').pop() ?? '',
            }));

            // Convert API date strings to Date objects using shared utility            
            // Set form initial values with API data
            setInitValues({
                passportId: '',
                nationalId: '',
                idNumber: apiKycData?.pfc?.docId || '',
                docExpiryDate: convertToDate(apiKycData?.pfc?.docExpiryDate),
                nationalIdNumber: apiKycData?.nationalId?.docId || '',
                nationalIdDocExpiryDate: convertToDate(apiKycData?.nationalId?.docExpiryDate)
            });
        }
        setLoadingData(false);
    };

    const acceptedExtensions = ['.jpg', '.jpeg', '.png'];
    const verifyFileTypes = (fileList: string) => {
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
    const clearImageState = (imageType: ImageType) => {
        switch (imageType) {
            case 'nationalIdFront': setNationalIdFrontImage(""); break;
            case 'nationalIdBack': setNationalIdBackImage(""); break;
            case 'passportFront': setPassortImage(""); break;
            case 'passportBack': setPassportBackImage(""); break;
            case 'passportHandHolding': setIdPhoto(""); break;
            case 'passportSelfie': setSelfie(""); break;
            case 'passportSignature': setSignImage(""); break;
        }
        setImageErrors(prev => ({ ...prev, [imageType]: "" }));
        setUploading(prev => ({ ...prev, [imageType]: true }));
    };

    const setImageState = (imageType: ImageType, uploadedImage: string) => {
        switch (imageType) {
            case 'nationalIdFront': setNationalIdFrontImage(uploadedImage); break;
            case 'nationalIdBack': setNationalIdBackImage(uploadedImage); break;
            case 'passportFront': setPassortImage(uploadedImage); break;
            case 'passportBack': setPassportBackImage(uploadedImage); break;
            case 'passportHandHolding': setIdPhoto(uploadedImage); break;
            case 'passportSelfie': setSelfie(uploadedImage); break;
            case 'passportSignature': setSignImage(uploadedImage); break;
        }
    };

    const validateAndUploadImage = async (selectedImage: ImageAsset, imageType: ImageType) => {
        const { uri, type, fileSize } = selectedImage;

        // Check file size (15MB limit)
        const fileSizeMB = fileSize ? fileSize / (1024 * 1024) : 0;
        if (fileSizeMB > 15) {
            setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            return false;
        }

        if (!verifyFileSize(fileSize || 0)) {
            setErrormsg(KYC_PROFILE_PRIVEW_CONSTANTS.FILE_SIZE_SHOULD_15MB);
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            return false;
        }

        const fileName = selectedImage.fileName ?? uri.split('/').pop() ?? `image_${Date.now()}.jpg`;
        const fileExtension = getFileExtension(selectedImage.uri || uri);

        if (!verifyFileTypes(fileName)) {
            setErrormsg("Accepts only jpg, png, and jpeg format");
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            return false;
        }

        setFileNames(prevState => ({ ...prevState, [fileNameKeyMap[imageType]]: fileName }));

        const formData = new FormData();
        formData.append("document", { uri: uri, type: `${type}/${fileExtension}`, name: fileName } as any);
        const uploadRes = await ProfileService.uploadFile(formData) as UploadApiResponse;

        if (uploadRes.status === 200) {
            const uploadedImage: string = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
            setImageState(imageType, uploadedImage);
            setErrormsg("");
            return true;
        } else {
            setErrormsg(isErrorDispaly(uploadRes));
            ref?.current?.scrollTo?.({ y: 0, animated: true });
            return false;
        }
    };

    const handleImageUpload = async (imageType: ImageType, pickerOption?: 'camera' | 'library' | 'documents') => {
        clearImageState(imageType);

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
                    requestAnimationFrame(() => {
                        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                // Validate file type
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

                if (!isPdf && !isImage) {
                    setErrormsg(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                    requestAnimationFrame(() => {
                        ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                setFileNames(prevState => ({ ...prevState, [fileNameKeyMap[imageType]]: fileName }));

                const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
                const type = isPdf ? 'application' : 'image';

                const formData = new FormData();
                formData.append("document", { uri: uri, type: `${type}/${fileExtension}`, name: fileName } as any);
                const uploadRes = await ProfileService.uploadFile(formData) as UploadApiResponse;

                if (uploadRes.status === 200) {
                    const uploadedImage: string = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                    setImageState(imageType, uploadedImage);
                    setErrormsg("");
                } else {
                    setErrormsg(isErrorDispaly(uploadRes));
                    ref?.current?.scrollTo?.({ y: 0, animated: true });
                }
                return;
            }
            // Handle camera or library permission (Custom popup only)
            const isCamera = pickerOption === "camera";

            // 1) Check current permission first (NO system popup)
            const currentPerm = isCamera
                ? await ImagePicker.getCameraPermissionsAsync()
                : await ImagePicker.getMediaLibraryPermissionsAsync();

            // ❌ Permanently denied → show custom permission popup
            if (currentPerm.status === "denied" && currentPerm.canAskAgain === false) {
                setTimeout(() => {
                    setPermissionModel(true);
                    return;
                }, 300);
                return;
            }

            // 2) Ask system permission only if allowed
            if (currentPerm.status !== "granted") {
                const reqPerm = isCamera
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

                // User denied now → silently return (NO popup)
                if (!reqPerm.granted) return;

                // Edge case: denied + can't ask again
                if (reqPerm.status === "denied" && reqPerm.canAskAgain === false) {
                    setTimeout(() => {
                        setPermissionModel(true);
                        return;
                    }, 300);
                    return;
                }
            }

            const result = pickerOption === 'camera'
                ? await ImagePicker.launchCameraAsync({
                    allowsEditing: false,
                    aspect: [1, 1],
                    quality: 0.5,
                    cameraType: ImagePicker.CameraType.front,
                })
                : await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: 'images',
                    allowsEditing: false,
                    aspect: [1, 1],
                    quality: 0.5
                });

            if (!result.canceled && result.assets) {
                const selectedImage = result.assets[0] as ImageAsset;

                // Check file size (15MB limit) before upload
                const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
                if (fileSizeMB > 15) {
                    setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    ref?.current?.scrollTo?.({ y: 0, animated: true });
                    return;
                }

                await validateAndUploadImage(selectedImage, imageType);
            }
        } catch (err) {
            setErrormsg(isErrorDispaly(err));
            ref?.current?.scrollTo?.({ y: 0, animated: true });
        } finally {
            setUploading(prev => ({ ...prev, [imageType]: false }));
        }
    };

    const getImageFieldsConfig = useCallback((): ImageFieldConfig[] => {
        const requirements = getRequirements();
        const fields: ImageFieldConfig[] = [];

        // PFC: Front ID Photo only (Passport section)
        if (requirements.showPFC) {
            fields.push(
                { type: 'passportFront', value: passortImage, errorMessageKey: "GLOBAL_CONSTANTS.IS_REQUIRED" }
            );
        }

        // PPHS: Hand Holding ID, Face Photo, Signature (Document section)
        if (requirements.showPPHS) {
            fields.push(
                { type: 'passportHandHolding', value: idPhoto, errorMessageKey: "GLOBAL_CONSTANTS.IS_REQUIRED" },
                { type: 'passportSelfie', value: selfie, errorMessageKey: "GLOBAL_CONSTANTS.IS_REQUIRED" },
                { type: 'passportSignature', value: signImage, errorMessageKey: "GLOBAL_CONSTANTS.IS_REQUIRED" }
            );
        }

        // NI: National ID fields
        if (requirements.showNationalId) {
            fields.push(
                { type: 'nationalIdFront', value: nationalIdFrontImage, errorMessageKey: "GLOBAL_CONSTANTS.IS_REQUIRED" },
                { type: 'nationalIdBack', value: nationalIdBackImage, errorMessageKey: "GLOBAL_CONSTANTS.IS_REQUIRED" }
            );
        }

        return fields;
    }, [passortImage, idPhoto, selfie, signImage, nationalIdFrontImage, nationalIdBackImage, kycDetails]);

    const getValidationSchema = () => {
        const requirements = getRequirements();
        return getBankKycDocumentsSchema(requirements);
    };
    const validateImages = () => {
        let currentImageErrorsUpdates: Partial<Record<ImageType, string>> = {};
        let hasValidationErrors = false;
        const fieldsToValidate = getImageFieldsConfig();

        for (const field of fieldsToValidate) {
            if (!field.value) {
                currentImageErrorsUpdates[field.type] = field.errorMessageKey;
                hasValidationErrors = true;
            } else {
                currentImageErrorsUpdates[field.type] = "";
            }
        }

        setImageErrors(prev => ({ ...prev, ...currentImageErrorsUpdates }));
        return hasValidationErrors;
    };
    const verifyFileSize = (fileSize: number | undefined) => {
        const maxSizeInBytes = 15 * 1024 * 1024;
        return (fileSize || 0) <= maxSizeInBytes;
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
                setErrormsg(KYC_PROFILE_PRIVEW_CONSTANTS.FILE_SIZE_SHOULD_15MB);
                ref?.current?.scrollTo?.({ y: 0, animated: true });
                setUploading(prev => ({ ...prev, passportSignature: false }));
                return;
            }
            setFileNames(prevState => ({ ...prevState, signFileName: fileName }));
            const formData = new FormData();
            formData.append("document", { uri: filePath, type: 'image/png', name: fileName } as any);
            const uploadRes = await ProfileService.uploadFile(formData) as UploadApiResponse;
            if (uploadRes.status === 200) {
                const uploadedImage: string = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                setSignImage(uploadedImage);
            } else {
                setErrormsg(isErrorDispaly(uploadRes));
                ref?.current?.scrollTo?.({ y: 0, animated: true });
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setErrormsg(isErrorDispaly(errorMessage));
            ref?.current?.scrollTo?.({ y: 0, animated: true });
        } finally {
            setUploading(prev => ({ ...prev, passportSignature: false }));
        }
    };

    const handleBack = useCallback(() => {
        props?.navigation?.goBack();
    }, [navigation]);

    const closePermissionModel = () => {
        setPermissionModel(false);
    };

    const formatExpiryDate = (date: any): string => {
        if (!date) return '';
        return typeof date === 'string' ? date : date.toString();
    };

    const handleSave = async (values: any) => {
        setBtnLoading(true);
        setErrormsg('');

        try {
            const passportExpiryDate = formatExpiryDate(values.docExpiryDate);
            const nationalIdExpiryDate = formatExpiryDate(values.nationalIdDocExpiryDate);

            const object = [
                {
                    selfieImage: selfie,
                    frontImage: passortImage,
                    backDocImage: null,
                    handHoldingImage: idPhoto,
                    singatureImage: signImage,
                    documentType: "Passport",
                    documentNumber: values.idNumber || '',
                    documentExpiryDate: passportExpiryDate,
                },
                {
                    frontImage: nationalIdFrontImage,
                    backDocImage: nationalIdBackImage,
                    documentType: "National ID",
                    documentNumber: values.nationalIdNumber || '',
                    documentExpiryDate: nationalIdExpiryDate,
                },
            ];
            dispatch({ type: 'SET_IDENTITY_DOCUMENTS', payload: object });
            navigation.navigate(props?.route?.params?.route?.name || 'BankKycProfilePreview', { animation: 'slide_from_left' });
        } finally {
            setBtnLoading(false);
        }
    };
    const deleteImageByType = (imageType: ImageType) => {
        switch (imageType) {
            case 'nationalIdFront': setNationalIdFrontImage(""); break;
            case 'nationalIdBack': setNationalIdBackImage(""); break;
            case 'passportFront': setPassortImage(""); break;
            case 'passportBack': setPassportBackImage(""); break;
            case 'passportHandHolding': setIdPhoto(""); break;
            case 'passportSelfie': setSelfie(""); break;
            case 'passportSignature': setSignImage(""); break;
        }
        setImageErrors(prev => ({ ...prev, [imageType]: "" }));
    };
    const handleError = useCallback(() => {
        setErrormsg('');
    }, []);

    const hasAnyDocuments = () => {
        const requirements = getRequirements();

        // Check PFC documents
        if (requirements.showPFC && passortImage) {
            return true;
        }

        // Check PPHS documents
        if (requirements.showPPHS && (idPhoto || selfie || signImage)) {
            return true;
        }

        // Check National ID documents
        if (requirements.showNationalId && (nationalIdFrontImage || nationalIdBackImage)) {
            return true;
        }

        return false;
    };
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
                        <PageHeader title={hasAnyDocuments() ? "GLOBAL_CONSTANTS.EDIT_DOCUMENTS" : "GLOBAL_CONSTANTS.ADD_DOCUMENTS"} onBackPress={handleBack} />
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

                            {errormsg !== "" && <ErrorComponent message={errormsg} onClose={handleError} />}
                            {!loadingData && <Formik
                                initialValues={initValues}
                                onSubmit={handleSave}
                                validationSchema={getValidationSchema()}
                                enableReinitialize
                                onInvalidSubmit={() => {
                                    ref?.current?.scrollTo?.({ y: 0, animated: true });
                                    setErrormsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
                                }}
                            >
                                {(formik) => {
                                    const { handleSubmit } = formik;
                                    const requirements = getRequirements();
                                    return (
                                        <>
                                            {(requirements.showPFC || requirements.showPPHS) && (
                                                <>
                                                    <ParagraphComponent text="GLOBAL_CONSTANTS.PASSPORT" style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                                                    {/* Document Number and Expiry Date for both PFC and PPHS */}
                                                    <Field
                                                        activeOpacity={0.9}
                                                        touched={formik.touched.idNumber}
                                                        name="idNumber"
                                                        label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                                                        error={formik.errors.idNumber}
                                                        handleBlur={formik.handleBlur}
                                                        onHandleChange={(text: any) => {
                                                            formik.handleChange('idNumber')(text.toUpperCase());
                                                        }}
                                                        placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"}
                                                        component={InputDefault}
                                                        alphanumericOnly={true}
                                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                                    />
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <DatePickerComponent
                                                        minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                                        name='docExpiryDate'
                                                        label={"GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE_FUTURE"}
                                                        required={true}
                                                    />
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    {requirements.showPFC && (
                                                        <>
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
                                                                subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                            />
                                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                                        </>
                                                    )}
                                                    {requirements.showPPHS && (
                                                        <>
                                                            <FileUpload
                                                                fileLoader={uploading.passportHandHolding}
                                                                onSelectImage={(source) => handleImageUpload('passportHandHolding', source)}
                                                                uploadedImageUri={idPhoto}
                                                                fileName={fileNames?.handleHoldingImgFilename}
                                                                errorMessage={imageErrors.passportHandHolding}
                                                                deleteImage={() => deleteImageByType('passportHandHolding')}
                                                                label="GLOBAL_CONSTANTS.HAND_HOLDING_ID"
                                                                isRequired={true}
                                                                showImageSourceSelector={true}
                                                                subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                            />
                                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                                            <FileUpload
                                                                fileLoader={uploading.passportSelfie}
                                                                onSelectImage={(source) => handleImageUpload('passportSelfie', source)}
                                                                uploadedImageUri={selfie}
                                                                fileName={fileNames?.selfieFileName}
                                                                errorMessage={imageErrors.passportSelfie}
                                                                deleteImage={() => deleteImageByType('passportSelfie')}
                                                                label="GLOBAL_CONSTANTS.FACE_PHOTO"
                                                                isRequired={true}
                                                                showImageSourceSelector={true}
                                                                subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                            />
                                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                                            <FileUpload
                                                                fileLoader={uploading.passportSignature}
                                                                onSelectImage={() => setIsSignatureProcessVisible(true)}
                                                                uploadedImageUri={signImage}
                                                                errorMessage={imageErrors.passportSignature}
                                                                fileName={fileNames?.signFileName}
                                                                deleteImage={() => deleteImageByType('passportSignature')}
                                                                label="GLOBAL_CONSTANTS.SIGNATURE"
                                                                isRequired={true}
                                                                subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                            />
                                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                                        </>
                                                    )}
                                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                                </>
                                            )}

                                            {requirements.showNationalId && (
                                                <>
                                                    <ParagraphComponent text="GLOBAL_CONSTANTS.NATIONAL_ID" style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} />
                                                    <Field
                                                        activeOpacity={0.9}
                                                        touched={formik.touched.nationalIdNumber}
                                                        name="nationalIdNumber"
                                                        label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                                                        error={formik.errors.nationalIdNumber}
                                                        handleBlur={formik.handleBlur}
                                                        onHandleChange={(text: any) => {
                                                            formik.handleChange('nationalIdNumber')(text.toUpperCase());
                                                        }}
                                                        placeholder={"GLOBAL_CONSTANTS.ENTER_DOCUMENT_NUMBER"}
                                                        component={InputDefault}
                                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                                    />
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <DatePickerComponent
                                                        minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                                        name='nationalIdDocExpiryDate'
                                                        label={"GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE_FUTURE"}
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
                                                        subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                    />
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <FileUpload
                                                        fileLoader={uploading.nationalIdBack}
                                                        onSelectImage={(source) => handleImageUpload('nationalIdBack', source)}
                                                        fileName={fileNames?.nationalIdBackFileName}
                                                        uploadedImageUri={nationalIdBackImage}
                                                        errorMessage={imageErrors.nationalIdBack}
                                                        deleteImage={() => deleteImageByType('nationalIdBack')}
                                                        label="GLOBAL_CONSTANTS.BACK_ID_PHOTO"
                                                        isRequired={true}
                                                        showImageSourceSelector={true}
                                                        subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                    />
                                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                                </>
                                            )}

                                            <ViewComponent style={[commonStyles.justify, commonStyles.flex1]}>
                                                <ButtonComponent
                                                    title="GLOBAL_CONSTANTS.CONTINUE"
                                                    loading={btnLoading}
                                                    disable={btnLoading}
                                                    onPress={async () => {
                                                        if (btnLoading) return;

                                                        // Set all fields as touched first to show validation errors
                                                        formik.setTouched({
                                                            idNumber: true,
                                                            docExpiryDate: true,
                                                            nationalIdNumber: true,
                                                            nationalIdDocExpiryDate: true
                                                        });

                                                        // Validate form fields
                                                        const formErrors = await formik.validateForm();
                                                        const hasFormErrors = Object.keys(formErrors).length > 0;

                                                        // Validate images
                                                        const hasImageErrors = validateImages();

                                                        if (hasFormErrors || hasImageErrors) {
                                                            ref?.current?.scrollTo?.({ y: 0, animated: true });
                                                            setErrormsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
                                                            return; // Stop execution if there are errors
                                                        }

                                                        handleSubmit();
                                                    }}
                                                />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.justify, commonStyles.buttongap, commonStyles.flex1]}>
                                                <ButtonComponent title={"GLOBAL_CONSTANTS.BACK"} onPress={handleBack} solidBackground={true} />
                                            </ViewComponent>
                                            <ViewComponent style={commonStyles.mb32} />
                                        </>
                                    );
                                }}
                            </Formik>}
                        </>
                    </Container>}</ScrollViewComponent></KeyboardAvoidingView>
            <PermissionModel permissionDeniedContent={"GLOBAL_CONSTANTS.CASES_REPLAY_PERISSION_MESSAGE"} closeModel={closePermissionModel} addModelVisible={permissionModel} />

        </ViewComponent>
    );
}
export default BankKycProfileStep2;
