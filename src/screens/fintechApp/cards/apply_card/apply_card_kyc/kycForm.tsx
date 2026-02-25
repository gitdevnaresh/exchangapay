import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StyleSheet, View, BackHandler, KeyboardAvoidingView, Platform } from "react-native";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { isUSDateFormat, formatDateTimeDatePicker, isErrorDispaly } from "../../../../../utils/helpers";
import CardsModuleService from '../../../../../apiServices/cards';
import { useIsFocused } from '@react-navigation/native';
import { CREATE_KYC_ADDRESS_CONST, FORM_DATA_CONSTANTS, FormData, generateValidationSchema } from "../constants";
import { Field, Formik } from "formik";
import moment from "moment-timezone";
import CustomPicker from "../../../../../components/customPicker/CustomPicker";
import KycFields from "./kycFields";
import { setApplyCardData, setCardHolderStatusId,   } from "../../../../../redux/actions/actions";
import { CARDS_CONST } from "../../dashoard/constants";
import ButtonComponent from "../../../../../components/buttons/button";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import ViewComponent from "../../../../../components/view/view";
import Container from "../../../../../components/container/container";
import { s } from "../../../../../components/theme/scale";
import ScrollViewComponent from "../../../../../components/scrollView/scrollView";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import DashboardLoader from "../../../../../components/loader";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import CustomRBSheet from "../../../../../components/models/commonBottomSheet";
import BindCardSuccess from "../../myCards/bindCard/BindCardSuccess";
import * as Yup from 'yup';
import { Beneficiary, BeneficiaryResponse, DataState, NavigationProps, ReduxState, UbosDetails } from "../interface";

const KycForm = (props: NavigationProps) => {
    const isFocus = useIsFocused();
    const ref = useRef<string|null>(null);
    const [applyCardsLoading, setApplyCardsLoading] = useState<boolean>(false);
    const [errormsg, setErrormsg] = useState<string>('');
    const userInfo = useSelector((state: ReduxState) => state.userReducer?.userDetails);
    const [btnLoader, setBtnLoader] = useState<boolean>(false);
    const [kycReqList, setKycReqList] = useState<string[]>([])
    const [keyRequirements, setKeyRequirements] = useState<string>("")
    const [data, setData] = useState<DataState>({ "beneficiaryType": [], "beneficiary": [], "ubosDetails": {} });
    const dispatch = useDispatch();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { decryptAES, encryptAES } = useEncryptDecrypt();
    const { t } = useLngTranslation();
    const succussRbRef = useRef<string|null>();
    const acceptedTerms = useSelector((state: any) => state.userReducer?.acceptedTerms);

    const kycFormData = useSelector((state: ReduxState) => state.userReducer?.kycFormData);
    const [formData, setFormData] = useState<FormData>(() => {
        // Initialize with kycFormData if available, otherwise use default values
        return kycFormData || {
            firstName: "",
            lastName: "",
            middleName: "",
            country: "",
            state: "",
            dob: "",
            gender: "",
            city: "",
            town: "",
            addressLine1: "",
            mobile: "",
            mobileCode: userInfo?.phonecode || "",
            email: "",
            idType: "",
            idNumber: "",
            docExpiryDate: "",
            postalCode: "",
            faceImage: "",
            signature: "",
            profilePicBack: "",
            profilePicFront: "",
            handHoldingIDPhoto: "",
            biometric: "",
            emergencyContactName: "",
            kycRequirements: "",
            beneficiaryType: '',
            beneficiary: '',
            idImage: null,
            address: null,
            addressId: null,
            docNumber: null,
            faceImage1: null,
            mixedPhoto: null,
            occupation: null,
            annualSalary: null,
            sourceOfIncome: null,
            accountPurpose: null,
            expectedMonthlyVolume: null,
            issueDate: null,
            addressLine2: "",
            isDefault: false,
            documentTypeCode: "",
            isDocumentsRequriedOrNot: false,
            addressCountry: "",
        };
    });
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (!hasInitialized) {
            getKycRequirements(!!kycFormData);
            getListOfBeneficiaryTypes();
            setHasInitialized(true);
        }
        // ref?.current?.scrollTo({ y: 0, animated: true });
        setErrormsg(''); 
    }, [isFocus, kycFormData, hasInitialized]);
    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => { handleBack(); return true; }
        );
        return () => backHandler.remove();
    }, []);
    const getKycRequirements = async (preserveFormData: boolean = false) => {
        setApplyCardsLoading(true);
        try {
            const response = await CardsModuleService?.getApplyCardsRequirements(props?.route?.params?.cardId) as ApiResponse;
            if (response?.status === 200) {
                setErrormsg('');
                setApplyCardsLoading(false);
                const kycRequirements = response?.data?.kyc?.kycRequirements;
                const mappedKycRequirements = kycRequirements
                    ? kycRequirements?.split(',')?.map((req: string) => req.toLowerCase())
                    : [];
                setKycReqList(mappedKycRequirements);
                setKeyRequirements(kycRequirements);

                // Only update formData if not preserving saved data
                if (!preserveFormData) {
                    const kycResponse: KycResponse = response?.data?.kyc;
                    setFormData((prevData: FormData) => ({
                        ...prevData,
                        firstName: kycResponse?.firstName ? decryptAES(kycResponse.firstName) : "",
                        lastName: kycResponse?.lastName ? decryptAES(kycResponse.lastName) : "",
                        middleName: kycResponse?.middleName ?? "",
                        email: kycResponse?.email ? decryptAES(kycResponse.email) : "",
                        mobile: kycResponse?.mobile ? decryptAES(kycResponse.mobile) : "",
                        mobileCode: kycResponse?.mobileCode ? decryptAES(kycResponse.mobileCode) : "",
                        country: kycResponse?.country ?? "",
                        addressCountry: kycResponse?.addressCountry ?? kycResponse?.country ?? "",
                        city: kycResponse?.city ?? "",
                        town: kycResponse?.town ?? "",
                        addressLine1: kycResponse?.addressLine1 ?? "",
                        state: kycResponse?.state ?? "",
                        gender: kycResponse?.gender ?? "",
                        dob: kycResponse?.dob ? (isUSDateFormat(decryptAES(kycResponse.dob)) ? formatDateTimeDatePicker(decryptAES(kycResponse.dob)) : decryptAES(kycResponse.dob)) : "",
                        idNumber: kycResponse?.idNumber ? decryptAES(kycResponse.idNumber) : "",
                        faceImage: kycResponse?.faceImage ?? "",
                        signature: kycResponse?.signature ?? "",
                        profilePicBack: kycResponse?.backDocImage ?? kycResponse?.profilePicBack ?? "",
                        profilePicFront: kycResponse?.profilePicFront ?? "",
                        handHoldingIDPhoto: kycResponse?.handHoldingIDPhoto ?? "",
                        faceImage1: kycResponse?.faceImage ?? "",
                        idImage: kycResponse?.idImage ?? "",
                        docExpiryDate: kycResponse?.docExpiryDate ? (isUSDateFormat(decryptAES(kycResponse.docExpiryDate)) ? formatDateTimeDatePicker(decryptAES(kycResponse.docExpiryDate)) : decryptAES(kycResponse.docExpiryDate)) : "",
                        issueDate: kycResponse?.docissueDate ? (isUSDateFormat(decryptAES(kycResponse.docissueDate)) ? formatDateTimeDatePicker(decryptAES(kycResponse.docissueDate)) : decryptAES(kycResponse.docissueDate)) : "",
                        occupation: kycResponse?.occupation ? kycResponse.occupation.replace(/[^a-zA-Z0-9\s]/g, '').trim().substring(0, 50) : "",
                        annualSalary: kycResponse?.annualSalary ?? null,
                        sourceOfIncome: kycResponse?.sourceOfIncome ?? "",
                        accountPurpose: kycResponse?.accountPurpose ?? "",
                        expectedMonthlyVolume: kycResponse?.expectedMonthlyVolume ?? null,
                        addressLine2: kycResponse?.addressLine2 ?? "",
                        postalCode: kycResponse?.postalCode ? decryptAES(kycResponse.postalCode) : "",
                        emergencyContactName: kycResponse?.emergencyContactName ? decryptAES(kycResponse.emergencyContactName) : "",
                        isDefault: kycResponse?.isDefault ?? false,
                        idType: mappedKycRequirements?.includes('passport') || mappedKycRequirements?.includes('passportonly') ? 'Passport' : kycResponse?.idType ?? "",
                        isdocTypeBasedOnCountry: kycResponse?.isdocTypeBasedOnCountry ?? false
                    }));
                } else {
                    // If preserving form data, bind saved data
                    setFormData(kycFormData);
                }
            } else {
                setErrormsg("Invalid data received");
                setApplyCardsLoading(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setApplyCardsLoading(false);
        }
    };

    const prepareKycData = (formValues: FormData) => ({
        KycUpdateModel: KycUpdateModel(formValues),
    });
      const safeEncrypt = (value: unknown): string => {
        try {
            if (value === null || value === undefined || value === '') return '';
            return encryptAES(String(value));
        } catch (error) {
            console.error('Encryption error:', error);
            return '';
        }
    };
    
    const KycUpdateModel = (formattedValues: FormData) => {
        return {
            customerId: userInfo?.id ?? "",
            cardId: props?.route?.params?.cardId ?? "",
            firstName: formattedValues?.firstName ?? "",
            lastName: formattedValues?.lastName ?? "",
            addressLine1: formattedValues?.addressLine1 ?? "",
            city: formattedValues?.city ?? "",
            state: formattedValues?.state ?? "",
            country: formattedValues?.country ?? "",
            addressCountry: formattedValues?.addressCountry ?? "",
            // town: formattedValues?.town ?? "",
            idType: formattedValues?.idType ?? "",
            idNumber: formattedValues?.idNumber ?? "",
            docIssueDate: formattedValues?.idType?.toLowerCase()?.replace(/\s+/g, '').trim() == "hongkongid" ? null : (formattedValues?.issueDate || ""),
            profilePicFront: formattedValues?.profilePicFront ?? "",
            profilePicBack: formattedValues?.profilePicBack ?? "",
            signature: formattedValues?.signature ?? "",
            docExpiryDate: formattedValues?.idType?.toLowerCase()?.replace(/\s+/g, '').trim() == "hongkongid" ? null : (formattedValues?.docExpiryDate ? encryptAES(formattedValues?.docExpiryDate) : ""),
            dob: formattedValues?.dob ?? "",
            biometric: formattedValues?.biometric ?? "",
            backDocImage: formattedValues?.idType?.toLowerCase()?.replace(/\s+/g, '')?.trim() === "passport" ? formattedValues?.profilePicFront ?? "" : formattedValues?.profilePicBack ?? "",
            gender: formattedValues?.gender ?? "",
            email: formattedValues?.email ?? "",
            mobileCode: formattedValues?.mobileCode ?? "",
            mobile: formattedValues?.mobile ?? "",
            faceImage: formattedValues?.faceImage ?? "",
            handHoldingIDPhoto: formattedValues?.handHoldingIDPhoto ?? "",
            emergencyContactName: formattedValues?.emergencyContactName ? encryptAES(formattedValues?.emergencyContactName) : "",
            postalCode: formattedValues?.postalCode ? encryptAES(formattedValues?.postalCode) : "",
            cardHandHoldingIDPhoto: formattedValues?.cardHandHoldingIDPhoto ?? "",
            occupation: formattedValues?.occupation ?? "",
            annualSalary: formattedValues?.annualSalary ?? 0,
            accountPurpose: formattedValues?.accountPurpose ?? "",
            expectedMonthlyVolume: formattedValues?.expectedMonthlyVolume ?? 0,
            requirement: keyRequirements || "",
            addressId: formattedValues?.addressId ?? null,
            addressLine2: formattedValues?.addressLine2 ?? "",
        };
    };
    const handleSaveKycData = async (values: any) => {
        if (!kycReqList) return;

        setBtnLoader(true);

        if (values?.dob && moment().diff(moment(values.dob), 'years') < 18) {
            setBtnLoader(false);
            setErrormsg(CREATE_KYC_ADDRESS_CONST.EXPIRY_DATE_VALIDATION_VALIDATION);
            ref?.current?.scrollTo({ y: 0, animated: true });
            return;
        }

        if (values?.docExpiryDate && values?.issueDate && moment(values.docExpiryDate).isSameOrBefore(moment(values.issueDate))) {
            setBtnLoader(false);
            setErrormsg(CREATE_KYC_ADDRESS_CONST.ISSUE_DATE_VALIDATION_VALIDATION);
            ref?.current?.scrollTo({ y: 0, animated: true });
            return;
        }

        const formattedValues = {
            ...values,
            dob: values?.dob ? moment(values.dob).format('YYYY-MM-DD') : null,
            docExpiryDate: values?.docExpiryDate ? moment(values.docExpiryDate).toISOString() : null,
            faceImage: values?.faceImage ?? null,
            signature: values?.signature ?? null,
            profilePicBack: values?.profilePicBack ?? null,
            profilePicFront: values?.profilePicFront ?? null,
            handHoldingIDPhoto: values?.handHoldingIDPhoto ?? null,
            biometric: values?.biometric ?? null,
            emergencyContactName: values?.emergencyContactName ?? "",
        };

        const applycardData = prepareKycData(formattedValues);
        const ApplyCardObj = {
            CardId: props?.route?.params?.cardId,
            kycUpdateModel: applycardData
        };
        const routeParams = props?.route?.params;

        const obj = {
            KycUpdateModel: {
                customerId: userInfo?.id ?? "",
                cardId: props?.route?.params?.cardId ?? "",
                firstName: safeEncrypt(formattedValues?.firstName),
                lastName: safeEncrypt(formattedValues?.lastName),
                country: formattedValues?.country ?? "",
                addressCountry: formattedValues?.addressCountry ?? "",
                dob: safeEncrypt(formattedValues?.dob),
                email: safeEncrypt(formattedValues?.email),
                gender: formattedValues?.gender ?? "",
                biometric: formattedValues?.biometric ?? null,
                docExpiryDate: safeEncrypt(formattedValues?.docExpiryDate || ""),
                mixDoc: formattedValues?.mixDoc || "",
                emergencyContactName: formattedValues?.emergencyContactName || "",
                faceImage: formattedValues?.faceImage || "",
                addressLine1: safeEncrypt(formattedValues?.addressLine1 ?? ""),
                city: safeEncrypt(formattedValues?.city ?? ""),
                state: safeEncrypt(formattedValues?.state ?? ""),
                // town: encryptedData?.KycUpdateModel?.town ?? "",
                idType: formattedValues?.idType ?? "",
                idNumber: safeEncrypt(formattedValues?.idNumber ?? ""),
                issueDate: safeEncrypt(formattedValues?.issueDate ?? ""),
                profilePicFront: formattedValues?.profilePicFront ?? "",
                profilePicBack: formattedValues?.profilePicBack ?? "",
                signature: formattedValues?.signature ?? "",
                docIssueDate: safeEncrypt(formattedValues?.docIssueDate ?? ""),
                backDocImage: formattedValues?.backDocImage ?? "",
                mobileCode: safeEncrypt(formattedValues?.mobileCode ?? ""),
                mobile: safeEncrypt(formattedValues?.mobile ?? ""),
                handHoldingIDPhoto: formattedValues?.handHoldingIDPhoto ?? "",
                cardHandHoldingIDPhoto: formattedValues.handHoldingIDPhoto ?? "",
                postalCode: safeEncrypt(formattedValues?.postalCode ?? ""),
                occupation: formattedValues?.occupation ?? "",
                ipAddress: formattedValues?.ipAddress ?? "",
                annualSalary: parseFloat(formattedValues?.annualSalary) ?? 0,
                accountPurpose: formattedValues?.accountPurpose ?? "",
                expectedMonthlyVolume: parseFloat(formattedValues?.expectedMonthlyVolume )?? 0,
                requirement: formattedValues.requirement || "",
                addressLine2: formattedValues?.addressLine2 ?? "",
            },
            cardId: props?.route?.params?.cardId,
            name: props?.route?.params?.cardName,
            type: props?.route?.params?.cardType || props?.route?.params?.type,
            noteType: acceptedTerms?.noteType || "",
            note: acceptedTerms?.noteType?.toLowerCase() === 'dynamic' ? JSON.stringify(acceptedTerms?.note || []).toLowerCase() : "",
            personalAddressId: values?.addressId || formattedValues?.addressId || "00000000-0000-0000-0000-000000000000",
            companyApplicationModel: null,

        }
        const navParams = {
            logo: routeParams?.logo,
            cardName: routeParams?.cardName,
            cardType: routeParams?.cardType || routeParams?.type,
            cardId: routeParams?.cardId,
            cardPrice: routeParams?.cardPrice,
            currency: routeParams?.currency || routeParams?.cardCurrency,
            supportedPlatforms: routeParams?.supportedPlatforms,
            kycType: routeParams?.kycType,
            isCustomerCreated: routeParams?.isCustomerCreated,

        };

        try {
            dispatch(setApplyCardData(applycardData));
            dispatch({ type: 'SET_KYC_FORM_DATA', payload: formattedValues });

            if (routeParams?.cardProcessType?.toLowerCase() === "doublestep") {
                const response = await CardsModuleService.postDoubleStepCardApply(obj);
                if (response?.status === 200) {
                    props.navigation.navigate("CardSetupStatus", {
                        ...navParams,
                        cardProcessType: routeParams?.cardProcessType?.toLowerCase(),
                        cardHolderStatusId: response?.data,
                    });
                    dispatch(setCardHolderStatusId(response?.data));
                    return;
                }
                else {
                    setErrormsg(isErrorDispaly(response));
                    ref?.current?.scrollTo({ y: 0, animated: true });


                }
                return;
            }
            if (routeParams?.screenName === "GLOBAL_CONSTANTS.BIND_CARD_SCREEN") {
                const response = await CardsModuleService.postQuickLinkApplyCard(ApplyCardObj);
                if (response?.status === 200) {
                    succussRbRef?.current?.open();
                }
            } else {
                props.navigation.navigate("ApplyCard", navParams);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            ref?.current?.scrollTo({ y: 0, animated: true });
        } finally {
            setBtnLoader(false);
        }
    };
    const getListOfBeneficiaryTypes = async () => {
        try {
            const response = await CardsModuleService.getCoreLookups() as BeneficiaryResponse ;
            if (response?.ok) {
                setData(prevState => ({
                    ...prevState,
                    beneficiaryType: response?.data?.BeneficiaryTypes
                }));

                setErrormsg("");
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const selectType = (value: string, setFieldValue: (field: string, value: string) => void) => {
        setFormData(prevState => ({
            ...prevState,
            beneficiaryType: value,
            beneficiary: '',
            firstName: "",
            lastName: "",
            middleName: "",
            country: "",
            addressCountry: "",
            state: "",
            dob: "",
            gender: "",
            city: "",
            town: "",
            addressLine1: "",
            mobile: "",
            mobileCode: "",
            email: "",
            idType: "Passport",
            idNumber: "",
            docExpiryDate: "",
            postalCode: "",
            faceImage: "",
            signature: "",
            profilePicBack: "",
            profilePicFront: "",
            handHoldingIDPhoto: "",
            biometric: "",
            emergencyContactName: "",
            kycRequirements: "",
            idImage: null,
            address: null,
            addressId: null,
            docNumber: null,
            faceImage1: null,
            mixedPhoto: null,
            occupation: null,
            annualSalary: null,
            sourceOfIncome: null,
            accountPurpose: null,
            expectedMonthlyVolume: null,
            issueDate: null,
            addressLine2: null,
            isDefault: false,
            documentTypeCode: "",
            isDocumentsRequriedOrNot: false
        }));
        setFieldValue('beneficiary', "");

        if (value) {
            getListBenefiary(value);
        }
    };
    const selectBeneficiary = (beneficiary: string, values: FormData) => {
        setFormData((prevState): FormData => ({
            ...prevState,
            beneficiaryType: values.beneficiaryType,
            beneficiary: beneficiary,
            firstName: "",
            lastName: "",
            middleName: "",
            country: "",
            state: "",
            dob: "",
            gender: "",
            city: "",
            town: "",
            addressLine1: "",
            mobile: "",
            mobileCode: "",
            email: "",
            idType: "",
            idNumber: "",
            docExpiryDate: "",
            postalCode: "",
            faceImage: "",
            signature: "",
            profilePicBack: "",
            profilePicFront: "",
            handHoldingIDPhoto: "",
            biometric: "",
            emergencyContactName: "",
            kycRequirements: "",
            idImage: null,
            address: null,
            addressId: null,
            docNumber: null,
            faceImage1: null,
            mixedPhoto: null,
            occupation: null,
            annualSalary: null,
            sourceOfIncome: null,
            accountPurpose: null,
            expectedMonthlyVolume: null,
            issueDate: null,
            addressLine2: "",
            isDefault: false,
            documentTypeCode: "",
            isDocumentsRequriedOrNot: false,
            addressCountry: ""
        }));
        const findData = data?.beneficiary?.find((item: Beneficiary) => item?.name == beneficiary);
        if (findData) {
            getUbosDetails(findData?.id)
        }
    }
    const getListBenefiary = async (type: string) => {
        try {
            const response = await CardsModuleService.getBeneficiaries(type);
            if (response?.ok) {
                setData(prevState => ({
                    ...prevState,
                    beneficiary: response?.data as Beneficiary[]
                }));
                setErrormsg("");
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const getUbosDetails = async (id: string) => {
        try {
            const response = await CardsModuleService.getUbosDetails(id);
            if (response?.ok) {
                setData(prevState => ({
                    ...prevState,
                    ubosDetails: response?.data as UbosDetails
                }));
                const ubosData = response?.data as UbosDetails;
                setFormData(prevData => ({
                    ...prevData,
                    firstName: ubosData?.firstName ? decryptAES(ubosData.firstName) : "",
                    lastName: ubosData?.lastName ? decryptAES(ubosData.lastName) : "",
                    middleName: ubosData?.middleName ?? "",
                    email: ubosData?.email ? decryptAES(ubosData.email) : "",
                    mobile: ubosData?.phoneNo || ubosData?.phoneNumber ? decryptAES(ubosData.phoneNo || ubosData.phoneNumber) : "",
                    mobileCode: ubosData?.phoneCode ? decryptAES(ubosData.phoneCode) : "",
                    country: ubosData?.country ?? "",
                    addressCountry: ubosData?.addressCountry ?? "",
                    city: ubosData?.city ?? "",
                    gender: ubosData?.gender ?? "",
                    dob: ubosData?.dob ? (isUSDateFormat(ubosData.dob) ? formatDateTimeDatePicker(ubosData.dob) : ubosData.dob) : "",
                    idType: ubosData?.idType === null ? "Passport" : ubosData?.idType ?? "",
                    profilePicFront: ubosData?.docDetails?.frontIdPhoto || ""
                }));
                setErrormsg("");
            } else {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            ref?.current?.scrollTo({ y: 0, animated: true });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const handleBack = () => {
        dispatch({ type: 'SET_KYC_FORM_DATA', payload: formData }); // Save current form data
        props?.navigation?.goBack();
    };
    const handleValidationSave = (validateForm: () => Promise<Record<string, string>>) => {
        validateForm().then(async (errors: Record<string, string>) => {
            if (Object.keys(errors)?.length > 0) {
                ref?.current?.scrollTo({ y: 0, animated: true });
                setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD"));
            }
        })
    };
    useHardwareBackHandler(() => {
        props?.navigation?.goBack()
    })
    const handleGoback = () => {
        props?.navigation?.goBack()
    };
    const handleCloseError = () => {
        setErrormsg("")
    }
    const onBindSuccessDone = () => {
        succussRbRef?.current?.close();
        props?.navigation?.reset({
            index: 0,
            routes: [{
                name: 'Dashboard',
                params: { initialTab: "GLOBAL_CONSTANTS.CARDS" },
                animation: 'slide_from_left'
            }],
        });
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {applyCardsLoading && (
                <View style={[commonStyles.flex1]}>
                    <DashboardLoader />
                </View>
            )}
            {!applyCardsLoading && <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={s(64)}
            >
                <ScrollViewComponent
                    ref={ref}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    style={[commonStyles.flex1, commonStyles.screenBg]}

                >
                    <Container style={commonStyles.container}>

                        <View>

                            {!applyCardsLoading &&


                                <View style={[]}>

                                    <PageHeader title={"GLOBAL_CONSTANTS.APPLICATION_INFO"} onBackPress={handleGoback} />
                                    {errormsg && (<ErrorComponent message={errormsg} onClose={handleCloseError} />)}


                                </View>
                            }
                        </View>

                        <Formik
                            initialValues={formData}
                            enableReinitialize
                            validationSchema={Yup.lazy((values) => generateValidationSchema(kycReqList, values))}
                            onSubmit={handleSaveKycData}
                            validateOnBlur={false} // Keep this as true
                            validateOnChange={true}
                        >
                            {(formik) => {
                                const { touched, handleChange, handleSubmit, errors, handleBlur, setFieldValue, values, validateForm, setFieldError } =
                                    formik;
                                return (
                                    <>
                                        {(kycReqList?.length > 0 && userInfo?.accountType == CARDS_CONST.BUSINESS) &&
                                            <View>
                                                <Field
                                                    modalTitle={"GLOBAL_CONSTANTS.SELECT_ROLE_FOR_KYC"}
                                                    activeOpacity={0.9}
                                                    style={{ backgroundColor: 'NEW_COLOR.SCREENBG_WHITE', borderColor: 'NEW_COLOR.SEARCH_BORDER' }}
                                                    label={"GLOBAL_CONSTANTS.SELECT_ROLE_FOR_KYC"}
                                                    customContainerStyle={{}}
                                                    name={'beneficiaryType'}
                                                    onChange={(item: string) => selectType(item, setFieldValue)}
                                                    error={errors.beneficiaryType}
                                                    handleBlur={handleBlur}
                                                    data={data?.beneficiaryType}
                                                    placeholder={"GLOBAL_CONSTANTS.SELECT_ROLE_FOR_KYC"}
                                                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                    component={CustomPicker}
                                                />
                                                <View style={commonStyles.formItemSpace} />
                                                <Field
                                                    modalTitle={"GLOBAL_CONSTANTS.SELECT_INDIVIDUAL_TO_VERIFY"}
                                                    activeOpacity={0.9}
                                                    style={{ backgroundColor: 'NEW_COLOR.SCREENBG_WHITE', borderColor: 'NEW_COLOR.SEARCH_BORDER' }}
                                                    label={"GLOBAL_CONSTANTS.SELECT_INDIVIDUAL_TO_VERIFY"}
                                                    touched={touched.beneficiary}
                                                    customContainerStyle={{}}
                                                    name={'beneficiary'}
                                                    onChange={(item: string) => selectBeneficiary(item, values)}
                                                    error={errors.beneficiary}
                                                    handleBlur={handleBlur}
                                                    data={data?.beneficiary}
                                                    placeholder={"GLOBAL_CONSTANTS.SELECT_INDIVIDUAL_TO_VERIFY"}
                                                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                    component={CustomPicker}
                                                    Children={<LabelComponent text=" *" style={commonStyles.textError} />}
                                                />
                                                <View style={commonStyles.formItemSpace} />
                                            </View>}
                                        {kycReqList?.length > 0 && (
                                            <KycFields touched={touched}
                                                errors={errors}
                                                handleBlur={handleBlur}
                                                values={values}
                                                setFieldValue={setFieldValue}
                                                handleChange={handleChange}
                                                kycReqList={kycReqList}
                                                handleCloseKyc={props.closeModal}
                                                setErrors={setFieldError}
                                                cardId={props?.route?.params?.cardId}
                                                keyRequirements={keyRequirements}
                                                formData={formData} />

                                        )}
                                        <View style={[commonStyles.mt24]} />
                                        <ButtonComponent
                                            title={props?.route?.params?.screenName == FORM_DATA_CONSTANTS.BIND_CARD_SCREEN ? "GLOBAL_CONSTANTS.SUBMIT" : "GLOBAL_CONSTANTS.NEXT"}
                                            disable={undefined}
                                            loading={btnLoader}
                                            onPress={() => {
                                                handleValidationSave(validateForm)
                                                handleSubmit();
                                            }}
                                        />
                                        <View style={[commonStyles.mb43]} />
                                    </>
                                );
                            }}
                        </Formik>

                    </Container>


                </ScrollViewComponent>
                <CustomRBSheet
                    refRBSheet={succussRbRef}
                    height={"Medium"}
                    draggable={false} closeOnPressMask={false}
                >
                    <BindCardSuccess onDone={onBindSuccessDone} ref={succussRbRef} />

                </CustomRBSheet>
            </KeyboardAvoidingView>}

        </ViewComponent>
    );
};

export default KycForm;
const styles = StyleSheet.create({
    opacity6: { opacity: 0.6, },
});
