import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Switch,
    TextInput,
} from "react-native";
import { useSelector } from "react-redux";
import { isErrorDispaly } from "../../../../utils/helpers";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { Field, Formik, FormikErrors } from "formik";
import CustomPickerAcc from '../../../../components/customPicker/CustomPicker';
import InputDefault from '../../../../components/textInputComponents/DefaultFiat';
import PhoneCodePicker from "../../../../components/phonePicker/phonePicker";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import ViewComponent from "../../../../components/view/view";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import ButtonComponent from "../../../../components/buttons/button";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import DashboardLoader from "../../../../components/loader";
import { s } from "../../../../constants/styels/scale";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import { AddressShema, CreateAccSchema } from "./schema";
import LabelComponent from "../../../../components/textComponets/lableComponent/lable";
import CheckboxWithOutFormik from "../../../../components/checkBoxes/basic/checkBoxComponent";
import CreateAccountService from "../../../../apiServices/bank/createAccount";
import useCountryData from "../../../../hooks/countryDataHook/useCountryData";
import Toggle from "../../../../components/toggle/toggle";

// --- INTERFACES & TYPES ---
interface CountryDetail { name: string; code: string | null; }
interface CountryWithDetails { name: string; code: string; details?: CountryDetail[]; }
interface PhoneCodeItem { name: string; code: string; }



export interface AddressFormValues {
    firstName: string;
    lastName: string;
    country: string;
    state: string;
    city: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    email: string;
    phoneCode: string;
    town: string;
    isDefault?: boolean;
    favoriteName?: string;
    addressType?: string;
    isTradingAddress?: boolean;
}
interface CommonAddressProps {
    isAddAddress?: boolean;
    initValues?: AddressFormValues;
    handleSave: (values: AddressFormValues) => Promise<any>;
    route?: any;
    isEnabled?: boolean;
    isTradingAddress?: boolean;
    onToggleDefault?: (value: boolean) => void;
    onToggleTrading?: (value: boolean) => void;
    useStateInput?: boolean;
    showNameFields?: boolean;
    useKycAddressTypes?: boolean;
    kycRequirements?: any;
}
const CommonAddress = (props: CommonAddressProps) => {
    const { isAddAddress, useStateInput = false, showNameFields = false, useKycAddressTypes = false } = props;
    const ref = useRef<any>(null);
    const [errormsg, setErrormsg] = useState<string>("");
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    // Use optimized country data hook
    const {
        countries: countriesData,
        countriesWithStates,
        loading: countryLoading,
        error: countryError,
    } = useCountryData({
        loadCountries: true,
        loadStates: true,
        loadPhoneCodes: true,
        autoLoad: true
    });

    // Transform data for compatibility
    const countries = countriesData.map(c => ({ name: c.name, details: c.details || [] }));
    const [statesList, setStatesList] = useState<CountryDetail[]>([]);
    const [addressTypeList, setAddressTypeList] = useState<any[]>([]);
    const [editLoading, setEditLoading] = useState<boolean>(false);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const { decryptAES } = useEncryptDecrypt();

    const [initValues, setInitValues] = useState<AddressFormValues>({
        firstName: (props?.route?.params?.KycInformation ? props.route.params.kycInfoData?.firstName : undefined) ?? "",
        lastName: (props?.route?.params?.KycInformation ? props.route.params.kycInfoData?.lastName : undefined) ?? "",
        favoriteName: "",
        addressType: "",
        country: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? userInfo?.country : undefined) ?? "",
        state: "",
        city: "",
        phoneNumber: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? userInfo?.phoneNo : undefined) ?? "",
        addressLine1: "",
        addressLine2: "",
        postalCode: "",
        email: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? (decryptAES(userInfo?.email) ?? undefined) : undefined) ?? "",
        phoneCode: (props?.route?.params?.KycInformation || props?.route?.params?.KybInformation ? userInfo?.phonecode : undefined) ?? "",
        town: "",
        isDefault: true,
    });

    useEffect(() => {
        getAddressTypes();
        setInitValues({ ...props.initValues });
    }, [props?.initValues]);

    // Handle country data errors
    useEffect(() => {
        if (countryError) {
            setErrormsg(countryError);
        }
    }, [countryError]);

    useEffect(() => {
        if (initValues.country && countriesWithStates.length > 0) {
            const selectedCountryForStates: any = countriesWithStates.find(c => c.name === initValues.country);
            if (selectedCountryForStates && selectedCountryForStates.details?.length > 0) {
                setStatesList(selectedCountryForStates.details);

            } else {

                setStatesList([]);
            }
        }
    }, [initValues.country, countriesWithStates]);


    const getAddressTypes = async () => {
        try {
            if (useKycAddressTypes && props.kycRequirements) {
                // For UBO forms, use KYC address types from API response
                const response = await CreateAccountService?.getAllAdressTypes();
                
                if (response?.ok && response?.data) {
                    const data = response?.data as any;
                    
                    // Use KYC address types for UBO forms
                    const addressTypes = data?.KYC || [];
                    setAddressTypeList(addressTypes);
                } else {
                    // Fallback to default KYC types
                    const defaultKycTypes = [
                        { name: "Residential Address", code: "Residential Address" },
                        { name: "Mailing Address", code: "Mailing Address" }
                    ];
                    setAddressTypeList(defaultKycTypes);
                }
            } else {
                // Original logic for regular address forms
                const response = await CreateAccountService?.getAllAdressTypes();
                if (response?.ok && response?.data) {
                    const data = response?.data as any;
                    const addressTypes = userInfo?.accountType?.toLowerCase() === 'business' ? data?.KYB || [] : data?.KYC || [];
                    setAddressTypeList(addressTypes);
                } else {
                    const error = isErrorDispaly(response);
                    setErrormsg(error);
                }
            }
        } catch (error) {
            const errorMsg = isErrorDispaly(error);
            setErrormsg(errorMsg);
        }
    };

    const handleValidationSave = (validateForm: () => Promise<FormikErrors<AddressFormValues>>) => {
        validateForm().then(async (a: FormikErrors<AddressFormValues>) => {
            if (Object.keys(a).length > 0) {
                ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                setErrormsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
            }
        });
    };

    const handleCountryChange = (countryName: string, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        setFieldValue('country', countryName);
        setFieldValue('state', '');
        setFieldValue("town", "");
        const selectedCountryForTowns = countries?.find(c => c?.name === countryName);
        const selectedCountryForStates: any = countriesWithStates?.find(c => c?.name === countryName);
        if (selectedCountryForStates && selectedCountryForStates.details?.length > 0) {
            setStatesList(selectedCountryForStates.details);
        } else {
            setStatesList([]);
        }
    };

    const handlePhoneCode = (item: PhoneCodeItem, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        setFieldValue("phoneCode", item?.code);
    };

    const handleSave = async (values: AddressFormValues) => {
        setBtnLoading(true);
        setErrormsg("");
        
        try {
            const response = await props.handleSave(values);
            
            if (response?.ok) {
                // Success logic
                setBtnLoading(false);
                return;
            } else {
                setErrormsg(isErrorDispaly(response));
                ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
                setBtnLoading(false);
            }
        } catch (error: any) {
            setBtnLoading(false);
            
            // Handle different types of errors
            if (error?.data?.title) {
                // API validation error (422)
                setErrormsg(error.data.title);
            } else if (error?.message) {
                // Generic error message
                setErrormsg(error.message);
            } else {
                // Fallback error message
                setErrormsg(isErrorDispaly(error));
            }
            
            // Scroll to top to show error
            ref?.current?.scrollTo({ x: 0, y: 0, animated: true });
        }
    };

    const handleCloseError = useCallback(() => { setErrormsg("") }, []);
    const toggleSwitch = (value: any, setFieldValue: any) => setFieldValue("isDefault", value);

    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            {(editLoading || countryLoading) ? (
                <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </ViewComponent>
            ) : (
                <ScrollViewComponent ref={ref} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {errormsg !== "" && (<ErrorComponent message={errormsg} onClose={handleCloseError} />)}
                    <Formik
                        initialValues={initValues}
                        onSubmit={handleSave}
                        validationSchema={isAddAddress ? AddressShema : CreateAccSchema}
                        enableReinitialize
                        validateOnChange={true}
                        validateOnBlur={true}
                    >
                        {(formik) => {
                            const { touched, handleSubmit, errors, handleBlur, values, setFieldValue, validateForm, handleChange } = formik;
                            return (
                                <ViewComponent>
                                    {/* --- CONDITIONAL FIELDS --- */}
                                    {!isAddAddress ? (
                                        <>
                                            {showNameFields && (
                                                <>
                                                    <Field touched={touched.firstName} name="firstName" label={"GLOBAL_CONSTANTS.FIRST_NAME"} error={errors.firstName} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"} component={InputDefault} editable={true} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <Field touched={touched.lastName} name="lastName" label={"GLOBAL_CONSTANTS.LAST_NAME"} error={errors.lastName} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"} component={InputDefault} editable={true} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Field maxLength={50} touched={touched.favoriteName} name="favoriteName" label={"GLOBAL_CONSTANTS.FAVORITE_NAME"} error={errors.favoriteName} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.ENTER_FAVORITE_NAME"} component={InputDefault} editable={true} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <LabelComponent text={"GLOBAL_CONSTANTS.ADDRESS_TYPE"} style={[commonStyles.inputLabel]}><LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                                            <Field activeOpacity={0.9} touched={touched?.addressType} name="addressType" error={errors?.addressType} handleBlur={handleBlur} modalTitle={"GLOBAL_CONSTANTS.SELECT_ACCOUNT_TYPE"} data={addressTypeList} placeholder={"GLOBAL_CONSTANTS.SELECT_ADDRESS_TYPE"} component={CustomPickerAcc} onChange={(item: any) => setFieldValue("addressType", item)} sheetHeight={s(300)} isOnlycountry={true} />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                        </>
                                    )}

                                    {/* Show name fields for banks when isAddAddress is true */}
                                    {isAddAddress && showNameFields && (
                                        <>
                                            <Field touched={touched.firstName} name="firstName" label={"GLOBAL_CONSTANTS.FIRST_NAME"} error={errors?.firstName} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.FIRST_NAME_PLACEHOLDER"} component={InputDefault} editable={true} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field touched={touched.lastName} name="lastName" label={"GLOBAL_CONSTANTS.LAST_NAME"} error={errors?.lastName} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.LAST_NAME_PLACEHOLDER"} component={InputDefault} editable={true} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                        </>
                                    )}

                                    {/* --- COMMON FIELDS --- */}
                                    {/* <Field maxLength={100} touched={touched.email} name="email" label={"GLOBAL_CONSTANTS.EMAIL"} error={errors.email} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.EMAIL_PLACEHOLDER"} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                    <ViewComponent style={[commonStyles.formItemSpace]} /> */}

                                    <LabelComponent text={"GLOBAL_CONSTANTS.COUNTRY"} style={[commonStyles.inputLabel]}><LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                                    <Field activeOpacity={0.9} touched={touched?.country} name="country" error={errors?.country} handleBlur={handleBlur} modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"} data={countries} placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"} component={CustomPickerAcc} onChange={(item: any) => handleCountryChange(item, setFieldValue)} sheetHeight={s(600)} isOnlycountry={true} />
                                    <ViewComponent style={[commonStyles.formItemSpace]} />

                                    {/* --- DYNAMIC STATE FIELD --- */}


                                    {useStateInput ? (
                                        <Field touched={touched?.state} name="state" label={"GLOBAL_CONSTANTS.STATE"} error={errors.state} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.STATE_PLACEHOLDER"} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                    ) : (
                                        <>
                                            <LabelComponent text={"GLOBAL_CONSTANTS.STATE"} style={[commonStyles.inputLabel]}><LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                                            <Field
                                                activeOpacity={0.9}
                                                touched={touched?.state}
                                                name="state"
                                                error={errors?.state}
                                                handleBlur={handleBlur}
                                                modalTitle={"GLOBAL_CONSTANTS.SELECT_STATE"}
                                                data={statesList}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_STATE"}
                                                component={CustomPickerAcc}
                                                onChange={(item: any) => setFieldValue("state", item)}
                                                sheetHeight={s(600)}
                                                isOnlycountry={true}
                                            />
                                        </>
                                    )}


                                    <ViewComponent style={[commonStyles.formItemSpace]} />

                                    {/* <LabelComponent text={"GLOBAL_CONSTANTS.TOWN"} style={[commonStyles.inputLabel]}><LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                                    <Field maxLength={100} activeOpacity={0.9} touched={touched?.town} name="town" error={errors?.town} handleBlur={handleBlur} modalTitle={"GLOBAL_CONSTANTS.SELECT_TOWN"} data={townsList} placeholder={"GLOBAL_CONSTANTS.SELECT_TOWN"} component={CustomPickerAcc} onChange={(item: any) => setFieldValue("town", item)} sheetHeight={s(600)} isOnlycountry={true} />
                                    <ViewComponent style={[commonStyles.formItemSpace]} /> */}

                                    <Field maxLength={100} touched={touched.city} name="city" label={"GLOBAL_CONSTANTS.CITY"} error={errors.city} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.CITY_PLACEHOLDER"} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                    <ViewComponent style={[commonStyles.formItemSpace]} />

                                    <Field maxLength={100} touched={touched.addressLine1} name="addressLine1" label={"GLOBAL_CONSTANTS.ADDRESS_LINE1"} error={errors.addressLine1} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE1_PLACEHOLDER"} component={InputDefault} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                    <ViewComponent style={[commonStyles.formItemSpace]} />

                                    <Field maxLength={100} touched={touched.addressLine2} name="addressLine2" label={"GLOBAL_CONSTANTS.ADDRESS_LINE2"} error={errors.addressLine2} handleBlur={handleBlur} placeholder={"GLOBAL_CONSTANTS.ADDRESS_LINE2_PLACEHOLDER"} component={InputDefault} />
                                    <ViewComponent style={[commonStyles.formItemSpace]} />

                                    <Field maxLength={8} touched={touched.postalCode} name="postalCode" label={"GLOBAL_CONSTANTS.POSTAL_CODE"} error={errors.postalCode} handleBlur={handleBlur} autoCapitalize="words" placeholder={"GLOBAL_CONSTANTS.POSTAL_CODE_PLACEHOLDER"} component={InputDefault} maxLength={8} requiredMark={<LabelComponent text=" *" style={commonStyles.textError} />} />
                                    <ViewComponent style={[commonStyles.formItemSpace]} />

                                    {/* <LabelComponent text={"GLOBAL_CONSTANTS.PHONE_NUMBER"} style={[commonStyles.inputLabel]}><LabelComponent text={"*"} style={commonStyles.textError} /></LabelComponent>
                                    <ViewComponent style={[commonStyles.relative, commonStyles.dflex, commonStyles.pr2]}>
                                        <PhoneCodePicker key={values.phoneCode} inputStyle={{ borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: touched?.phoneCode && errors?.phoneCode ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }} modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY_CODE"} customBind={["name", "(", "code", ")"]} data={countryCodelist} value={values?.phoneCode} placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_SELECT")} onChange={(item: PhoneCodeItem) => handlePhoneCode(item, setFieldValue)} sheetHeight={s(500)} isOnlycountry={true} />
                                        <TextInput maxLength={12} style={[commonStyles.flex1, commonStyles.textInput, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderColor: touched?.phoneNumber && errors?.phoneNumber ? NEW_COLOR.TEXT_RED : NEW_COLOR.INPUT_BORDER }]} placeholder={t("GLOBAL_CONSTANTS.PHONE_NUMBER_PLACEHOLDER")} placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR} onChangeText={(text) => { const formattedText = text.replace(/\D/g, "").slice(0, 13); handleChange('phoneNumber')(formattedText); }} onBlur={handleBlur("phoneNumber")} value={values.phoneNumber} keyboardType="phone-pad" multiline={false} />
                                    </ViewComponent>
                                    {(touched.phoneCode || touched.phoneNumber) && (errors.phoneNumber || errors.phoneCode) && (<ParagraphComponent multiLanguageAllows={true} style={[commonStyles.inputrequirederrormessage, commonStyles.mt4]} text={errors.phoneNumber || errors.phoneCode} />)} */}

                                    {!(props?.route?.params?.KycInformation ?? props?.route?.params?.KybInformation) && (
                                        <>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justify, commonStyles.gap10, commonStyles.mt20]}>
                                                <ParagraphComponent text={"GLOBAL_CONSTANTS.SET_AS_DEFAULT"} style={[commonStyles.primarytext]} multiLanguageAllows={true} />
                                                {/* <Switch trackColor={{ true: NEW_COLOR.TEXT_PRIMARY, false: NEW_COLOR.TEXT_link }} thumbColor={NEW_COLOR.THUMBTOGGLE_BG} ios_backgroundColor="" onValueChange={(value) => props.onToggleDefault ? props.onToggleDefault(value) : toggleSwitch(value, setFieldValue)} value={props.isEnabled !== undefined ? props.isEnabled : values.isDefault} /> */}
                                                <Toggle
                                                    onValueChange={(value) => props.onToggleDefault ? props.onToggleDefault(value) : toggleSwitch(value, setFieldValue)} value={props.isEnabled !== undefined ? props.isEnabled : values.isDefault} />
                                            </ViewComponent>
                                            {userInfo?.accountType?.toLowerCase() === 'business' && (
                                                <>
                                                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                                        <CheckboxWithOutFormik
                                                            label={t("GLOBAL_CONSTANTS.MAKE_THIS_MY_TRADING_ADDRESS")}
                                                            initialChecked={props?.isTradingAddress || false}
                                                            onChange={(value) => props?.onToggleTrading && props?.onToggleTrading(value)}
                                                            labelStyle={[commonStyles.fs14, commonStyles.fw400, commonStyles.primarytext]}
                                                            style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}
                                                        />
                                                    </ViewComponent>
                                                </>
                                            )}
                                        </>
                                    )}

                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    <ButtonComponent title="GLOBAL_CONSTANTS.SAVE" loading={btnLoading} onPress={() => { handleValidationSave(validateForm); handleSubmit(); }} />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    <ViewComponent style={[commonStyles.sectionGap]} />

                                </ViewComponent>
                            );
                        }}
                    </Formik>
                </ScrollViewComponent>
            )}
        </ViewComponent>
    );
};

export default CommonAddress;
