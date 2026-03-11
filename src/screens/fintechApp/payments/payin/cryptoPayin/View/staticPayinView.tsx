import React, { useEffect, useReducer, useState } from "react";
import { getThemedCommonStyles, statusColor } from "../../../../../../components/CommonStyles";
import { Alert, Linking, Share, ActivityIndicator } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import PaymentService from "../../../../../../apiServices/payments";
import { dateFormates, isErrorDispaly } from "../../../../../../utils/helpers";
import QRCode from "react-native-qrcode-svg";
import { useLngTranslation } from "../../../../../../hooks/languagesHook/useLngTranslation";
import DownloadFile from "../../../../../../components/downloadFile";
import { useThemeColors } from "../../../../../../hooks/themedHook/useThemeColors";
import { PAYMENT_LINK_CONSTENTS } from "../../../constants";
import DashboardLoader from "../../../../../../components/loader";
import { s } from "../../../../../../components/theme/scale";
import ViewComponent from "../../../../../../components/view/view";
import ScrollViewComponent from "../../../../../../components/scrollView/scrollView";
import CommonTouchableOpacity from "../../../../../../components/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../../../../components/textComponets/paragraphText/paragraph";
import ButtonComponent from "../../../../../../components/buttons/button";
import ErrorComponent from "../../../../../../components/errorDisplay/errorDisplay";
import CopyCard from "../../../../../../components/copyIcon/CopyCard";
import Container from "../../../../../../components/container/container";
import PageHeader from "../../../../../../components/pageHeader/pageHeader";
import TextMultiLanguage from "../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { CurrencyText } from "../../../../../../components/textComponets/currencyText/currencyText";
import StateChange from "./componetns/stateChange";
import SafeAreaViewComponent from "../../../../../../components/safeArea/safeArea";
import { CreatePaymentReducer, formState } from "./componetns/createPaymentReducer";
import Clipboard from "@react-native-clipboard/clipboard";
import ActionButton from "../../../../../../components/gradianttext/gradiantbg";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import StateChanageIcon from "../../../../../../components/svgIcons/mainmenuicons/statechange";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { logEvent } from "../../../../../../hooks/loggingHook";
import { FormattedDateText } from "../../../../../../components/textComponets/dateTimeText/dateTimeText";
import { useHardwareBackHandler } from "../../../../../../hooks/backHandleHook";
import EditLinksIcon from "../../../../../../components/svgIcons/mainmenuicons/linkedit";
import { EditIcon } from "../../../../../../assets/svg";
import ProfileEditIcon from "../../../../../../components/svgIcons/mainmenuicons/editicon";
import RapidzEditIcon from "../../../../../../components/svgIcons/mainmenuicons/rapidzedit";
import LabelComponent from "../../../../../../components/textComponets/lableComponent/lable";

const StaticPaymentView = (props: any) => {
    const [localState, localDispatch] = useReducer(CreatePaymentReducer, formState);
    const [stateChangeModelOpen, setStateChangeModelOpen] = useState<boolean>(false)
    const isFocused = useIsFocused();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const invoiceData = localState?.paymentLinkData;
    const { t } = useLngTranslation();
    const navigation = useNavigation<any>();
    const [isPreparingPdfUrl, setIsPreparingPdfUrl] = useState(false)
    const [currentDownloadUrl, setCurrentDownloadUrl] = useState<string | null>(null)

    useEffect(() => {
        if (isFocused && props?.route?.params?.id) {
            getPaymentLinkDetails();
        }
    }, [isFocused, props?.route?.params?.id]);

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true;
    })
    const getPaymentLinkDetails = async () => {
        localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: null })
        localDispatch({ type: PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK_CONSTANTS.SET_STATIC_PAYMENT_LOADER, payload: true })
        try {
            let response = await PaymentService.paymentLinkDetails('static', props?.route?.params?.id);
            if (response.ok) {
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK_CONSTANTS.SET_PAYMENT_LINK_DATA, payload: response?.data })
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: null })
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK_CONSTANTS.SET_STATIC_PAYMENT_LOADER, payload: false })
            }
            else {
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: isErrorDispaly(response) });
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK_CONSTANTS.SET_STATIC_PAYMENT_LOADER, payload: false })
            }
        }
        catch (error) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: isErrorDispaly(error) });
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.STATIC_PAYMENT_LINK_CONSTANTS.SET_STATIC_PAYMENT_LOADER, payload: false })
        }
    };
    const backArrowButtonHandler = () => {
        const action = props?.route?.params?.action;
        if (action === "ViewComponent" || action === "View" || action === "Edit") {
            const returnTab = props?.route?.params?.returnTab ?? 1;
            navigation.navigate("PayInGrid", { animation: "slide_from_left", initialTab: returnTab });
        } else {
            navigation.navigate("Dashboard", { animation: "slide_from_left", screen: "GLOBAL_CONSTANTS.PAYMENTS" });
        }
    }
    const handleErrorclear = () => {
        localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: null })
    }
    const copyToClipboard = async (text: any) => {
        try { Clipboard.setString(text ?? ''); }
        catch (e: any) { Alert.alert(PAYMENT_LINK_CONSTENTS.COPY_CLICK_ERROR, e.message); }
    };
    const handleRedirect = (paymentLinkUrl: any) => {
        const url = paymentLinkUrl;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => {
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: isErrorDispaly(err) });
            });

    };
    const onShare = async () => {
        logEvent("Button Pressed", { action: "Share paymentslink", currentScreen: "Static paymentslink", nextScreen: "Static paymentslink view" })
        try {
            await Share.share({
                message: `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_SHARE_MY")} ${invoiceData?.currency} (${invoiceData?.networkName}) ${t("GLOBAL_CONSTANTS.ADDRESS_FOR_RECEIVING")}${invoiceData?.walletAddress}\n${t("GLOBAL_CONSTANTS.PLEASE_MAKE_SURE_YOU_ARE_USING_THE_CORRECT_PROTOCAL")}\n${t("GLOBAL_CONSTANTS.I_AM_USING")}: ${invoiceData?.paymentLink}\n${t("GLOBAL_CONSTANTS.THANK_YOU")}`
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };
    const handleEdit = (val: any) => {
        if (val?.status === PAYMENT_LINK_CONSTENTS.PAID) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: PAYMENT_LINK_CONSTENTS.PAYIN_HAS_BEEN_FULLY_PAID });
        }
        else if (val?.status === PAYMENT_LINK_CONSTENTS.CANCELLED) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: PAYMENT_LINK_CONSTENTS.CANNOT_EDIT_CANCELLED_PAYIN });
        }
        else if (val?.status === PAYMENT_LINK_CONSTENTS.PARTIALLY_PAID) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: PAYMENT_LINK_CONSTENTS.PAY_IN_HAS_BEEN_PARTIALLY_PAID })
        }
        else if (val?.status === "Expired") {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: PAYMENT_LINK_CONSTENTS.EXPIRED_PAYIN })
        }
        else {
            const returnTab = props?.route?.params?.returnTab ?? 1;
            navigation.navigate(PAYMENT_LINK_CONSTENTS.CREATE_PAYMENT_COMPONENT, {
                animation: "slide_from_left",
                id: val?.id,
                Type: val?.type,
                invoiceNo: val?.invoiceNumber || val?.invoiceNo,
                returnTab
            });
        }
    }
    const handelWalletAddrerssCopyToClipboard = () => {
        copyToClipboard(invoiceData?.walletAddress)
    }
    const handlePaymentLinkCopyToClipboard = () => {
        copyToClipboard(invoiceData?.paymentLink)
    }
    const handleStateChange = () => {
        logEvent("Button Pressed", { action: "Sate change paymentslink", currentScreen: "Static paymentslink view" })
        if (invoiceData?.status === PAYMENT_LINK_CONSTENTS.PAID) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: PAYMENT_LINK_CONSTENTS.PAYIN_HAS_BEEN_FULLY_PAID });
        }
        else if (invoiceData?.status === PAYMENT_LINK_CONSTENTS.CANCELLED) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: PAYMENT_LINK_CONSTENTS.CANNOT_STATE_CHANGE_CANCELLED_PAY_IN });
        }
        else if (invoiceData?.status === PAYMENT_LINK_CONSTENTS.PARTIALLY_PAID) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: PAYMENT_LINK_CONSTENTS.PAY_IN_HAS_BEEN_PARTIALLY_PAID });

        }
        else {
            setStateChangeModelOpen(true);
        }
    }
    const isRefreshView = () => {
        setStateChangeModelOpen(false)
        getPaymentLinkDetails();
    }
    const handleClose = () => {
        if (props.route.params.action == "Home") {
            navigation.navigate("Dashboard", { animation: "slide_from_left", initialTab: "GLOBAL_CONSTANTS.PAYMENTS" });
        }
        else {
            navigation.navigate("PayInGrid", { animation: "slide_from_left", initialTab: 1 });
        }
    }
    const handleDownload = async () => {
        if (isPreparingPdfUrl || !invoiceData?.id) return;

        setIsPreparingPdfUrl(true);
        try {
            const response: any = await PaymentService.downloadStatictemplete(invoiceData?.id, "static");
            if (response?.data) {
                setCurrentDownloadUrl(response.data);
            } else {
                localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: isErrorDispaly(response) });
            }
        } catch (error) {
            localDispatch({ type: PAYMENT_LINK_CONSTENTS.SET_ERRORS, payload: isErrorDispaly(error) });
        } finally {
            setIsPreparingPdfUrl(false);
        }
    };

    const close = () => {
        setStateChangeModelOpen(false);
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
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1,]}>
            {localState?.staticPaymentLoader && <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>}
            {!localState?.staticPaymentLoader && <Container style={[commonStyles.container]}>
                <PageHeader
                    title={(props?.route?.params?.invoiceNo ? props?.route?.params?.invoiceNo : "GLOBAL_CONSTANTS.STATIC_PAYMENT_LINK")}
                    onBackPress={backArrowButtonHandler}
                    rightActions={renderDownloadAction()}
                />
                <ScrollViewComponent showsVerticalScrollIndicator={false}>
                    {localState?.errors && <ErrorComponent message={localState?.errors} onClose={handleErrorclear} />}
                    <ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignStart, commonStyles.sectionGap, commonStyles.gap8]}>
                            {invoiceData?.status && <ViewComponent style={[commonStyles.flex1]}>
                                <ActionButton text={"GLOBAL_CONSTANTS.EDIT_INVOICE"} useGradient onPress={() => handleEdit(localState?.paymentLinkData)} customIcon={<RapidzEditIcon/>} />
                            </ViewComponent>}
                            <ViewComponent style={[commonStyles.flex1]} >
                                <ActionButton text={"GLOBAL_CONSTANTS.STATE_CHANGE"} customTextColor={NEW_COLOR.TEXT_PRIMARY} onPress={() => handleStateChange()} customIcon={<StateChanageIcon />} />
                            </ViewComponent>
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.sectionGap]}>
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.AMOUNT_TO_BE_PAID"} style={[commonStyles.transactionamounttextlabel]} />
                            <CurrencyText value={invoiceData?.amount || 0} decimalPlaces={4} currency={invoiceData?.currency} style={[commonStyles.transactionamounttext]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.rounded5]}>
                            <ViewComponent style={[commonStyles.sectionGap]}>

                                <ViewComponent>
                                    <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.listitemGap, commonStyles.justifyContent]}>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.COIN"} />
                                        <ParagraphComponent text={invoiceData?.currency} style={[commonStyles.listprimarytext]} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.listitemGap, commonStyles.justifyContent]}>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.NETWORK"} />
                                        <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.textWhite]} text={invoiceData?.networkName || ""} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.listitemGap, commonStyles.justifyContent]}>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.INVOICE_TYPE"} />
                                        <ParagraphComponent text={invoiceData?.type || invoiceData?.paymentType} style={[commonStyles.listprimarytext]} />
                                    </ViewComponent>
                                    {invoiceData?.orderId && <ViewComponent style={[commonStyles?.dflex, commonStyles.alignStart, commonStyles.gap4, commonStyles.justifyContent, commonStyles.listitemGap]}>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ORDER_ID"} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10]}>
                                            {invoiceData?.orderId && <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.textRight, { width: s(180) }]} text={invoiceData?.orderId || ""} />}
                                        </ViewComponent>
                                    </ViewComponent>}
                                    {invoiceData?.dueDate && <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.listitemGap, commonStyles.justifyContent,]}>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.DUE_DATE"} />
                                        <FormattedDateText value={invoiceData?.dueDate} dateFormat={dateFormates.date} style={[commonStyles.textWhite, commonStyles.fw500, commonStyles.fs16,]} />
                                    </ViewComponent>}
                                    {invoiceData?.status &&
                                        <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.gap4, commonStyles.listitemGap, commonStyles.justifyContent]}>
                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.STATUS"} />
                                            <ParagraphComponent style={[commonStyles.listprimarytext, { color: statusColor[invoiceData?.status?.toLowerCase()] }]} text={invoiceData?.status || ""} />
                                        </ViewComponent>}
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                        {(<ViewComponent style={[commonStyles.titleSectionGap]}>
                            <ViewComponent style={[]}>
                                {invoiceData?.walletAddress && <ViewComponent style={[commonStyles.mxAuto]}>
                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.ARTHA_TECHNOLOGIES"} style={[commonStyles.transactionamounttextlabel]} />
                                    <ParagraphComponent text={`${invoiceData?.currency} (${invoiceData?.networkName})`} style={[commonStyles.sectionTitle, commonStyles.textCenter]} />
                                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                                    <ViewComponent style={[commonStyles.bgAlwaysWhite, { padding: 6, borderRadius: 0 }]}>
                                        <QRCode value={invoiceData?.walletAddress} size={s(200)} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.titleSectionGap]} />
                                </ViewComponent>}
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.sectionGap]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                                    <TextMultiLanguage style={[commonStyles.transactionamounttextlabel]} text={"GLOBAL_CONSTANTS.AMOUNT_DUE"} />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                                    <CurrencyText style={[commonStyles.transactionamounttext]} value={invoiceData?.dueAmount || 0} decimalPlaces={4} currency={invoiceData?.currency} />
                                </ViewComponent>
                            </ViewComponent>
                            {invoiceData?.walletAddress && <ViewComponent style={[commonStyles.bgnote, commonStyles.titleSectionGap]}>
                                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.RECIPIENT"} style={[commonStyles.walletaddresssecondarytext]} />
                                    {invoiceData?.walletAddress && <CopyCard onPress={handelWalletAddrerssCopyToClipboard} />}
                                </ViewComponent>
                                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                    {invoiceData?.walletAddress && <ParagraphComponent text={`${invoiceData?.walletAddress?.substring(0, 10)} ......... ${invoiceData?.walletAddress?.slice(-15)}`} style={[commonStyles.walletaddressessprimarytext]} />}
                                </ViewComponent>
                            </ViewComponent>}
                            {invoiceData?.paymentLink && <ViewComponent style={[commonStyles.bgnote,]}>
                                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.PAYMENT_LINK"} style={[commonStyles.walletaddresssecondarytext]} />
                                    {invoiceData?.paymentLink && <CopyCard onPress={handlePaymentLinkCopyToClipboard} />}
                                </ViewComponent>
                                <ViewComponent style={[commonStyles?.dflex, commonStyles.alignCenter]}>
                                    <CommonTouchableOpacity onPress={() => handleRedirect(invoiceData?.paymentLink)}>
                                             <LabelComponent style={[commonStyles.paymentLinkprimarytext]} selectable={true}>
                                                                                        {invoiceData?.paymentLink?.substring(0, 15)}......${invoiceData?.paymentLink?.slice(-15)}
                                                                                    </LabelComponent>
                                    </CommonTouchableOpacity>
                                </ViewComponent>
                            </ViewComponent>}
                        </ViewComponent>)}

                        <ViewComponent style={[commonStyles.bgnote, commonStyles.sectionGap]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>
                                <ViewComponent>
                                    <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textWhite]} text={t("GLOBAL_CONSTANTS.PLEASE_DOUBLE_CHECK")} />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>

                        <ViewComponent style={[]}>
                            <ButtonComponent title={"GLOBAL_CONSTANTS.SHARE"} icon={<Feather name="share" size={s(20)} color={NEW_COLOR.BUTTON_TEXT} />} onPress={onShare} />
                        </ViewComponent>

                        <ViewComponent style={[commonStyles.buttongap]} />
                        <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} onPress={handleClose} solidBackground={true} />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                    </ViewComponent>
                    {stateChangeModelOpen && <StateChange modelOpen={stateChangeModelOpen} data={invoiceData} isRefresh={isRefreshView} closeModel={close} />}
                </ScrollViewComponent>
            </Container>}
        </ViewComponent>
    )
};
export default StaticPaymentView;
