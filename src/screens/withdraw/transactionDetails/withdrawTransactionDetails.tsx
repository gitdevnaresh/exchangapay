import React, { useEffect, useState } from 'react';
import ViewComponent from '../../../newComponents/view/view';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import Clipboard from '@react-native-clipboard/clipboard';
import { s } from '../../../constants/theme/scale';
import Container from '../../../newComponents/container/container';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import ButtonComponent from '../../../newComponents/buttons/button';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { WithDrawServices } from '../../../apiServices/withdrawApis/withdrawServices';
import { isErrorDispaly } from '../../../utils/helpers';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import { FormattedDateText } from '../../../newComponents/textComponets/dateTimeText/dateTimeText';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import LabelComponent from '../../../newComponents/textComponets/lableComponent/lable';
import { t } from 'i18next';
import { AntDesign, FontAwesome, Octicons } from '@expo/vector-icons';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import { CurrencyText } from '../../../newComponents/textComponets/currencyText/currencyText';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import { Linking } from 'react-native';

interface Loaders {
    cancelLoader: boolean,
    isLoading: boolean,
}
const WithdrawTransactionDetails = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [transferDetails, setTransferDetails] = useState<any>({});
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const [transactionStatus, setTransactionStatus] = useState<any>({});
    const [error,setError]=useState<string>("")
    const [loaders, setLoaders] = useState<Loaders>({
        cancelLoader: false,
        isLoading: false,
    })
    useEffect(() => {
        handleTransferDetails();
        handleTransferStatus();
    }, [isFocused]);
    useHardwareBackHandler(() => {
        handleBack();
    });

    const copyToClipboard = (text: string) => {
        if (text) {
            Clipboard.setString(text);
        }
    };

    const handleTransferDetails = async () => {
        setError("");
        setLoaders({ ...loaders, isLoading: true })
        try {
            const response: any = await WithDrawServices.withdraTransferDetails(props?.route?.params.transactionId);
            if (response.ok) {
                setTransferDetails(response.data)
                setLoaders({ ...loaders, isLoading: false })
            } else {
                setLoaders({ ...loaders, isLoading: false })
                setError(isErrorDispaly(response));
                setTransferDetails({});
            }
        } catch (error) {
            setLoaders({ ...loaders, isLoading: false })
            setError(isErrorDispaly(error));
        }
    };



    const handleTransferStatus = async () => {
        setError("")
        try {
            const response: any = await WithDrawServices.withdrawTransactionDetails(props?.route?.params.transactionId);
            if (response.ok) {
                setTransactionStatus(response.data)
            } else {
                setError(isErrorDispaly(response));
            }
            } catch (error) {
            setError(isErrorDispaly(error));
        }
    };

    const handleCanelWithdraw = async () => {
        setLoaders({ ...loaders, cancelLoader: true })
        try {
            const response: any = await WithDrawServices.cancelWithdraw(props?.route?.params.transactionId);
            if (response.ok) {
                navigation.navigate({
                    name: "WithdrawSuccess", params: {

                        transactionId: props?.route?.params.transactionId,
                        withdrawCancel: true
                    }, merge: true
                })
                setLoaders({ ...loaders, cancelLoader: false })
            } else {
                setError(isErrorDispaly(response));
                setLoaders({ ...loaders, cancelLoader: false })
            }

        } catch (error: any) {
            setError(isErrorDispaly(error));
            setLoaders({ ...loaders, cancelLoader: false })
        }
    }

    const handleBack = () => {
       navigation.navigate("Dashboard")
    };
    const statusColors = {
        "completed": NEW_COLOR.TEXT_GREEN,
        "pending": NEW_COLOR.BG_YELLOW,
        "rejected": NEW_COLOR.TEXT_RED,
        "failed": NEW_COLOR.TEXT_RED
    };
    const getStatusIconColor = (status: string) => {
        if (status) return NEW_COLOR.TEXT_GREEN;
        if (!status) return NEW_COLOR.TEXT_WHITE;
        return NEW_COLOR.TEXT_GREY;
    };
    const statusIcons = {
        "completed": <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_GREEN} />,
        "rejected": <AntDesign name="closecircleo" size={s(18)} color={NEW_COLOR.TEXT_RED} />,
        "pending": <Octicons name="stopwatch" size={s(18)} color={NEW_COLOR.BG_YELLOW} />,
        "failed": <AntDesign name="closecircleo" size={s(18)} color={NEW_COLOR.TEXT_RED} />,
    };
    const handleRefresh = () => {
        setError("");
        handleTransferDetails();
        handleTransferStatus();
    };
const handleOpenExplorer = () => {
    if(transferDetails?.hash&&transferDetails?.explorer){
        const url=`${transferDetails?.explorer || ""}${transferDetails?.hash}`
        Linking.openURL(url);
    }
}
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loaders.isLoading ? (

                <SwokipayDashboardLoader />

            ) : (<Container>
                <PageHeader title={'GLOBAL_CONSTANTS.TRANSAFER_STATUS'} onBackPress={handleBack} isrefresh={true} onRefresh={handleRefresh} />
               
                <ScrollViewComponent contentContainerStyle={[]}>
                     {error&&<ErrorComponent message={error} screen={true}/>}
                    {/* Status Legend */}
                    <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter]}>
                         <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter,commonStyles.mb24]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, { gap: s(6) }]}>
                                {transferDetails?.state && statusIcons[transferDetails?.state?.toLowerCase()]}
                                <TextMultiLanguage text={transferDetails.state || ""} style={[{ color: statusColors[transferDetails?.state?.toLowerCase()] || NEW_COLOR.TEXT_WHITE},commonStyles.fw400,commonStyles.fs14]} />
                            </ViewComponent>
                        </ViewComponent>
                        {/* Amount Display */}
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                            <CurrencyText prifix='-' value={transferDetails?.amount || 0} style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite, commonStyles.alignCenter]} />
                            <ParagraphComponent
                                text={`${transferDetails?.type || ""}`}
                                style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textGrey, commonStyles.alignCenter,commonStyles.mt12]}
                            />
                        </ViewComponent>
                       
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mb32]} />

                    <ViewComponent style={[commonStyles.transactionsCard, commonStyles.p12, commonStyles.rounded12, commonStyles.gap6]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap5]}>
                            <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_GREEN} />
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.SUBMISSION_SUCCESSFUL"} style={[commonStyles.fs14, commonStyles.fw400, { color: NEW_COLOR.TEXT_GREEN }]} />
                        </ViewComponent>
                        {transferDetails.state?.toLowerCase() !== "failed" && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap5]}>
                            {(transactionStatus.pending && transactionStatus.processing) ? (
                                <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_GREEN} />
                            ) : (
                                <FontAwesome name="circle-thin" size={s(18)} color={getStatusIconColor(transactionStatus.pending && transactionStatus.processing)} />
                            )}
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.PENDING_REVIEW"} style={[commonStyles.fs14, commonStyles.fw400, { color: getStatusIconColor(transactionStatus.pending && transactionStatus.processing) }]} />
                        </ViewComponent>}
                        {transferDetails.state?.toLowerCase() !== "failed" && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap5]}>
                            {transactionStatus.processing ? (
                                <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_GREEN} />
                            ) : (
                                <FontAwesome name="circle-thin" size={s(18)} color={NEW_COLOR.TEXT_GREY} />
                            )}
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.WALLET_PROCESSING"} style={[commonStyles.fs14, commonStyles.fw400, { color: transactionStatus.processing ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_GREY }]} />
                        </ViewComponent>}
                        {transferDetails.state?.toLowerCase() !== "failed" && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap5]}>
                            {transactionStatus.processed ? (
                                <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_GREEN} />
                            ) : (
                                <FontAwesome name="circle-thin" size={s(18)} color={NEW_COLOR.TEXT_GREY} />
                            )}
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.PROCESSED"} style={[commonStyles.fs14, commonStyles.fw400, { color: transactionStatus.processed ? NEW_COLOR.TEXT_GREEN : NEW_COLOR.TEXT_GREY }]} />
                        </ViewComponent>}
                        {transferDetails.state?.toLowerCase() === "failed" && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap5]}>

                            <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_GREEN} />

                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.PENDING_REVIEW"} style={[commonStyles.fs14, commonStyles.fw400, { color: NEW_COLOR?.TEXT_GREEN }]} />
                        </ViewComponent>}
                        {transferDetails.state?.toLowerCase() === "failed" && <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap5]}>
                            <AntDesign name="closecircleo" size={s(18)} color={NEW_COLOR.TEXT_RED} />,
                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.TRNSACTION_CANCELLED"} style={[commonStyles.fs14, commonStyles.fw400, { color: NEW_COLOR.TEXT_RED }]} />
                        </ViewComponent>}
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                    {/* Transaction Details Section */}
                    <TextMultiLanguage text="GLOBAL_CONSTANTS.TRANSACTION_DETAILS" style={[commonStyles.fs14, commonStyles.fw700, commonStyles.textWhite, { marginBottom: s(8) }]} />
                    <ViewComponent style={[commonStyles.rounded5, commonStyles.mb20]}>
                        {/* Type */}
                        <ViewComponent style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.gap16,
                            commonStyles.justifyContent,
                            commonStyles.listbg
                        ]}>
                            <TextMultiLanguage text="GLOBAL_CONSTANTS.TYPE" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                            <ParagraphComponent text={transferDetails?.txType} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.menuitemspace]} />

                        {/* Network */}
                        <ViewComponent style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.gap16,
                            commonStyles.justifyContent,
                            commonStyles.listbg

                        ]}>
                            <TextMultiLanguage text="GLOBAL_CONSTANTS.NETWORK" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                            <ParagraphComponent text={transferDetails?.network} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.menuitemspace]} />

                        <ViewComponent style={[commonStyles.rounded8,commonStyles.p8,commonStyles.rewardsbg]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <LabelComponent
                                    text={`${t("GLOBAL_CONSTANTS.ADDRESS")}`}
                                    style={[commonStyles.fs14, commonStyles.fw400,commonStyles.textGrey]}
                                />
                                {transferDetails?.address && <CopyCard onPress={() => copyToClipboard(transferDetails?.address)} size={s(24)} />}
                            </ViewComponent>
                            <ParagraphComponent text={transferDetails?.address} style={[commonStyles.fs14, commonStyles.fw400,commonStyles.textWhite, commonStyles.flex1]} />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.menuitemspace]} />
                        {/* Amount */}
                        <ViewComponent style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.gap16,
                            commonStyles.justifyContent,
                            commonStyles.listbg

                        ]}>
                            <TextMultiLanguage text="GLOBAL_CONSTANTS.AMOUNT" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                            <CurrencyText value={transferDetails?.amount || 0} currency={transferDetails?.type || ""}  style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />

                        </ViewComponent>
                        <ViewComponent style={[commonStyles.menuitemspace]} />
                        {/* Fee */}
                        <ViewComponent style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.gap16,
                            commonStyles.transactionsCard,
                            commonStyles.justifyContent,
                            commonStyles.listbg
                        ]}>
                            <TextMultiLanguage text="GLOBAL_CONSTANTS.FEE" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                            <CurrencyText value={transferDetails?.fee || 0} currency={transferDetails?.type || ""}  style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />
                             </ViewComponent>
                        <ViewComponent style={[commonStyles.menuitemspace]} />

                        {/* Created On */}
                        <ViewComponent style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.gap16,
                            commonStyles.justifyContent,
                            commonStyles.listbg

                        ]}>
                            <TextMultiLanguage text="GLOBAL_CONSTANTS.CREATED_ON" style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                            <FormattedDateText
                                value={transferDetails.dateTime || ""}
                                conversionType="UTC-to-local"
                                style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]}
                            />
                        </ViewComponent>
                         <ViewComponent style={[commonStyles.menuitemspace]} />
                       { transferDetails?.hash&&<ViewComponent style={[commonStyles.rounded8, commonStyles.p8, commonStyles.rewardsbg]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <LabelComponent
                                    text={`${t("GLOBAL_CONSTANTS.HASH")}`}
                                    style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                                />
                                {transferDetails?.hash && <CopyCard onPress={() => copyToClipboard(`${transferDetails?.explorer || ""}${transferDetails?.hash}`)} size={s(24)} />}
                            </ViewComponent>
                            <CommonTouchableOpacity onPress={handleOpenExplorer}>
                            <ParagraphComponent text={`${transferDetails?.hash || ""}`} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.text_yellow, commonStyles.flex1]} />
                            </CommonTouchableOpacity>
                        </ViewComponent>}
                    </ViewComponent>

                    {/* Cancel Button */}
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </ScrollViewComponent>
                {(!transactionStatus.processing && transferDetails.state?.toLowerCase() !== "failed") && <ButtonComponent onPress={handleCanelWithdraw} title="GLOBAL_CONSTANTS.CANCEL_WITHDRAW" loading={loaders.cancelLoader} />}
                <ViewComponent style={[commonStyles.sectionGap]} />
            </Container>)}
        </ViewComponent>
    );
};

export default WithdrawTransactionDetails;