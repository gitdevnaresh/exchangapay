import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { BackHandler, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Field, Formik } from "formik";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { formatYearMonthDate, formatDateTimeDatePicker, isErrorDispaly } from "../../../utils/helpers";
import Container from "../../../components/container/container";
import ErrorComponent from "../../../components/errorDisplay/errorDisplay";
import InputDefault from '../../../components/textInputComponents/DefaultFiat';
import CustomPicker from "../../../components/customPicker/CustomPicker";
import FileUpload from "../../../components/fileUpload/fileUpload";
import ButtonComponent from "../../../components/buttons/button";
import ViewComponent from "../../../components/view/view";
import ScrollViewComponent from "../../../components/scrollView/scrollView";
import PageHeader from "../../../components/pageHeader/pageHeader";
import DashboardLoader from "../../../components/loader";
import PhoneCodePicker from "../../../components/phonePicker/phonePicker";
import DatePickerComponent from "../../../components/datePickers/formik/datePicker";
import LabelComponent from "../../../components/textComponets/lableComponent/lable";
import RadioButton from "../../../components/radiobutton/RadioButton";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import ProfileService from "../../../apiServices/profile";
import BankKybService from "../../../apiServices/bank/bankKybService";
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { s } from "../../../constants/styels/scale";
import { getFileExtension, verifyFileTypes } from "../../fintechApp/onboarding/constants";
import { FORM_DATA_CONSTANTS, FORM_DATA_LABEL, FORM_DATA_PLACEHOLDER } from "../../fintechApp/cards/apply_card/constants";
import { FORM_FIELD } from "../../fintechApp/onboarding/kyb/constants";
import CardsModuleService from "../../../apiServices/cards";
import { FormValues, UboFormDetailsProps, FileNames, ImagesLoader, LookupData, CountryWithStates, KybRequirements, PersonalDetails, ReduxState, LookupItem } from "./interface";
import CreateAccountService from "../../../apiServices/bank/createAccount";
import { KybAddUobsSchema } from "./schema";
import { getKybRequirements, checkDuplicateUbo, getPersionalDetails as getPersonalDetailsFromService } from "../../fintechApp/cards/apply_card/apply_card_kyb/kybservice";
import { UBO_FORM_CONSTANTS, UBO_FORM_LABELS, UBO_FORM_PLACEHOLDERS, UBO_FORM_MESSAGES, UBO_FORM_FIELD_NAMES } from "./constants";
import useCountryData from "../../../hooks/countryDataHook/useCountryData";
import ParagraphComponent from "../../../components/textComponets/paragraphText/paragraph";
import { getThemedCommonStyles } from "../../../components/CommonStyles";


/**
 * UboFormDetails Component
 * 
 * This component handles the form for adding/editing UBO (Ultimate Beneficial Owner), 
 * Director, and Representative details in the KYB (Know Your Business) process.
 * 
 * Features:
 * - Dynamic form fields based on entity type (UBO/Director/Representative)
 * - Document upload functionality (front ID, back ID, selfie)
 * - Address information collection
 * - Form validation using Formik and Yup
 * - File upload with size and type validation
 * - Integration with Redux for state management
 * 
 * @param props - Component props including navigation params and form handlers
 */
const UboFormDetails: React.FC<UboFormDetailsProps> = ({
    onSave,
    onBack,
    title,
    validationSchema,
    productId,
    customFields,
    ...props
}) => {
    // Refs and hooks initialization
    const scrollRef = useRef<any>(null);
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const { t } = useLngTranslation();
    const { decryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    // Redux state and navigation
    const { uboCardFormData: uboFormDataList = [], directorCardFormData: directorFormDataList = [], representativeFormDataList = [], selectedBank, userDetails: userInfo, cardId, deletedCardsApiItems } = useSelector((state: ReduxState) => state.userReducer);
    const { isDirectorMode = false, isRepresentativeMode = false, editId } = props?.route?.params || {};
    const navigation = useNavigation();

    // Component state management
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [btnLoading, setBtnLoading] = useState(false);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [formDataBinding, setFormDataBinding] = useState<boolean>(false);
    const [imagesLoader, setImagesLoader] = useState<ImagesLoader>({ frontId: false, backImgId: false, selfi: false });
    const [fileNames, setFileNames] = useState<FileNames>({ frontId: null, backImgId: null, selfi: null });
    const [documentTypesLookUp, setDocumentTypesLookUp] = useState<LookupItem[]>([]);
    const [countries, setCountries] = useState<LookupItem[]>([]);
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const [statesList, setStatesList] = useState<LookupItem[]>([]);
    const [addressTypeList, setAddressTypeList] = useState<LookupItem[]>([]);
    const [kybRequirements, setKybRequirements] = useState<KybRequirements>({});
    const [persionalDetails, setPersionalDetails] = useState<PersonalDetails>({});

    // Use country data hook phoneCodePickerData
    const { countryPickerData, phoneCodePickerData, countriesWithStates, genderPickerData, loading: countryLoading, error: countryError, clearCache } = useCountryData({
        loadCountries: true,
        loadPhoneCodes: true,
        loadStates: true,
        autoLoad: true,
        loadGenders: true
    });




    // Form initial values - determines default form state
    const [initValues, setInitValues] = useState<FormValues>({
        firstName: "",
        lastName: "",
        middleName: '',
        uboPosition: isDirectorMode ? UBO_FORM_CONSTANTS.DIRECTOR : (isRepresentativeMode ? UBO_FORM_CONSTANTS.REPRESENTATIVE : UBO_FORM_CONSTANTS.UBO),
        dob: '',
        gender: '',
        country: '',
        shareHolderPercentage: "",
        phoneCode: '',
        phoneNumber: "",
        note: "",
        frontId: '',
        backImgId: '',
        docType: '',
        docDetailsid: '',
        email: '',
        docNumber: '',
        docIssueDate: '',
        docExpiryDate: '',
        selfi: "",
        addressCountry: "",
        state: "",
        city: "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        addressType: ""
    });



    // Effect hooks for component lifecycle management
    useEffect(() => {
        if (isFocused) {
            fetchLookUps();
            fetchCounriesLookup();
            getAddressTypes();
            // fetchPhoneCodes();

            // Fetch personal details from API - use cardId from Redux
            const finalCardId = cardId || props?.route?.params?.cardId;
            getPersonalDetailsFromService(selectedBank, setPersionalDetails, setErrormsg, setLoadingData, finalCardId);
        }
    }, [isFocused, cardId]);

    // Separate effect for handling edit mode after persionalDetails is loaded
    useEffect(() => {
        if (editId && persionalDetails && Object.keys(persionalDetails).length > 0) {
            setFormDataBinding(true);
            getPersionalDetails();
        } else if (editId) {
            setFormDataBinding(true);
        }
    }, [editId, persionalDetails]);

    // Set KYB requirements when persionalDetails is available
    useEffect(() => {
        if (persionalDetails?.kyb?.kycRequirements) {
            setKybRequirements(getKybRequirements(persionalDetails.kyb.kycRequirements));
        }
    }, [persionalDetails]);


    // Update states list when addressCountry changes
    useEffect(() => {
        if (initValues.addressCountry && countriesWithStates.length > 0) {
            const selectedCountryForStates = countriesWithStates.find((country: CountryWithStates) => country?.name === initValues.addressCountry);
            if (selectedCountryForStates && selectedCountryForStates.details && selectedCountryForStates.details.length > 0) {
                setStatesList(selectedCountryForStates.details);
            } else {
                setStatesList([]);
            }
        }
    }, [initValues.addressCountry, countriesWithStates]);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);

    // API service functions
    /**
     * Fetches address types from the API based on user account type
     */
    const getAddressTypes = async () => {
        try {
            const response = await CreateAccountService?.getAllAdressTypes();
            if (response?.ok && response?.data) {
                const data = response?.data as any;
                const addressTypes = userInfo?.accountType?.toLowerCase() === UBO_FORM_CONSTANTS.BUSINESS ? data?.KYB || [] : data?.KYC || [];
                setAddressTypeList(addressTypes);
            } else {
                const error = isErrorDispaly(response);
                setErrormsg(error);
            }
        } catch (error) {
            const errorMsg = isErrorDispaly(error);
            setErrormsg(errorMsg);
        }
    };

    /**
     * Fetches lookup data including document types
     */
    const fetchLookUps = async () => {
        setErrormsg(null);
        try {
            const response = await BankKybService.getLookupData();
            if (response?.ok && response?.data) {
                const data = response.data as LookupData;
                setDocumentTypesLookUp(data.KycDocumentTypes || []);
                setErrormsg(null);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };

    const fetchCounriesLookup = async () => {
        try {
            const response = await CardsModuleService.getCardCountries();
            if (response?.status == 200) {
                setCountries((response?.data as LookupItem[]) || []);
                setErrormsg('');
            }
            else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }

    };

    const getPersionalDetails = async () => {
        setErrormsg(null);

        // First check Redux data
        const dataList = isDirectorMode ? directorFormDataList : (isRepresentativeMode ? representativeFormDataList : uboFormDataList);
        const reduxData = dataList.find((item: FormValues & { id: string }) => item?.id === editId);

        if (reduxData) {
            setInitValues(reduxData);
            setFileNames({
                frontId: reduxData?.frontId?.split('/').pop() ?? null,
                backImgId: reduxData?.backImgId?.split('/').pop() ?? null,
                selfi: reduxData?.selfi?.split('/').pop() ?? null
            });
            setFormDataBinding(false);
            return;
        }

        // If not in Redux, check API data using the same service as the main screen
        if (persionalDetails && Object.keys(persionalDetails).length > 0) {
            let targetData = null;
            let apiDataArray = [];

            if (isDirectorMode) {
                apiDataArray = persionalDetails?.kyb?.directors || [];
            } else if (isRepresentativeMode) {
                apiDataArray = persionalDetails?.kyb?.representatives || [];
            } else {
                apiDataArray = persionalDetails?.kyb?.ubos || [];
            }

            targetData = apiDataArray.find((item: any) => item.id === editId);

            if (targetData) {
                const formattedDob = targetData?.personDetails?.dateOfBirth ? formatDateTimeDatePicker(targetData.personDetails.dateOfBirth) : '';
                const formattedDocExpiryDate = targetData?.identification?.docExpireDate ? formatDateTimeDatePicker(targetData.identification.docExpireDate) : '';
                const formattedDocIssueDate = targetData?.identification?.docIssueDate ? formatDateTimeDatePicker(targetData.identification.docIssueDate) : '';

                // Map API structure to form structure
                const addressData = targetData?.ubosAddress || targetData?.directorAddress || targetData?.representativesAddress || {};

                const formValues = {
                    firstName: targetData?.personDetails?.firstName || '',
                    lastName: targetData?.personDetails?.lastName || '',
                    middleName: targetData?.personDetails?.middleName || '',
                    uboPosition: isDirectorMode ? UBO_FORM_CONSTANTS.DIRECTOR : (isRepresentativeMode ? UBO_FORM_CONSTANTS.REPRESENTATIVE : UBO_FORM_CONSTANTS.UBO),
                    dob: formattedDob,
                    gender: targetData?.personDetails?.gender || '',
                    country: targetData?.personDetails?.country || '',
                    shareHolderPercentage: targetData?.personDetails?.shareHolderPercentage?.toString().replace('%', '') || '',
                    phoneCode: targetData?.personDetails?.phoneCode || '',
                    phoneNumber: targetData?.personDetails?.phoneNumber || '',
                    note: targetData?.personDetails?.note || '',
                    frontId: targetData?.identification?.frontDocument || '',
                    backImgId: targetData?.identification?.backDocument || '',
                    docType: targetData?.identification?.idType || '',
                    docDetailsid: targetData?.identification?.id || '',
                    email: targetData?.personDetails?.email || '',
                    docNumber: targetData?.identification?.idNumber || '',
                    docIssueDate: formattedDocIssueDate,
                    docExpiryDate: formattedDocExpiryDate,
                    selfi: targetData?.selfie || '',
                    state: addressData?.state || "",
                    city: addressData?.city || "",
                    addressLine1: addressData?.line1 || "",
                    addressLine2: addressData?.line2 || "",
                    postalCode: addressData?.postalCode || "",
                    addressType: addressData?.addressType || "",
                    addressCountry: addressData?.country || ""
                };

                setInitValues(formValues);

                setFileNames({
                    frontId: targetData?.identification?.frontDocument?.split('/').pop() || null,
                    backImgId: targetData?.identification?.backDocument?.split('/').pop() || null,
                    selfi: targetData?.selfie?.split('/').pop() || null
                });
            } else {
                setErrormsg('Item not found for editing');
            }
        }

        setFormDataBinding(false);
    };

    // Form handling functions
    /**
     * Handles form submission - validates data and saves to Redux store
     * @param values - Form values from Formik
     * @param validateForm - Formik validation function that returns Promise<ValidationErrors>
     *                      Promise is used because validation can be asynchronous (API calls, etc.)
     */
    const handleSave = async (values: FormValues, { validateForm }: { validateForm: () => Promise<any> }) => {
        setBtnLoading(true);
        // Promise usage: validateForm() returns Promise that resolves to validation errors object
        // await ensures we wait for all validation rules to complete before proceeding
        // Returns: {} (empty object) if no errors, or {fieldName: "error message"} if errors exist
        const errors = await validateForm();
        if (Object.keys(errors).length > 0) {
            setBtnLoading(false);
            return;
        }

        // Check for duplicates based on current mode
        const currentList = isDirectorMode ? directorFormDataList : (isRepresentativeMode ? representativeFormDataList : uboFormDataList);
        const duplicateError = checkDuplicateUbo(values, currentList, editId, t, persionalDetails, deletedCardsApiItems);
        if (duplicateError) {
            setErrormsg(duplicateError);
            setTimeout(() => {
                scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
            }, 100);
            setBtnLoading(false);
            return;
        }
        // Set ID and record status based on whether it's new or edit
        const itemId = editId || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const recordStatus = editId ? "Modified" : "Added";

        const uboData = {
            ...values,
            id: itemId,
            tempId: itemId, // Keep temp ID for UI tracking
            recordStatus: recordStatus,
            dob: values?.dob ? formatYearMonthDate(values.dob) : '',
            docExpiryDate: values?.docExpiryDate ? formatYearMonthDate(values.docExpiryDate) : '',
            docIssueDate: values?.docIssueDate ? formatYearMonthDate(values.docIssueDate) : '',
            uboPosition: isDirectorMode ? UBO_FORM_CONSTANTS.DIRECTOR : (isRepresentativeMode ? UBO_FORM_CONSTANTS.REPRESENTATIVE : UBO_FORM_CONSTANTS.UBO),
            shareHolderPercentage: parseFloat(values.shareHolderPercentage) || 0,
            gender: values?.gender

        };

        try {
            if (isDirectorMode) {
                let updatedList = [...directorFormDataList];
                if (editId) {
                    // Check if item exists in Redux list
                    const existingIndex = updatedList.findIndex(item => item.id === editId);
                    if (existingIndex >= 0) {
                        // Update existing Redux item
                        updatedList[existingIndex] = uboData;
                    } else {
                        // Add API item to Redux (first time editing API item)
                        updatedList.push(uboData);
                    }
                } else {
                    updatedList.push(uboData);
                }
                dispatch({ type: UBO_FORM_CONSTANTS.REDUX_ACTIONS.SET_CARDS_DIRECTOR_FORM_DATA, payload: updatedList });
            } else if (isRepresentativeMode) {
                let updatedList = [...representativeFormDataList];
                if (editId) {
                    // Check if item exists in Redux list
                    const existingIndex = updatedList.findIndex(item => item.id === editId);
                    if (existingIndex >= 0) {
                        // Update existing Redux item
                        updatedList[existingIndex] = uboData;
                    } else {
                        // Add API item to Redux (first time editing API item)
                        updatedList.push(uboData);
                    }
                } else {
                    updatedList.push(uboData);
                }
                dispatch({ type: UBO_FORM_CONSTANTS.REDUX_ACTIONS.SET_CARDS_REPRESENTATIVE_FORM_DATA, payload: updatedList });
            } else {
                let updatedList = [...uboFormDataList];
                if (editId) {
                    // Check if item exists in Redux list
                    const existingIndex = updatedList.findIndex(item => item.id === editId);
                    if (existingIndex >= 0) {
                        // Update existing Redux item
                        updatedList[existingIndex] = uboData;
                    } else {
                        // Add API item to Redux (first time editing API item)
                        updatedList.push(uboData);
                    }
                } else {
                    updatedList.push(uboData);
                }
                dispatch({ type: UBO_FORM_CONSTANTS.REDUX_ACTIONS.SET_CARD_UBO_FORM_DATA, payload: updatedList });
            }

            navigation.goBack();
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setBtnLoading(false);
        }
    };
    // File upload utility functions
    /**
     * Uploads file to server using ProfileService
     * @param uri - File URI
     * @param type - File type (image/application)
     * @param fileName - Name of the file
     * @param fileExtension - File extension
     * @param item - Form field name
     * @param setFeilds - Function to update form field
     */
    const uploadFileToServer = async (uri: string, type: string, fileName: string, fileExtension: string, item: string, setFeilds: (field: string, value: string) => void) => {
        setImagesLoader(prevState => ({ ...prevState, [item]: true }));
        const formData = new FormData();
        formData.append('document', {
            uri: uri,
            type: `${type}/${fileExtension}`,
            name: fileName,
        } as any);

        try {
            const uploadRes = await ProfileService.uploadFile(formData);
            if (uploadRes.status === 200) {
                const uploadedImage = Array.isArray(uploadRes.data) && uploadRes.data.length > 0 ? uploadRes.data[0] : "";
                setFeilds(item, uploadedImage);
                setErrormsg(null);
            } else {
                setErrormsg(isErrorDispaly(uploadRes));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setImagesLoader(prevState => ({ ...prevState, [item]: false }));
        }
    };

    /**
     * Handles image/document selection and upload
     * @param item - Form field name
     * @param setFeilds - Function to update form field
     * @param pickerOption - Source of file selection (camera/library/documents)
     */
    const handleUploadImg = async (item: string, setFeilds: (field: string, value: string) => void, pickerOption?: 'camera' | 'library' | 'documents') => {
        try {
            if (pickerOption === 'documents') {
                const result = await DocumentPicker.getDocumentAsync({
                    type: ['image/*', 'application/pdf'],
                    copyToCacheDirectory: true,
                });

                if (result.canceled) return;

                const selectedFile = result.assets[0];
                const { uri, mimeType, name, size } = selectedFile;
                const fileName = name || uri.split('/').pop() || `file_${Date.now()}`;

                const fileSizeMB = size ? size / (1024 * 1024) : 0;
                if (fileSizeMB > 15) {
                    setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                    return;
                }

                const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
                const isImage = mimeType?.startsWith('image/') || verifyFileTypes(fileName);

                if (!isPdf && !isImage) {
                    setErrormsg(t('GLOBAL_CONSTANTS.ONLY_IMAGES_AND_PDF_FILES_ARE_ACCEPTED'));
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
                Alert.alert(UBO_FORM_MESSAGES.PERMISSION_DENIED, UBO_FORM_MESSAGES.ENABLE_PERMISSIONS);
                return;
            }

            const result = pickerOption === 'camera'
                ? await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [1, 1], quality: 0.5 })
                : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: false, aspect: [1, 1], quality: 0.5 });

            if (result.canceled) return;

            const selectedImage = result.assets[0];
            const { uri, type } = selectedImage;
            const fileName = selectedImage.fileName || uri.split('/').pop() || `image_${Date.now()}.jpg`;
            const fileExtension = getFileExtension(selectedImage.uri);

            if (!verifyFileTypes(fileName)) {
                setErrormsg(UBO_FORM_MESSAGES.ONLY_IMAGES_ACCEPTED);
                return;
            }

            const fileSizeMB = selectedImage.fileSize ? selectedImage.fileSize / (1024 * 1024) : 0;
            if (fileSizeMB > 15) {
                setErrormsg(t('GLOBAL_CONSTANTS.FILE_SIZE_EXCEEDED_15MB'));
                return;
            }

            setFileNames(prevState => ({ ...prevState, [item]: fileName }));

            if (uri && type && fileExtension) {
                await uploadFileToServer(uri, type, fileName, fileExtension, item, setFeilds);
            }
        } catch (err) {
            setErrormsg(isErrorDispaly(err));
        }
    };

    // Navigation and utility functions
    /**
     * Handles back navigation
     */
    const handleBack = () => {
        navigation.goBack();
    };

    const handleError = useCallback(() => {
        setErrormsg(null);
        if (countryError) {
            clearCache();
        }
    }, [countryError, clearCache]);

    /**
     * Handles address country selection and resets dependent fields
     * @param e - Selected country value
     * @param setFieldValue - Formik field setter function
     * @param values - Current form values
     */
    const handleAddressCountry = (e: string, setFieldValue: (field: string, value: string) => void, values: FormValues) => {
        setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_COUNTRY, e);
        if (e?.toLowerCase()?.replace(/\s+/g, '')?.trim() !== values?.addressCountry?.toLowerCase()?.replace(/\s+/g, '')?.trim()) {
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE1, "");
            setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE2, "");
            setFieldValue(FORM_DATA_CONSTANTS.CITY, "");
            setFieldValue(FORM_DATA_CONSTANTS.STATE, "");
            setFieldValue(FORM_DATA_CONSTANTS.POSTAL_CODE, "");
            setFieldValue(FORM_DATA_CONSTANTS.TOWN, "");
        }
        // Find states for selected country
        const selectedCountryForStates = countriesWithStates?.find((country: CountryWithStates) => country?.name === e);
        if (selectedCountryForStates && selectedCountryForStates.details && selectedCountryForStates.details.length > 0) {
            setStatesList(selectedCountryForStates.details);
        } else {
            setStatesList([]);
        }
    };
    // Debug logs
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
                    {(loadingData || formDataBinding || countryLoading) && (
                        <ViewComponent style={[commonStyles.flex1]}>
                            <DashboardLoader />
                        </ViewComponent>
                    )}
                    {!loadingData && !formDataBinding && !countryLoading && (
                        <Container style={commonStyles.container}>
                            <PageHeader title={props?.route?.params?.title || "GLOBAL_CONSTANTS.FORM"} onBackPress={handleBack} />
                            {(errormsg || countryError) && <ErrorComponent message={errormsg || countryError || ''} onClose={handleError} />}

                            <Formik
                                key={`${editId || ''}-${JSON.stringify(initValues)}`}
                                initialValues={initValues}
                                onSubmit={handleSave}
                                validationSchema={KybAddUobsSchema(isRepresentativeMode, isDirectorMode, kybRequirements)}
                                enableReinitialize={true}
                                validateOnChange={true}
                                validateOnBlur={true}
                            >
                                {(formik) => {
                                    const { touched, handleSubmit, errors, handleBlur, values, setFieldValue, handleChange, validateForm } = formik;
                                    return (
                                        <>
                                            <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.PERSONAL_DETAILS"} />
                                            <ViewComponent style={[commonStyles.titleSectionGap]} />
                                            <Field
                                                touched={touched?.firstName}
                                                name={UBO_FORM_FIELD_NAMES.FIRST_NAME}
                                                label={"GLOBAL_CONSTANTS.FIRST_NAME"}
                                                error={errors?.firstName}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"}
                                                component={InputDefault}
                                                maxLength={50}
                                                requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            <Field
                                                touched={touched?.lastName}
                                                name={UBO_FORM_FIELD_NAMES.LAST_NAME}
                                                label={"GLOBAL_CONSTANTS.LAST_NAME"}
                                                error={errors?.lastName}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"}
                                                component={InputDefault}
                                                maxLength={50}
                                                requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            <LabelComponent text={"GLOBAL_CONSTANTS.GENDER"} style={commonStyles.mb10}>
                                                <LabelComponent text={" *"} style={commonStyles.textError} />
                                            </LabelComponent>
                                            <RadioButton
                                                options={genderPickerData}
                                                selectedOption={values?.gender?.toLowerCase()}
                                                onSelect={(val: any) => setFieldValue(UBO_FORM_FIELD_NAMES.GENDER, val)}
                                                nameField='name'
                                                valueField='name'
                                                touched={touched?.gender}
                                            />
                                            {errors?.gender && touched?.gender && (
                                                <ParagraphComponent
                                                    style={[
                                                        commonStyles.fs14,
                                                        commonStyles.fw400,
                                                        commonStyles.textError,
                                                        { marginLeft: 0 }
                                                    ]}
                                                    text={errors?.gender}
                                                />
                                            )}
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            <Field
                                                touched={touched?.email}
                                                name={UBO_FORM_FIELD_NAMES.EMAIL}
                                                label={"GLOBAL_CONSTANTS.EMAIL"}
                                                error={errors?.email}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.ENTER_EMAIL_ADDRESS"}
                                                component={InputDefault}
                                                keyboardType={'email-address'}
                                                maxLength={50}
                                                requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            <Field
                                                touched={touched?.shareHolderPercentage}
                                                name={UBO_FORM_FIELD_NAMES.SHARE_HOLDER_PERCENTAGE}
                                                label={"GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE"}
                                                error={errors?.shareHolderPercentage}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.SHARE_HOLDER_PERCENTAGE_PLACEHOLDER"}
                                                component={InputDefault}
                                                maxLength={3}
                                                keyboardType={'numeric'}
                                                requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            <DatePickerComponent name={UBO_FORM_FIELD_NAMES.DOB} label={"GLOBAL_CONSTANTS.DATE_OF_BIRTH"} maximumDate={maxDate} />
                                            <ViewComponent style={commonStyles.formItemSpace} />
                                            <Field
                                                activeOpacity={0.9}
                                                label={UBO_FORM_LABELS.COUNTRY}
                                                touched={touched?.country}
                                                name={UBO_FORM_FIELD_NAMES.COUNTRY}
                                                error={errors?.country}
                                                handleBlur={handleBlur}
                                                customContainerStyle={{ height: 80 }}
                                                data={countryPickerData || []}
                                                placeholder={UBO_FORM_LABELS.SELECT_COUNTRY}
                                                component={CustomPicker}
                                                modalTitle={UBO_FORM_LABELS.SELECT_COUNTRY}
                                                customBind={['name']}
                                                valueField={'name'}
                                                requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                            />
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            <LabelComponent style={[commonStyles.inputLabel]} text={"GLOBAL_CONSTANTS.PHONE_NUMBER"}>
                                                <ParagraphComponent style={[commonStyles.textRed]} text={" *"} />
                                            </LabelComponent>
                                            <ViewComponent style={[commonStyles.relative, commonStyles.dflex]}>
                                                <PhoneCodePicker
                                                    inputStyle={{
                                                        borderRightWidth: 0,
                                                        borderTopRightRadius: 0,
                                                        borderBottomRightRadius: 0,
                                                        borderColor: ((touched?.phoneCode && errors?.phoneCode) || (touched?.phoneNumber && errors?.phoneNumber)) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER
                                                    }}
                                                    modalTitle={"GLOBAL_CONSTANTS.SELECT_PHONE_CODE"}
                                                    customBind={['name', '(', 'code', ')']}
                                                    data={phoneCodePickerData || []}
                                                    placeholder={"GLOBAL_CONSTANTS.SELECT"}
                                                    value={values.phoneCode}
                                                    onChange={(item: any) => {
                                                        setFieldValue(UBO_FORM_FIELD_NAMES.PHONE_CODE, item.code);
                                                    }}
                                                    isOnlycountry={true}
                                                />
                                                <ViewComponent style={[commonStyles.flex1, commonStyles.pr2]}>
                                                    <TextInput
                                                        style={[
                                                            commonStyles.textInput,
                                                            commonStyles.fs14,
                                                            commonStyles.fw400,
                                                            {
                                                                borderBottomLeftRadius: 0,
                                                                borderTopLeftRadius: 0,
                                                                borderColor: ((touched?.phoneCode && errors?.phoneCode) || (touched?.phoneNumber && errors?.phoneNumber)) ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER
                                                            }
                                                        ]}
                                                        placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                        onChangeText={(text) => {
                                                            const formattedText = text.replace(/\D/g, "").slice(0, 13);
                                                            handleChange(UBO_FORM_FIELD_NAMES.PHONE_NUMBER)(formattedText);
                                                        }}
                                                        onBlur={handleBlur(UBO_FORM_FIELD_NAMES.PHONE_NUMBER)}
                                                        value={values.phoneNumber}
                                                        keyboardType={'phone-pad'}
                                                        maxLength={16}
                                                    />
                                                </ViewComponent>
                                            </ViewComponent>
                                            {(touched.phoneCode && errors.phoneCode || touched.phoneNumber && errors.phoneNumber) &&
                                                <ParagraphComponent style={[commonStyles.textRed]} text={errors.phoneCode || errors?.phoneNumber} />
                                            }
                                            <ViewComponent style={commonStyles.formItemSpace} />

                                            <Field
                                                touched={touched?.note}
                                                name={UBO_FORM_FIELD_NAMES.NOTE}
                                                label={"GLOBAL_CONSTANTS.NOTE_LABLE"}
                                                error={errors?.note}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.NOTE_PLACEHOLDER"}
                                                component={InputDefault}
                                                maxLength={249}
                                            />
                                            <ViewComponent style={commonStyles.sectionGap} />
                                            {/* Show identification section based on specific requirements for each entity type */}
                                            {kybRequirements.showUBOIdentification || kybRequirements.showDirectorIdentification || kybRequirements.showRepresentativeIdentification ? <ViewComponent>
                                                <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.UPLOAD_THE_DOCUMENTS"} />
                                                <ViewComponent style={[commonStyles.titleSectionGap]} />

                                                <Field
                                                    activeOpacity={0.9}
                                                    label={"GLOBAL_CONSTANTS.CHOOSE_DOCUMENT_TYPE"}
                                                    touched={touched?.docType}
                                                    name={UBO_FORM_FIELD_NAMES.DOC_TYPE}
                                                    error={errors?.docType}
                                                    handleBlur={handleBlur}
                                                    customContainerStyle={{ height: 80 }}
                                                    data={documentTypesLookUp || []}
                                                    placeholder={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                                                    component={CustomPicker}
                                                    modalTitle={"GLOBAL_CONSTANTS.SELECT_DOCUMENT_TYPE"}
                                                    onChange={(value: string) => {
                                                        setFieldValue(UBO_FORM_FIELD_NAMES.DOC_TYPE, value);
                                                        setFieldValue(UBO_FORM_FIELD_NAMES.DOC_NUMBER, '');
                                                        setFieldValue(UBO_FORM_FIELD_NAMES.DOC_EXPIRY_DATE, '');
                                                        setFieldValue(UBO_FORM_FIELD_NAMES.FRONT_ID, '');
                                                        setFieldValue(UBO_FORM_FIELD_NAMES.BACK_IMG_ID, '');
                                                        setFileNames({ frontId: null, backImgId: null, selfi: null });
                                                    }}
                                                    requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                />
                                                <ViewComponent style={commonStyles.formItemSpace} />

                                                <Field
                                                    touched={touched?.docNumber}
                                                    name={UBO_FORM_FIELD_NAMES.DOC_NUMBER}
                                                    label={"GLOBAL_CONSTANTS.DOCUMENT_NUMBER"}
                                                    error={errors?.docNumber}
                                                    handleBlur={handleBlur}
                                                    placeholder={UBO_FORM_PLACEHOLDERS.ENTER_DOCUMENT_NUMBER}
                                                    component={InputDefault}
                                                    maxLength={50}
                                                    requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                />
                                                <ViewComponent style={commonStyles.formItemSpace} />



                                                <DatePickerComponent
                                                    name={UBO_FORM_FIELD_NAMES.DOC_ISSUE_DATE}
                                                    maximumDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                                                    label="GLOBAL_CONSTANTS.DOCUMENT_ISSUE_DATE"
                                                    placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER"
                                                    required={true}
                                                />
                                                <ViewComponent style={commonStyles.formItemSpace} />

                                                <DatePickerComponent
                                                    name={UBO_FORM_FIELD_NAMES.DOC_EXPIRY_DATE}
                                                    minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                                    label="GLOBAL_CONSTANTS.DOCUMENT_EXPIRY_DATE_FUTURE"
                                                    placeholder="GLOBAL_CONSTANTS.DATE_PLACEHOLDER"
                                                    required={!UBO_FORM_CONSTANTS.DOCUMENT_TYPES_NO_EXPIRY.includes(values.docType)}
                                                />
                                                <ViewComponent style={[commonStyles.formItemSpace]} />

                                                <FileUpload
                                                    fileLoader={imagesLoader?.frontId}
                                                    onSelectImage={(source) => {
                                                        formik.setFieldTouched(UBO_FORM_FIELD_NAMES.FRONT_ID, true);
                                                        handleUploadImg(UBO_FORM_FIELD_NAMES.FRONT_ID, setFieldValue, source);
                                                    }}
                                                    uploadedImageUri={values?.frontId}
                                                    errorMessage={touched?.frontId ? errors?.frontId as string : ''}
                                                    deleteImage={() => {
                                                        formik.setFieldTouched(UBO_FORM_FIELD_NAMES.FRONT_ID, true);
                                                        setFieldValue(UBO_FORM_FIELD_NAMES.FRONT_ID, '');
                                                    }}
                                                    fileName={fileNames?.frontId}
                                                    label={"GLOBAL_CONSTANTS.FRONT_ID_PHOTO"}
                                                    isRequired={true}
                                                    showImageSourceSelector={true}
                                                    subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                />
                                                <ViewComponent style={commonStyles.formItemSpace} />

                                                <FileUpload
                                                    fileLoader={imagesLoader?.backImgId}
                                                    onSelectImage={(source) => {
                                                        formik.setFieldTouched(UBO_FORM_FIELD_NAMES.BACK_IMG_ID, true);
                                                        handleUploadImg(UBO_FORM_FIELD_NAMES.BACK_IMG_ID, setFieldValue, source);
                                                    }}
                                                    uploadedImageUri={values?.backImgId}
                                                    errorMessage={touched?.backImgId ? errors?.backImgId as string : ''}
                                                    deleteImage={() => {
                                                        formik.setFieldTouched(UBO_FORM_FIELD_NAMES.BACK_IMG_ID, true);
                                                        setFieldValue(UBO_FORM_FIELD_NAMES.BACK_IMG_ID, '');
                                                    }}
                                                    fileName={fileNames?.backImgId}
                                                    label={"GLOBAL_CONSTANTS.BACK_ID_PHOTO"}
                                                    isRequired={true}
                                                    showImageSourceSelector={true}
                                                    subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                />
                                                <ViewComponent style={commonStyles.formItemSpace} />

                                                {/* Show selfie upload based on specific requirements for each entity type */}
                                                {(kybRequirements.showUBOSelfie || kybRequirements.showDirectorSelfie || kybRequirements.showRepresentativeSelfie) && (
                                                    <FileUpload
                                                        fileLoader={imagesLoader?.selfi}
                                                        onSelectImage={(source) => {
                                                            formik.setFieldTouched(UBO_FORM_FIELD_NAMES.SELFI, true);
                                                            handleUploadImg(UBO_FORM_FIELD_NAMES.SELFI, setFieldValue, source);
                                                        }}
                                                        uploadedImageUri={values?.selfi}
                                                        errorMessage={touched?.selfi ? errors?.selfi as string : ''}
                                                        deleteImage={() => {
                                                            formik.setFieldTouched(UBO_FORM_FIELD_NAMES.SELFI, true);
                                                            setFieldValue(UBO_FORM_FIELD_NAMES.SELFI, '');
                                                        }}
                                                        fileName={fileNames?.selfi}
                                                        label={"GLOBAL_CONSTANTS.SELFIE_IMAGE"}
                                                        isRequired={true}
                                                        showImageSourceSelector={true}
                                                        subLabel={"GLOBAL_CONSTANTS.PNG_JPG_JPEG_PDF_FILES_ALLOWED"}
                                                    />
                                                )}


                                                <ViewComponent style={commonStyles.formItemSpace} />
                                            </ViewComponent> : null}
                                            {/* Show address section based on specific requirements for each entity type */}
                                            {(kybRequirements.showUBOAddress || kybRequirements.showDirectorAddress || kybRequirements.showRepresentativeAddress || kybRequirements.showPersonalInformationAddress) && (
                                                <>
                                                    <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.ADDRESS_DETAILS"} />
                                                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                                                    <Field
                                                        label={"GLOBAL_CONSTANTS.ADDRESS_TYPE"}
                                                        touched={touched.addressType}
                                                        name={UBO_FORM_FIELD_NAMES.ADDRESS_TYPE}
                                                        value={values?.addressType}
                                                        error={errors?.addressType}
                                                        onChange={(e: string) => setFieldValue(UBO_FORM_FIELD_NAMES.ADDRESS_TYPE, e)}
                                                        component={CustomPicker}
                                                        data={addressTypeList}
                                                        placeholder={"GLOBAL_CONSTANTS.ADDRESS_TYPE"}
                                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                                    />


                                                    <ViewComponent style={commonStyles.formItemSpace} />
                                                    <Field
                                                        label={"GLOBAL_CONSTANTS.COUNTRY"}
                                                        touched={touched.addressCountry && !values?.addressCountry}
                                                        name={FORM_DATA_CONSTANTS.ADDRESS_COUNTRY}
                                                        value={values?.addressCountry}
                                                        error={touched.addressCountry && !values?.addressCountry ? errors?.addressCountry : undefined}
                                                        onChange={(e: string) => handleAddressCountry(e, setFieldValue, values)}
                                                        component={CustomPicker}
                                                        data={countries}
                                                        placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                                    />

                                                    <ViewComponent style={commonStyles.formItemSpace} />
                                                    <Field
                                                        label={FORM_DATA_LABEL.STATE}
                                                        touched={touched.state}
                                                        name={FORM_DATA_CONSTANTS.STATE}
                                                        value={values?.state}
                                                        error={errors?.state}
                                                        onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.STATE, val)}
                                                        component={CustomPicker}
                                                        data={statesList}
                                                        placeholder={FORM_DATA_CONSTANTS.SELECT_STATE}
                                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                                    />

                                                    <ViewComponent style={commonStyles.formItemSpace} />
                                                    <Field
                                                        touched={touched.city}
                                                        name={FORM_DATA_CONSTANTS.CITY}
                                                        label={FORM_DATA_LABEL.CITY}
                                                        value={values?.city}
                                                        error={errors?.city}
                                                        handleBlur={handleBlur}
                                                        onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.CITY, val)}
                                                        component={InputDefault}
                                                        placeholder={FORM_DATA_CONSTANTS.ENTER_CITY}

                                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                                    />

                                                    <ViewComponent style={commonStyles.formItemSpace} />
                                                    <Field
                                                        touched={touched.addressLine1}
                                                        name={FORM_DATA_CONSTANTS.ADDRESS_LINE1}
                                                        label={FORM_DATA_LABEL.ADDRESS_LINE1}
                                                        value={values?.addressLine1}
                                                        error={errors?.addressLine1}
                                                        handleBlur={handleBlur}
                                                        onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE1, val)}
                                                        component={InputDefault}
                                                        placeholder={FORM_DATA_PLACEHOLDER.ENTER_ADDRESS_LINE_1}

                                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                                    />

                                                    <ViewComponent style={commonStyles.formItemSpace} />
                                                    <Field
                                                        touched={touched.addressLine2}
                                                        name={FORM_DATA_CONSTANTS.ADDRESS_LINE2}
                                                        label={FORM_DATA_LABEL.ADDRESS_LINE2}
                                                        value={values?.addressLine2}
                                                        error={errors?.addressLine2}
                                                        handleBlur={handleBlur}
                                                        onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.ADDRESS_LINE2, val)}
                                                        component={InputDefault}
                                                        placeholder={FORM_DATA_PLACEHOLDER.ENTER_ADDRESS_LINE_2}
                                                    />

                                                    <ViewComponent style={commonStyles.formItemSpace} />
                                                    <Field
                                                        touched={touched.postalCode}
                                                        name={FORM_DATA_CONSTANTS.POSTAL_CODE}
                                                        label={FORM_DATA_LABEL.POSTAL_CODE}
                                                        value={values?.postalCode}
                                                        error={errors?.postalCode}
                                                        handleBlur={handleBlur}
                                                        onChange={(val: string) => setFieldValue(FORM_DATA_CONSTANTS.POSTAL_CODE, val)}
                                                        keyboardType="numeric"
                                                        component={InputDefault}
                                                        placeholder={FORM_DATA_PLACEHOLDER.ENTER_POSTAL_CODE}
                                                        requiredMark={<LabelComponent text={FORM_FIELD.START_REQUIRED} style={commonStyles.textError} />}
                                                    />
                                                </>
                                            )}

                                            <ViewComponent style={commonStyles.mb40} />
                                            <ViewComponent>
                                                <ButtonComponent
                                                    title={"GLOBAL_CONSTANTS.OK"}
                                                    loading={btnLoading}
                                                    disable={btnLoading}
                                                    onPress={() => {
                                                        validateForm().then(async (errors: Record<string, string>) => {
                                                            if (Object.keys(errors).length > 0) {
                                                                const touchedFields = Object.keys(values).reduce((acc, key) => {
                                                                    acc[key] = true;
                                                                    return acc;
                                                                }, {} as Record<string, boolean>);
                                                                formik.setTouched(touchedFields);
                                                                scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
                                                                setErrormsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
                                                                return;
                                                            }
                                                            setErrormsg('');
                                                            handleSubmit();
                                                        });
                                                    }}
                                                />
                                                <ViewComponent style={[commonStyles.buttongap]} />
                                                <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handleBack} solidBackground={true} />
                                            </ViewComponent>
                                            <ViewComponent style={commonStyles.sectionGap} />
                                        </>
                                    );
                                }}
                            </Formik>
                        </Container>
                    )}
                </ScrollViewComponent>
            </KeyboardAvoidingView>
        </ViewComponent>
    );
};

export default UboFormDetails;

