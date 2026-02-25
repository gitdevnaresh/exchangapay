
import React, { useEffect, useRef, useState } from "react"
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { Field, Formik } from "formik";
import InputDefault from '../../../../../../components/textInputComponents/DefaultFiat';
import { isErrorDispaly } from "../../../../../../utils/helpers";
import CustomPicker from "../../../../../../components/customPicker/CustomPicker";
import { useNavigation } from "@react-navigation/native";
import PaymentService from "../../../../../../apiServices/payments";
import useEncryptDecrypt from "../../../../../../hooks/encDecHook";
import { useHardwareBackHandler } from "../../../../../../hooks/backHandleHook";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import { PAYMENT_LINK_CONSTENTS } from "../../../constants";
import { invoiceDetailsSchema } from "../../../schema";
import { Country, InvoiceInitValues, StateIterface } from "../../../interface";
import ButtonComponent from "../../../../../../components/buttons/button";
import ViewComponent from "../../../../../../components/view/view";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import TextMultiLanguage from "../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ErrorComponent from "../../../../../../components/errorDisplay/errorDisplay";
import LabelComponent from "../../../../../../components/textComponets/lableComponent/lable";
import Container from "../../../../../../components/container/container";
import SafeAreaViewComponent from "../../../../../../components/safeArea/safeArea";
import DashboardLoader from "../../../../../../components/loader";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import { useLngTranslation } from "../../../../../../hooks/languagesHook/useLngTranslation";
import DatePickerComponent from "../../../../../../components/datePickers/formik/datePicker";
import useCountryData from "../../../../../../hooks/countryDataHook/useCountryData";


const InvoiceForm = (props: any) => {
    const nameRef = useRef();
    const scrollRef = useRef<any>(null);
    // Use optimized country data hook
    const {
        countries: countriesData,
        countriesWithStates,
        loading: countryLoading,
        error: countryError
    } = useCountryData({
        loadCountries: true,
        loadStates: true,
    });

    // Transform data for compatibility
    const countries = countriesData;
    const allCountryData = countriesWithStates;

    const [errorMsg, setErrormsg] = useState<any>('');
    const [filteredStates, setFilteredStates] = useState<StateIterface[]>([]);
    const [invoiceCurrency, setInvoiceCurrency] = useState();
    const [loading, setLoading] = useState<boolean>(false)
    const navigation = useNavigation<any>();
    const [buttonLoader, setButtonLoader] = useState<boolean>(false)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const [initValues, setInitValues] = useState<InvoiceInitValues>({
        invoiceNumber: "",
        issuedDate: (() => {
            const d = new Date();
            d.setHours(12, 0, 0, 0);
            return d;
        })(),
        dueDate: "",
        companyName: "",
        clientName: "",
        emails: "",
        country: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        taxIdentificationNumber: "",
        invoiceCurrency: "",
        orderId: "",
    });
    const { decryptAES } = useEncryptDecrypt();

    useEffect(() => {
        getInvoiceCoinsLookup();
        if (props?.route?.params?.id) {
            getPaymentDetails();
        }
    }, []);

    // Handle country data errors
    useEffect(() => {
        if (countryError) {
            setErrormsg(countryError);
        }
    }, [countryError]);

    // New useEffect to pre-populate states when in edit mode
    useEffect(() => {
        if (props?.route?.params?.id && initValues.country && allCountryData.length > 0) {
            const selectedCountryData = allCountryData.find(country => country?.name?.toLowerCase() === initValues.country.toLowerCase());
            if (selectedCountryData && selectedCountryData.details) {
                setFilteredStates(selectedCountryData.details);
            }
        }
    }, [allCountryData, initValues.country, props?.route?.params?.id]);


    const getPaymentDetails = async () => {
        setLoading(true)
        try {
            const response: any = await PaymentService.getGenerateInvoiceDetails(props?.route?.params?.id);
            if (response.ok) {
                const decryptedData = {
                    invoiceNumber: response.data.invoiceNumber,
                    issuedDate: response.data.issuedDate,
                    dueDate: response.data.dueDate,
                    companyName: response.data.companyName,
                    clientName: response.data.clientName,
                    emails: response.data.emails ? decryptAES(response.data.emails) : "",
                    country: response.data.country,
                    streetAddress: response.data.streetAddress,
                    city: response.data.city,
                    state: response.data.state,
                    zipCode: response.data.zipCode ? decryptAES(response.data.zipCode) : "",
                    taxIdentificationNumber: response.data.taxIdentificationNumber ? decryptAES(response.data.taxIdentificationNumber) : "",
                    invoiceCurrency: response.data.invoiceCurrency,
                    orderId: response.data.orderId
                };
                setInitValues(decryptedData)
                setLoading(false)
            }
            else {
                setErrormsg(isErrorDispaly(response.data))
                setLoading(false)
            }
        }
        catch (error) {
            setErrormsg(isErrorDispaly(error))
            setLoading(false)
        }
    }

    // Corrected logic to filter states without overwriting the master list
    const getCountryState = async (name: any) => {
        if (!name) {
            setFilteredStates([]); // Clear states if country is deselected
            return;
        }
        // Find the selected country from the master list
        const selectedCountryData: any = allCountryData?.find(country => country?.name?.toLowerCase() == name?.toLowerCase());

        // If the country is found and has states, update the filteredStates
        if (selectedCountryData && selectedCountryData.details) {
            setFilteredStates(selectedCountryData.details);
        } else {
            setFilteredStates([]); // Handle countries with no states
        }
    };

    const getInvoiceCoinsLookup = async () => {
        try {
            const response: any = await PaymentService?.paymentsLookups();
            if (response.ok) {
                const currency = response.data.cryptoCurrency.map((item: any) => ({ ...item, name: item.code }))
                setInvoiceCurrency(currency)
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    }

    const handleValidationSave = (validateForm: () => Promise<any>) => {
        validateForm().then(async (errors: any) => {
            if (Object.keys(errors).length > 0) {
                scrollRef?.current?.scrollToPosition(0, 0, true);
                setErrormsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
            }
        });
    };

    const onSubmit = (values: any) => {
        setButtonLoader(true)
        const _object = { ...values, invoiceType: props?.route?.params?.invoiceType, id: props?.route?.params?.id, returnTab: props?.route?.params?.returnTab };
        navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FORM_ITEMDETAILS_COMPONENT, _object)
        setButtonLoader(false)
    }

    const handleErrorMsg = () => {
        setErrormsg('')
    }

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true; // Prevent default back behavior
    })

    const backArrowButtonHandler = () => {
        const returnTab = props?.route?.params?.returnTab;
        if (returnTab !== undefined) {
            navigation.navigate('PayInGrid', { animation: 'slide_from_left', initialTab: returnTab });
        } else {
            navigation.goBack();
        }
    }

    return (
        <ViewComponent style={[commonStyles.flex1]}>
            {((props?.route?.params?.id && loading) || countryLoading) && (<SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>)}
            {!((props?.route?.params?.id && loading) || countryLoading) &&
                <Container style={[commonStyles.container]}>
                    <PageHeader title={!props?.route?.params?.id ? "GLOBAL_CONSTANTS.CREATE_INVOICE" : "GLOBAL_CONSTANTS.UPDATE_INVOICE"} onBackPress={backArrowButtonHandler} />
                    <KeyboardAwareScrollView ref={scrollRef} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} enableOnAndroid={true}>
                        <Formik
                            initialValues={initValues}
                            onSubmit={onSubmit}
                            validationSchema={invoiceDetailsSchema}
                            enableReinitialize
                            validateOnChange={true}
                            validateOnBlur={true}
                        >
                            {(formik) => {
                                const { touched, handleSubmit, errors, handleBlur, setFieldValue, validateForm } = formik;
                                return (<ViewComponent>
                                    {!loading &&
                                        <ViewComponent>
                                            {errorMsg && <ErrorComponent message={errorMsg} onClose={handleErrorMsg} />}
                                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.BASIC_INFO_TITLE"} style={[commonStyles.sectionTitle]} />
                                            {(props?.route?.params?.id) &&
                                                <>
                                                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                                                    <Field
                                                        touched={touched?.invoiceNumber}
                                                        name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.INVOICE_NAME}
                                                        label={"GLOBAL_CONSTANTS.INVOICE_NO"}
                                                        handleBlur={handleBlur}
                                                        placeholder={"GLOBAL_CONSTANTS.INVOICE_NO"}
                                                        component={InputDefault}
                                                        innerRef={nameRef}
                                                        editable={false}
                                                    />
                                                </>
                                            }
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                touched={touched?.orderId}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.ORDER_ID}
                                                label={"GLOBAL_CONSTANTS.ORDER_ID"}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.ENTER_ORDER_ID"}
                                                component={InputDefault}
                                                innerRef={nameRef}
                                                editable={!props?.route?.params?.id}
                                                error={errors?.orderId}

                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <DatePickerComponent
                                                name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.ISSUE_DATE}
                                                label={"GLOBAL_CONSTANTS.ISSUED_DATE"}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_ISSUED_DATE"}
                                                maximumDate={new Date(new Date().setDate(new Date().getDate()))}
                                                minimumDate={new Date()}
                                                mode={PAYMENT_LINK_CONSTENTS.DATE as any}
                                                required={true}
                                                iconColor={NEW_COLOR.TEXT_WHITE}
                                                disabled={true}
                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <DatePickerComponent
                                                name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.DUE_DATE}
                                                label={"GLOBAL_CONSTANTS.DUE_DATE"}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_DUE_DATE"}
                                                minimumDate={tomorrow}
                                                mode={'date'}
                                                required={true}
                                                iconColor={NEW_COLOR.TEXT_WHITE}
                                            />
                                            <ViewComponent style={[commonStyles.sectionGap]} />
                                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.ADDRESS_DETAILS"} style={[commonStyles.sectionTitle]} />
                                            <ViewComponent style={[commonStyles.titleSectionGap]} />
                                            <Field
                                                touched={touched?.companyName}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.FROM_COMPANY}
                                                label={"GLOBAL_CONSTANTS.COMPANY_NAME"}
                                                error={errors?.companyName}
                                                handleBlur={handleBlur}
                                                editable={!props?.route?.params?.id}
                                                placeholder={"GLOBAL_CONSTANTS.ENTER_COMPANY"}
                                                component={InputDefault}
                                                innerRef={nameRef}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                editable={!props?.route?.params?.id}
                                                touched={touched?.clientName}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.CLIENT}
                                                label={"GLOBAL_CONSTANTS.CLIENT"}
                                                error={errors?.clientName}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.CLIENT_NAME"}
                                                component={InputDefault}
                                                innerRef={nameRef}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}

                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                touched={touched?.emails}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.EMAIL}
                                                label={"GLOBAL_CONSTANTS.EMAILS"}
                                                error={errors?.emails}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.EXAMPLE_CCMAILS"}
                                                component={InputDefault}
                                                innerRef={nameRef}
                                                editable={!props?.route?.params?.id}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}

                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                touched={touched?.country}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.COUNTRY}
                                                label={"GLOBAL_CONSTANTS.COUNTRY"}
                                                error={errors?.country}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                                innerRef={nameRef}
                                                data={countries}
                                                modalTitle={"GLOBAL_CONSTANTS.SELECT_COUNTRY"}
                                                component={CustomPicker}
                                                disabled={props?.route?.params?.id}
                                                isOnlycountry={true}
                                                onChange={(type: any) => {
                                                    // These three lines correctly handle the dependent dropdown
                                                    setFieldValue('country', type);
                                                    setFieldValue('state', ''); // Reset state when country changes
                                                    getCountryState(type);
                                                }}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                touched={touched?.state}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.STATE}
                                                label={"GLOBAL_CONSTANTS.STATE"}
                                                error={errors?.state}
                                                modalTitle={"GLOBAL_CONSTANTS.SELECT_STATE"}
                                                handleBlur={handleBlur}
                                                // Data now comes from the filtered state list
                                                data={filteredStates}
                                                component={CustomPicker}
                                                disabled={props?.route?.params?.id}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_STATE"}
                                                innerRef={nameRef}
                                                isOnlycountry={true}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}

                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                touched={touched?.city}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.CITY}
                                                label={"GLOBAL_CONSTANTS.CITY"}
                                                error={errors?.city}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.CITY_PLACEHOLDER"}
                                                component={InputDefault}
                                                innerRef={nameRef}
                                                editable={!props?.route?.params?.id}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}

                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                touched={touched?.streetAddress}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.STREET_ADDRESS}
                                                label={"GLOBAL_CONSTANTS.STREET"}
                                                error={errors?.streetAddress}
                                                handleBlur={handleBlur}
                                                placeholder={"GLOBAL_CONSTANTS.STREET_ADDRESS"}
                                                component={InputDefault}
                                                innerRef={nameRef}
                                                editable={!props?.route?.params?.id}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}

                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                touched={touched?.zipCode}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.ZIP}
                                                label={"GLOBAL_CONSTANTS.POSTAL_CODE"}
                                                error={errors?.zipCode}
                                                handleBlur={handleBlur}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                                placeholder={"GLOBAL_CONSTANTS.POSTAL_CODE_PLACEHOLDER"}
                                                component={InputDefault}
                                                innerRef={nameRef}
                                                editable={!props?.route?.params?.id}

                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                touched={touched?.taxIdentificationNumber}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.TAX_IDENTIFICATION_NUMBER}
                                                label={"GLOBAL_CONSTANTS.TAX_IDENTIFICATION_NUMBER"}
                                                error={errors?.taxIdentificationNumber}
                                                handleBlur={handleBlur}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                                placeholder={"GLOBAL_CONSTANTS.ENTER_TAX_IDENTIFICATION"}
                                                component={InputDefault}
                                                innerRef={nameRef}
                                                editable={!props?.route?.params?.id}
                                            />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                            <Field
                                                touched={touched?.invoiceCurrency}
                                                name={PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.INVOICE_CURRENCY}
                                                label={"GLOBAL_CONSTANTS.INVOICE_CURRENCY"}
                                                error={errors?.invoiceCurrency}
                                                handleBlur={handleBlur}
                                                requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                                placeholder={"GLOBAL_CONSTANTS.SELECT_CURRENCY"}
                                                data={invoiceCurrency}
                                                innerRef={nameRef}
                                                component={CustomPicker}
                                                isIconsDisplay={true}
                                                disabled={props?.route?.params?.id}
                                                modalTitle={"GLOBAL_CONSTANTS.SELECT_CURRENCY"}
                                            />
                                            <ViewComponent style={[commonStyles.mb24]} />
                                            <ViewComponent style={[commonStyles.mb24]} />
                                            <ButtonComponent title={"GLOBAL_CONSTANTS.CONTINUE"} onPress={() => { handleValidationSave(validateForm); handleSubmit(); }} loading={buttonLoader} />
                                            <ViewComponent style={[commonStyles.buttongap]} />
                                            <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={backArrowButtonHandler} disable={buttonLoader} solidBackground={true} />
                                            <ViewComponent style={[commonStyles.formItemSpace]} />
                                        </ViewComponent>
                                    }
                                </ViewComponent>)
                            }}
                        </Formik>
                    </KeyboardAwareScrollView>
                </Container>}
        </ViewComponent>
    )
}
export default InvoiceForm;
