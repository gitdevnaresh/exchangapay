import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, TextInput, Linking } from "react-native";
import { Formik, Field } from "formik";
import CreateAccountService from '../../../../../apiServices/bank/createAccount';
import { formatDateTimeAPI, isErrorDispaly } from '../../../../../utils/helpers';
import CustomPicker from "../../../../../components/customPicker/CustomPicker";
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import OnBoardingService from '../../../../../apiServices/onBoarding';
import { useDispatch, useSelector } from 'react-redux';
import { CommonActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import Container from '../../../../../components/container/container';
import RadioButton from '../../../../../components/radiobutton/RadioButton';
import AuthService from '../../../../../apiServices/onBoarding/auth';
import { loginAction } from '../../../../../redux/actions/actions';
import { s } from '../../../../../constants/styels/scale';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { validatePhoneNumber } from '../../../../../utils/helpers/validation/commonValidations';
import { validateBusinessName, validateFirastName, validateLastName } from '../../schema';
import useEncryptDecrypt from '../../../../../hooks/encDecHook';
import ButtonComponent from '../../../../../components/buttons/button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ViewComponent from '../../../../../components/view/view';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import DashboardLoader from '../../../../../components/loader';
import PhoneCodePicker from '../../../../../components/phonePicker/phonePicker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomRBSheet from '../../../../../components/models/commonDrawer';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import { logEvent } from '../../../../../hooks/loggingHook';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import AlertsCarousel from '../../../Dashboard/components/allertCases';
import RenderHTML from 'react-native-render-html';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import DatePickerComponent from '../../../../../components/datePickers/formik/datePicker';
import ConfirmLogout from '../../../../commonScreens/logout/comfirmLogout';
import NoDataComponent from '../../../../../components/noData/noData';
import useCountryData from '../../../../../hooks/countryDataHook/useCountryData';
import useLogout from '../../../../../hooks/logout/useLogout';
import { store } from '../../../../../redux/reducers';
import { GenderOption, LocalRootStackParamList, LookupResponse, PhoneCodeListItem, PrivatePolicyResponse, RBSheetRefType, RegFormValues, RootState } from '../../interface';

type CustomerRigisterScreenProps = NativeStackScreenProps<LocalRootStackParamList, 'CustomerRigister'>;
type FormFieldNames = keyof RegFormValues;
type AppDispatch = typeof store.dispatch;


const CustomerRigister = (props: CustomerRigisterScreenProps) => {
    const { route } = props;
    const { accountType: routeAccountType, referralId: routeReferralId } = route.params || "";
    const [genderOptions, setGenderOptions] = useState<GenderOption[]>([]);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Use new country data hook
    const { countries, phoneCodes, genderPickerData, loading: countryLoading, error: countryError } = useCountryData({
        loadCountries: true,
        loadPhoneCodes: true,
        loadGenders: true,
    });
    const dispatch = useDispatch<AppDispatch>();
    const { encryptAES } = useEncryptDecrypt();
    const CustomeRbsheetRef = useRef<RBSheetRefType>(null);
    const [regVals, setRegVals] = useState<RegFormValues>({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        country: '',
        businessName: '',
        phoneCode: "",
        gender: '',
        state: "",
        city: "",
        addressLine1: "",
        postalCode: "",
        incorporationDate: null,
        isAccepted: false,
    });

    const userinfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    const navigation = useNavigation<NativeStackScreenProps<LocalRootStackParamList>['navigation']>();
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isCheckedError, setIsCheckedError] = useState<string | null>(null);
    const isFocused = useIsFocused();
    const { t } = useLngTranslation();
    const isEmployeeFromUserInfo = userinfo?.isEmployee;
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    // 1. Add state to track the currently focused field
    const [focusedField, setFocusedField] = useState<FormFieldNames | null>(null);
    const [templateContent, setTemplateContent] = useState<string | null>(null);
    const [templateTitle, setTemplateTile] = useState<string>('');
    const [templeteLoader, setTempleteLoader] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState(false);
    const scrollRef = useRef<KeyboardAwareScrollView | null>(null);
    const { logout } = useLogout();
    useEffect(() => {
        getLookupDetails();
        if (isEmployeeFromUserInfo) {
            setRegVals((prev) => ({
                ...prev,
                firstName: userinfo?.firstName ?? '',
                lastName: userinfo?.lastName ?? '',
                phoneNumber: userinfo?.phoneNo ?? '',
                country: userinfo?.country ?? '',
                phoneCode: userinfo?.phonecode ?? '',
            }))
        }
    }, [isFocused, isEmployeeFromUserInfo]);

    // Handle country data errors
    useEffect(() => {
        if (countryError) {
            setErrormsg(countryError);
        }
    }, [countryError]);
    const getLookupDetails = async () => {
        try {
            const response = await CreateAccountService.getListOfCountries() as LookupResponse;
            if (response?.ok) {
                if (response.data?.Gender) {
                    const mappedGenders = response.data.Gender.map((gender) => {
                        let key = gender.name.toUpperCase();
                        if (key === 'OTHERS') {
                            key = 'OTHER';
                        }
                        return { label: `GLOBAL_CONSTANTS.${key}`, value: gender.name };
                    });
                    setGenderOptions(mappedGenders);
                }
                setErrormsg(null)
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };
    const getPrivatePolicyData = async (type: string) => {
        setTempleteLoader(true);
        try {
            const response = await CreateAccountService.getPrivatePolicyTemplate(type, props?.route?.params?.accountType) as PrivatePolicyResponse;
            if (response?.ok && response.data) {
                const { templateContent, renderTarget } = response.data;
                if (renderTarget?.toLowerCase() === 'website') {
                    Linking.openURL(templateContent);
                    return;
                }
                setTemplateContent(templateContent);
                setErrormsg(null);
                CustomeRbsheetRef.current?.open();
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setTempleteLoader(false);
        }
    };
    const handleSubmit = async (values: RegFormValues) => {
        setErrormsg('')
        logEvent("Button Pressed", { action: "Registration button pressed", nextScreen: "Phone verification", currentScreen: "Registration" })
        const userInfo = {
            phoneNo: encryptAES(values.phoneNumber),
            phoneCode: encryptAES(`${values.phoneCode}`),
            country: values.country,
            isAccepted: values.isAccepted,
            referralId: routeReferralId ?? null,
            firstName: values.firstName || null,
            lastName: values.lastName || null,
            gender: values?.gender || null,
            businessName: values?.businessName || null,
            incorporationDate: values?.incorporationDate ? formatDateTimeAPI(values?.incorporationDate) : null,
        };
        setSaveLoading(true);
        const currentAccountType = routeAccountType || userinfo?.accountType;
        if (!currentAccountType) {
            setErrormsg(t("ERROR_ACCOUNT_TYPE_MISSING"));
            scrollRef?.current?.scrollToPosition(0, 0, true);
            setSaveLoading(false);
            return;
        }
        const saveRes = await OnBoardingService.saveUserInfo(userInfo, currentAccountType);
        if (saveRes.ok) {
            setSaveLoading(false);
            updateUserInfo(saveRes?.data);
        } else {
            setErrormsg(isErrorDispaly(saveRes));
            scrollRef?.current?.scrollToPosition(0, 0, true);
            setSaveLoading(false);
        }
    };

    const updateUserInfo = (values: unknown) => {
        AuthService.getMemberInfo().then((userLoginInfo) => {
            dispatch(loginAction(userLoginInfo?.data));
            setSaveLoading(false);
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: "RegistrationSuccess" }],
                })
            );
        }).catch((error: Error) => {
            setSaveLoading(false);
        })
    }

    const validatePersonalFields = (values: RegFormValues, errors: Partial<Record<keyof RegFormValues, string>>) => {
        if (!values.firstName) {
            errors.firstName = "GLOBAL_CONSTANTS.IS_REQUIRED";
        } else if (!validateFirastName(values.firstName)) {
            errors.firstName = "GLOBAL_CONSTANTS.INVALID_FIRST_NAME";
        }
        if (!values.lastName) {
            errors.lastName = "GLOBAL_CONSTANTS.IS_REQUIRED";
        } else if (!validateLastName(values.lastName)) {
            errors.lastName = "GLOBAL_CONSTANTS.INVALID_LAST_NAME";
        }
        if (!values.gender) {
            errors.gender = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
    };

    const validateBusinessFields = (values: RegFormValues, errors: Partial<Record<keyof RegFormValues, string>>) => {
        if (!values.businessName) {
            errors.businessName = "GLOBAL_CONSTANTS.IS_REQUIRED";
        } else if (!validateBusinessName(values?.businessName)) {
            errors.businessName = "GLOBAL_CONSTANTS.INVALID_BUSINESS_NAME";
        }
        if (!values?.incorporationDate) {
            errors.incorporationDate = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
    };

    const validate = (values: RegFormValues) => {
        const errors: Partial<Record<keyof RegFormValues, string>> = {};
        const currentAccountType = routeAccountType || userinfo?.accountType;
        if (currentAccountType !== 'Business') {
            validatePersonalFields(values, errors);
        } else {
            validateBusinessFields(values, errors);
        }
        if (!values?.phoneNumber) {
            errors.phoneNumber = "GLOBAL_CONSTANTS.IS_REQUIRED";
        } else if (!validatePhoneNumber(values?.phoneNumber)) {
            errors.phoneNumber = "GLOBAL_CONSTANTS.INVALID_PHONE_NUMBER";
        }
        if (!values.country) {
            errors.country = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
        if (!values.phoneCode) {
            errors.phoneCode = "GLOBAL_CONSTANTS.IS_REQUIRED";
        }
        if (!values.isAccepted) {
            errors.isAccepted = "GLOBAL_CONSTANTS.ERROR_ACCEPT_TERMS";
        }
        return errors;
    };
    useHardwareBackHandler(() => {
        navigation.goBack();
    })
    const handleBackArrowAddressView = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleCheck = (isActive: boolean) => {
        Keyboard.dismiss();
        setIsChecked(isActive);
        if (!isActive) {
            setIsCheckedError(t('GLOBAL_CONSTANTS.ERROR_ACCEPT_TERMS'));
        } else {
            setIsCheckedError(null);
        }
    };

    const handleClose = () => {
        setIsVisible(false)
    }
    const handleConfirm = async () => {
        setIsVisible(false)
        handleLogout();
    }
    const handleLogoutBtn = () => {
        setIsVisible(true)
    }

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);

    };
    const handleValidationSave = (validateForm: () => Promise<Partial<Record<keyof RegFormValues, string>>>) => {
        validateForm().then((errors) => {
            if (Object?.keys(errors)?.length > 0) {
                scrollRef?.current?.scrollToPosition(0, 0, true);
                setErrormsg(t("GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD"));
            }
        })
    };

    const handleOpenAgreementPopup = (type: string, title: string) => {
        Keyboard.dismiss();
        setTemplateTile(title);
        getPrivatePolicyData(type)
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                ref={scrollRef}
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >

                <Container style={[commonStyles.container]}>
                    <PageHeader showLogo={false} onBackPress={handleBackArrowAddressView} title={props?.route?.params?.accountType === "Business" ? "GLOBAL_CONSTANTS.BUSINESS_INFORMATION" : "GLOBAL_CONSTANTS.PERSIONAL_INFORMATION"} />
                    <AlertsCarousel screenName='Onbaording' />
                    <ViewComponent style={commonStyles.titleSectionGap} />
                    {loading && (
                        <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                            <DashboardLoader />
                        </ViewComponent>
                    )}
                    {!loading && (
                        <>
                            {errormsg && <ErrorComponent message={errormsg} onClose={() => setErrormsg(null)} />}
                            <ViewComponent >
                                <Formik
                                    initialValues={regVals}
                                    onSubmit={handleSubmit}
                                    validate={validate}
                                    enableReinitialize
                                >
                                    {({ touched, handleSubmit, handleChange, handleBlur, values, errors, setFieldValue, validateForm }) => {

                                        // 2. Define border color logic for phone group
                                        const phoneGroupHasError = (touched.phoneCode && errors.phoneCode) || (touched.phoneNumber && errors.phoneNumber);
                                        const isPhoneGroupFocused = focusedField === 'phoneNumber';
                                        const phoneGroupBorderColor = phoneGroupHasError ? NEW_COLOR.TEXT_RED : isPhoneGroupFocused ? NEW_COLOR.LABEL_HOVERCOLOR : NEW_COLOR.INPUT_BORDER;

                                        return (
                                            <>
                                                {(routeAccountType || userinfo?.accountType) !== 'Business' && <>
                                                    <ViewComponent style={[commonStyles.relative,]}>
                                                        <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.FIRST_NAME")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                                        {/* 3. Apply dynamic border color and event handlers */}
                                                        <TextInput style={[commonStyles.textInput, commonStyles.phonecodeplaceholder, { borderColor: touched.firstName && errors.firstName ? NEW_COLOR.TEXT_RED : focusedField === 'firstName' ? NEW_COLOR.LABEL_HOVERCOLOR : NEW_COLOR.INPUT_BORDER }]}
                                                            placeholder={t("GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER")}
                                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                            onChangeText={handleChange('firstName')}
                                                            onFocus={() => setFocusedField('firstName')}
                                                            value={values?.firstName}
                                                            maxLength={30}
                                                        />
                                                    </ViewComponent>
                                                    {touched.firstName && errors.firstName && <ParagraphComponent style={[commonStyles.inputrequirederrormessage]} text={errors.firstName} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <ViewComponent style={[commonStyles.relative,]}>
                                                        <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.LAST_NAME")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                                        <TextInput style={[commonStyles.textInput, commonStyles.phonecodeplaceholder, { borderColor: touched.lastName && errors.lastName ? NEW_COLOR.TEXT_RED : focusedField === 'lastName' ? NEW_COLOR.LABEL_HOVERCOLOR : NEW_COLOR.INPUT_BORDER }]}
                                                            placeholder={t("GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER")}
                                                            onChangeText={handleChange('lastName')}
                                                            onFocus={() => setFocusedField('lastName')}
                                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                            value={values.lastName}
                                                            maxLength={30}
                                                        />
                                                    </ViewComponent>
                                                    {touched.lastName && errors.lastName && <ParagraphComponent style={[commonStyles.inputrequirederrormessage]} text={errors.lastName} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <LabelComponent text={"GLOBAL_CONSTANTS.GENDER"} children={<LabelComponent
                                                        text=" *"
                                                        style={commonStyles.textError}
                                                    />} style={[commonStyles.mb10, commonStyles.textWhite]} />
                                                    <RadioButton
                                                        options={genderPickerData}
                                                        selectedOption={values.gender}
                                                        onSelect={(val: string) => setFieldValue('gender', val)}
                                                        nameField='name'
                                                        valueField='name'
                                                    />
                                                    {touched.gender && errors.gender && <ParagraphComponent style={[commonStyles.inputrequirederrormessage]} text={errors.gender} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                </>}
                                                {(routeAccountType || userinfo?.accountType) === 'Business' && <>
                                                    <ViewComponent style={[commonStyles.relative, commonStyles.pr5]}>
                                                        <LabelComponent style={[commonStyles.inputLabel]} text={t("GLOBAL_CONSTANTS.LEGAL_ENTITY_NAME")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                                        <TextInput style={[commonStyles.textInput, commonStyles.phonecodeplaceholder, { borderColor: touched.businessName && errors.businessName ? NEW_COLOR.TEXT_RED : focusedField === 'businessName' ? NEW_COLOR.LABEL_HOVERCOLOR : NEW_COLOR.INPUT_BORDER }]}
                                                            placeholder={t("GLOBAL_CONSTANTS.LEGAL_ENTITY_PLACEHOLDER")}
                                                            onChangeText={handleChange('businessName')}
                                                            onFocus={() => setFocusedField('businessName')}
                                                            placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                            value={values.businessName || ''}
                                                            maxLength={30}
                                                        />
                                                    </ViewComponent>
                                                    {touched.businessName && errors.businessName && <ParagraphComponent style={[commonStyles.inputrequirederrormessage]} text={errors.businessName} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                </>}
                                                <LabelComponent text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} style={[commonStyles.inputLabel]} >
                                                    <LabelComponent text={"*"} style={commonStyles.textError} />
                                                </LabelComponent>
                                                <ViewComponent style={[commonStyles.relative, commonStyles.dflex,]}>
                                                    <PhoneCodePicker
                                                        inputStyle={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: touched?.phoneCode && errors?.phoneCode ? NEW_COLOR.ERROR_BORDER : NEW_COLOR.INPUT_BORDER }}
                                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"}
                                                        customBind={["name", "(", "code", ")"]}
                                                        data={phoneCodes}
                                                        value={values?.phoneCode}
                                                        placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_SELECT")}
                                                        containerStyle={[]}
                                                        onChange={(item: PhoneCodeListItem) => setFieldValue('phoneCode', item?.code)}
                                                        sheetHeight={s(350)}
                                                        isOnlycountry={true}
                                                    />
                                                    <TextInput
                                                        style={[commonStyles.flex1, commonStyles.textInput, commonStyles.phonecodeplaceholder, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderColor: phoneGroupBorderColor, width: "100%" }]}
                                                        placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")}
                                                        onChangeText={(text) => {
                                                            const formattedText = text.replace(/[^0-9]/g, "").slice(0, 13);
                                                            handleChange('phoneNumber')(formattedText);
                                                        }}
                                                        onFocus={() => setFocusedField('phoneNumber')}
                                                        value={values.phoneNumber}
                                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                        keyboardType="phone-pad"
                                                        maxLength={13}
                                                    />
                                                </ViewComponent>
                                                {(touched.phoneCode || touched.phoneNumber) && (errors.phoneCode || errors.phoneNumber) && <ParagraphComponent style={[commonStyles.textRed, commonStyles.fs14, commonStyles.fw400, commonStyles.mt4]} text={errors.phoneNumber ?? errors.phoneCode} />}
                                                <ViewComponent style={[commonStyles.formItemSpace]} />
                                                <ViewComponent style={[commonStyles.relative]}>
                                                    <LabelComponent style={[commonStyles.inputLabel]} text={(routeAccountType || userinfo?.accountType) !== 'Business' ? t("GLOBAL_CONSTANTS.COUNTRY_OF_RECIDENCY") : t("GLOBAL_CONSTANTS.COUNTRY_OF_INCORPORATION")} children={<ParagraphComponent style={[commonStyles.textRed]} text={' *'} />} />
                                                    <Field
                                                        activeOpacity={0.9}
                                                        style={commonStyles.textInput}
                                                        touched={touched.country}
                                                        name="country"
                                                        error={errors.country}
                                                        data={countries}
                                                        placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                                        placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
                                                        component={CustomPicker}
                                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                                        sheetHeight={s(600)}
                                                        showCountryImages={true}
                                                        isOnlycountry={true}
                                                        onPress={() => {
                                                            Keyboard.dismiss();
                                                        }}
                                                    />
                                                    {(routeAccountType || userinfo?.accountType) === 'Business' && <ViewComponent style={[commonStyles.formItemSpace]} />}
                                                </ViewComponent>
                                                {(routeAccountType || userinfo?.accountType) === 'Business' && <DatePickerComponent name='incorporationDate' label={"GLOBAL_CONSTANTS.INCORPORATION_DATE"} maximumDate={new Date()} />}
                                                <ViewComponent style={[commonStyles.sectionGap]} />
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.gap8]}>
                                                    <MaterialCommunityIcons
                                                        name={values.isAccepted === true ? 'checkbox-outline' : 'checkbox-blank-outline'} size={s(22)}
                                                        color={values.isAccepted === true ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.CHECK_BOX}
                                                        touchableOpacity={0.6} onPress={() => setFieldValue('isAccepted', !values.isAccepted)}
                                                    />
                                                    <ViewComponent style={[commonStyles.flex1]}>
                                                        <ParagraphComponent text={"GLOBAL_CONSTANTS.BY_CLICK_SUBMIT"} style={[commonStyles.checkboxtextterms, commonStyles.flex1]} >
                                                            <ParagraphComponent text={"GLOBAL_CONSTANTS.AGREEMENT"} style={[commonStyles.checkboxtexttermslink]} onPress={() => handleOpenAgreementPopup('Aggrement', 'User Agreement')}>
                                                                <ParagraphComponent text={"GLOBAL_CONSTANTS.AND_IVE_READ"} style={[commonStyles.checkboxtextterms]} >
                                                                </ParagraphComponent>
                                                            </ParagraphComponent>
                                                            <ParagraphComponent text={"GLOBAL_CONSTANTS.PRIVACY_POLICY"} style={[commonStyles.checkboxtexttermslink]} onPress={() => handleOpenAgreementPopup('PrivacyPolicy', "Privacy Policy")} >
                                                            </ParagraphComponent>
                                                        </ParagraphComponent>
                                                    </ViewComponent>
                                                </ViewComponent>
                                                {touched.isAccepted && errors.isAccepted && <ParagraphComponent style={[commonStyles.inputrequirederrormessage]} text={errors.isAccepted} />}
                                                <ViewComponent style={[commonStyles.mt24, commonStyles.mb24,]} />
                                                <ButtonComponent title={"GLOBAL_CONSTANTS.CONTINUE"} onPress={() => {
                                                    handleValidationSave(validateForm);
                                                    handleSubmit();
                                                }} disable={saveLoading} loading={saveLoading} />
                                                <ViewComponent style={[commonStyles.buttongap]} />
                                                <ButtonComponent title={"GLOBAL_CONSTANTS.LOGOUT"} onPress={handleLogoutBtn} solidBackground={true} />
                                                <ViewComponent style={[commonStyles.sectionGap]} />
                                                <ViewComponent style={[commonStyles.mb10]} />
                                                <ConfirmLogout
                                                    isVisible={isVisible}
                                                    onClose={handleClose}
                                                    onConfirm={handleConfirm} />

                                            </>
                                        )
                                    }}
                                </Formik>
                            </ViewComponent>
                        </>
                    )}
                    <CustomRBSheet modeltitle={true} refRBSheet={CustomeRbsheetRef} title={templateTitle ?? ''} height={"Extra Large"} closeicon={true}>
                        {templeteLoader && <ActivityIndicator size="small" color={NEW_COLOR.TEXT_PRIMARY} />}
                        {!templeteLoader && <RenderHTML source={{ html: templateContent ?? '' }}
                            tagsStyles={{
                                p: commonStyles.textWhite,
                                h1: commonStyles.textWhite,
                                h2: commonStyles.textWhite,
                                li: commonStyles.textWhite,
                                span: { color: NEW_COLOR.TEXT_link },
                                a: { color: NEW_COLOR.TEXT_PRIMARY },
                                td: commonStyles.textWhite
                            }}
                            classesStyles={{
                                "text-paraColor": commonStyles.textWhite,
                                "text-subTextColor": commonStyles.textWhite,
                            }}
                            ignoredDomTags={["font"]}
                            ignoredStyles={["color", "backgroundColor"]}
                        />}

                        {(!templeteLoader && !templateContent) && (<ViewComponent style={[commonStyles.mt44]}>
                            <NoDataComponent Description={`No ${templateTitle} Found`} />
                        </ViewComponent>
                        )}
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </CustomRBSheet>
                </Container>
            </KeyboardAwareScrollView>
        </ViewComponent >


    );
};

export default CustomerRigister;
