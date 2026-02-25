import React, { useEffect, useState } from "react";
import { Alert, Linking, Share, ActivityIndicator } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import PaymentService from "../../../../../../apiServices/payments";
import { isErrorDispaly } from "../../../../../../utils/helpers";
import SafeAreaViewComponent from "../../../../../../components/safeArea/safeArea";
import DashboardLoader from "../../../../../../components/loader";
import Container from "../../../../../../components/container/container";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import ScrollViewComponent from "../../../../../../components/scrollView/scrollView";
import ErrorComponent from "../../../../../../components/errorDisplay/errorDisplay";
import StateChange from "./componetns/stateChange";
import { GenerateInvoiceInterafe, PAYMENT_LINK_CONSTENTS } from "../../../constants";
import { InvoiceFormViewInterface } from "../../../interface";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../../../components/CommonStyles";
import { useLngTranslation } from "../../../../../../hooks/languagesHook/useLngTranslation";
import useEncryptDecrypt from "../../../../../../hooks/encDecHook";
import Clipboard from "@react-native-clipboard/clipboard";
import ViewComponent from "../../../../../../components/view/view";
import InvoiceDetails from "./invoiceViewComponets/invoiceViewDetails";
import InvoicePaymentSection from "./invoiceViewComponets/invoiceViewPaymentSection";
import ButtonComponent from "../../../../../../components/buttons/button";
import { useHardwareBackHandler } from "../../../../../../hooks/backHandleHook";
import DownloadFile from "../../../../../../components/downloadFile";
import CommonTouchableOpacity from "../../../../../../components/touchableComponents/touchableOpacity";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { s } from "../../../../../../components/theme/scale";
import { logEvent } from "../../../../../../hooks/loggingHook";

const InvoiceSummary = (props: any) => {
    const isFocused = useIsFocused();
    const [isPreparingPdfUrl, setIsPreparingPdfUrl] = useState(false)
    const [currentDownloadUrl, setCurrentDownloadUrl] = useState<string | null>(null);
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [invoiceGetData, setInvoiceGetData] = useState<InvoiceFormViewInterface>({
        merchantName: "",
        invoiceNumber: "",
        issuedDate: "",
        dueDate: "",
        companyName: "",
        clientName: "",
        emails: "",
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
        dueAmount: 0,
        customerWalletId: "",
        merchantId: "",
        networkName: "",
        currency: "",
        id: "",
        paymentType: "",
        createdDate: null,
        paymentLink: "",
        createdBy: "",
        modifiedBy: "",
        status: "",
        amount: 0,
        paymentNote: "",
        walletAddress: ""

    })
    const { decryptAES } = useEncryptDecrypt();
    const [invoiceData, setInvoicedData] = useState<GenerateInvoiceInterafe>({
        invoiceGetData: {},
        errorMsg: "",
        invoiceLoader: false,

    })
    const [stateChangeModelOpen, setStateChangeModelOpen] = useState(false)
    const { t } = useLngTranslation();
    useHardwareBackHandler(() => {
        handleClose();
    })
    useEffect(() => {
        if (isFocused && props?.route?.params?.id) {
            getInvoiceDetails();
        }
    }, [isFocused, props?.route?.params?.id])

    const getInvoiceDetails = async () => {
        setInvoicedData((prev) => ({ ...prev, errorMsg: "", invoiceLoader: true }));
        try {
            let response: any = await PaymentService.getGenerateInvoiceDetails(props?.route?.params?.id);
            if (response?.ok) {
                setInvoiceGetData(response?.data);
                setInvoicedData((prev) => ({ ...prev, errorMsg: "", invoiceLoader: false }));
            } else {
                setInvoicedData((prev) => ({ ...prev, errorMsg: isErrorDispaly(response), invoiceLoader: false }));
            }
        } catch (error) {
            setInvoicedData((prev) => ({ ...prev, errorMsg: isErrorDispaly(error), invoiceLoader: false }));
        }
    };

    const handleDownload = async () => {
        if (isPreparingPdfUrl || !invoiceGetData?.id) return;

        setIsPreparingPdfUrl(true);
        try {
            const response: any = await PaymentService.downloadInvoiceTemplete(invoiceGetData?.id, "invoice");
            if (response?.data) {
                setCurrentDownloadUrl(response.data);
            } else {
                setInvoicedData((prev) => ({ ...prev, errorMsg: isErrorDispaly(response) }));
            }
        } catch (error) {
            setInvoicedData((prev) => ({ ...prev, errorMsg: isErrorDispaly(error) }));
        } finally {
            setIsPreparingPdfUrl(false);
        }
    };

    const handleEdit = (val: any) => {
        if (val.status === PAYMENT_LINK_CONSTENTS.PAID) {
            setInvoicedData((prev) => ({ ...prev, errorMsg: t("GLOBAL_CONSTANTS.PAYIN_HAS_BEEN_FULLY_PAID") }));
        }
        else if (val.status === PAYMENT_LINK_CONSTENTS.CANCELLED) {
            setInvoicedData((prev) => ({ ...prev, errorMsg: t("GLOBAL_CONSTANTS.CANNOT_EDIT_CANCELLED_PAYIN") }));
        }
        else if (val?.status === PAYMENT_LINK_CONSTENTS.PARTIALLY_PAID) {
            setInvoicedData((prev) => ({ ...prev, errorMsg: t("GLOBAL_CONSTANTS.PAY_IN_HAS_BEEN_PARTIALLY_PAID") }));

        }
        else if (val?.status === "Expired") {
            setInvoicedData((prev) => ({ ...prev, errorMsg: t("GLOBAL_CONSTANTS.EXPIRED_PAYIN") }));
        }
        else {
            const returnTab = props?.route?.params?.returnTab ?? 1;
            props.navigation.navigate(PAYMENT_LINK_CONSTENTS.INVOICE_FORM, {
                animation: "slide_from_left",
                id: val?.id,
                Type: val?.paymentType,
                invoiceNo: val?.invoiceNumber || val?.invoiceNo,
                returnTab

            })
        }
    }
    const handleRedirect = (paymentLinkUrl: any) => {
        const url = paymentLinkUrl;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => {
                setInvoicedData((prev) => ({ ...prev, errorMsg: err }));

            });

    };
    const copyToClipboard = async (text: any) => {
        try { Clipboard.setString(text ?? ''); }
        catch (e: any) { Alert.alert(PAYMENT_LINK_CONSTENTS.COPY_CLICK_ERROR, e.message); }
    };
    const onShare = async () => {
        logEvent("Button Pressed", { action: "Share Invoice paymentslink", currentScreen: "Invoice paymentslink view" })
        try {
            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_SHARE_MY")} ${invoiceGetData?.currency} (${invoiceGetData?.networkName}) ${t("GLOBAL_CONSTANTS.ADDRESS_FOR_RECEIVING")}${invoiceGetData?.walletAddress}\n
                ${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING_THE_CORRECT_PROTOCAL")}\n${t("GLOBAL_CONSTANTS.I_AM_USING")}${invoiceGetData?.paymentLink}\n${t("GLOBAL_CONSTANTS.THANK_YOU")}`
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const handleClose = () => {
        const action = props?.route?.params?.action;
        if (action === "ViewComponent" || action === "Edit") {
            const returnTab = props?.route?.params?.returnTab ?? 1;
            navigation.navigate("PayInGrid", { animation: "slide_from_left", initialTab: returnTab });
        } else {
            navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.PAYMENTS", animation: "slide_from_left" });
            logEvent("Button Pressed", { action: "Cancel button", currentScreen: "Invoice paymentslink view", nextScreen: "Payments Dashboard" })
        }
    }
    const handleErrorClear = () => {
        setInvoicedData((prev) => ({ ...prev, errorMsg: "" }));

    }
    const handelCopyWalletAddress = () => {
        copyToClipboard(invoiceGetData?.walletAddress)
    }
    const handleCopyPaymentLink = () => {
        copyToClipboard(invoiceGetData?.paymentLink)
    }
    const handleStateChange = () => {
        logEvent("Button Pressed", { action: "State change button", currentScreen: "Invoice paymentslink view" })
        if (invoiceGetData.status === PAYMENT_LINK_CONSTENTS.PAID) {
            setInvoicedData((prev) => ({ ...prev, errorMsg: t("GLOBAL_CONSTANTS.PAYIN_HAS_BEEN_FULLY_PAID") }));
        }
        else if (invoiceGetData.status === PAYMENT_LINK_CONSTENTS.CANCELLED) {
            setInvoicedData((prev) => ({ ...prev, errorMsg: t("GLOBAL_CONSTANTS.CANNOT_STATE_CHANGE_CANCELLED_PAY_IN") }));
        }
        else if (invoiceGetData?.status === PAYMENT_LINK_CONSTENTS.PARTIALLY_PAID) {
            setInvoicedData((prev) => ({ ...prev, errorMsg: t("GLOBAL_CONSTANTS.PAY_IN_HAS_BEEN_PARTIALLY_PAID") }));

        }
        else {
            setStateChangeModelOpen(true);
        }
    }
    const isRefreshView = () => {
        setStateChangeModelOpen(false);
        getInvoiceDetails();
    }
    const closeModel = () => {
        setStateChangeModelOpen(false)
    }

    const renderDownloadAction = () => {
        if (isPreparingPdfUrl) {
            return <ActivityIndicator size="small" color={NEW_COLOR.TEXT_WHITE} />;
        }

        if (currentDownloadUrl) {
            return (
                <DownloadFile
                    imageURL={currentDownloadUrl}
                    isDownloadInvoice={true}
                    autoStartDownload={true}
                    onAutoStartProcessed={() => setCurrentDownloadUrl(null)}
                />
            );
        }

        return (
            <CommonTouchableOpacity onPress={handleDownload} activeOpacity={0.7}>
                <MaterialCommunityIcons name="tray-arrow-down" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
            </CommonTouchableOpacity>
        );
    };
    const isExpiredDate = new Date() <= new Date(invoiceGetData.dueDate);
    const isFullyPaid = invoiceGetData?.status === PAYMENT_LINK_CONSTENTS.GENERATE_INVOICE_DATA.PAID;
    const showPaymentLink = isExpiredDate && !isFullyPaid;
    return (
        <ViewComponent style={[commonStyles.flex1]}>
            {invoiceData?.invoiceLoader && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
            {!invoiceData?.invoiceLoader && (
                <Container style={[commonStyles.container]}>
                    <PageHeader
                        title={props?.route?.params?.invoiceNo || invoiceGetData?.invoiceNumber || PAYMENT_LINK_CONSTENTS.INVOICE}
                        onBackPress={handleClose}
                        rightActions={renderDownloadAction()}
                    />
                    <ScrollViewComponent>
                        <ViewComponent>
                            {!!invoiceData?.errorMsg && <ErrorComponent message={invoiceData?.errorMsg} onClose={handleErrorClear} />}
                            {invoiceGetData && !invoiceData?.invoiceLoader && (
                                <>
                                    <InvoiceDetails
                                        invoiceGetData={invoiceGetData}
                                        decryptAES={decryptAES}
                                        commonStyles={commonStyles}
                                        currentDownloadUrl={currentDownloadUrl}
                                        handleEdit={handleEdit}
                                        handleStateChange={handleStateChange}
                                        NEW_COLOR={NEW_COLOR}
                                    />
                                    {(
                                        <InvoicePaymentSection
                                            invoiceGetData={invoiceGetData}
                                            commonStyles={commonStyles}
                                            handleRedirect={handleRedirect}
                                            handelCopyWalletAddress={handelCopyWalletAddress}
                                            handleCopyPaymentLink={handleCopyPaymentLink}
                                            onShare={onShare}
                                            NEW_COLOR={NEW_COLOR}
                                        />
                                    )}
                                    <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} onPress={handleClose} solidBackground={true} />
                                    <ViewComponent style={[commonStyles.mb24]} />
                                </>
                            )}
                        </ViewComponent>
                        {stateChangeModelOpen && (
                            <StateChange
                                modelOpen={stateChangeModelOpen}
                                data={invoiceGetData}
                                isRefresh={isRefreshView}
                                closeModel={closeModel}
                            />
                        )}
                    </ScrollViewComponent>
                </Container>
            )}
        </ViewComponent>
    );
};

export default InvoiceSummary;

