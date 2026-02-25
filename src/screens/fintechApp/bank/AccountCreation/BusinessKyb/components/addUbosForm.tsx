import { BackHandler, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Field, Formik } from "formik";
import { useIsFocused } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import InputDefault from "../../../../../../components/textInputComponents/DefaultFiat";
import { setUboFormData } from "../../../../../../redux/actions/actions";
import ParagraphComponent from "../../../../../../components/textComponets/paragraphText/paragraph";
import { ADD_UBOS_DETAILS_CONSTANTS, FORM_FIELD, getFileExtension, KYB_INFO_CONSTANTS, verifyFileTypes } from "./constants";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ApiResponse, ReduxState } from "../../../interface";
import { Beneficiary, Country, CountryCode, DocumentType, FileNamesState, FormValues, ImageLoaderState, UboDirectorItem } from "../types/interface";
import useEncryptDecrypt from "../../../../../../hooks/encDecHook";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { BankKybService, BankCommonService } from "../../../../../../apiServices/bank";
import { formatDateTimeAPI, isErrorDispaly, formatDateTimeDatePicker } from "../../../../../../utils/helpers";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import ErrorComponent from "../../../../../../components/errorDisplay/errorDisplay";
import { KybAddUobsSchema } from "../schemas/schema";
import ViewComponent from "../../../../../../components/view/view";
import CustomPicker from "../../../../../../components/customPicker/CustomPicker";
import LabelComponent from "../../../../../../components/textComponets/lableComponent/lable";
import ButtonComponent from "../../../../../../components/buttons/button";
import FileUpload from "../../../../../../components/fileUpload/fileUpload";
import DatePickerComponent from "../../../../../../components/datePickers/formik/datePicker";
import Container from "../../../../../../components/container/container";
import ScrollViewComponent from "../../../../../../components/scrollView/scrollView";
import { s } from "../../../../../../components/theme/scale";
import DashboardLoader from "../../../../../../components/loader";
import PhoneCodePicker from "../../../../../../components/phonePicker/phonePicker";
import { useLngTranslation } from "../../../../../../hooks/languagesHook/useLngTranslation";
import useCountryData from "../../../../../../hooks/countryDataHook/useCountryData";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import ProfileService from "../../../../../../apiServices/profile";

const BankKybAddUbosDetailsForm = (props: any) => {
    const scrollRef = useRef<any>(null);
    const uboFormDataList = useSelector((state: ReduxState) => state.userReducer?.uboFormDataList || []);
    const directorFormDataList = useSelector((state: ReduxState) => state.userReducer?.directorFormDataList || []);
    const selectedBank = useSelector((state: ReduxState) => state.userReducer?.selectedBank);



    // Check if this is director mode
    const isDirectorMode = props?.route?.params?.addDirector || props?.route?.params?.isDirector || props?.route?.params?.editDirector;
    const dispatch = useDispatch();
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const isFocused = useIsFocused();
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const { countryPickerData, phoneCodePickerData, loading: countryLoading, error: countryError, clearCache } = useCountryData({
        loadCountries: true,
        loadPhoneCodes: true,
    });
    const [imagesLoader, setImagesLoader] = useState<ImageLoaderState>({ frontId: false, backImgId: false });
    const [fileNames, setFileNames] = useState<FileNamesState>({ frontId: null, backImgId: null });
    const [documentTypesLookUp, setDocumentTypesLookUp] = useState<DocumentType[]>([]);
    const [beneficiariesList, setBeneficiariesList] = useState<Beneficiary[]>([]);
    const [persionalDetails, setPersionalDetails] = useState<any>({});
    const deletedApiItems = useSelector((state: ReduxState) => state.userReducer?.deletedApiItems || []);
    const { t } = useLngTranslation();
    const { decryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const uuidv4 = () => {
        return ADD_UBOS_DETAILS_CONSTANTS.GUID_FORMATE.replace(/x/g, function () {
            const randumnumberval = Math.random() * 16 | 0;
            return randumnumberval.toString(16);
        });
    };
    const [initValues, setInitValues] = useState<FormValues>({
        firstName: "",
        lastName: "",
        middleName: '',
        uboPosition: isDirectorMode ? "Director" : "Ubo",
        dob: '',
        country: '',
        shareHolderPercentage: "",
        phoneCode: '',
        phoneNumber: "",
        note: "",
        frontId: '',
        backImgId: '',
        docType: '',
        docDetailsid: '',
        beneficiaryId: '',
        beneficiaryName: '',
        email: '',
        idIssuedCountry: '',
        docNumber: '',
        docExpiryDate: ''
    });

    useEffect(() => {
        fetchLookUps();
        fetchBeneficiaries(initValues.uboPosition);
        if (props?.route?.params?.id || props?.route?.params?.editUbo || props?.route?.params?.editDirector) {
            getPersionalDetails();
        } else if (props?.route?.params?.clearForm) {
            // Reset form when adding new director/UBO
            setInitValues({
                firstName: "",
                lastName: "",
                middleName: '',
                uboPosition: isDirectorMode ? "Director" : "Ubo",
                dob: '',
                country: '',
                shareHolderPercentage: "",
                phoneCode: '',
                phoneNumber: "",
                note: "",
                frontId: '',
                backImgId: '',
                docType: '',
                docDetailsid: '',
                beneficiaryId: '',
                beneficiaryName: '',
                email: '',
                idIssuedCountry: '',
                docNumber: '',
                docExpiryDate: ''
            });
        }
    }, [isFocused, props?.route?.params?.id, props?.route?.params?.clearForm, props?.route?.params?.editUbo, props?.route?.params?.editDirector]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleGoBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);


    const fetchLookUps = async () => {
        setErrormsg(null);
        try {
            const response = await BankCommonService.getLookupData() as ApiResponse<{
                KycDocumentTypes: DocumentType[];
                PhoneCodes: CountryCode[];
                countryWithTowns: Country[];
            }>
            if (response?.ok && response?.data) {
                setDocumentTypesLookUp(response.data.KycDocumentTypes || []);
                setErrormsg(null);
            } else {
                requestAnimationFrame(() => {
                    scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
                });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            requestAnimationFrame(() => {
                scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
            });
            setErrormsg(isErrorDispaly(error));
        }
    };

    const fetchBeneficiaries = async (type: string = 'Ubo') => {
        try {
            const response = await BankKybService?.getbeneficiaryTypeDetails(type) as ApiResponse<Beneficiary[]>
            if (response?.ok && response?.data) {
                setBeneficiariesList(response.data);
            } else {
                setBeneficiariesList([]);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setBeneficiariesList([]);
        }
    };

    const getseletedBeneficiariesDetails = async (beneficiaryId: string) => {
        // Try to find by ID first, then by name as fallback
        let selectedBeneficiary = beneficiariesList.find(b => b.id === beneficiaryId);

        if (!selectedBeneficiary) {
            // Fallback: try to find by name (in case CustomPicker is still passing name)
            selectedBeneficiary = beneficiariesList.find(b => b.name === beneficiaryId);
        }

        if (!selectedBeneficiary?.id) {
            setErrormsg(t('GLOBAL_CONSTANTS.SELECTED_BENFICIARY_NOT_FOUND'));
            return;
        }
        setErrormsg('')
        setLoadingData(true);
        try {
            const res = await BankKybService.getSelectedUboDetails(selectedBeneficiary.id) as ApiResponse<any>;
            if (res?.ok) {
                const data = res?.data;
                // Handle backImgId conditionally for passport documents (both UBOs and Directors)
                const docType = data?.docDetails?.type || '';
                const uboPosition = data?.uboPosition || (isDirectorMode ? "Director" : "Ubo");
                const shouldHaveBackId = docType.toLowerCase() !== 'passport';
                setInitValues({
                    firstName: decryptAES(data?.firstName || ''),
                    lastName: decryptAES(data?.lastName || ''),
                    middleName: data?.middleName || '',
                    uboPosition: uboPosition,
                    dob: data?.dob || '',
                    country: data?.country || '',
                    shareHolderPercentage: data?.shareHolderPercentage?.toString() || '',
                    phoneCode: data?.phoneCode ? decryptAES(data.phoneCode) || '' : '',
                    phoneNumber: data?.phoneNumber ? decryptAES(data.phoneNumber) || '' : '',
                    note: data?.note || '',
                    frontId: data?.docDetails?.frontImage || '',
                    backImgId: shouldHaveBackId ? (data?.docDetails?.backImage || '') : '',
                    docType: docType,
                    docDetailsid: data?.docDetails?.id || '',
                    beneficiaryId: selectedBeneficiary.id || '',
                    beneficiaryName: selectedBeneficiary.name || '',
                    email: data?.email ? decryptAES(data.email) || '' : '',
                    idIssuedCountry: '',
                    docNumber: data?.docDetails?.number ? decryptAES(data.docDetails.number) || '' : '',
                    docExpiryDate: data?.docDetails?.expiryDate || ''
                });
                setFileNames({
                    frontId: data?.docDetails?.frontImage?.split('/').pop() || null,
                    backImgId: data?.docDetails?.backImage?.split('/').pop() || null
                });
                setLoadingData(false);
            }
            else {
                setErrormsg(isErrorDispaly(res));
                setLoadingData(false)
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setLoadingData(false)
        }
    };

    const processReduxData = (reduxData: UboDirectorItem) => {
        // Handle backImgId conditionally for passport documents (both UBOs and Directors)
        const docType = reduxData?.docType || '';
        const uboPosition = reduxData?.uboPosition || '';
        const shouldHaveBackId = docType.toLowerCase() !== 'passport';
        const initialValues = {
            firstName: reduxData?.firstName || '',
            lastName: reduxData?.lastName || '',
            middleName: reduxData?.middleName || '',
            uboPosition: uboPosition,
            dob: reduxData?.dob || '',
            country: reduxData?.country || '',
            shareHolderPercentage: reduxData?.shareHolderPercentage?.toString() ?? "",
            phoneCode: reduxData?.phoneCode || '',
            phoneNumber: reduxData?.phoneNumber || '',
            note: reduxData?.note || '',
            docType: docType,
            frontId: reduxData?.frontId || '',
            backImgId: shouldHaveBackId ? (reduxData?.backImgId || '') : '',
            docDetailsid: reduxData?.docDetailsid || '',
            beneficiaryId: reduxData?.beneficiaryId || '',
            beneficiaryName: reduxData?.beneficiaryName || '',
            email: reduxData?.email || '',
            // idIssuedCountry: reduxData?.idIssuedCountry || '',
            docNumber: reduxData?.docNumber || '',
            docExpiryDate: reduxData?.docExpiryDate || ''
        };

        setInitValues(initialValues);

        const fileNamesData = {
            frontId: reduxData?.frontId?.split('/').pop() ?? null,
            backImgId: reduxData?.backImgId?.split('/').pop() ?? null
        };
        setFileNames(fileNamesData);
    };

    const formatDateIfNeeded = (dateStr: string) => {
        if (!dateStr) return '';
        const isUSDateFormat = /^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr);
        return isUSDateFormat ? formatDateTimeDatePicker(dateStr) : dateStr;
    };

    const processApiData = (data: any) => {
        const formattedDob = formatDateIfNeeded(data?.dob);
        const formattedDocExpiryDate = formatDateIfNeeded(data?.docDetails?.expiryDate);

        try {
            const decryptedFirstName = data?.firstName ? decryptAES(data.firstName) || '' : '';
            const decryptedLastName = data?.lastName ? decryptAES(data.lastName) || '' : '';
            const decryptedEmail = data?.email ? decryptAES(data.email) || '' : '';
            const decryptedPhoneCode = data?.phoneCode ? decryptAES(data.phoneCode) || '' : '';
            const decryptedPhoneNumber = data?.phoneNumber ? decryptAES(data.phoneNumber) || '' : '';
            const decryptedDocNumber = data?.docDetails?.docNumber ? decryptAES(data.docDetails.docNumber) || '' : '';

            // Handle backImgId conditionally for passport documents (both UBOs and Directors)
            const docType = data?.docDetails?.type || '';
            const uboPosition = data?.uboPosition || (isDirectorMode ? "Director" : "Ubo");
            const shouldHaveBackId = docType.toLowerCase() !== 'passport';

            const initialValues = {
                firstName: decryptedFirstName,
                lastName: decryptedLastName,
                middleName: data?.middleName || '',
                uboPosition: uboPosition,
                dob: formattedDob,
                country: data?.country || '',
                shareHolderPercentage: data?.shareHolderPercentage?.toString() || '',
                phoneCode: decryptedPhoneCode,
                phoneNumber: decryptedPhoneNumber,
                note: data?.note || '',
                docType: docType,
                frontId: data?.docDetails?.frontImage || '',
                backImgId: shouldHaveBackId ? (data?.docDetails?.backImage || '') : '',
                docDetailsid: data?.docDetails?.id || '',
                beneficiaryId: data?.beneficiaryId || '',
                beneficiaryName: '',
                email: decryptedEmail,
                idIssuedCountry: '',
                docNumber: decryptedDocNumber,
                docExpiryDate: formattedDocExpiryDate
            };

            setInitValues(initialValues);
        } catch (error) {
            throw error;
        }
    };

    const getPersionalDetails = async () => {
        setErrormsg(null);
        setLoadingData(true);

        const dataList = isDirectorMode ? directorFormDataList : uboFormDataList;
        const reduxData = dataList.find((item: UboDirectorItem) => item?.id === props?.route?.params?.id);

        if (reduxData) {
            processReduxData(reduxData);
            setLoadingData(false);
            return;
        }
        // Check if we're editing an API item by ID match
        try {
            const res = await BankKybService.kybInfoDetails(selectedBank?.productId) as ApiResponse<any>;

            if (res?.ok && res?.data?.kyb) {
                setPersionalDetails(res.data);
                const apiUbo = res.data.kyb.ubo;
                const apiDirector = res.data.kyb.director;

                // Check if we're editing the API UBO
                if (!isDirectorMode && apiUbo?.id === props?.route?.params?.id) {
                    processApiData(apiUbo);
                    setLoadingData(false);
                    return;
                }

                // Check if we're editing the API Director
                if (isDirectorMode && apiDirector?.id === props?.route?.params?.id) {
                    processApiData(apiDirector);
                    setLoadingData(false);
                    return;
                }
            } else {
                setErrormsg(isErrorDispaly(res));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setLoadingData(false);
        }
    };

    const updateListData = (uboData: any, updatedUboList: any[], updatedDirectorList: any[]) => {
        const targetList = isDirectorMode ? updatedDirectorList : updatedUboList;
        const editId = props?.route?.params?.id;

        if (editId) {
            // Find existing item by ID
            const existingIndex = targetList.findIndex(item => item.id === editId);

            if (existingIndex !== -1) {
                // Update existing item
                targetList[existingIndex] = { ...targetList[existingIndex], ...uboData };
            } else {
                // If not found in target list, check if it's an API item being edited
                targetList.push(uboData);
            }
        } else {
            // Adding new item
            targetList.push(uboData);
        }
    };

    const createUboData = (values: FormValues) => {
        const editId = props?.route?.params?.id;
        const uboData = {
            ...values,
            id: editId || uuidv4(),
            dob: values?.dob ? formatDateTimeAPI(values.dob) : '',
            docExpiryDate: values?.docExpiryDate ? formatDateTimeAPI(values.docExpiryDate) : '',
            registrationNumber: editId ? (values as any)?.registrationNumber || uuidv4() : uuidv4(),
            uboPosition: isDirectorMode ? "Director" : "Ubo",
            shareHolderPercentage: parseFloat(values.shareHolderPercentage) || 0
        };

        return uboData;
    };

    const checkDuplicateUbo = async (values: FormValues): Promise<string | null> => {
        const currentId = props?.route?.params?.id;
        const allItems = [...uboFormDataList, ...directorFormDataList];

        let apiData = persionalDetails;
        if (!apiData?.kyb) {
            try {
                const res = await BankKybService.kybInfoDetails(selectedBank?.productId);
                if (res?.ok && res?.data) {
                    apiData = res.data;
                } else {
                    setErrormsg(isErrorDispaly(res));
                }
            } catch (error) {
                setErrormsg(isErrorDispaly(error));
            }
        }

        const beneficiaryId = values.beneficiaryId?.trim();
        if (beneficiaryId) {
            const beneficiaryDuplicateInRedux = allItems.find(item =>
                item.id !== currentId &&
                item.uboPosition?.toLowerCase() === values.uboPosition?.toLowerCase() &&
                item.beneficiaryId?.trim() === beneficiaryId
            );

            if (beneficiaryDuplicateInRedux && !currentId) {
                return isDirectorMode ? t('GLOBAL_CONSTANTS.DIRECTOR_ALREADY_EXISTS') : t('GLOBAL_CONSTANTS.UBO_ALREADY_EXISTS');
            }

            const apiUbo = apiData?.kyb?.ubo;
            const apiDirector = apiData?.kyb?.director;

            if (values.uboPosition?.toLowerCase() === 'ubo' && apiUbo && apiUbo.id !== currentId && !(deletedApiItems || []).includes(apiUbo.id)) {
                const apiBeneficiaryId = apiUbo.beneficiaryId?.trim();
                if (apiBeneficiaryId === beneficiaryId) {
                    return t('GLOBAL_CONSTANTS.UBO_ALREADY_EXISTS');
                }
            }

            if (values.uboPosition?.toLowerCase() === 'director' && apiDirector && apiDirector.id !== currentId && !(deletedApiItems || []).includes(apiDirector.id)) {
                const apiBeneficiaryId = apiDirector.beneficiaryId?.trim();
                if (apiBeneficiaryId === beneficiaryId) {
                    return t('GLOBAL_CONSTANTS.DIRECTOR_ALREADY_EXISTS');
                }
            }
        }

        const emailToCheck = values.email?.toLowerCase()?.trim();
        if (emailToCheck) {
            const emailDuplicateInRedux = allItems.find(item =>
                item.id !== currentId &&
                item.uboPosition?.toLowerCase() === values.uboPosition?.toLowerCase() &&
                item.email?.toLowerCase()?.trim() === emailToCheck
            );

            if (emailDuplicateInRedux && !currentId) {
                return isDirectorMode ? t('GLOBAL_CONSTANTS.DIRECTOR_ALREADY_EXISTS') : t('GLOBAL_CONSTANTS.UBO_ALREADY_EXISTS');
            }

            const apiUbo = apiData?.kyb?.ubo;
            const apiDirector = apiData?.kyb?.director;

            if (values.uboPosition?.toLowerCase() === 'ubo' && apiUbo && apiUbo.id !== currentId && !(deletedApiItems || []).includes(apiUbo.id)) {
                try {
                    const apiEmail = apiUbo.email ? decryptAES(apiUbo.email)?.toLowerCase()?.trim() : '';
                    if (apiEmail && apiEmail === emailToCheck) {
                        return t('GLOBAL_CONSTANTS.UBO_ALREADY_EXISTS');
                    }
                } catch (error) {
                    // Ignore decryption errors for comparison
                }
            }

            if (values.uboPosition?.toLowerCase() === 'director' && apiDirector && apiDirector.id !== currentId && !(deletedApiItems || []).includes(apiDirector.id)) {
                try {
                    const apiEmail = apiDirector.email ? decryptAES(apiDirector.email)?.toLowerCase()?.trim() : '';
                    if (apiEmail === emailToCheck) {
                        return t('GLOBAL_CONSTANTS.DIRECTOR_ALREADY_EXISTS');
                    }
                } catch (error) {
                    // Ignore decryption errors for comparison
                }
            }
        }

        return null;
    };

    const handleSave = async (values: FormValues, { validateForm }: any) => {
        setBtnLoading(true);

        const errors = await validateForm();
        if (Object.keys(errors).length > 0) {
            setBtnLoading(false);
            return;
        }

        const duplicateError = await checkDuplicateUbo(values);
        if (duplicateError) {
            setErrormsg(duplicateError);
            requestAnimationFrame(() => {
                scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
            });
            setBtnLoading(false);
            return;
        }

        setErrormsg("");

        try {
            const uboData = createUboData(values);
            const updatedUboList = [...uboFormDataList];
            const updatedDirectorList = [...directorFormDataList];

            updateListData(uboData, updatedUboList, updatedDirectorList);

            const combinedList = [...updatedUboList, ...updatedDirectorList];
            dispatch(setUboFormData(combinedList));

            const routeParams = props?.route?.params;
            if (routeParams?.route?.name) {
                props.navigation.navigate(routeParams.route.name, { animation: "slide_from_left", ...routeParams.route });
            }
            else {
                props.navigation.goBack();
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setBtnLoading(false);
        }
    };

    const handleGoBack = useCallback(() => {
        const routeParams = props?.route?.params;
        if (routeParams?.route?.name) {
            props.navigation.navigate(routeParams.route.name, { ...routeParams, animation: "slide_from_left" });
        } else {
            props.navigation.goBack();
        }
    }, [props.navigation, props.route.params]);

    const handleBack = useCallback(() => {
        props?.navigation?.goBack();
    }, [props?.navigation]);

    const handleValidationSave = (validateForm: () => Promise<any>, setTouched: (touched: any) => void, values: FormValues) => {
        validateForm().then(async (errors: any) => {
            if (Object.keys(errors).length > 0) {
                const touchedFields = Object.keys(values).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                }, {} as Record<string, boolean>);
                setTouched(touchedFields);
                requestAnimationFrame(() => {
                    scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
                });
                setErrormsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
            } else {
                setErrormsg('');
            }
        });
    };

    const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFeilds: (field: string, value: string) => void) => {
        setImagesLoader(prevState => ({ ...prevState, [item]: true }));
        const formData = new FormData();
        formData.append(KYB_INFO_CONSTANTS.DOCUMENT, {
            uri: uri,
            type: `${type}/${fileExtension}`,
            name: fileName,
        } as any);
        const uploadRes = await ProfileService.uploadFile(formData);
        if (uploadRes.status === 200) {
            const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
            setFeilds(item, uploadedImage);
            setErrormsg(null);
        } else {
            requestAnimationFrame(() => {
                scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
            });
            setErrormsg(isErrorDispaly(uploadRes));
        }
    };

    const handleUploadImg = async (
        item: string,
        setFeilds: (field: string, value: string) => void,
        pickerOption?: 'camera' | 'library' | 'documents'
    ) => {
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
                        scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                // Validate file type
                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

                if (!isPdf && !isImage) {
                    setErrormsg(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
                    requestAnimationFrame(() => {
                        scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
                    });
                    return;
                }

                setFileNames(prevState => ({ ...prevState, [item]: fileName }));

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
                setErrormsg(KYB_INFO_CONSTANTS.ACCEPT_IMG_MSG);
                requestAnimationFrame(() => {
                    scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
                });
                return;
            }
            // Check file size (15MB limit)
            const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                requestAnimationFrame(() => {
                    scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
                });
                return;
            }

            setFileNames(prevState => ({ ...prevState, [item]: fileName }));

            if (uri && type && fileExtension) {
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
            }
        } catch (err) {
            requestAnimationFrame(() => {
                scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
            });
            setErrormsg(isErrorDispaly(err));
        } finally {
            setImagesLoader(prevState => ({ ...prevState, [item]: false }));
        }
    };

    const deleteImage = (fileName: string, setFieldValue: (field: string, value: string) => void) => {
        setFieldValue(fileName, '');
    };

    const handleError = useCallback(() => {
        setErrormsg(null);
        if (countryError) {
            clearCache();
        }
    }, [countryError, clearCache]);
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>



            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={s(64)}
            >
                <ScrollViewComponent
                    ref={scrollRef}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {(loadingData || countryLoading) &&
                        <ViewComponent style={[commonStyles.flex1]}>
                            <DashboardLoader />
                        </ViewComponent>}
                    {!loadingData && !countryLoading && <Container style={commonStyles.container}>
                        {(() => {
                            let pageTitle;
                            if (props?.route?.params?.id || props?.route?.params?.editUbo || props?.route?.params?.editDirector) {
                                pageTitle = isDirectorMode ? "GLOBAL_CONSTANTS.EDIT_DIRECTOR" : "GLOBAL_CONSTANTS.EDIT_UBO";
                            } else {
                                pageTitle = isDirectorMode ? "GLOBAL_CONSTANTS.ADD_DIRECTOR" : "GLOBAL_CONSTANTS.ADD_UBO";
                            }
                            return <PageHeader title={pageTitle} onBackPress={handleBack} />;
                        })()}
                        {(errormsg || countryError) && <ErrorComponent message={errormsg || countryError || ''} onClose={handleError} />}
                        {!loadingData && <Formik
                            key={`${props?.route?.params?.id || 'new'}-${JSON.stringify(initValues)}`}
                            initialValues={initValues}
                            onSubmit={handleSave}
                            validationSchema={KybAddUobsSchema}
                            enableReinitialize={true}
                            validateOnChange={true}
                            validateOnBlur={true}
                        >
                            {(formik) => {
                                const {
                                    touched,
                                    handleSubmit,
                                    errors,
                                    handleBlur,
                                    values, setFieldValue,
                                    handleChange,
                                    validateForm
                                } = formik;
                                return (
                                    <>
                                        <Field
                                            activeOpacity={0.9}
                                            label={"GLOBAL_CONSTANTS.BENFICIARY"}
                                            touched={touched?.beneficiaryName}
                                            name={'beneficiaryName'}
                                            error={errors?.beneficiaryName}
                                            handleBlur={handleBlur}
                                            customContainerStyle={{ height: 80 }}
                                            data={beneficiariesList || []}
                                            placeholder={"GLOBAL_CONSTANTS.SELECT_BENEFICIARY"}
                                            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                            component={CustomPicker}
                                            onChange={(value: string) => {
                                                getseletedBeneficiariesDetails(value)
                                            }}
                                            modalTitle={"GLOBAL_CONSTANTS.SELECT_BENEFICIARY"}
                                            customBind={['name']}
                                            valueField={'name'}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched?.firstName}
                                            name={FORM_FIELD.FIRST_NAME}
                                            label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                                            error={errors?.firstName}
                                            handleBlur={handleBlur}
                                            customContainerStyle={{}}
                                            placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
                                            component={InputDefault}
                                            maxLength={FORM_FIELD.MAX_LENGTH.FIRST_NAME}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched?.middleName}
                                            name={FORM_FIELD.MIDLE_NAME}
                                            label={"GLOBAL_CONSTANTS.MIDLE_NAME"}
                                            error={errors?.middleName}
                                            handleBlur={handleBlur}
                                            maxLength={50}
                                            customContainerStyle={{}}
                                            placeholder={"GLOBAL_CONSTANTS.MIDLE_NAME_PLACEHOLDER"}
                                            component={InputDefault}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched?.lastName}
                                            name={FORM_FIELD.LAST_NAME}
                                            label={"GLOBAL_CONSTANTS.LAST_NAME"}
                                            error={errors?.lastName}
                                            handleBlur={handleBlur}
                                            customContainerStyle={{}}
                                            placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                                            component={InputDefault}
                                            maxLength={FORM_FIELD.MAX_LENGTH.LAST_NAME}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched?.email}
                                            name={'email'}
                                            label={"GLOBAL_CONSTANTS.EMAIL"}
                                            error={errors?.email}
                                            handleBlur={handleBlur}
                                            customContainerStyle={{}}
                                            placeholder={"GLOBAL_CONSTANTS.ENTER_EMAIL_ADDRESS"}
                                            component={InputDefault}
                                            keyboardType={'email-address'}
                                            maxLength={50}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <Field
                                            activeOpacity={0.9}
                                            touched={touched?.shareHolderPercentage}
                                            name={FORM_FIELD.SHARE_HOLDER_PERCENTAGE}
                                            label={"GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE"}
                                            error={errors?.shareHolderPercentage}
                                            handleBlur={handleBlur}
                                            maxLength={3}
                                            customContainerStyle={{ height: 80 }}
                                            placeholder={"GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE_PLACEHOLDER"}
                                            component={InputDefault}
                                            keyboardType={KYB_INFO_CONSTANTS.NUMURIC_KEYPAD}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <DatePickerComponent name={FORM_FIELD.DATE_OF_BIRTH} label={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} maximumDate={maxDate} />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <Field
                                            activeOpacity={0.9}
                                            label={"GLOBAL_CONSTANTS.COUNTRY"}
                                            touched={touched?.country}
                                            name={'country'}
                                            error={errors?.country}
                                            handleBlur={handleBlur}
                                            customContainerStyle={{ height: 80 }}
                                            data={countryPickerData || []}
                                            placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                            component={CustomPicker}
                                            modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                            customBind={['name']}
                                            valueField={'name'}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <LabelComponent style={[commonStyles.inputLabel]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"}>
                                            <ParagraphComponent style={[commonStyles.textRed]} text={FORM_FIELD.START_REQUIRED} />
                                        </LabelComponent>
                                        <ViewComponent style={[commonStyles.relative, commonStyles.dflex]}>
                                            <PhoneCodePicker
                                                inputStyle={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: ((touched?.phoneCode && errors?.phoneCode) || (touched?.phoneNumber && errors?.phoneNumber)) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }}
                                                modalTitle={"GLOBAL_CONSTANTS.SELECT_PHONE_CODE"}
                                                customBind={['name', '(', 'code', ')']}
                                                data={phoneCodePickerData || []}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT"}
                                                value={values.phoneCode}
                                                onChange={(item: any) => {
                                                    setFieldValue(FORM_FIELD.PHONE_CODE, item.code);
                                                }}
                                                isOnlycountry={true}
                                            />
                                            <ViewComponent style={[commonStyles.flex1, commonStyles.pr2]}>
                                                <TextInput style={[commonStyles.textInput, commonStyles.fs14, commonStyles.fw400, { borderBottomLeftRadius: 0, borderTopLeftRadius: 0, borderColor: ((touched?.phoneCode && errors?.phoneCode) || (touched?.phoneNumber && errors?.phoneNumber)) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }]}
                                                    placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                                                    onChangeText={(text) => {
                                                        const formattedText = text.replace(/\D/g, "").slice(0, 13);
                                                        handleChange(FORM_FIELD.PHONE_NUMBER)(formattedText);
                                                    }}
                                                    onBlur={handleBlur(FORM_FIELD.PHONE_NUMBER)}
                                                    value={values.phoneNumber}
                                                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                    keyboardType={FORM_FIELD.PHONE_PAD as 'phone-pad'}
                                                />
                                            </ViewComponent>
                                        </ViewComponent>
                                        {(touched.phoneCode && errors.phoneCode || touched.phoneNumber && errors.phoneNumber) && <ParagraphComponent style={[commonStyles.textRed]} text={errors.phoneCode || errors?.phoneNumber} />}
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched?.note}
                                            name={FORM_FIELD.NOTE}
                                            label={"GLOBAL_CONSTANTS.NOTE_LABLE"}
                                            error={errors?.note}
                                            handleBlur={handleBlur}
                                            customContainerStyle={{}}
                                            placeholder={"GLOBAL_CONSTANTS.NOTE_PLACEHOLDER"}
                                            component={InputDefault}
                                            maxLength={249}
                                        />
                                        <ViewComponent style={commonStyles.sectionGap} />
                                        <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.UPLOAD_THE_DOCUMENTS"} />
                                        <ViewComponent style={[commonStyles.titleSectionGap]} />
                                        <Field
                                            activeOpacity={0.9}
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
                                            onChange={(value: string) => {
                                                setFieldValue('docType', value);
                                                setFieldValue('docNumber', '');
                                                setFieldValue('docExpiryDate', '');
                                                setFieldValue('frontId', '');
                                                setFieldValue('backImgId', '');
                                                setFileNames({ frontId: null, backImgId: null });
                                            }}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />
                                        {/* 
                                        TODO: ID Issued Country field is temporarily commented out
                                        Reason: This field is not currently required by the API and causes validation issues
                                        The field may be re-enabled in future versions if business requirements change
                                        
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <Field
                                            activeOpacity={0.9}
                                            label={"ID Issued Country"}
                                            touched={touched?.idIssuedCountry}
                                            name={'idIssuedCountry'}
                                            error={errors?.idIssuedCountry}
                                            handleBlur={handleBlur}
                                            customContainerStyle={{ height: 80 }}
                                            data={countriesList || []}
                                            placeholder={"Select ID Issued Country"}
                                            placeholderTextColor={NEW_COLOR.TEXT_SECONDARY}
                                            component={CustomPicker}
                                            modalTitle={"Select ID Issued Country"}
                                            customBind={['name']}
                                            valueField={'name'}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        /> 
                                        */}
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <Field
                                            touched={touched?.docNumber}
                                            name={'docNumber'}
                                            label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                                            error={errors?.docNumber}
                                            handleBlur={handleBlur}
                                            customContainerStyle={{}}
                                            placeholder={"GLOBAL_CONSTANTS.DACUMENT_NUMBER_PLACEHOLDER"}
                                            component={InputDefault}
                                            maxLength={FORM_FIELD.MAX_LENGTH.DOCUMENT_NUMBER}
                                            requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />
                                        <DatePickerComponent
                                            name='docExpiryDate'
                                            minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                            label="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE_FUTURE"
                                            placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER"
                                            required={!['ID Card', 'National Id', 'Resident Card'].includes(values.docType)}
                                        />

                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        {/* 
                                        DEV COMMENT: FileUpload component refactored with built-in upload functionality
                                        - Added fieldName prop to specify which form field to update
                                        - Added setFieldValue and setErrorMessage props for automatic form integration
                                        - Added scrollRef prop for automatic error scrolling
                                        - Component now handles upload internally, eliminating need for complex handleUploadImg function
                                        - Maintains all existing functionality while reducing code duplication
                                        */}
                                        <FileUpload
                                            fileLoader={imagesLoader?.frontId}
                                            onSelectImage={(source) => {
                                                formik.setFieldTouched(FORM_FIELD.FRONT_ID, true);
                                                handleUploadImg(FORM_FIELD.FRONT_ID, setFieldValue, source);
                                            }}
                                            uploadedImageUri={values?.frontId}
                                            fileName={fileNames?.frontId as string}
                                            errorMessage={touched?.frontId ? errors?.frontId as string : ''}
                                            deleteImage={() => {
                                                formik.setFieldTouched(FORM_FIELD.FRONT_ID, true);
                                                deleteImage(FORM_FIELD.FRONT_ID, setFieldValue);
                                            }}
                                            label={"GLOBAL_CONSTANTS.FRONT_ID_PHOTO"}
                                            isRequired={true}
                                            showImageSourceSelector={true}
                                            subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                        />
                                        <ViewComponent style={commonStyles.formItemSpace} />   {/* Show back ID photo only when document type is not Passport (for both UBOs and Directors) */}
                                        {(values.docType && values.docType.toLowerCase() !== 'passport') && (
                                            <>
                                                <FileUpload
                                                    fileLoader={imagesLoader?.backImgId}
                                                    onSelectImage={(source) => {
                                                        formik.setFieldTouched(FORM_FIELD.BACK_IMG_ID, true);
                                                        handleUploadImg(FORM_FIELD.BACK_IMG_ID, setFieldValue, source);
                                                    }}
                                                    uploadedImageUri={values?.backImgId}
                                                    fileName={fileNames?.backImgId as string}
                                                    errorMessage={touched?.backImgId ? errors?.backImgId as string : ''}
                                                    deleteImage={() => {
                                                        formik.setFieldTouched(FORM_FIELD.BACK_IMG_ID, true);
                                                        deleteImage(FORM_FIELD.BACK_IMG_ID, setFieldValue);
                                                    }}
                                                    label={"GLOBAL_CONSTANTS.BACK_ID_PHOTO"}
                                                    isRequired={false}
                                                    showImageSourceSelector={true}
                                                    subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                />
                                                <ViewComponent style={commonStyles.formItemSpace} />
                                            </>
                                        )}
                                        <ViewComponent style={commonStyles.mb40} />
                                        <ViewComponent>
                                            <ButtonComponent
                                                title={"GLOBAL_CONSTANTS.OK"}
                                                loading={btnLoading}
                                                disable={btnLoading}
                                                onPress={() => {
                                                    handleValidationSave(validateForm, formik.setTouched, values);
                                                    handleSubmit();
                                                }}
                                            />
                                            <ViewComponent style={[commonStyles.buttongap]} />
                                            <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleBack} solidBackground={true} />
                                        </ViewComponent>
                                        <ViewComponent style={commonStyles.sectionGap} />

                                    </>
                                );
                            }}
                        </Formik>}
                    </Container>}
                </ScrollViewComponent>
            </KeyboardAvoidingView>
        </ViewComponent>
    );
};

export default BankKybAddUbosDetailsForm;
