import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../hooks/useThemeColors";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../newComponents/view/view";
import SendServices from "../../../services/send";
import { useEffect, useState } from "react";
import { isErrorDispaly } from '../../../utils/helpers';
import { s } from '../../../constants/theme/scale';
import Clipboard from '@react-native-clipboard/clipboard';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import CopyCard from '../../../newComponents/copyComponent/CopyCard';
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";
import { useSelector } from "react-redux";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import { FormattedDateText } from "../../../newComponents/textComponets/dateTimeText/dateTimeText";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { useNavigation } from "@react-navigation/native";
import SwokipayDashboardLoader from "../../../newComponents/swokipayloader";
import TransactionStatus from "../../TransactionDetails/status";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";



const SendTransactionStatus = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [transactionData, setTransactionData] = useState<any>(null);
    const userInfo = useSelector((state: any) => state?.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [error,setError]=useState<string>("");

    const copyToClipboard = (text: string) => {
        if (text) {
            Clipboard.setString(text);
        }
    };

    useEffect(() => {
        getSendTransactionStatus();
    }, []);

    const getSendTransactionStatus = async () => {
        setError("");
        setLoading(true);
        try {
            const response = await SendServices.sendTransactionStatus(props?.route?.params?.transactionId);
            if (response.status === 200) {
                setTransactionData(response?.data);
                setLoading(false);
            }
            else {
                setError(isErrorDispaly(response));
                setLoading(false);
                setTransactionData([]);
            }
        }
        catch (error) {
            setError(isErrorDispaly(error));
            setLoading(false);
        }
    }
    useHardwareBackHandler(() => {
        handleBackPress();
        return true;
    });

    const handleBackPress = () => {
        navigation.goBack();
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loading && <SwokipayDashboardLoader />}
            {!loading && <Container>
                <PageHeader title={"GLOBAL_CONSTANTS.SEND_STATUS"} onBackPress={handleBackPress} />
                {error&&<ErrorComponent message={error} screen={true}/>}
                <ScrollViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>

                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                <ViewComponent style={[]}>
                                    <ParagraphComponent style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite]} text={"-"} />
                                </ViewComponent>
                                <CurrencyText
                                    value={transactionData?.amount | 0}
                                    style={[commonStyles.fs30, commonStyles.fw700, commonStyles.textWhite]}
                                // symboles={true}
                                />
                            </ViewComponent>
                            <ParagraphComponent
                                style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400, commonStyles.mt12]} // Example styles for the currency
                                text={`${transactionData?.cardCurrency || ""}`}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.alignCenter]}>
                            <TransactionStatus status={transactionData?.state?.toLowerCase()} />
                        </ViewComponent>

                    </ViewComponent>


                    {transactionData && (
                        <ViewComponent>
                            <TextMultiLanguage
                                text={"GLOBAL_CONSTANTS.TRANSACTIONS_DETAILS"}
                                style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite, commonStyles.mb16]}
                            />

                            {/* Type */}
                            <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.TYPE"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transactionData?.action || "Send"}</ParagraphComponent>
                            </ViewComponent>

                            {/* Recipient */}
                            <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.SENDER"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} numberOfLines={1}>{decryptAES(userInfo.userName) || ''}</ParagraphComponent>
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.RECEIVER"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} numberOfLines={1}>{transactionData?.address || ''}</ParagraphComponent>
                            </ViewComponent>
                            {/* Amount */}
                            <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.AMOUNT"} />
                                <CurrencyText value={transactionData?.amount} currency={transactionData?.cardCurrency} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.FEE"} />
                                <CurrencyText value={transactionData?.fee} currency={transactionData?.cardCurrency} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.CREATED_ON"} />
                                <FormattedDateText value={transactionData?.dateTime} conversionType="UTC-to-local" style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} />
                            </ViewComponent>

                            <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                <TextMultiLanguage text={"GLOBAL_CONSTANTS.ORDER_ID"} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} />
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transactionData?.txId || ''}</ParagraphComponent>
                                   { transactionData?.txId&&<CopyCard size={s(24)} onPress={() => copyToClipboard(transactionData?.txId)} />}
                                </ViewComponent>
                            </ViewComponent>
                            {transactionData?.note && <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.NOTE_TEXT"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.textRight, { width: "60%" }]} numberOfLines={3}>{transactionData?.note || ''}</ParagraphComponent>
                            </ViewComponent>}

                            {transactionData?.purposeOfTransfer && <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                              <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.PURPOSE_OF_TRANSFER"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transactionData?.purposeOfTransfer || ''}</ParagraphComponent>
                            </ViewComponent>}

                            {transactionData?.relationShipWithRecipient && <ViewComponent style={[commonStyles.listbg]}>
                                 <TextMultiLanguage style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={"GLOBAL_CONSTANTS.RELATIONSHIP_WITH_RECIPIENT"} />
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}>{transactionData?.relationShipWithRecipient || ''}</ParagraphComponent>
                            </ViewComponent>}

                        </ViewComponent>
                    )}
                </ScrollViewComponent>
            </Container>}
        </ViewComponent>
    )
};

export default SendTransactionStatus;