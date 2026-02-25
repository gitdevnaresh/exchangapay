import React, { useEffect, useRef, useState } from "react";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import ErrorComponent from "../../../../../../components/errorDisplay/errorDisplay";
import { WINDOW_HEIGHT } from "../../../../../../constants/styels/variables";
import { useSelector } from "react-redux";
import { Field, Formik } from "formik";
import InputDefault from '../../../../../../components/textInputComponents/DefaultFiat';
import CustomPicker from "../../../../../../components/customPicker/CustomPicker";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import PaymentService from "../../../../../../apiServices/payments";
import { formatCurrency, isErrorDispaly, formatDateTimeForAPI } from "../../../../../../utils/helpers";
import DashboardLoader from "../../../../../../components/loader";
import useEncryptDecrypt from "../../../../../../hooks/encDecHook";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import ViewComponent from "../../../../../../components/view/view";
import TextMultiLanguage from "../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../../../components/textComponets/paragraphText/paragraph";
import LabelComponent from "../../../../../../components/textComponets/lableComponent/lable";
import ButtonComponent from "../../../../../../components/buttons/button";
import { invoiceItemDetailsSchema } from "../../../schema";
import { CoinsInterface, InvoiceFormSaveInterface, InvoiceItemDetails, NetworkInterface, StaticPreviewInterface, VaultsInterface } from "../../../interface";
import { PAYMENT_LINK_CONSTENTS } from "../../../constants";
import NoDataComponent from "../../../../../../components/noData/noData";
import Container from "../../../../../../components/container/container";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import InvoicePreviewSheet from "./invoiceFormItemDetailsComponents/InvoicePreviewSheet";
import DeleteConfirmSheet from "./DeleteConfirmSheet";
import InvoiceItemList from "./invoiceFormItemDetailsComponents/InvoiceItemList";
import InvoiceSummary from "./invoiceFormItemDetailsComponents/InvoiceSummary";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ScrollViewComponent from "../../../../../../components/scrollView/scrollView";
import { logEvent } from "../../../../../../hooks/loggingHook";
import AddIcon from "../../../../../../components/addCommonIcon/addCommonIcon";
import { useHardwareBackHandler } from "../../../../../../hooks/backHandleHook";


const InvoiceFormItemDetails = (props: any) => {
    const ref = useRef<any>();
    const [errorMsg, setErrormsg] = useState<string>('');
    const [itemDetails, setItemDetails] = useState<any[]>([]);
    const [merchantName, setMerchantName] = useState<VaultsInterface[]>([]);
    const [coin, setCoin] = useState<CoinsInterface[]>([]);
    const [network, setNetwork] = useState<NetworkInterface[]>([]);
    const [merchantId, setMerchantId] = useState<string>('');
    const [customerWalletId, setCustomerWalletId] = useState<string>('');
    const customerInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const isFocused = useIsFocused();
    const [itemData, setItemData] = useState<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const [invoiceGetData, setInvoiceGetData] = useState<StaticPreviewInterface>({
        issuedDate: "",
        dueDate: "",
        companyName: "",
        clientName: "",
        emails: "",
        clientWillPayCommission: false,
        streetAddress: "",
        country: "",
        city: "",
        state: "",
        zipCode: "",
        invoiceCurrency: "",
        taxIdentificationNumber: "",
        details: [],
        amountwithoutTax: 0,
        taxAmount: 0,
        totalDiscount: 0,
        totalAmount: 0,
        dueAmount: 0
    });
    const [getData, setGetDate] = useState<any>({});
    const previewSheetRef = useRef<any>(null);
    const deleteSheetRef = useRef<any>(null);
    useEffect(() => {
        if (props?.route?.params?.item) {
            setItemDetails((prevItems) => {
                const isItemAlreadyInArray = prevItems.some(item => item.itemName === props.route.params.item.itemName);
                if (!isItemAlreadyInArray) {
                    return [...prevItems, props.route.params.item];
                }
                return prevItems;
            });
        }
    }, [props?.route?.params?.item]);

    useEffect(() => {
        if (props?.route?.params?.id) {
            getPaymentDetails();
        }
        getMerchantsLu();
    }, [isFocused]);

    useHardwareBackHandler(() => {
        handleBack();
    })
    const [initValues, setInitValues] = useState<InvoiceItemDetails>({
        merchantId: '',
        customerWalletId: '',
        coins: '',
        paymentNote: '',
        merchantName: '',
        currency: '',
        networkName: '',
    });
    const handleBack = () => {
        const returnTab = props?.route?.params?.returnTab;
        // if (returnTab !== undefined) {
        //     navigation.navigate('PayInGrid', { animation: 'slide_from_left', initialTab: returnTab });
        // } else {
        props.navigation.goBack();
        // }
    };
    const getMerchantsLu = async () => {
        try {
            let response: any = await PaymentService.paymentCoins();
            if (response.ok) {
                setErrormsg('');
                const updatedMerchantData = response?.data?.map((data: any) => ({ ...data, name: data?.name }));
                const defaultVault = updatedMerchantData[0];
                setInitValues((prevState) => ({
                    ...prevState,
                    merchantName: defaultVault?.name,
                    merchantId: defaultVault?.id,
                }));
                setMerchantId(defaultVault.id);
                if (defaultVault) {
                    const currencies: any = defaultVault?.merchantsDetails?.map((merchant: any) => ({
                        ...merchant,
                        name: merchant.code
                    }));
                    setCoin(currencies);
                }
                setMerchantName(updatedMerchantData);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };

    const handleSelectVault = (id: any, type: any) => {
        if (type === PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_PLACEHOLDER.MERCHANT_NAME) {
            const selectedMerchant: any = merchantName?.find(merchant => merchant.name === id);
            if (selectedMerchant) {
                const currencies: any = selectedMerchant.merchantsDetails.map((merchant: any) => ({
                    ...merchant,
                    name: merchant.code
                }));
                setCoin(currencies);
                setMerchantId(selectedMerchant.id);
                setNetwork([]);
            }
        } else if (type === PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.COIN) {
            const selectedCurrency: any = coin?.find((currency: any) => currency.code === id);
            if (selectedCurrency?.networks) {
                const networks = selectedCurrency.networks.map((network: any) => ({
                    ...network,
                    name: network.code
                }));
                setNetwork(networks);
            }
            setCustomerWalletId("");
        } else if (type === PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.NETWORK) {
            const selectedNetwork: any = network.find((network: any) => network.code === id);
            setCustomerWalletId(selectedNetwork?.customerWalletId || "");
        }
    };

    const getPaymentDetails = async () => {
        setDataLoading(true);
        try {
            const response: any = await PaymentService.getGenerateInvoiceDetails(props.route?.params?.id);
            if (response.ok) {
                setInitValues({
                    ...response?.data,
                    paymentNote: response?.data?.paymentNote || ''
                });
                setGetDate(response?.data);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
        setDataLoading(false);
    };

    const handleAdd = () => {
        if (!props.route.params?.id) {
            props.navigation.push(PAYMENT_LINK_CONSTENTS.ITEMDETAILS_COMPONENT, {
                onGoBack: (newItem: any) => { setItemDetails((prevItems) => [...prevItems, newItem]) }
            });
        }
    };
    const buttonTitle = props?.route?.params?.id ? "GLOBAL_CONSTANTS.UPDATE_INVOICE" : "GLOBAL_CONSTANTS.CREATE_INVOICE";
    const DiscountAmunt = itemDetails.reduce((sum, item) => {
        let totalPrice = (parseFloat(item.unitPrice) * parseFloat(item.quantity));
        let discount = (totalPrice * parseFloat(item.discountPercentage)) / 100;
        return sum + discount;
    }, 0);
    const WithOutTax = itemDetails.reduce((sum, item: any) => sum + parseFloat((item?.unitPrice * item?.quantity)), 0);
    const TotalTax = itemDetails.reduce((sum, item) => {
        const totalPrice = parseFloat(item?.unitPrice) * parseFloat(item?.quantity);
        const priceAfterDiscount = totalPrice * (1 - (parseFloat(item?.discountPercentage) / 100));
        const taxAmount = (priceAfterDiscount * parseFloat(item?.taxPercentage)) / 100;
        return sum + taxAmount;
    }, 0);

    const handlePreview = (formik: any) => {
        formik.validateForm().then((errors: any) => {
            if (Object.keys(errors).length > 0) {
                formik.setTouched(
                    Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                );
            } else {
                // Always set data first, then open after state update
                const _Obj: StaticPreviewInterface = {
                    issuedDate: formatDateTimeForAPI(props.route.params?.issuedDate),
                    dueDate: formatDateTimeForAPI(props.route.params?.dueDate),
                    companyName: props.route.params?.companyName,
                    clientName: props.route.params?.clientName,
                    emails: props.route.params?.emails,
                    clientWillPayCommission: true,
                    streetAddress: props.route.params?.streetAddress,
                    country: props.route.params?.country,
                    city: props.route.params?.city,
                    state: props.route.params?.state,
                    zipCode: props.route.params?.zipCode,
                    invoiceCurrency: props.route.params?.invoiceCurrency,
                    taxIdentificationNumber: props.route.params?.taxIdentificationNumber,
                    details: props.route.params?.id ? getData?.details : itemDetails,
                    amountwithoutTax: WithOutTax || getData?.amountwithoutTax,
                    taxAmount: TotalTax || getData?.taxAmount,
                    totalDiscount: DiscountAmunt || getData?.totalDiscount,
                    totalAmount: (WithOutTax - DiscountAmunt) + TotalTax || getData?.totalAmount,
                    dueAmount: (WithOutTax - DiscountAmunt) + TotalTax || getData?.dueAmount,
                };
                setInvoiceGetData(_Obj);
                setTimeout(() => {
                    previewSheetRef.current?.open();
                }, 100);
            }
        });
    };
    const handleEdit = (item: any) => {
        if (!props?.route?.params?.id) {
            props.navigation.push(PAYMENT_LINK_CONSTENTS.ITEMDETAILS_COMPONENT, {
                item,
                onGoBack: (updatedItem: any) => { setItemDetails((prevItems) => prevItems.map(existingItem => existingItem.id === updatedItem.id ? updatedItem : existingItem)) }
            });
        }
    };
    const { encryptAES } = useEncryptDecrypt();
    const onSubmit = async (values: any) => {
        logEvent("Button Pressed", { action: "Create Invoice paymentslink", currentScreen: "Create Invoice paymentslink", nextScreen: "Invoice paymentslink View" })
        setBtnLoading(true);
        if (!props?.route?.params?.id && itemDetails?.length <= 0) {
            setBtnLoading(false);
            setErrormsg(PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.AT_LEAST_ONE_ITEM_IS_REQUIRED);
            return;
        }
        const updatedItems = itemDetails.map((item: any) => ({
            ...item,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            discountPercentage: parseFloat(item.discountPercentage),
            taxPercentage: parseFloat(item.taxPercentage),
            amount: parseFloat(item.amount),
            discountAmount: parseFloat(item.discountAmount),
            taxAmount: parseFloat(item.taxAmount),
        }));
        const _Obj: InvoiceFormSaveInterface = {
            invoiceNumber: props.route.params?.invoiceNumber,
            issuedDate: formatDateTimeForAPI(props.route.params?.issuedDate),
            dueDate: formatDateTimeForAPI(props.route.params?.dueDate),
            companyName: props.route.params?.companyName,
            clientName: props.route.params?.clientName,
            emails: encryptAES(props.route.params?.emails),
            streetAddress: props.route.params?.streetAddress,
            country: props.route.params?.country,
            city: props.route.params?.city,
            state: props.route.params?.state,
            zipCode: encryptAES(props.route.params?.zipCode),
            invoiceCurrency: props.route.params?.invoiceCurrency,
            taxIdentificationNumber: encryptAES(props.route.params?.taxIdentificationNumber),
            details: updatedItems,
            amountwithoutTax: WithOutTax || getData?.amountwithoutTax,
            taxAmount: TotalTax || getData?.taxAmount,
            totalDiscount: DiscountAmunt || getData?.totalDiscount,
            totalAmount: (WithOutTax - DiscountAmunt) + TotalTax || getData?.totalAmount,
            dueAmount: (WithOutTax - DiscountAmunt) + TotalTax || getData?.dueAmount,
            customerWalletId: customerWalletId,
            // merchantId: merchantId,
            merchantName: values.merchantName,
            networkName: values.networkName,
            currency: values.currency,
            id: PAYMENT_LINK_CONSTENTS.GUID_FORMATE,
            paymentType: PAYMENT_LINK_CONSTENTS.INVOICE,
            createdDate: new Date(),
            paymentLink: "",
            paymentNote: values?.paymentNote?.trim() || null,
            createdBy: customerInfo.name,
            modifiedBy: customerInfo.name,
            modifiedDate: new Date(),
            status: PAYMENT_LINK_CONSTENTS.AMOUNT_NOT_PAID,
            isCryptoTransfer: true,
            orderId: props.route.params?.orderId,
            amount: 0
        };
        const EditObject = {
            id: props?.route?.params?.id,
            dueDate: formatDateTimeForAPI(props.route.params?.dueDate),
            modifiedBy: customerInfo.name,
            invoiceNumber: props.route.params?.invoiceNumber
        };
        try {
            let response;
            if (props?.route?.params?.id) {
                response = await PaymentService.updateInvoice(EditObject);
            } else {
                response = await PaymentService.createInvoiceForm(_Obj);
            }
            if (response.ok) {
                setBtnLoading(false);
                setErrormsg('');
                const _Object = response.data;
                if (!props?.route?.params?.id) {
                    props.navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.INVOICE_SUMMARY_COMPONENT, _Object);
                    setInitValues({} as InvoiceItemDetails);
                    setItemDetails([]);
                } else {
                    props.navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.INVOICE_SUMMARY_COMPONENT, { id: props?.route?.params?.id, action: props?.route?.params?.id ? "Edit" : "Add" });
                }
            } else {
                setBtnLoading(false);
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setBtnLoading(false);
            setErrormsg(isErrorDispaly(error));
        }
    };
    const noNetworkData = () => {
        if (itemDetails?.length <= 0) {
            return <NoDataComponent />;
        }
        return null;
    };
    const handleErrorMsg = () => {
        setErrormsg('');
    };
    const handleClose = () => {
        deleteSheetRef.current?.close();
    };
    const handleDelete = (item: any) => {
        setItemData(item);
        setTimeout(() => {
            deleteSheetRef.current?.open();
        }, 100);
    };
    const handleConfirm = () => {
        setItemDetails((prevItems) => prevItems.filter(existingItem => existingItem.id !== itemData.id));
        deleteSheetRef.current?.close();
    };
    const handlecancel = () => {
        const returnTab = props?.route?.params?.returnTab ?? 1;
        navigation.navigate("PayInGrid", { animation: 'slide_from_left', initialTab: returnTab });
    };
    return (
        <KeyboardAwareScrollView
            contentContainerStyle={[{ flexGrow: 1 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
        >
            <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
                <Container style={commonStyles.container}>
                    <PageHeader title={props?.route?.params?.id ? "GLOBAL_CONSTANTS.UPDATE_INVOICE" : "GLOBAL_CONSTANTS.CREATE_INVOICE"} onBackPress={handleBack} />
                    <ScrollViewComponent showsVerticalScrollIndicator={false} ref={ref}>
                        {errorMsg && <ErrorComponent message={errorMsg} onClose={handleErrorMsg} />}
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.ITEMS"} style={[commonStyles.sectionTitle]} />
                            {!props?.route?.params?.id &&
                                <ViewComponent style={[commonStyles.actioniconbg]}>
                                    <AddIcon onPress={handleAdd} />
                                </ViewComponent>
                            }
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.titleSectionGap]} />
                        <ViewComponent>
                            {dataLoading ? (
                                <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                    <DashboardLoader />
                                </ViewComponent>
                            ) : (
                                <ViewComponent>
                                    <InvoiceItemList data={props?.route?.params?.id ? getData?.details : itemDetails} props={props} commonStyles={commonStyles} NEW_COLOR={NEW_COLOR} formatCurrency={formatCurrency} handleEdit={handleEdit} handleDelete={handleDelete} noNetworkData={noNetworkData} />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    {(props?.route?.params?.id ? getData?.details?.length > 0 : itemDetails?.length > 0) && <InvoiceSummary commonStyles={commonStyles} props={props} getData={getData} WithOutTax={WithOutTax} TotalTax={TotalTax} DiscountAmunt={DiscountAmunt} InvoiceCurrency={props?.route?.params?.invoiceCurrency} />}
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                    {(props?.route?.params?.id ? getData?.details?.length > 0 : itemDetails?.length > 0) && <Formik
                                        initialValues={initValues}
                                        onSubmit={onSubmit}
                                        validationSchema={invoiceItemDetailsSchema}
                                        enableReinitialize
                                        validateOnChange
                                        validateOnBlur
                                    >
                                        {(formik) => {
                                            const { touched, handleSubmit, errors, handleBlur, setFieldValue } = formik;
                                            return (
                                                <>
                                                    {touched?.merchantName?.length > 1 && <Field
                                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_WALLET"}
                                                        name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.VAULT}
                                                        data={merchantName}
                                                        innerRef={ref}
                                                        component={CustomPicker}
                                                        touched={touched?.merchantName}
                                                        label={"GLOBAL_CONSTANTS.WALLET"}
                                                        placeholder={"GLOBAL_CONSTANTS.CHOOSE_A_WALLET"}
                                                        handleBlur={handleBlur}
                                                        onChange={(id: any) => {
                                                            handleSelectVault(id, PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_PLACEHOLDER.MERCHANT_NAME);
                                                            setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.COIN, "");
                                                            setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.NETWORK, "");
                                                        }}
                                                        disabled={props?.route?.params?.id}
                                                        requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                                    />}
                                                    {touched?.merchantName && errors?.merchantName && <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={errors.merchantName} />}
                                                    {touched?.merchantName?.length > 1 && <ViewComponent style={[commonStyles.formItemSpace]} />}
                                                    <Field
                                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_COIN"}
                                                        innerRef={ref}
                                                        name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.COIN}
                                                        data={coin}
                                                        component={CustomPicker}
                                                        error={errors?.currency}
                                                        disabled={props?.route?.params?.id}
                                                        label={"GLOBAL_CONSTANTS.COIN"}
                                                        placeholder={"GLOBAL_CONSTANTS.SELECT_COIN"}
                                                        isIconsDisplay={true}
                                                        handleBlur={handleBlur}
                                                        onChange={
                                                            (type: any) => {
                                                                handleSelectVault(type, PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.COIN);
                                                                setFieldValue(PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.NETWORK, "");
                                                            }
                                                        }
                                                        requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                                    />
                                                    {touched?.currency && errors.currency && <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={errors.currency} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <Field
                                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_NETWORK"}
                                                        innerRef={ref}
                                                        name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.NETWORK}
                                                        data={network}
                                                        component={CustomPicker}
                                                        label={"GLOBAL_CONSTANTS.NETWORK"}
                                                        placeholder={"GLOBAL_CONSTANTS.SELECT_NETWORK"}
                                                        handleBlur={handleBlur}
                                                        onChange={(type: any) => { handleSelectVault(type, PAYMENT_LINK_CONSTENTS.PAYMENT_LINK_NAMES.NETWORK) }}
                                                        disabled={props?.route?.params?.id}
                                                        requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                                    />
                                                    {touched?.networkName && errors.networkName && <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={errors.networkName} />}
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    <ViewComponent>
                                                        <Field
                                                            innerRef={ref}
                                                            name={PAYMENT_LINK_CONSTENTS.INVOICE_FORM_CONSTENTS.NOTE}
                                                            component={InputDefault}
                                                            label={"GLOBAL_CONSTANTS.PAYMENT_NOTE"}
                                                            placeholder={"GLOBAL_CONSTANTS.PAYMENT_NOTE_PLACEHOLDER"}
                                                            handleBlur={handleBlur}
                                                            numberOfLines={4}
                                                            inputStyleChange={{ height: 150 }}
                                                            customContainerStyle={{ height: 150 }}
                                                            inputHeight={150}
                                                            inputTextAlignment={{ textAlignVertical: "top" }}
                                                            editable={!props?.route?.params?.id}
                                                        // requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                                        />
                                                        {touched?.paymentNote && errors.paymentNote && <ParagraphComponent multiLanguageAllows={true} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={errors.paymentNote} />}
                                                    </ViewComponent>
                                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                                    <ButtonComponent title={buttonTitle} onPress={handleSubmit} loading={btnLoading} />
                                                    <ViewComponent style={[commonStyles.mt16]} />
                                                    <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={handlecancel} solidBackground={true} disable={btnLoading} />
                                                    <ViewComponent style={[commonStyles.mb24]} />
                                                    <ViewComponent style={[commonStyles.mb24]} />
                                                    <ViewComponent style={[commonStyles.mb24]} />


                                                </>
                                            );
                                        }}
                                    </Formik>}
                                </ViewComponent>
                            )}
                        </ViewComponent>
                        <InvoicePreviewSheet refRBSheet={previewSheetRef} height={WINDOW_HEIGHT * 0.8} invoiceGetData={invoiceGetData} commonStyles={commonStyles} handleClose={() => previewSheetRef.current.close()} />
                        <DeleteConfirmSheet refRBSheet={deleteSheetRef} onClose={handleClose} onConfirm={handleConfirm} commonStyles={commonStyles} />
                    </ScrollViewComponent>
                </Container>
            </ViewComponent>
        </KeyboardAwareScrollView>
    );
};

export default InvoiceFormItemDetails;
